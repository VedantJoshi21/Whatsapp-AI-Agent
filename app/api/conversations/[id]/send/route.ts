import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendWhatsAppMessage } from '@/lib/whatsapp';
import { logger } from '@/lib/logger';

/*{
    Function Name: POST
    Purpose: Send a manual message via WhatsApp API and record it
    Parameters: request (NextRequest), { params }
}*/
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { content } = await request.json();

    if (!content) {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 });
    }

    // 1. Get conversation and client details
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select(`
        *,
        clients (*)
      `)
      .eq('id', id)
      .single();

    if (convError || !conversation) {
      logger.error('Fetch Conversation for Send Error', convError);
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    const client = conversation.clients;

    // 2. Send message via WhatsApp API
    try {
      const whatsappResult = await sendWhatsAppMessage(
        client.whatsapp_phone_number_id,
        client.access_token,
        conversation.phone,
        content
      );

      const whatsapp_msg_id = whatsappResult.messages?.[0]?.id;

      // 3. Store message in database
      const { data: newMessage, error: msgError } = await supabase
        .from('messages')
        .insert({
          conversation_id: id,
          role: 'assistant',
          content: content,
          whatsapp_msg_id: whatsapp_msg_id
        })
        .select()
        .single();

      if (msgError) {
        logger.error('Store Manual Message Error', msgError);
        // We don't return error here because the message WAS sent to the user
      }

      // 4. Update conversation timestamp to move it to the top of the list
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', id);

      return NextResponse.json(newMessage || { success: true });
    } catch (sendError) {
      logger.error('Send WhatsApp Message Error', sendError);
      return NextResponse.json({ error: 'Failed to send WhatsApp message' }, { status: 500 });
    }
  } catch (error) {
    logger.error('Send Message Unexpected Error', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
