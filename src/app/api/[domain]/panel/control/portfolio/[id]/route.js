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
    const type = body.type || 'project';

    if (type === 'service') {
      const { title, summary = '', description = '', icon_url = '', starting_price = 0, is_active = true } = body;
      const res = await queryDb(
        `UPDATE website_portfolio_services
         SET title = COALESCE($1, title), summary = $2, description = $3, icon_url = $4, starting_price = $5, is_active = $6, updated_at = NOW()
         WHERE id = $7 AND website_id = $8
         RETURNING *`,
        [title, summary, description, icon_url, Number(starting_price) || 0, is_active, id, website.id]
      );
      if (res.rowCount === 0) return NextResponse.json({ success: false, error: 'Service not found' }, { status: 404 });
      return NextResponse.json({ success: true, service: res.rows[0] });
    }

    if (type === 'skill') {
      const { skill_name, proficiency_percentage = 80, icon_url = '', sort_order = 0 } = body;
      const res = await queryDb(
        `UPDATE website_portfolio_skills
         SET skill_name = COALESCE($1, skill_name), proficiency_percentage = $2, icon_url = $3, sort_order = $4, updated_at = NOW()
         WHERE id = $5 AND website_id = $6
         RETURNING *`,
        [skill_name, Number(proficiency_percentage) || 0, icon_url, Number(sort_order) || 0, id, website.id]
      );
      if (res.rowCount === 0) return NextResponse.json({ success: false, error: 'Skill not found' }, { status: 404 });
      return NextResponse.json({ success: true, skill: res.rows[0] });
    }

    // Default: project
    const { title, summary = '', description = '', client_name = '', project_url = '', github_url = '', thumbnail_url = '', is_featured = false } = body;
    const res = await queryDb(
      `UPDATE website_portfolio_projects
       SET title = COALESCE($1, title), summary = $2, description = $3, client_name = $4, project_url = $5, github_url = $6, thumbnail_url = $7, is_featured = $8, updated_at = NOW()
       WHERE id = $9 AND website_id = $10
       RETURNING *`,
      [title, summary, description, client_name, project_url, github_url, thumbnail_url, is_featured, id, website.id]
    );
    if (res.rowCount === 0) return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 });
    return NextResponse.json({ success: true, project: res.rows[0] });
  } catch (error) {
    console.error('Portfolio PUT error:', error);
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
    const type = searchParams.get('type') || 'project';

    let table = 'website_portfolio_projects';
    if (type === 'service') table = 'website_portfolio_services';
    if (type === 'skill') table = 'website_portfolio_skills';

    const res = await queryDb(
      `DELETE FROM ${table} WHERE id = $1 AND website_id = $2 RETURNING id`,
      [id, website.id]
    );

    if (res.rowCount === 0) return NextResponse.json({ success: false, error: 'Item not found' }, { status: 404 });
    return NextResponse.json({ success: true, deletedId: id });
  } catch (error) {
    console.error('Portfolio DELETE error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

