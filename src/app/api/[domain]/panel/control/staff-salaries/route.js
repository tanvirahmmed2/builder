import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';
import { getControlAuth, logWebsiteActivity } from '@/lib/website-control';

export async function GET(request, context) {
  try {
    const { website, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const res = await queryDb(
      `SELECT ss.id, ss.id AS staff_salary_id, ss.website_id, ss.staff_id, ss.salary_id,
              ss.effective_date, ss.status, ss.note, ss.created_at, ss.updated_at,
              u.name AS staff_name, u.email AS staff_email, u.phone AS staff_phone, u.role AS staff_role,
              s.title AS salary_title, s.base_salary, s.bonus, s.allowance, s.deduction,
              (s.base_salary + s.bonus + s.allowance - s.deduction) AS net_salary
       FROM website_staff_salaries ss
       JOIN website_users u ON u.id = ss.staff_id
       JOIN website_salaries s ON s.id = ss.salary_id
       WHERE ss.website_id = $1
       ORDER BY ss.id DESC`,
      [website.id]
    );

    return NextResponse.json(res.rows);
  } catch (error) {
    console.error('Staff salaries GET API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request, context) {
  try {
    const { website, user, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const body = await request.json();
    const { staff_id, salary_id, effective_date = new Date().toISOString().split('T')[0], status = 'active', note = '' } = body;

    if (!staff_id || !salary_id) {
      return NextResponse.json({ success: false, error: 'Staff and salary structure are required' }, { status: 400 });
    }

    const res = await queryDb(
      `INSERT INTO website_staff_salaries (website_id, staff_id, salary_id, effective_date, status, note)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, id AS staff_salary_id, website_id, staff_id, salary_id, effective_date, status, note, created_at, updated_at`,
      [website.id, Number(staff_id), Number(salary_id), effective_date, status, note]
    );

    await logWebsiteActivity({
      websiteId: website.id,
      userId: user?.id,
      userName: user?.name,
      action: 'STAFF_SALARY_ASSIGNED',
      details: `Assigned salary structure #${salary_id} to staff #${staff_id}`,
      req: request
    });

    return NextResponse.json(res.rows[0], { status: 201 });
  } catch (error) {
    console.error('Staff salaries POST API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
