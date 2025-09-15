import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function GET(request) {
  try {
    const { data, error } = await supabaseAdmin
      .from('exam_sessions')
      .select('id, session, year')
      .order('year', { ascending: false })
      .order('session', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch exam sessions' },
        { status: 500 }
      );
    }

    return NextResponse.json({ examSessions: data || [] });

  } catch (error) {
    console.error('Exam sessions fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
