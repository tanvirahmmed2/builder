import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';
import { getControlAuth, logWebsiteActivity } from '@/lib/website-control';

export async function PUT(request, context) {
  try {
    const { website, user, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const params = await context.params;
    const assignmentId = Number(params.id);
    const body = await request.json();

    const { staff_id, salary_id, effective_date, status, note } = body;

    const res = await queryDb(
      `UPDATE website_staff_salaries
       SET staff_id = COALESCE($1, staff_id),
           salary_id = COALESCE($2, salary_id),
           effective_date = COALESCE($3, effective_date),
           status = COALESCE($4, status),
           note = COALESCE($5, note),
           updated_at = NOW()
       WHERE id = $6 AND website_id = $7
       RETURNING id, id AS staff_salary_id, website_id, staff_id, salary_id, effective_date, status, note, created_at, updated_at`,
      [
        staff_id ? Number(staff_id) : null,
        salary_id ? Number(salary_id) : null,
        effective_date,
        status,
        note,
        assignmentId,
        website.id
      ]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Staff salary assignment not found' }, { status: 404 });
    }

    await logWebsiteActivity({
      websiteId: website.id,
      userId: user?.id,
      userName: user?.name,
      action: 'STAFF_SALARY_UPDATED',
      details: `Updated staff salary assignment #${assignmentId}`,
      req: request
    });

    return NextResponse.json(res.rows[0]);
  } catch (error) {
    console.error('Staff salary PUT ID error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, context) {
  try {
    const { website, user, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const params = await context.params;
    const assignmentId = Number(params.id);

    const res = await queryDb(
      `DELETE FROM website_staff_salaries
       WHERE id = $1 AND website_id = $2
       RETURNING id`,
      [assignmentId, website.id]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Staff salary assignment not found' }, { status: 404 });
    }

    await logWebsiteActivity({
      websiteId: website.id,
      userId: user?.id,
      userName: user?.name,
      action: 'STAFF_SALARY_DELETED',
      details: `Deleted staff salary assignment #${assignmentId}`,
      req: request
    });

    return NextResponse.json({ success: true, message: 'Staff salary assignment deleted successfully' });
  } catch (error) {
    console.error('Staff salary DELETE ID error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
