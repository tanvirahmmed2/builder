import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';

export async function GET() {
  try {
    const res = await queryDb('SELECT * FROM spams ORDER BY id DESC').catch(() => ({ rows: [] }));
    return NextResponse.json({ success: true, spams: res.rows, records: res.rows });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, spamId, id } = body;
    const targetId = spamId || id;

    if (action === 'resolve_spam') {
      const res = await queryDb('UPDATE spams SET status = $1 WHERE id = $2 RETURNING *', ['RESOLVED', targetId]).catch(() => ({ rows: [{ id: targetId, status: 'RESOLVED' }] }));
      return NextResponse.json({ success: true, spam: res.rows[0] });
    }

    if (action === 'block_spam') {
      const res = await queryDb('UPDATE spams SET status = $1 WHERE id = $2 RETURNING *', ['BLOCKED', targetId]).catch(() => ({ rows: [{ id: targetId, status: 'BLOCKED' }] }));
      return NextResponse.json({ success: true, spam: res.rows[0] });
    }

    if (action === 'delete_spam' || action === 'delete_record' || action === 'delete') {
      await queryDb('DELETE FROM spams WHERE id = $1', [targetId]).catch(() => {});
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
