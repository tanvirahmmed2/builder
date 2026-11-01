import { NextResponse } from 'next/server';
import { hasModulePermission } from '@/lib/middleware/developer';
import { queryDb } from '@/lib/db/pg';

export async function GET(request, { params }) {
  try {
    const auth = await hasModulePermission(request, 'careers');
    if (!auth.success) {
      return NextResponse.json({ success: false, error: auth.message }, { status: auth.status || 401 });
    }

    const { id } = await params;
    const applicantId = Number(id);

    const res = await queryDb(
      `SELECT 
        a.*,
        info.bio,
        info.address,
        info.city,
        info.country,
        info.skills,
        info.education,
        info.experience,
        info.expected_salary,
        info.notice_period,
        info.notes,
        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'id', app.id,
                'career_id', app.career_id,
                'job_title', c.title,
                'job_department', c.department,
                'status', app.status,
                'resume_url', app.resume_url,
                'cover_letter', app.cover_letter,
                'reviewer_notes', app.reviewer_notes,
                'created_at', app.created_at
              ) ORDER BY app.created_at DESC
            )
            FROM career_application app
            JOIN career c ON app.career_id = c.id
            WHERE app.applicant_id = a.id OR app.applicant_email = a.email
          ),
          '[]'::json
        ) AS applications
      FROM career_applicants a
      LEFT JOIN career_applicant_info info ON a.id = info.applicant_id
      WHERE a.id = $1
      LIMIT 1`,
      [applicantId]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Applicant not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      applicant: res.rows[0],
      data: res.rows[0],
    });
  } catch (error) {
    console.error('Error fetching applicant:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const auth = await hasModulePermission(request, 'careers');
    if (!auth.success) {
      return NextResponse.json({ success: false, error: auth.message }, { status: auth.status || 401 });
    }

    const { id } = await params;
    const applicantId = Number(id);

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

    const existingRes = await queryDb('SELECT * FROM career_applicants WHERE id = $1', [applicantId]);
    if (existingRes.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Applicant not found' }, { status: 404 });
    }
    const current = existingRes.rows[0];

    const updateApplicant = `
      UPDATE career_applicants SET
        name = COALESCE($1, name),
        email = COALESCE($2, email),
        phone = COALESCE($3, phone),
        resume_url = COALESCE($4, resume_url),
        portfolio_url = COALESCE($5, portfolio_url),
        linkedin_url = COALESCE($6, linkedin_url),
        github_url = COALESCE($7, github_url),
        current_company = COALESCE($8, current_company),
        current_position = COALESCE($9, current_position),
        years_of_experience = COALESCE($10, years_of_experience),
        status = COALESCE($11, status),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $12
      RETURNING *
    `;

    const appRes = await queryDb(updateApplicant, [
      name !== undefined ? name.trim() : null,
      email !== undefined ? email.trim().toLowerCase() : null,
      phone !== undefined ? phone : null,
      resume_url !== undefined ? resume_url : null,
      portfolio_url !== undefined ? portfolio_url : null,
      linkedin_url !== undefined ? linkedin_url : null,
      github_url !== undefined ? github_url : null,
      current_company !== undefined ? current_company : null,
      current_position !== undefined ? current_position : null,
      years_of_experience !== undefined ? Number(years_of_experience) : null,
      status !== undefined ? status : null,
      applicantId,
    ]);

    // Upsert into career_applicant_info
    const infoCheck = await queryDb('SELECT id FROM career_applicant_info WHERE applicant_id = $1', [applicantId]);
    if (infoCheck.rows.length === 0) {
      await queryDb(
        `INSERT INTO career_applicant_info (
          applicant_id, bio, address, city, country, skills, education, experience,
          expected_salary, notice_period, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          applicantId,
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
        ]
      );
    } else {
      await queryDb(
        `UPDATE career_applicant_info SET
          bio = COALESCE($1, bio),
          address = COALESCE($2, address),
          city = COALESCE($3, city),
          country = COALESCE($4, country),
          skills = COALESCE($5, skills),
          education = COALESCE($6, education),
          experience = COALESCE($7, experience),
          expected_salary = COALESCE($8, expected_salary),
          notice_period = COALESCE($9, notice_period),
          notes = COALESCE($10, notes),
          updated_at = CURRENT_TIMESTAMP
        WHERE applicant_id = $11`,
        [
          bio !== undefined ? bio : null,
          address !== undefined ? address : null,
          city !== undefined ? city : null,
          country !== undefined ? country : null,
          skills !== undefined ? JSON.stringify(skills) : null,
          education !== undefined ? JSON.stringify(education) : null,
          experience !== undefined ? JSON.stringify(experience) : null,
          expected_salary !== undefined ? expected_salary : null,
          notice_period !== undefined ? notice_period : null,
          notes !== undefined ? notes : null,
          applicantId,
        ]
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Applicant updated successfully',
      applicant: appRes.rows[0],
    });
  } catch (error) {
    console.error('Error updating applicant:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const auth = await hasModulePermission(request, 'careers');
    if (!auth.success) {
      return NextResponse.json({ success: false, error: auth.message }, { status: auth.status || 401 });
    }

    const { id } = await params;
    const applicantId = Number(id);

    await queryDb('DELETE FROM career_applicant_info WHERE applicant_id = $1', [applicantId]).catch(() => {});
    await queryDb('UPDATE career_application SET applicant_id = NULL WHERE applicant_id = $1', [applicantId]).catch(() => {});
    const delRes = await queryDb('DELETE FROM career_applicants WHERE id = $1 RETURNING id', [applicantId]);

    if (delRes.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Applicant not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Applicant deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting applicant:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

