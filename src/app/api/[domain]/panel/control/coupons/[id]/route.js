import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';
import { getControlAuth } from '@/lib/website-control';

export async function PUT(request, context) {
  try {
    const { website, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const params = context?.params ? await context.params : {};
    const id = params?.id;
    const body = await request.json();
    const { code, discount_type, discount_value, min_spend, max_discount, usage_limit, is_active } = body;

    const res = await queryDb(
      `UPDATE website_coupons
       SET code = COALESCE($1, code),
           discount_type = COALESCE($2, discount_type),
           discount_value = COALESCE($3, discount_value),
           min_spend = COALESCE($4, min_spend),
           max_discount = COALESCE($5, max_discount),
           usage_limit = COALESCE($6, usage_limit),
           is_active = COALESCE($7, is_active),
           updated_at = NOW()
       WHERE id = $8 AND website_id = $9
       RETURNING *`,
      [code ? code.trim().toUpperCase() : null, discount_type, discount_value ? Number(discount_value) : null, min_spend ? Number(min_spend) : null, max_discount ? Number(max_discount) : null, usage_limit ? Number(usage_limit) : null, is_active, id, website.id]
    );

    if (res.rowCount === 0) return NextResponse.json({ success: false, error: 'Coupon not found' }, { status: 404 });
    return NextResponse.json({ success: true, coupon: res.rows[0] });
  } catch (error) {
    console.error('Coupons PUT error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, context) {
  try {
    const { website, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const params = context?.params ? await context.params : {};
    const id = params?.id;

    const res = await queryDb(
      `DELETE FROM website_coupons WHERE id = $1 AND website_id = $2 RETURNING id`,
      [id, website.id]
    );

    if (res.rowCount === 0) return NextResponse.json({ success: false, error: 'Coupon not found' }, { status: 404 });
    return NextResponse.json({ success: true, deletedId: id });
  } catch (error) {
    console.error('Coupons DELETE error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

