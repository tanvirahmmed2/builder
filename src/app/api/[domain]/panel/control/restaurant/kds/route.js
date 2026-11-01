import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';
import { getControlAuth } from '@/lib/website-control';

export async function GET(request, context) {
  try {
    const { website, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const res = await queryDb(
      `SELECT k.id, k.ticket_number, k.status, k.priority, k.estimated_ready_at, k.created_at,
              o.id as order_id, o.customer_name, o.customer_phone
       FROM website_restaurant_kds_tickets k
       LEFT JOIN website_restaurant_orders o ON k.order_id = o.id
       WHERE k.website_id = $1
       ORDER BY k.created_at ASC`,
      [website.id]
    );

    return NextResponse.json(res.rows);
  } catch (error) {
    console.error('KDS GET error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request, context) {
  try {
    const { website, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const body = await request.json();
    const { id, status } = body;

    const res = await queryDb(
      `UPDATE website_restaurant_kds_tickets
       SET status = $1, updated_at = NOW()
       WHERE id = $2 AND website_id = $3
       RETURNING *`,
      [status, id, website.id]
    );

    if (res.rowCount === 0) return NextResponse.json({ success: false, error: 'KDS ticket not found' }, { status: 404 });
    return NextResponse.json({ success: true, ticket: res.rows[0] });
  } catch (error) {
    console.error('KDS PUT error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

