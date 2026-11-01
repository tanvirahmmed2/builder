import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';
import { getControlAuth } from '@/lib/website-control';

export async function GET(request, context) {
  try {
    const { website, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const res = await queryDb(
      `SELECT s.*, b.name AS branch_name
       FROM website_ecommerce_orders s
       LEFT JOIN website_branches b ON b.id = s.branch_id
       WHERE s.website_id = $1 AND (LOWER(s.status) = 'returned' OR LOWER(COALESCE(s.order_status, '')) = 'returned')
       ORDER BY s.id DESC`,
      [website.id]
    );

    return NextResponse.json(res.rows);
  } catch (error) {
    console.error('Return GET API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

