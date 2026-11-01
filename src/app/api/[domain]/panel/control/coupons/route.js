import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';
import { getControlAuth } from '@/lib/website-control';

export async function GET(request, context) {
  try {
    const { website, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const res = await queryDb(
      `SELECT id, code, discount_type, discount_value, min_spend, max_discount, usage_limit, used_count, start_date, end_date, is_active, created_at, updated_at
       FROM website_coupons
       WHERE website_id = $1
       ORDER BY id DESC`,
      [website.id]
    );

    return NextResponse.json(res.rows);
  } catch (error) {
    console.error('Coupons GET error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request, context) {
  try {
    const { website, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const body = await request.json();
    const { code, discount_type = 'percentage', discount_value = 10, min_spend = 0, max_discount = null, usage_limit = 100, start_date = null, end_date = null, is_active = true } = body;

    if (!code?.trim()) {
      return NextResponse.json({ success: false, error: 'Coupon code is required' }, { status: 400 });
    }

    const res = await queryDb(
      `INSERT INTO website_coupons
       (website_id, code, discount_type, discount_value, min_spend, max_discount, usage_limit, used_count, start_date, end_date, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 0, $8, $9, $10, NOW(), NOW())
       RETURNING *`,
      [website.id, code.trim().toUpperCase(), discount_type, Number(discount_value) || 0, Number(min_spend) || 0, max_discount ? Number(max_discount) : null, Number(usage_limit) || 100, start_date || null, end_date || null, is_active]
    );

    return NextResponse.json({ success: true, coupon: res.rows[0] });
  } catch (error) {
    console.error('Coupons POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

