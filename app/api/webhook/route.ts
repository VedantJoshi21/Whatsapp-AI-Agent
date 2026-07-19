import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateAIResponse } from '@/lib/ai';
import { sendWhatsAppMessage } from '@/lib/whatsapp';
import { logger } from '@/lib/logger';
import crypto from 'crypto';

/*{
    Function Name: verifySignature
    Purpose: Verifies that the webhook request came from Meta
    Parameters: payload (string), signature (string)
    Returns: boolean
}*/
function verifySignature(payload: string, signature: string): boolean {
  const appSecret = process.env.WHATSAPP_APP_SECRET;
  if (!appSecret) {
    logger.warn('Webhook Security', 'WHATSAPP_APP_SECRET not set, skipping signature verification');
    return true; // Skip if not configured, but log warning
  }

  const hash = crypto
    .createHmac('sha256', appSecret)
    .update(payload)
    .digest('hex');
  
  return `sha256=${hash}` === signature;
}

/*{
    Function Name: GET
    Purpose: Verification endpoint for WhatsApp Cloud API
    Parameters: request (NextRequest)
}*/
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('Webhook Verified!');
    return new NextResponse(challenge, { status: 200 });
  }

  console.error('Webhook Verification Failed!');
  return new NextResponse('Forbidden', { status: 403 });
}

/*{
    Function Name: POST
    Purpose: Handles incoming WhatsApp messages and events
    Parameters: request (NextRequest)
}*/
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const body = JSON.parse(rawBody);
    
    // Verify Signature
    const signature = request.headers.get('x-hub-signature-256') || '';
    if (!verifySignature(rawBody, signature)) {
      logger.error('Webhook Security', 'Invalid signature detected');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    logger.info('Webhook Received', body);

    // Check if this is a WhatsApp Business Account event
    if (body.object === 'whatsapp_business_account') {
      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;

      // 1. Extract phone_number_id from webhook
      const phone_number_id = value?.metadata?.phone_number_id;

      if (!phone_number_id) {
        return NextResponse.json({ error: 'Missing phone_number_id' }, { status: 400 });
      }

      // 2. Query database: find client where whatsapp_phone_number_id = phone_number_id
      const { data: client, error } = await supabase
        .from('clients')
        .select('*')
        .eq('whatsapp_phone_number_id', phone_number_id)
        .single();

      // 3. If no client found: return early
      if (error || !client) {
        logger.warn('Client Not Found', { phone_number_id });
        return NextResponse.json({ status: 'success', message: 'Client not found' }, { status: 200 });
      }

      // Check if there are messages
      if (value?.messages && value.messages.length > 0) {
        const message = value.messages[0];
        const sender_phone = message.from;
        const message_text = message.text?.body || '';
        const whatsapp_msg_id = message.id;
        const sender_name = value.contacts?.[0]?.profile?.name || null;

        // 4. Prevent duplicate messages
        const { data: existingMessage } = await supabase
          .from('messages')
          .select('id')
          .eq('whatsapp_msg_id', whatsapp_msg_id)
          .maybeSingle();

        if (existingMessage) {
          logger.info('Duplicate Message Ignored', { whatsapp_msg_id });
          return NextResponse.json({ status: 'success', message: 'Duplicate message' }, { status: 200 });
        }

        // 5. Find or create conversation
        const { data: conversation, error: convError } = await supabase
          .from('conversations')
          .select('id, mode')
          .eq('client_id', client.id)
          .eq('phone', sender_phone)
          .maybeSingle();

        if (convError) {
          logger.error('Fetch Conversation Error', convError);
          return NextResponse.json({ error: 'Database error' }, { status: 500 });
        }

        let conversation_id;
        let currentMode;

        if (conversation) {
          conversation_id = conversation.id;
          currentMode = conversation.mode;
        } else {
          // Create new conversation with default agent mode
          const { data: newConv, error: createConvError } = await supabase
            .from('conversations')
            .insert({
              client_id: client.id,
              phone: sender_phone,
              name: sender_name,
              mode: 'agent'
            })
            .select('id, mode')
            .single();

          if (createConvError) {
            logger.error('Create Conversation Error', createConvError);
            return NextResponse.json({ error: 'Database error' }, { status: 500 });
          }
          conversation_id = newConv.id;
          currentMode = newConv.mode;
        }

        // 6. Store incoming message
        const { error: msgError } = await supabase
          .from('messages')
          .insert({
            conversation_id: conversation_id,
            role: 'user',
            content: message_text,
            whatsapp_msg_id: whatsapp_msg_id
          });

        if (msgError) {
          logger.error('Store Message Error', msgError);
          return NextResponse.json({ error: 'Database error' }, { status: 500 });
        }

        // UPDATE conversation timestamp to move it to top of list
        await supabase
          .from('conversations')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', conversation_id);

        logger.info('New Message Stored', {
          client: client.business_name,
          from: sender_phone,
          text: message_text,
          mode: currentMode
        });

        // 7. Handle Response based on mode
        if (currentMode === 'agent') {
          logger.info('Generating AI Response', { conversation_id });
          
          // Pass client metadata for branded AI responses
          const aiResponse = await generateAIResponse(conversation_id, {
            business_name: client.business_name
          });

          if (aiResponse) {
            try {
              const whatsappResult = await sendWhatsAppMessage(
                client.whatsapp_phone_number_id,
                client.access_token,
                sender_phone,
                aiResponse
              );

              const whatsapp_resp_id = whatsappResult.messages?.[0]?.id;

              await supabase
                .from('messages')
                .insert({
                  conversation_id: conversation_id,
                  role: 'assistant',
                  content: aiResponse,
                  whatsapp_msg_id: whatsapp_resp_id
                });
                
              // UPDATE conversation timestamp again for the reply
              await supabase
                .from('conversations')
                .update({ updated_at: new Date().toISOString() })
                .eq('id', conversation_id);

              logger.info('AI Response Sent & Stored', { response: aiResponse });
            } catch (sendError) {
              logger.error('Send AI Response Error', sendError);
            }
          }
        } else {
          logger.info('Human Mode Active: Skipping AI reply', { conversation_id });
        }
      }

      return NextResponse.json({ status: 'success' }, { status: 200 });
    }

    return NextResponse.json({ error: 'Not a WhatsApp event' }, { status: 404 });
  } catch (error) {
    logger.error('Webhook Process Error', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
