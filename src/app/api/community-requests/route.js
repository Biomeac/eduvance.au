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

export async function GET(request) {
  try {
    const auth = await verifyStaffAuth(request);
    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized - staff access required' },
        { status: 401 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('community_resource_requests')
      .select('*')
      .eq('approved', "Unapproved")
      .is('rejected', null);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch pending requests' },
        { status: 500 }
      );
    }

    return NextResponse.json({ requests: data || [] });

  } catch (error) {
    console.error('Community requests fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const auth = await verifyStaffAuth(request);
    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized - staff access required' },
        { status: 401 }
      );
    }

    const { id, action, rejection_reason, ...updateData } = await request.json();

    if (!id || !action) {
      return NextResponse.json(
        { error: 'Request ID and action are required' },
        { status: 400 }
      );
    }

    if (action === 'approve') {
      // Get the request first
      const { data: requestData, error: fetchError } = await supabaseAdmin
        .from('community_resource_requests')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError || !requestData) {
        return NextResponse.json(
          { error: 'Request not found' },
          { status: 404 }
        );
      }

      // Update the request
      const { error: updateError } = await supabaseAdmin
        .from('community_resource_requests')
        .update({ 
          approved: "Pending", 
          approved_at: new Date().toISOString(), 
          approved_by: auth.staff.username 
        })
        .eq('id', id);

      if (updateError) {
        return NextResponse.json(
          { error: 'Failed to approve request' },
          { status: 500 }
        );
      }

      // Insert into resources table
      const { error: insertError } = await supabaseAdmin
        .from('resources')
        .insert({
          title: requestData.title,
          link: requestData.link,
          description: requestData.description,
          resource_type: requestData.resource_type,
          subject_id: requestData.subject_id,
          unit_chapter_name: requestData.unit_chapter_name,
          contributor_email: requestData.contributor_name || requestData.contributor_email || 'Community',
          approved: "Pending"
        });

      if (insertError) {
        return NextResponse.json(
          { error: 'Failed to create resource' },
          { status: 500 }
        );
      }

      return NextResponse.json({ message: 'Request approved successfully' });

    } else if (action === 'reject') {
      if (!rejection_reason) {
        return NextResponse.json(
          { error: 'Rejection reason is required' },
          { status: 400 }
        );
      }

      const { error } = await supabaseAdmin
        .from('community_resource_requests')
        .update({ 
          rejection_reason, 
          approved: "Unapproved",
          rejected: true
        })
        .eq('id', id);

      if (error) {
        return NextResponse.json(
          { error: 'Failed to reject request' },
          { status: 500 }
        );
      }

      return NextResponse.json({ message: 'Request rejected successfully' });

    } else if (action === 'update') {
      const { error } = await supabaseAdmin
        .from('community_resource_requests')
        .update(updateData)
        .eq('id', id);

      if (error) {
        return NextResponse.json(
          { error: 'Failed to update request' },
          { status: 500 }
        );
      }

      return NextResponse.json({ message: 'Request updated successfully' });

    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Community request action error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
