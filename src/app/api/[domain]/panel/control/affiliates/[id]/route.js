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
    const { commission_rate, status } = body;

    const res = await queryDb(
      `UPDATE website_affiliates
       SET commission_rate = COALESCE($1, commission_rate),
           status = COALESCE($2, status),
           updated_at = NOW()
       WHERE id = $3 AND website_id = $4
       RETURNING *`,
      [commission_rate ? Number(commission_rate) : null, status, id, website.id]
    );

    if (res.rowCount === 0) return NextResponse.json({ success: false, error: 'Affiliate not found' }, { status: 404 });
    return NextResponse.json({ success: true, affiliate: res.rows[0] });
  } catch (error) {
    console.error('Affiliates PUT error:', error);
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
      `DELETE FROM website_affiliates WHERE id = $1 AND website_id = $2 RETURNING id`,
      [id, website.id]
    );

    if (res.rowCount === 0) return NextResponse.json({ success: false, error: 'Affiliate not found' }, { status: 404 });
    return NextResponse.json({ success: true, deletedId: id });
  } catch (error) {
    console.error('Affiliates DELETE error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

