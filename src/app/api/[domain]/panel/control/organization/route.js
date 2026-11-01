import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';
import { getControlAuth } from '@/lib/website-control';
import slugify from 'slugify';

export async function GET(request, context) {
  try {
    const { website, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(request.url);
    const tab = searchParams.get('tab') || 'members';

    if (tab === 'departments') {
      const res = await queryDb(
        `SELECT id, name, slug, description, is_active, created_at, updated_at
         FROM website_org_departments
         WHERE website_id = $1
         ORDER BY name ASC`,
        [website.id]
      );
      return NextResponse.json(res.rows);
    }

    if (tab === 'jobs') {
      const res = await queryDb(
        `SELECT j.id, j.department_id, j.title, j.slug, j.job_type, j.location, j.salary_range, j.description, j.requirements, j.status, j.created_at,
                d.name as department_name
         FROM website_org_jobs j
         LEFT JOIN website_org_departments d ON j.department_id = d.id
         WHERE j.website_id = $1
         ORDER BY j.id DESC`,
        [website.id]
      );
      return NextResponse.json(res.rows);
    }

    if (tab === 'leaves') {
      const res = await queryDb(
        `SELECT l.id, l.member_id, l.start_date, l.end_date, l.total_days, l.reason, l.status, l.created_at,
                m.full_name as member_name, m.email as member_email
         FROM website_org_leave_requests l
         LEFT JOIN website_org_members m ON l.member_id = m.id
         WHERE l.website_id = $1
         ORDER BY l.created_at DESC`,
        [website.id]
      );
      return NextResponse.json(res.rows);
    }

    // Default: members
    const res = await queryDb(
      `SELECT m.id, m.department_id, m.designation_id, m.full_name, m.email, m.phone, m.avatar_url, m.bio, m.joining_date, m.status, m.sort_order, m.created_at,
              d.name as department_name
       FROM website_org_members m
       LEFT JOIN website_org_departments d ON m.department_id = d.id
       WHERE m.website_id = $1
       ORDER BY m.sort_order ASC, m.id DESC`,
      [website.id]
    );
    return NextResponse.json(res.rows);
  } catch (error) {
    console.error('Organization GET error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request, context) {
  try {
    const { website, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const body = await request.json();
    const type = body.type || 'member';

    if (type === 'department') {
      const { name, description = '', is_active = true } = body;
      if (!name?.trim()) return NextResponse.json({ success: false, error: 'Department name is required' }, { status: 400 });
      const slug = slugify(name, { lower: true, strict: true }) + '-' + Date.now().toString(36);
      const res = await queryDb(
        `INSERT INTO website_org_departments (website_id, name, slug, description, is_active, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
         RETURNING *`,
        [website.id, name.trim(), slug, description, is_active]
      );
      return NextResponse.json({ success: true, department: res.rows[0] });
    }

    if (type === 'job') {
      const { department_id = null, title, job_type = 'Full-time', location = 'Remote', salary_range = '', description = '', requirements = '', status = 'active' } = body;
      if (!title?.trim()) return NextResponse.json({ success: false, error: 'Job title is required' }, { status: 400 });
      const slug = slugify(title, { lower: true, strict: true }) + '-' + Date.now().toString(36);
      const res = await queryDb(
        `INSERT INTO website_org_jobs
         (website_id, department_id, title, slug, job_type, location, salary_range, description, requirements, status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
         RETURNING *`,
        [website.id, department_id || null, title.trim(), slug, job_type, location, salary_range, description, requirements, status]
      );
      return NextResponse.json({ success: true, job: res.rows[0] });
    }

    // Default: member
    const { department_id = null, full_name, email = '', phone = '', avatar_url = '', bio = '', status = 'active' } = body;
    if (!full_name?.trim()) return NextResponse.json({ success: false, error: 'Member full name is required' }, { status: 400 });
    const res = await queryDb(
      `INSERT INTO website_org_members
       (website_id, department_id, full_name, email, phone, avatar_url, bio, status, sort_order, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 0, NOW(), NOW())
       RETURNING *`,
      [website.id, department_id || null, full_name.trim(), email.trim(), phone.trim(), avatar_url, bio, status]
    );
    return NextResponse.json({ success: true, member: res.rows[0] });
  } catch (error) {
    console.error('Organization POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

