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
      `SELECT id, token, ip_address, user_agent, device, is_revoked, expires_at, created_at, updated_at
       FROM creator_sessions
       WHERE creator_id = $1
       ORDER BY created_at DESC`,
      [auth.creator.id]
    );

    return NextResponse.json({
      success: true,
      sessions: res.rows,
      data: res.rows,
    });
  } catch (error) {
    console.error('Error fetching creator sessions:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const auth = await authenticateCreator(request);
    if (!auth.success) {
      return NextResponse.json({ success: false, error: auth.message }, { status: auth.status || 401 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('id');

    if (sessionId) {
      await queryDb(
        `UPDATE creator_sessions SET is_revoked = TRUE WHERE id = $1 AND creator_id = $2`,
        [Number(sessionId), auth.creator.id]
      );
      return NextResponse.json({ success: true, message: 'Session revoked successfully' });
    } else {
      // Revoke all other sessions
      await queryDb(
        `UPDATE creator_sessions SET is_revoked = TRUE WHERE creator_id = $1`,
        [auth.creator.id]
      );
      return NextResponse.json({ success: true, message: 'All sessions revoked successfully' });
    }
  } catch (error) {
    console.error('Error revoking creator sessions:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

