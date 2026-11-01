import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';
import { authenticateCreator } from '@/lib/middleware/creator';

export async function GET(request) {
  try {
    const auth = await authenticateCreator(request);
    if (!auth.success) {
      return NextResponse.json({ success: false, error: auth.message }, { status: auth.status || 401 });
    }

    const res = await queryDb(
      `SELECT id, email, ip_address, user_agent, device, location, status, failure_reason, created_at
       FROM creator_login_activity
       WHERE creator_id = $1 OR email = $2
       ORDER BY created_at DESC
       LIMIT 50`,
      [auth.creator.id, auth.creator.email]
    );

    return NextResponse.json({
      success: true,
      logs: res.rows,
      data: res.rows,
    });
  } catch (error) {
    console.error('Error fetching creator login activity:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

