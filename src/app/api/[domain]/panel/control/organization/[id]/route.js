import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';
import { getControlAuth } from '@/lib/website-control';

export async function PUT(request, context) {
  try {
    const { website, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const params = context?.params ? await context.params : {};
    const id = params?.id;
    const body = await request.json();
    const type = body.type || 'member';

    if (type === 'department') {
      const { name, description, is_active } = body;
      const res = await queryDb(
        `UPDATE website_org_departments
         SET name = COALESCE($1, name), description = COALESCE($2, description), is_active = COALESCE($3, is_active), updated_at = NOW()
         WHERE id = $4 AND website_id = $5
         RETURNING *`,
        [name, description, is_active, id, website.id]
      );
      if (res.rowCount === 0) return NextResponse.json({ success: false, error: 'Department not found' }, { status: 404 });
      return NextResponse.json({ success: true, department: res.rows[0] });
    }

    if (type === 'job') {
      const { title, job_type, location, salary_range, description, requirements, status } = body;
      const res = await queryDb(
        `UPDATE website_org_jobs
         SET title = COALESCE($1, title), job_type = COALESCE($2, job_type), location = COALESCE($3, location),
             salary_range = COALESCE($4, salary_range), description = COALESCE($5, description),
             requirements = COALESCE($6, requirements), status = COALESCE($7, status), updated_at = NOW()
         WHERE id = $8 AND website_id = $9
         RETURNING *`,
        [title, job_type, location, salary_range, description, requirements, status, id, website.id]
      );
      if (res.rowCount === 0) return NextResponse.json({ success: false, error: 'Job not found' }, { status: 404 });
      return NextResponse.json({ success: true, job: res.rows[0] });
    }

    // Default: member
    const { full_name, email, phone, avatar_url, bio, status, department_id } = body;
    const res = await queryDb(
      `UPDATE website_org_members
       SET full_name = COALESCE($1, full_name), email = COALESCE($2, email), phone = COALESCE($3, phone),
           avatar_url = COALESCE($4, avatar_url), bio = COALESCE($5, bio), status = COALESCE($6, status),
           department_id = COALESCE($7, department_id), updated_at = NOW()
       WHERE id = $8 AND website_id = $9
       RETURNING *`,
      [full_name, email, phone, avatar_url, bio, status, department_id, id, website.id]
    );
    if (res.rowCount === 0) return NextResponse.json({ success: false, error: 'Member not found' }, { status: 404 });
    return NextResponse.json({ success: true, member: res.rows[0] });
  } catch (error) {
    console.error('Organization PUT error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, context) {
  try {
    const { website, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const params = context?.params ? await context.params : {};
    const id = params?.id;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'member';

    let table = 'website_org_members';
    if (type === 'department') table = 'website_org_departments';
    if (type === 'job') table = 'website_org_jobs';
    if (type === 'leave') table = 'website_org_leave_requests';

    const res = await queryDb(
      `DELETE FROM ${table} WHERE id = $1 AND website_id = $2 RETURNING id`,
      [id, website.id]
    );

    if (res.rowCount === 0) return NextResponse.json({ success: false, error: 'Item not found' }, { status: 404 });
    return NextResponse.json({ success: true, deletedId: id });
  } catch (error) {
    console.error('Organization DELETE error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

