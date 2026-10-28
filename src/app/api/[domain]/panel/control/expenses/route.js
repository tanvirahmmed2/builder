import { NextResponse } from 'next/server';
import { queryDb, pool } from '@/lib/db/pg';
import { getControlAuth, logWebsiteActivity } from '@/lib/website-control';

export async function GET(request, context) {
  try {
    const { website, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const res = await queryDb(
      `SELECT e.id, e.id AS expense_id, e.website_id, e.branch_id, e.user_id,
              e.title, e.category, e.expense_date, e.total_amount, e.paid_amount,
              e.due_amount, e.payment_method, e.payment_status, e.note, e.items,
              e.created_at, e.updated_at,
              b.name AS branch_name
       FROM website_expenses e
       LEFT JOIN website_branches b ON b.id = e.branch_id
       WHERE e.website_id = $1
       ORDER BY e.expense_date DESC, e.id DESC`,
      [website.id]
    );

    return NextResponse.json(res.rows);
  } catch (error) {
    console.error('Expenses GET API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request, context) {
  const client = await pool.connect();
  try {
    const { website, user, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) {
      client.release();
      return errorResponse;
    }

    const body = await request.json();
    const {
      title,
      category = 'General',
      expense_date = new Date().toISOString().split('T')[0],
      total_amount,
      paid_amount = 0,
      payment_method = 'cash',
      note = '',
      items = [],
      branch_id
    } = body;

    if (!title || !title.trim()) {
      client.release();
      return NextResponse.json({ success: false, error: 'Expense title is required' }, { status: 400 });
    }

    const totalAmt = parseFloat(total_amount) || 0;
    const paidAmt = parseFloat(paid_amount) || 0;
    const dueAmt = Math.max(0, totalAmt - paidAmt);
    const paymentStatus = dueAmt <= 0 ? 'paid' : (paidAmt > 0 ? 'partial' : 'due');
    const effectiveBranchId = branch_id ? Number(branch_id) : (user?.branch_id || null);

    await client.query('BEGIN');

    // 1. Insert expense
    const expRes = await client.query(
      `INSERT INTO website_expenses (
         website_id, branch_id, user_id, title, category, expense_date,
         total_amount, paid_amount, due_amount, payment_method, payment_status,
         note, items
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [
        website.id,
        effectiveBranchId,
        user?.id || null,
        title.trim(),
        category,
        expense_date,
        totalAmt,
        paidAmt,
        dueAmt,
        payment_method,
        paymentStatus,
        note,
        JSON.stringify(items)
      ]
    );

    const expense = expRes.rows[0];

    // 2. If initial payment made, record in website_expense_payments
    if (paidAmt > 0) {
      await client.query(
        `INSERT INTO website_expense_payments (expense_id, website_id, amount, payment_method, note)
         VALUES ($1, $2, $3, $4, $5)`,
        [expense.id, website.id, paidAmt, payment_method, `Initial payment for "${title}"`]
      );
    }

    await client.query('COMMIT');

    await logWebsiteActivity({
      websiteId: website.id,
      userId: user?.id,
      userName: user?.name,
      action: 'EXPENSE_CREATED',
      details: `Created expense "${title}": ৳${totalAmt} (${paymentStatus})`,
      req: request
    });

    return NextResponse.json({
      ...expense,
      expense_id: expense.id
    }, { status: 201 });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Expenses POST API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}
