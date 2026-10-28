import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';
import { getControlAuth } from '@/lib/website-control';

export async function GET(request, context) {
  try {
    const { website, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const [
      salesRes, manualAddRes, manualDeductRes,
      purchRes, expRes, salRes, withRes,
      stockRes, branchCountRes, staffCountRes,
      latestSalesRes, latestPaymentsRes, latestWithdrawalsRes,
      latestPurchPayRes, latestSalPayRes, latestExpRes
    ] = await Promise.all([
      queryDb(`SELECT COALESCE(SUM(paid_amount), 0) AS total FROM website_sales WHERE website_id = $1 AND order_status != 'cancelled'`, [website.id]),
      queryDb(`SELECT COALESCE(SUM(amount), 0) AS total FROM website_balance_transactions WHERE website_id = $1 AND type = 'add'`, [website.id]),
      queryDb(`SELECT COALESCE(SUM(amount), 0) AS total FROM website_balance_transactions WHERE website_id = $1 AND type = 'deduct'`, [website.id]),
      queryDb(`SELECT COALESCE(SUM(total_paid), 0) AS total FROM website_purchases WHERE website_id = $1`, [website.id]),
      queryDb(`SELECT COALESCE(SUM(paid_amount), 0) AS total FROM website_expenses WHERE website_id = $1`, [website.id]),
      queryDb(`SELECT COALESCE(SUM(amount), 0) AS total FROM website_salary_payments WHERE website_id = $1`, [website.id]),
      queryDb(`SELECT COALESCE(SUM(amount), 0) AS total FROM website_withdrawals WHERE website_id = $1`, [website.id]),

      queryDb(`SELECT COALESCE(SUM(stock * buy_price), 0) AS stock_balance, COALESCE(SUM(stock), 0) AS stock_items, COUNT(*) AS total_items FROM website_products WHERE website_id = $1`, [website.id]),
      queryDb(`SELECT COUNT(*) AS total_branches FROM website_branches WHERE website_id = $1 AND is_active = TRUE`, [website.id]),
      queryDb(`SELECT COUNT(*) AS total_staff FROM website_users WHERE website_id = $1 AND is_active = TRUE`, [website.id]),

      queryDb(`SELECT id, id AS order_id, invoice_no, customer_name, customer_phone, total_amount, paid_amount, due_amount, payment_type, order_status, created_at FROM website_sales WHERE website_id = $1 ORDER BY id DESC LIMIT 5`, [website.id]),
      queryDb(`SELECT id, id AS payment_id, amount, payment_method, transaction_id, created_at FROM website_sale_payments WHERE website_id = $1 ORDER BY id DESC LIMIT 5`, [website.id]),
      queryDb(`SELECT w.id, w.amount, w.payment_method, w.withdrawal_date, i.name AS investor_name FROM website_withdrawals w JOIN website_investors i ON i.id = w.investor_id WHERE w.website_id = $1 ORDER BY w.id DESC LIMIT 5`, [website.id]),
      queryDb(`SELECT id, amount, payment_method, payment_date FROM website_purchase_payments WHERE website_id = $1 ORDER BY id DESC LIMIT 5`, [website.id]),
      queryDb(`SELECT sp.id, sp.amount, sp.payment_month, u.name AS staff_name FROM website_salary_payments sp JOIN website_users u ON u.id = sp.staff_id WHERE sp.website_id = $1 ORDER BY sp.id DESC LIMIT 5`, [website.id]),
      queryDb(`SELECT id, id AS expense_id, title, category, total_amount, paid_amount, expense_date FROM website_expenses WHERE website_id = $1 ORDER BY id DESC LIMIT 5`, [website.id])
    ]);

    const salesTotal = parseFloat(salesRes.rows[0]?.total || 0);
    const manualAddTotal = parseFloat(manualAddRes.rows[0]?.total || 0);
    const manualDeductTotal = parseFloat(manualDeductRes.rows[0]?.total || 0);
    const purchTotal = parseFloat(purchRes.rows[0]?.total || 0);
    const expTotal = parseFloat(expRes.rows[0]?.total || 0);
    const salTotal = parseFloat(salRes.rows[0]?.total || 0);
    const withTotal = parseFloat(withRes.rows[0]?.total || 0);

    const currentBalance = (salesTotal + manualAddTotal) - (purchTotal + expTotal + salTotal + withTotal + manualDeductTotal);
    const stockRow = stockRes.rows[0] || {};

    return NextResponse.json({
      currentBalance: currentBalance,
      stockBalance: parseFloat(stockRow.stock_balance || 0),
      stockItems: parseInt(stockRow.stock_items || 0, 10),
      totalItems: parseInt(stockRow.total_items || 0, 10),
      totalBranch: parseInt(branchCountRes.rows[0]?.total_branches || 0, 10),
      totalStaff: parseInt(staffCountRes.rows[0]?.total_staff || 0, 10),
      latestSales: latestSalesRes.rows,
      latestPayments: latestPaymentsRes.rows,
      latestWithdrawals: latestWithdrawalsRes.rows,
      latestPurchasePayments: latestPurchPayRes.rows,
      latestSalaryPayments: latestSalPayRes.rows,
      latestExpenses: latestExpRes.rows
    });

  } catch (error) {
    console.error('Dashboard stats GET API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
