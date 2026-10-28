import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';
import { getControlAuth } from '@/lib/website-control';

export async function GET(request, context) {
  try {
    const { website, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const res = await queryDb(
      `SELECT r.id, r.id AS review_id, r.website_id, r.product_id, r.customer_name,
              r.customer_email, r.rating, r.comment, r.is_approved, r.created_at,
              p.name AS product_name, p.image AS product_image
       FROM website_reviews r
       LEFT JOIN website_products p ON p.id = r.product_id
       WHERE r.website_id = $1
       ORDER BY r.id DESC`,
      [website.id]
    );

    return NextResponse.json(res.rows);
  } catch (error) {
    console.error('Reviews GET API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
