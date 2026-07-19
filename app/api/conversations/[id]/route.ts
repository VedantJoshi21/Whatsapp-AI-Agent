import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';

/*{
    Function Name: PATCH
    Purpose: Update conversation mode (agent/human)
    Parameters: request (NextRequest), { params }
}*/
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { mode } = body;

    if (!mode || !['agent', 'human'].includes(mode)) {
      return NextResponse.json({ error: 'Invalid mode' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('conversations')
      .update({ mode })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error('Update Conversation Error', error);
      return NextResponse.json({ error: 'Failed to update conversation' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    logger.error('Update Conversation Unexpected Error', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
