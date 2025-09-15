import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Authenticate with Supabase
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await getSupabaseAdmin().auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check if user is staff
    const { data: staffData, error: staffError } = await supabaseAdmin
      .from('staff_users')
      .select('id, username, role')
      .eq('id', data.user.id)
      .single();

    if (staffError || !staffData) {
      return NextResponse.json(
        { error: 'Access denied - staff only' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      user: {
        id: data.user.id,
        email: data.user.email,
        username: staffData.username,
        role: staffData.role,
      },
      session: data.session,
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
