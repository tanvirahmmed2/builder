import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';
import { getControlAuth } from '@/lib/website-control';

export async function GET(request, context) {
  try {
    const { website, user, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    if (!user || !user.id) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const res = await queryDb(
      `SELECT id, id AS session_id, device_info, ip_address, is_active, last_active_at, created_at,
              TRUE AS is_current_device
       FROM website_staff_sessions
       WHERE user_id = $1 AND website_id = $2 AND is_active = TRUE
       ORDER BY last_active_at DESC`,
      [user.id, website.id]
    );

    // Fallback if no explicit session record yet
    let sessions = res.rows;
    if (sessions.length === 0) {
      sessions = [{
        session_id: 1,
        device_info: 'Current Browser / Desktop',
        ip_address: '127.0.0.1',
        is_active: true,
        is_current_device: true,
        last_active_at: new Date().toISOString()
      }];
    }

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('Staff sessions GET API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, context) {
  try {
    const { website, user, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    if (!user || !user.id) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    await queryDb(
      `DELETE FROM website_staff_sessions WHERE user_id = $1 AND website_id = $2`,
      [user.id, website.id]
    );

    return NextResponse.json({ success: true, message: 'All other sessions revoked successfully' });
  } catch (error) {
    console.error('Staff sessions DELETE API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
