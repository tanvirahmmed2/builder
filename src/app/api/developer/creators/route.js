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

// CREATE CREATOR
export async function POST(request) {
  try {
    const body = await request.json();
    const data = body.data || body;
    const keys = Object.keys(data).filter((k) => k !== 'id' && k !== 'action');
    const values = keys.map((k) => (typeof data[k] === 'object' && data[k] !== null ? JSON.stringify(data[k]) : data[k]));
    const placeholders = keys.map((_, i) => '$' + (i + 1));
    const res = await queryDb(
      `INSERT INTO creators (${keys.map((k) => `"${k}"`).join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`,
      values
    );
    return NextResponse.json({ success: true, record: res.rows[0] });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

// UPDATE CREATOR
export async function PUT(request) {
  try {
    const body = await request.json();
    const id = body.creatorId || body.id || body.data?.id;
    if (!id) return NextResponse.json({ success: false, error: 'Creator ID is required' }, { status: 400 });

    if (body.role) {
      const res = await queryDb('UPDATE creators SET role = $1 WHERE id = $2 RETURNING *', [body.role, id]);
      return NextResponse.json({ success: true, creator: res.rows[0], record: res.rows[0] });
    }

    const data = body.data || body;
    const keys = Object.keys(data).filter((k) => k !== 'id' && k !== 'creatorId' && k !== 'action');
    if (keys.length === 0) return NextResponse.json({ success: true });
    const values = keys.map((k) => (typeof data[k] === 'object' && data[k] !== null ? JSON.stringify(data[k]) : data[k]));
    const setClauses = keys.map((k, i) => `"${k}" = $${i + 1}`);
    values.push(id);
    const res = await queryDb(
      `UPDATE creators SET ${setClauses.join(', ')} WHERE id = $${values.length} RETURNING *`,
      values
    );
    return NextResponse.json({ success: true, creator: res.rows[0], record: res.rows[0] });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

// DELETE CREATOR
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    let id = searchParams.get('id') || searchParams.get('creatorId');
    if (!id) {
      const body = await request.json().catch(() => ({}));
      id = body.id || body.creatorId;
    }
    if (!id) return NextResponse.json({ success: false, error: 'Creator ID is required' }, { status: 400 });
    await queryDb('DELETE FROM creators WHERE id = $1', [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
