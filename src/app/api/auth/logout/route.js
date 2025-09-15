import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';

export async function POST(request) {
  try {
    const { accessToken } = await request.json();

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Access token required' },
        { status: 400 }
      );
    }

    // Sign out the user
    const { error } = await getSupabaseAdmin().auth.admin.signOut(accessToken);

    if (error) {
      return NextResponse.json(
        { error: 'Logout failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Logged out successfully' });

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
