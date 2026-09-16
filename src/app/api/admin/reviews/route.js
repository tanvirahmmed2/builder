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

export async function POST(request) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'moderate_review' || action === 'update_status') {
      const res = await queryDb('UPDATE portfolio_reviews SET status = $1 WHERE id = $2 RETURNING *', [body.status, body.reviewId || body.id]);
      return NextResponse.json({ success: true, review: res.rows[0] });
    }

    if (action === 'delete_review' || action === 'delete_record' || action === 'delete') {
      const res = await queryDb('DELETE FROM portfolio_reviews WHERE id = $1 RETURNING id', [body.reviewId || body.id]);
      return NextResponse.json({ success: true, deleted: res.rows[0] });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
