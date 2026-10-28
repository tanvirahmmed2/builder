import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';
import { getControlAuth } from '@/lib/website-control';

export async function GET(request, context) {
  try {
    const { website, user, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    if (!user || !user.id) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const [structureRes, paymentsRes] = await Promise.all([
      queryDb(
        `SELECT ss.id, ss.effective_date, ss.status,
                s.title, s.base_salary, s.bonus, s.allowance, s.deduction,
                (s.base_salary + s.bonus + s.allowance - s.deduction) AS net_salary
         FROM website_staff_salaries ss
         JOIN website_salaries s ON s.id = ss.salary_id
         WHERE ss.staff_id = $1 AND ss.website_id = $2 AND ss.status = 'active'
         ORDER BY ss.id DESC
         LIMIT 1`,
        [user.id, website.id]
      ),
      queryDb(
        `SELECT id, id AS payment_id, amount, payment_month, payment_method, status, transaction_id, payment_date
         FROM website_salary_payments
         WHERE staff_id = $1 AND website_id = $2
         ORDER BY payment_date DESC
         LIMIT 50`,
        [user.id, website.id]
      )
    ]);

    return NextResponse.json({
      salary_structure: structureRes.rows[0] || null,
      payments: paymentsRes.rows
    });

  } catch (error) {
    console.error('My-salary GET API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
