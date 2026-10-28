import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';
import { getControlAuth } from '@/lib/website-control';

export async function GET(request, context) {
  try {
    const { website, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const [salesPaidRes, manualAddRes, purchRes, expRes, salRes, withRes] = await Promise.all([
      queryDb(`SELECT COALESCE(SUM(paid_amount), 0) AS total FROM website_sales WHERE website_id = $1 AND order_status != 'cancelled'`, [website.id]),
      queryDb(`SELECT COALESCE(SUM(amount), 0) AS total FROM website_balance_transactions WHERE website_id = $1 AND type = 'add'`, [website.id]),
      queryDb(`SELECT COALESCE(SUM(total_paid), 0) AS total FROM website_purchases WHERE website_id = $1`, [website.id]),
      queryDb(`SELECT COALESCE(SUM(paid_amount), 0) AS total FROM website_expenses WHERE website_id = $1`, [website.id]),
      queryDb(`SELECT COALESCE(SUM(amount), 0) AS total FROM website_salary_payments WHERE website_id = $1`, [website.id]),
      queryDb(`SELECT COALESCE(SUM(amount), 0) AS total FROM website_withdrawals WHERE website_id = $1`, [website.id]),
    ]);

    const inflow = parseFloat(salesPaidRes.rows[0]?.total || 0) + parseFloat(manualAddRes.rows[0]?.total || 0);
    const outflow = parseFloat(purchRes.rows[0]?.total || 0) +
                    parseFloat(expRes.rows[0]?.total || 0) +
                    parseFloat(salRes.rows[0]?.total || 0) +
                    parseFloat(withRes.rows[0]?.total || 0);

    const availableBalance = inflow - outflow;

    return NextResponse.json({
      available_balance: availableBalance,
      total_inflow: inflow,
      total_outflow: outflow
    });

  } catch (error) {
    console.error('Available balance GET API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
