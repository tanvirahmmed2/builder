import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';
import { getControlAuth, logWebsiteActivity } from '@/lib/website-control';

export async function GET(request, context) {
  try {
    const { website, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const res = await queryDb(
      `SELECT id, id AS salary_id, website_id, title, base_salary, bonus, allowance,
              deduction, note, created_at, updated_at,
              (base_salary + bonus + allowance - deduction) AS net_salary
       FROM website_salaries
       WHERE website_id = $1
       ORDER BY id ASC`,
      [website.id]
    );

    return NextResponse.json(res.rows);
  } catch (error) {
    console.error('Salaries GET API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request, context) {
  try {
    const { website, user, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const body = await request.json();
    const { title, base_salary, bonus = 0, allowance = 0, deduction = 0, note = '' } = body;

    if (!title || !base_salary) {
      return NextResponse.json({ success: false, error: 'Title and base salary are required' }, { status: 400 });
    }

    const res = await queryDb(
      `INSERT INTO website_salaries (website_id, title, base_salary, bonus, allowance, deduction, note)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, id AS salary_id, website_id, title, base_salary, bonus, allowance, deduction, note, created_at, updated_at`,
      [
        website.id,
        title.trim(),
        parseFloat(base_salary) || 0,
        parseFloat(bonus) || 0,
        parseFloat(allowance) || 0,
        parseFloat(deduction) || 0,
        note
      ]
    );

    await logWebsiteActivity({
      websiteId: website.id,
      userId: user?.id,
      userName: user?.name,
      action: 'SALARY_STRUCTURE_CREATED',
      details: `Created salary structure "${title}"`,
      req: request
    });

    return NextResponse.json(res.rows[0], { status: 201 });
  } catch (error) {
    console.error('Salaries POST API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
