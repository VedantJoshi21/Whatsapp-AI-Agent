import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';

/*{
    Function Name: GET
    Purpose: Fetch conversations, optionally filtered by client_id
    Parameters: request (NextRequest)
}*/
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');

    let query = supabase
      .from('conversations')
      .select(`
        *,
        clients:client_id (
          business_name
        ),
        messages (
          content,
          created_at
        )
      `)
      .order('updated_at', { ascending: false });

    if (clientId) {
      query = query.eq('client_id', clientId);
    }

    let timeoutHandle: NodeJS.Timeout;
    const timeoutPromise = new Promise((_, reject) => {
      timeoutHandle = setTimeout(() => reject(new Error('Supabase query timed out')), 15000);
    });

    try {
      const { data: conversations, error } = await Promise.race([
        query,
        timeoutPromise
      ]) as any;

      clearTimeout(timeoutHandle!);

      if (error) {
        logger.error('Fetch Conversations Error', error);
        return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
      }

      return NextResponse.json(conversations);
    } catch (raceError) {
      clearTimeout(timeoutHandle!);
      throw raceError;
    }
  } catch (error) {
    logger.error('Fetch Conversations Unexpected Error', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
