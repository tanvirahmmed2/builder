import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';

export async function GET() {
  try {
    const res = await queryDb('SELECT * FROM portfolio_reviews ORDER BY id DESC').catch(() => ({ rows: [] }));
    return NextResponse.json({ success: true, reviews: res.rows, records: res.rows, portfolio_reviews: res.rows });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// CREATE REVIEW
export async function POST(request) {
  try {
    const body = await request.json();
    const data = body.data || body;
    const keys = Object.keys(data).filter((k) => k !== 'id' && k !== 'action' && k !== 'reviewId');
    const values = keys.map((k) => (typeof data[k] === 'object' && data[k] !== null ? JSON.stringify(data[k]) : data[k]));
    const placeholders = keys.map((_, i) => '$' + (i + 1));
    const res = await queryDb(
      `INSERT INTO portfolio_reviews (${keys.map((k) => `"${k}"`).join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`,
      values
    );
    return NextResponse.json({ success: true, record: res.rows[0] });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

// UPDATE REVIEW
export async function PUT(request) {
  try {
    const body = await request.json();
    const id = body.reviewId || body.id || body.data?.id;
    if (!id) return NextResponse.json({ success: false, error: 'Review ID is required' }, { status: 400 });

    if (body.status) {
      const res = await queryDb('UPDATE portfolio_reviews SET status = $1 WHERE id = $2 RETURNING *', [body.status, id]);
      return NextResponse.json({ success: true, review: res.rows[0], record: res.rows[0] });
    }

    const data = body.data || body;
    const keys = Object.keys(data).filter((k) => k !== 'id' && k !== 'action' && k !== 'reviewId');
    if (keys.length === 0) return NextResponse.json({ success: true });
    const values = keys.map((k) => (typeof data[k] === 'object' && data[k] !== null ? JSON.stringify(data[k]) : data[k]));
    const setClauses = keys.map((k, i) => `"${k}" = $${i + 1}`);
    values.push(id);
    const res = await queryDb(
      `UPDATE portfolio_reviews SET ${setClauses.join(', ')} WHERE id = $${values.length} RETURNING *`,
      values
    );
    return NextResponse.json({ success: true, review: res.rows[0], record: res.rows[0] });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

// DELETE REVIEW
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    let id = searchParams.get('id') || searchParams.get('reviewId');
    if (!id) {
      const body = await request.json().catch(() => ({}));
      id = body.reviewId || body.id;
    }
    if (!id) return NextResponse.json({ success: false, error: 'Review ID is required' }, { status: 400 });
    const res = await queryDb('DELETE FROM portfolio_reviews WHERE id = $1 RETURNING id', [id]);
    return NextResponse.json({ success: true, deleted: res.rows[0] });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
