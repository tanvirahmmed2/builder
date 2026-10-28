import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';
import { getControlAuth, logWebsiteActivity } from '@/lib/website-control';

export async function GET(request, context) {
  try {
    const { website, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const [
      salesRes, manualAddRes, manualDeductRes,
      purchRes, expRes, salRes, withRes, txRes, settingsRes
    ] = await Promise.all([
      queryDb(`SELECT COALESCE(SUM(paid_amount), 0) AS total FROM website_sales WHERE website_id = $1 AND order_status != 'cancelled'`, [website.id]),
      queryDb(`SELECT COALESCE(SUM(amount), 0) AS total FROM website_balance_transactions WHERE website_id = $1 AND type = 'add'`, [website.id]),
      queryDb(`SELECT COALESCE(SUM(amount), 0) AS total FROM website_balance_transactions WHERE website_id = $1 AND type = 'deduct'`, [website.id]),
      queryDb(`SELECT COALESCE(SUM(total_paid), 0) AS total FROM website_purchases WHERE website_id = $1`, [website.id]),
      queryDb(`SELECT COALESCE(SUM(paid_amount), 0) AS total FROM website_expenses WHERE website_id = $1`, [website.id]),
      queryDb(`SELECT COALESCE(SUM(amount), 0) AS total FROM website_salary_payments WHERE website_id = $1`, [website.id]),
      queryDb(`SELECT COALESCE(SUM(amount), 0) AS total FROM website_withdrawals WHERE website_id = $1`, [website.id]),
      queryDb(`SELECT id, id AS tx_id, type, amount, payment_method, reference_no, note, created_at FROM website_balance_transactions WHERE website_id = $1 ORDER BY id DESC LIMIT 50`, [website.id]),
      queryDb(`SELECT is_share_investment FROM website_settings WHERE website_id = $1 LIMIT 1`, [website.id]),
    ]);

    const salesTotal = parseFloat(salesRes.rows[0]?.total || 0);
    const manualAddTotal = parseFloat(manualAddRes.rows[0]?.total || 0);
    const manualDeductTotal = parseFloat(manualDeductRes.rows[0]?.total || 0);
    const purchTotal = parseFloat(purchRes.rows[0]?.total || 0);
    const expTotal = parseFloat(expRes.rows[0]?.total || 0);
    const salTotal = parseFloat(salRes.rows[0]?.total || 0);
    const withTotal = parseFloat(withRes.rows[0]?.total || 0);

    const availableBalance = (salesTotal + manualAddTotal) - (purchTotal + expTotal + salTotal + withTotal + manualDeductTotal);

    return NextResponse.json({
      is_share_investment: settingsRes.rows[0]?.is_share_investment || false,
      available_balance: availableBalance,
      total_sales_payments: salesTotal,
      total_manual_added: manualAddTotal,
      total_purchases: purchTotal,
      total_expenses: expTotal,
      total_salaries: salTotal,
      total_withdrawals: withTotal,
      balance_transactions: txRes.rows
    });

  } catch (error) {
    console.error('Balance GET API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request, context) {
  try {
    const { website, user, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const body = await request.json();
    const { type = 'add', amount, payment_method = 'Cash', reference_no = '', note = '' } = body;

    const txAmt = parseFloat(amount);
    if (!txAmt || txAmt <= 0) {
      return NextResponse.json({ success: false, error: 'Valid transaction amount is required' }, { status: 400 });
    }

    const res = await queryDb(
      `INSERT INTO website_balance_transactions (website_id, type, amount, payment_method, reference_no, note)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, id AS tx_id, website_id, type, amount, payment_method, reference_no, note, created_at`,
      [website.id, type, txAmt, payment_method, reference_no, note]
    );

    await logWebsiteActivity({
      websiteId: website.id,
      userId: user?.id,
      userName: user?.name,
      action: 'BALANCE_TRANSACTION_RECORDED',
      details: `${type === 'add' ? 'Added' : 'Deducted'} manual balance of ৳${txAmt}`,
      req: request
    });

    return NextResponse.json(res.rows[0], { status: 201 });
  } catch (error) {
    console.error('Balance POST API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
