import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';

// Helper function to verify staff authentication
async function verifyStaffAuth(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  
  try {
    const { data: { user }, error } = await getSupabaseAdmin().auth.getUser(token);
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

    const { 
      subject_id, 
      exam_session_id, 
      unit_code, 
      question_paper_link, 
      mark_scheme_link, 
      examiner_report_link 
    } = await request.json();

    if (!subject_id || !exam_session_id || !unit_code) {
      return NextResponse.json(
        { error: 'Subject, Exam Session, and Unit Code are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('papers')
      .insert({
        subject_id,
        exam_session_id,
        unit_code: unit_code.trim(),
        question_paper_link: question_paper_link?.trim() || null,
        mark_scheme_link: mark_scheme_link?.trim() || null,
        examiner_report_link: examiner_report_link?.trim() || null,
      })
      .select();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'A paper for this subject, exam session, and unit code already exists' },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to create paper' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      message: 'Past paper created successfully',
      paper: data[0]
    });

  } catch (error) {
    console.error('Paper creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
