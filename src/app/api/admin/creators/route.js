import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';

export async function GET() {
  try {
    const res = await queryDb('SELECT * FROM creators ORDER BY id DESC').catch(() => ({ rows: [] }));
    return NextResponse.json({ success: true, creators: res.rows, records: res.rows });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'update_creator_role' || action === 'update_role') {
      const res = await queryDb('UPDATE creators SET role = $1 WHERE id = $2 RETURNING *', [body.role, body.creatorId]);
      return NextResponse.json({ success: true, creator: res.rows[0] });
    }

    if (action === 'delete_record' || action === 'delete') {
      await queryDb('DELETE FROM creators WHERE id = $1', [body.id || body.creatorId]);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
