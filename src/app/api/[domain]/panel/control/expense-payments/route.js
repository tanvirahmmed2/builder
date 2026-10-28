import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';
import { getControlAuth } from '@/lib/website-control';

export async function GET(request, context) {
  try {
    const { website, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const res = await queryDb(
      `SELECT ep.id, ep.id AS payment_id, ep.expense_id, ep.amount, ep.payment_method,
              ep.reference_no, ep.note, ep.payment_date, ep.created_at,
              e.title AS expense_title, e.category AS expense_category
       FROM website_expense_payments ep
       JOIN website_expenses e ON e.id = ep.expense_id
       WHERE ep.website_id = $1
       ORDER BY ep.id DESC`,
      [website.id]
    );

    return NextResponse.json(res.rows);
  } catch (error) {
    console.error('Expense payments GET API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
