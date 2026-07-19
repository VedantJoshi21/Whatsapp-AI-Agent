import OpenAI from 'openai';
import { supabase } from './supabase';
import { logger } from './logger';

const openai = new OpenAI({
  baseURL: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY || '',
  defaultHeaders: {
    'HTTP-Referer': process.env.SITE_URL || 'http://localhost:3000',
    'X-Title': process.env.SITE_NAME || 'WhatsApp AI Agent',
  },
});



/*{
    Function Name: generateAIResponse
    Purpose: Fetches conversation context and generates an AI response using OpenRouter
    Parameters: conversationId (string), clientMetadata (any)
    Returns: Promise<string | null>
}*/
export async function generateAIResponse(
  conversationId: string, 
  clientMetadata?: { business_name: string }
): Promise<string | null> {
  try {
    // 1. Fetch last 10 messages for this conversation
    const { data: messages, error } = await supabase
      .from('messages')
      .select('role, content')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error || !messages) {
      logger.error('Fetch Messages Context Error', error);
      return null;
    }

    // 2. Format messages for OpenAI SDK (Reverse to get chronological order)
    const chatMessages = messages.reverse().map((msg) => ({
      role: msg.role as 'user' | 'assistant' | 'system',
      content: msg.content,
    }));

    // Add system prompt with business name if available
    const businessName = clientMetadata?.business_name || 'the business';
    const systemPrompt = {
      role: 'system' as const,
      content: `You are a helpful and conversational AI assistant for ${businessName}. 
      Your goal is to assist customers on WhatsApp.
      Rules:
      - Respond in short, WhatsApp-style messages.
      - Be conversational and clear.
      - Ask ONE question at a time.
      - Focus on lead conversion.
      - Avoid long paragraphs.
      - Avoid hallucination.`,
    };

    // 3. Generate response
    const completion = await openai.chat.completions.create({
      model: process.env.AI_MODEL || 'google/gemini-2.0-flash-001',
      messages: [systemPrompt, ...chatMessages],
      temperature: 0.7,
      max_tokens: 500,
    });

    const aiResponse = completion.choices[0]?.message?.content || null;

    return aiResponse;
  } 
  catch (err) {
    logger.error('AI Generation Error', err);
    return null;
  }
}
