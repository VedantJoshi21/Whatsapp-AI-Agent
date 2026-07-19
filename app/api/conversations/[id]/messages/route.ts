import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';

/*{
    Function Name: GET
    Purpose: Fetch message history for a specific conversation
    Parameters: request (NextRequest), { params }
}*/
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', id)
      .order('created_at', { ascending: true });

    if (error) {
      logger.error('Fetch Messages Error', error);
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }

    return NextResponse.json(messages);
  } catch (error) {
    logger.error('Fetch Messages Unexpected Error', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
