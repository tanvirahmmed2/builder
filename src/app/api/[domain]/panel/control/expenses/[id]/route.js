import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';
import { getControlAuth, logWebsiteActivity } from '@/lib/website-control';

export async function GET(request, context) {
  try {
    const { website, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const params = await context.params;
    const expenseId = Number(params.id);

    const res = await queryDb(
      `SELECT e.id, e.id AS expense_id, e.website_id, e.branch_id, e.user_id,
              e.title, e.category, e.expense_date, e.total_amount, e.paid_amount,
              e.due_amount, e.payment_method, e.payment_status, e.note, e.items,
              e.created_at, e.updated_at,
              b.name AS branch_name
       FROM website_expenses e
       LEFT JOIN website_branches b ON b.id = e.branch_id
       WHERE e.id = $1 AND e.website_id = $2
       LIMIT 1`,
      [expenseId, website.id]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Expense not found' }, { status: 404 });
    }

    const expense = res.rows[0];

    // Fetch payments
    const paymentsRes = await queryDb(
      `SELECT id, id AS payment_id, amount, payment_method, reference_no, note, payment_date, created_at
       FROM website_expense_payments
       WHERE expense_id = $1 AND website_id = $2
       ORDER BY id DESC`,
      [expenseId, website.id]
    );

    return NextResponse.json({
      ...expense,
      expense_payments: paymentsRes.rows
    });

  } catch (error) {
    console.error('Expense GET ID error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, context) {
  try {
    const { website, user, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const params = await context.params;
    const expenseId = Number(params.id);

    const res = await queryDb(
      `DELETE FROM website_expenses
       WHERE id = $1 AND website_id = $2
       RETURNING id, title`,
      [expenseId, website.id]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Expense not found' }, { status: 404 });
    }

    await logWebsiteActivity({
      websiteId: website.id,
      userId: user?.id,
      userName: user?.name,
      action: 'EXPENSE_DELETED',
      details: `Deleted expense "${res.rows[0].title}" (#${expenseId})`,
      req: request
    });

    return NextResponse.json({ success: true, message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Expense DELETE ID error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
