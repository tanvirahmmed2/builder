import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';
import { getControlAuth } from '@/lib/website-control';
import slugify from 'slugify';

export async function GET(request, context) {
  try {
    const { website, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const res = await queryDb(
      `SELECT id, title, slug, summary, content, thumbnail_url, is_published, published_at, view_count, created_at, updated_at
       FROM website_blogs
       WHERE website_id = $1
       ORDER BY id DESC`,
      [website.id]
    );

    return NextResponse.json(res.rows);
  } catch (error) {
    console.error('Blogs GET error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request, context) {
  try {
    const { website, user, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const body = await request.json();
    const { title, summary = '', content = '', thumbnail_url = '', is_published = true } = body;

    if (!title?.trim()) {
      return NextResponse.json({ success: false, error: 'Article title is required' }, { status: 400 });
    }

    const slug = slugify(title, { lower: true, strict: true }) + '-' + Date.now().toString(36);
    const author_id = user?.id || null;

    const res = await queryDb(
      `INSERT INTO website_blogs
       (website_id, author_id, title, slug, summary, content, thumbnail_url, is_published, published_at, view_count, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CASE WHEN $8 THEN NOW() ELSE NULL END, 0, NOW(), NOW())
       RETURNING *`,
      [website.id, author_id, title.trim(), slug, summary, content, thumbnail_url, is_published]
    );

    return NextResponse.json({ success: true, blog: res.rows[0] });
  } catch (error) {
    console.error('Blogs POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

