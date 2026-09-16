import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';

export async function GET() {
  try {
    const res = await queryDb('SELECT * FROM users ORDER BY id DESC').catch(() => ({ rows: [] }));
    return NextResponse.json({ success: true, users: res.rows, records: res.rows });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'ban_user') {
      const res = await queryDb('UPDATE users SET is_banned = $1 WHERE id = $2 RETURNING *', [Boolean(body.isBanned), body.userId || body.id]);
      return NextResponse.json({ success: true, user: res.rows[0] });
    }

    if (action === 'toggle_user_status') {
      const res = await queryDb('UPDATE users SET is_active = NOT is_active WHERE id = $1 RETURNING *', [body.userId || body.id]);
      return NextResponse.json({ success: true, user: res.rows[0] });
    }

    if (action === 'delete_user' || action === 'delete_record' || action === 'delete') {
      const res = await queryDb('DELETE FROM users WHERE id = $1 RETURNING id', [body.userId || body.id]);
      return NextResponse.json({ success: true, deleted: res.rows[0] });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
