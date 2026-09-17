import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';

export async function GET() {
  try {
    const res = await queryDb('SELECT * FROM leads ORDER BY id DESC').catch(() => ({ rows: [] }));
    return NextResponse.json({ success: true, table: 'leads', records: res.rows });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'delete_record' || action === 'delete') {
      await queryDb('DELETE FROM leads WHERE id = $1', [body.id]);
      return NextResponse.json({ success: true });
    }

    if (action === 'update_record' || action === 'update') {
      const data = body.data || {};
      const keys = Object.keys(data).filter((k) => k !== 'id');
      if (keys.length === 0) return NextResponse.json({ success: true });
      const values = keys.map((k) => (typeof data[k] === 'object' && data[k] !== null ? JSON.stringify(data[k]) : data[k]));
      const setClauses = keys.map((k, i) => `"${k}" = $${i + 1}`);
      values.push(body.id);
      const res = await queryDb(
        `UPDATE leads SET ${setClauses.join(', ')} WHERE id = $${values.length} RETURNING *`,
        values
      );
      return NextResponse.json({ success: true, record: res.rows[0] });
    }

    const data = body.data || body;
    const keys = Object.keys(data).filter((k) => k !== 'id');
    const values = keys.map((k) => (typeof data[k] === 'object' && data[k] !== null ? JSON.stringify(data[k]) : data[k]));
    const placeholders = keys.map((_, i) => '$' + (i + 1));
    const res = await queryDb(
      `INSERT INTO leads (${keys.map((k) => `"${k}"`).join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`,
      values
    );
    return NextResponse.json({ success: true, record: res.rows[0] });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    let id = searchParams.get('id');
    if (!id) {
      const body = await request.json().catch(() => ({}));
      id = body.id;
    }
    if (!id) return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
    await queryDb('DELETE FROM leads WHERE id = $1', [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}