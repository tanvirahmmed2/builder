import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';
import { getControlAuth } from '@/lib/website-control';
import slugify from 'slugify';

export async function GET(request, context) {
  try {
    const { website, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const res = await queryDb(
      `SELECT id, category_id, title, slug, summary, difficulty_level, estimated_time_minutes, is_published, created_at, updated_at
       FROM website_tutorials
       WHERE website_id = $1
       ORDER BY id DESC`,
      [website.id]
    );

    return NextResponse.json(res.rows);
  } catch (error) {
    console.error('Tutorials GET error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request, context) {
  try {
    const { website, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const body = await request.json();
    const { title, summary = '', difficulty_level = 'Beginner', estimated_time_minutes = 15, is_published = true } = body;

    if (!title?.trim()) {
      return NextResponse.json({ success: false, error: 'Tutorial title is required' }, { status: 400 });
    }

    const slug = slugify(title, { lower: true, strict: true }) + '-' + Date.now().toString(36);

    const res = await queryDb(
      `INSERT INTO website_tutorials
       (website_id, title, slug, summary, difficulty_level, estimated_time_minutes, is_published, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
       RETURNING *`,
      [website.id, title.trim(), slug, summary, difficulty_level, Number(estimated_time_minutes) || 15, is_published]
    );

    return NextResponse.json({ success: true, tutorial: res.rows[0] });
  } catch (error) {
    console.error('Tutorials POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

