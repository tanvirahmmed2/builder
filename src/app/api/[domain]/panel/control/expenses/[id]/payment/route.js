import { NextResponse } from 'next/server';
import { queryDb, pool } from '@/lib/db/pg';
import { getControlAuth, logWebsiteActivity } from '@/lib/website-control';

export async function POST(request, context) {
  const client = await pool.connect();
  try {
    const { website, user, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) {
      client.release();
      return errorResponse;
    }

    const params = await context.params;
    const expenseId = Number(params.id);

    const body = await request.json();
    const { amount, payment_method = 'cash', note = '' } = body;

    const payAmt = parseFloat(amount);
    if (!payAmt || payAmt <= 0) {
      client.release();
      return NextResponse.json({ success: false, error: 'Valid payment amount is required' }, { status: 400 });
    }

    await client.query('BEGIN');

    // 1. Verify expense exists
    const expRes = await client.query(
      `SELECT id, title, total_amount, paid_amount, due_amount
       FROM website_expenses
       WHERE id = $1 AND website_id = $2
       FOR UPDATE`,
      [expenseId, website.id]
    );

    if (expRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json({ success: false, error: 'Expense not found' }, { status: 404 });
    }

    const exp = expRes.rows[0];
    const newPaid = parseFloat(exp.paid_amount) + payAmt;
    const newDue = Math.max(0, parseFloat(exp.total_amount) - newPaid);
    const newStatus = newDue <= 0 ? 'paid' : 'partial';

    // 2. Insert into website_expense_payments
    const payRes = await client.query(
      `INSERT INTO website_expense_payments (expense_id, website_id, amount, payment_method, note)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [expenseId, website.id, payAmt, payment_method, note || `Payment for "${exp.title}"`]
    );

    // 3. Update website_expenses
    await client.query(
      `UPDATE website_expenses
       SET paid_amount = $1, due_amount = $2, payment_status = $3, updated_at = NOW()
       WHERE id = $4 AND website_id = $5`,
      [newPaid, newDue, newStatus, expenseId, website.id]
    );

    await client.query('COMMIT');

    await logWebsiteActivity({
      websiteId: website.id,
      userId: user?.id,
      userName: user?.name,
      action: 'EXPENSE_PAYMENT_ADDED',
      details: `Paid ৳${payAmt} for expense "${exp.title}"`,
      req: request
    });

    return NextResponse.json({
      success: true,
      payment: payRes.rows[0],
      paid_amount: newPaid,
      due_amount: newDue,
      payment_status: newStatus
    }, { status: 201 });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Expense payment POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}
