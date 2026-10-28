import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';
import { getControlAuth, logWebsiteActivity } from '@/lib/website-control';

export async function GET(request, context) {
  try {
    const { website, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const res = await queryDb(
      `SELECT sp.id, sp.id AS payment_id, sp.website_id, sp.staff_id, sp.staff_salary_id,
              sp.amount, sp.payment_month, sp.payment_method, sp.status, sp.transaction_id,
              sp.payment_date, sp.account_details, sp.created_at,
              u.name AS staff_name, u.email AS staff_email, u.phone AS staff_phone, u.role AS staff_role,
              s.title AS salary_title, s.base_salary
       FROM website_salary_payments sp
       JOIN website_users u ON u.id = sp.staff_id
       LEFT JOIN website_staff_salaries ss ON ss.id = sp.staff_salary_id
       LEFT JOIN website_salaries s ON s.id = ss.salary_id
       WHERE sp.website_id = $1
       ORDER BY sp.payment_date DESC, sp.id DESC`,
      [website.id]
    );

    return NextResponse.json(res.rows);
  } catch (error) {
    console.error('Salary payments GET API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request, context) {
  try {
    const { website, user, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const body = await request.json();
    const {
      staff_id,
      staff_salary_id,
      amount,
      payment_month,
      payment_method = 'Cash',
      status = 'Paid',
      transaction_id = '',
      payment_date = new Date().toISOString().split('T')[0],
      account_details = ''
    } = body;

    const payAmt = parseFloat(amount);
    if (!staff_id || !payAmt || !payment_month) {
      return NextResponse.json({ success: false, error: 'Staff, amount, and payment month are required' }, { status: 400 });
    }

    const res = await queryDb(
      `INSERT INTO website_salary_payments (
         website_id, staff_id, staff_salary_id, amount, payment_month,
         payment_method, status, transaction_id, payment_date, account_details
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, id AS payment_id, website_id, staff_id, staff_salary_id, amount, payment_month,
                 payment_method, status, transaction_id, payment_date, account_details, created_at`,
      [
        website.id,
        Number(staff_id),
        staff_salary_id ? Number(staff_salary_id) : null,
        payAmt,
        payment_month,
        payment_method,
        status,
        transaction_id,
        payment_date,
        account_details
      ]
    );

    await logWebsiteActivity({
      websiteId: website.id,
      userId: user?.id,
      userName: user?.name,
      action: 'SALARY_PAYMENT_PROCESSED',
      details: `Processed salary payment of ৳${payAmt} for staff #${staff_id} (${payment_month})`,
      req: request
    });

    return NextResponse.json(res.rows[0], { status: 201 });
  } catch (error) {
    console.error('Salary payments POST API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
