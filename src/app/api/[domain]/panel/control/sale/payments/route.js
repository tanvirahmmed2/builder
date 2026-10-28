import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';
import { getControlAuth } from '@/lib/website-control';

export async function GET(request, context) {
  try {
    const { website, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const res = await queryDb(
      `SELECT sp.id, sp.id AS payment_id, sp.sale_id, sp.amount, sp.payment_method,
              sp.transaction_id, sp.note, sp.payment_date, sp.created_at,
              s.invoice_no, s.customer_name, s.customer_phone
       FROM website_sale_payments sp
       JOIN website_sales s ON s.id = sp.sale_id
       WHERE sp.website_id = $1
       ORDER BY sp.id DESC`,
      [website.id]
    );

    return NextResponse.json(res.rows);
  } catch (error) {
    console.error('Sale payments GET API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
