import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';
import { getControlAuth } from '@/lib/website-control';

export async function GET(request, context) {
  try {
    const { website, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const res = await queryDb(
      `SELECT pp.id, pp.id AS payment_id, pp.purchase_id, pp.amount, pp.payment_method,
              pp.transaction_id, pp.note, pp.payment_date, pp.created_at,
              p.invoice_no, s.name AS supplier_name
       FROM website_purchase_payments pp
       JOIN website_purchases p ON p.id = pp.purchase_id
       LEFT JOIN website_suppliers s ON s.id = p.supplier_id
       WHERE pp.website_id = $1
       ORDER BY pp.id DESC`,
      [website.id]
    );

    return NextResponse.json(res.rows);
  } catch (error) {
    console.error('Purchase payments GET API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
