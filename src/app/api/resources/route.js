import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

// Helper function to verify staff authentication
async function verifyStaffAuth(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  
  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) return null;

    // Verify user is staff
    const { data: staffData } = await supabaseAdmin
      .from('staff_users')
      .select('id, username, role')
      .eq('id', user.id)
      .single();

    return staffData ? { user, staff: staffData } : null;
  } catch (error) {
    return null;
  }
}

export async function POST(request) {
  try {
    const auth = await verifyStaffAuth(request);
    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized - staff access required' },
        { status: 401 }
      );
    }

    const { title, link, description, resource_type, subject_id, unit_chapter_name } = await request.json();

    if (!title || !link || !resource_type || !subject_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const unitValue = unit_chapter_name?.trim() === '' ? 'General' : unit_chapter_name?.trim() || 'General';

    const { data, error } = await supabaseAdmin
      .from('resources')
      .insert({
        title,
        link,
        description,
        resource_type,
        subject_id,
        unit_chapter_name: unitValue,
        contributor_email: auth.staff.username,
        approved: "Pending"
      })
      .select();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to create resource' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      message: 'Resource created successfully',
      resource: data[0]
    });

  } catch (error) {
    console.error('Resource creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
