import { NextResponse } from 'next/server';
import { hasModulePermission } from '@/lib/middleware/developer';
import { queryDb } from '@/lib/db/pg';

export async function GET(request) {
  try {
    const auth = await hasModulePermission(request, 'careers');
    if (!auth.success) {
      return NextResponse.json({ success: false, error: auth.message }, { status: auth.status || 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    const conditions = [];
    const params = [];

    if (status) {
      params.push(status.toUpperCase());
      conditions.push(`a.status = $${params.length}`);
    }

    if (search.trim()) {
      params.push(`%${search.trim().toLowerCase()}%`);
      const idx = params.length;
      conditions.push(`(
        LOWER(a.name) LIKE $${idx} OR 
        LOWER(a.email) LIKE $${idx} OR 
        LOWER(COALESCE(a.current_position, '')) LIKE $${idx} OR 
        LOWER(COALESCE(a.current_company, '')) LIKE $${idx}
      )`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const query = `
      SELECT 
        a.*,
        info.city,
        info.country,
        info.skills,
        info.expected_salary,
        info.notice_period,
        COUNT(ca.id)::int AS total_applications,
        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'id', app.id,
                'career_id', app.career_id,
                'job_title', c.title,
                'status', app.status,
                'created_at', app.created_at
              )
            )
            FROM career_application app
            JOIN career c ON app.career_id = c.id
            WHERE app.applicant_id = a.id OR app.applicant_email = a.email
          ),
          '[]'::json
        ) AS applications
      FROM career_applicants a
      LEFT JOIN career_applicant_info info ON a.id = info.applicant_id
      LEFT JOIN career_application ca ON (ca.applicant_id = a.id OR ca.applicant_email = a.email)
      ${whereClause}
      GROUP BY a.id, info.id
      ORDER BY a.created_at DESC
    `;

    const res = await queryDb(query, params);

    return NextResponse.json({
      success: true,
      applicants: res.rows,
      data: res.rows,
      total: res.rows.length,
    });
  } catch (error) {
    console.error('Error fetching career applicants:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const auth = await hasModulePermission(request, 'careers');
    if (!auth.success) {
      return NextResponse.json({ success: false, error: auth.message }, { status: auth.status || 401 });
    }

    const body = await request.json();
    const {
      name,
      email,
      phone,
      resume_url,
      portfolio_url,
      linkedin_url,
      github_url,
      current_company,
      current_position,
      years_of_experience,
      status,
      // info fields
      bio,
      address,
      city,
      country,
      skills,
      education,
      experience,
      expected_salary,
      notice_period,
      notes,
    } = body;

    if (!name || !email) {
      return NextResponse.json({ success: false, error: 'Name and email are required.' }, { status: 400 });
    }

    // Check existing
    const existing = await queryDb('SELECT id FROM career_applicants WHERE email = $1', [email.trim().toLowerCase()]);
    if (existing.rows.length > 0) {
      return NextResponse.json({ success: false, error: 'An applicant with this email already exists.' }, { status: 400 });
    }

    const insertApplicant = `
      INSERT INTO career_applicants (
        name, email, phone, resume_url, portfolio_url, linkedin_url, github_url,
        current_company, current_position, years_of_experience, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;

    const appRes = await queryDb(insertApplicant, [
      name.trim(),
      email.trim().toLowerCase(),
      phone || null,
      resume_url || null,
      portfolio_url || null,
      linkedin_url || null,
      github_url || null,
      current_company || null,
      current_position || null,
      years_of_experience !== undefined ? Number(years_of_experience) : null,
      status || 'ACTIVE',
    ]);

    const newApplicant = appRes.rows[0];

    // Insert career_applicant_info
    const insertInfo = `
      INSERT INTO career_applicant_info (
        applicant_id, bio, address, city, country, skills, education, experience,
        expected_salary, notice_period, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;

    await queryDb(insertInfo, [
      newApplicant.id,
      bio || null,
      address || null,
      city || null,
      country || null,
      JSON.stringify(skills || []),
      JSON.stringify(education || []),
      JSON.stringify(experience || []),
      expected_salary || null,
      notice_period || null,
      notes || null,
    ]);

    return NextResponse.json({
      success: true,
      message: 'Applicant created successfully',
      applicant: newApplicant,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating career applicant:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

