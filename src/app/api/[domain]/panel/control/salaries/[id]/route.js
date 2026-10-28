import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';
import { getControlAuth, logWebsiteActivity } from '@/lib/website-control';

export async function PUT(request, context) {
  try {
    const { website, user, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const params = await context.params;
    const salaryId = Number(params.id);
    const body = await request.json();

    const { title, base_salary, bonus, allowance, deduction, note } = body;

    const res = await queryDb(
      `UPDATE website_salaries
       SET title = COALESCE($1, title),
           base_salary = COALESCE($2, base_salary),
           bonus = COALESCE($3, bonus),
           allowance = COALESCE($4, allowance),
           deduction = COALESCE($5, deduction),
           note = COALESCE($6, note),
           updated_at = NOW()
       WHERE id = $7 AND website_id = $8
       RETURNING id, id AS salary_id, website_id, title, base_salary, bonus, allowance, deduction, note, created_at, updated_at`,
      [
        title,
        base_salary !== undefined ? parseFloat(base_salary) : null,
        bonus !== undefined ? parseFloat(bonus) : null,
        allowance !== undefined ? parseFloat(allowance) : null,
        deduction !== undefined ? parseFloat(deduction) : null,
        note,
        salaryId,
        website.id
      ]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Salary structure not found' }, { status: 404 });
    }

    await logWebsiteActivity({
      websiteId: website.id,
      userId: user?.id,
      userName: user?.name,
      action: 'SALARY_STRUCTURE_UPDATED',
      details: `Updated salary structure #${salaryId}`,
      req: request
    });

    return NextResponse.json(res.rows[0]);
  } catch (error) {
    console.error('Salary PUT ID error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, context) {
  try {
    const { website, user, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const params = await context.params;
    const salaryId = Number(params.id);

    const res = await queryDb(
      `DELETE FROM website_salaries
       WHERE id = $1 AND website_id = $2
       RETURNING id, title`,
      [salaryId, website.id]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Salary structure not found' }, { status: 404 });
    }

    await logWebsiteActivity({
      websiteId: website.id,
      userId: user?.id,
      userName: user?.name,
      action: 'SALARY_STRUCTURE_DELETED',
      details: `Deleted salary structure "${res.rows[0].title}" (#${salaryId})`,
      req: request
    });

    return NextResponse.json({ success: true, message: 'Salary structure deleted successfully' });
  } catch (error) {
    console.error('Salary DELETE ID error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
