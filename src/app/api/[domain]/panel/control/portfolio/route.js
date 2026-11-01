import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';
import { getControlAuth } from '@/lib/website-control';
import slugify from 'slugify';

export async function GET(request, context) {
  try {
    const { website, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(request.url);
    const tab = searchParams.get('tab') || 'projects';

    if (tab === 'services') {
      const res = await queryDb(
        `SELECT id, title, slug, summary, description, icon_url, starting_price, is_active, created_at, updated_at
         FROM website_portfolio_services
         WHERE website_id = $1
         ORDER BY id DESC`,
        [website.id]
      );
      return NextResponse.json(res.rows);
    }

    if (tab === 'skills') {
      const res = await queryDb(
        `SELECT id, skill_name, proficiency_percentage, category_id, icon_url, sort_order, created_at, updated_at
         FROM website_portfolio_skills
         WHERE website_id = $1
         ORDER BY sort_order ASC, id DESC`,
        [website.id]
      );
      return NextResponse.json(res.rows);
    }

    // Default: projects
    const res = await queryDb(
      `SELECT id, title, slug, summary, description, client_name, project_url, github_url, thumbnail_url, is_featured, completion_date, created_at, updated_at
       FROM website_portfolio_projects
       WHERE website_id = $1
       ORDER BY is_featured DESC, id DESC`,
      [website.id]
    );
    return NextResponse.json(res.rows);
  } catch (error) {
    console.error('Portfolio GET error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request, context) {
  try {
    const { website, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const body = await request.json();
    const type = body.type || 'project';

    if (type === 'service') {
      const { title, summary = '', description = '', icon_url = '', starting_price = 0, is_active = true } = body;
      if (!title?.trim()) {
        return NextResponse.json({ success: false, error: 'Service title is required' }, { status: 400 });
      }
      const slug = slugify(title, { lower: true, strict: true }) + '-' + Date.now().toString(36);
      const res = await queryDb(
        `INSERT INTO website_portfolio_services
         (website_id, title, slug, summary, description, icon_url, starting_price, is_active, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
         RETURNING *`,
        [website.id, title.trim(), slug, summary, description, icon_url, Number(starting_price) || 0, is_active]
      );
      return NextResponse.json({ success: true, service: res.rows[0] });
    }

    if (type === 'skill') {
      const { skill_name, proficiency_percentage = 80, icon_url = '', sort_order = 0 } = body;
      if (!skill_name?.trim()) {
        return NextResponse.json({ success: false, error: 'Skill name is required' }, { status: 400 });
      }
      const res = await queryDb(
        `INSERT INTO website_portfolio_skills
         (website_id, skill_name, proficiency_percentage, icon_url, sort_order, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
         RETURNING *`,
        [website.id, skill_name.trim(), Number(proficiency_percentage) || 0, icon_url, Number(sort_order) || 0]
      );
      return NextResponse.json({ success: true, skill: res.rows[0] });
    }

    // Default: project
    const { title, summary = '', description = '', client_name = '', project_url = '', github_url = '', thumbnail_url = '', is_featured = false, completion_date = null } = body;
    if (!title?.trim()) {
      return NextResponse.json({ success: false, error: 'Project title is required' }, { status: 400 });
    }
    const slug = slugify(title, { lower: true, strict: true }) + '-' + Date.now().toString(36);
    const res = await queryDb(
      `INSERT INTO website_portfolio_projects
       (website_id, title, slug, summary, description, client_name, project_url, github_url, thumbnail_url, is_featured, completion_date, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
       RETURNING *`,
      [website.id, title.trim(), slug, summary, description, client_name, project_url, github_url, thumbnail_url, is_featured, completion_date || null]
    );
    return NextResponse.json({ success: true, project: res.rows[0] });
  } catch (error) {
    console.error('Portfolio POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

