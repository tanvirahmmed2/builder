import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const id = searchParams.get('id');

    let query = `
      SELECT 
        a.id,
        a.title,
        a.slug,
        a.description,
        a.short_description,
        a.is_published,
        a.created_at,
        a.updated_at,
        COALESCE(
          json_agg(
            json_build_object(
              'id', ai.id,
              'app_id', ai.app_id,
              'image', ai.image,
              'image_id', ai.image_id,
              'title', ai.title,
              'created_at', ai.created_at
            ) ORDER BY ai.id ASC
          ) FILTER (WHERE ai.id IS NOT NULL),
          '[]'::json
        ) AS images
      FROM apps a
      LEFT JOIN apps_images ai ON a.id = ai.app_id
      WHERE a.is_published = TRUE
    `;

    const params = [];

    if (slug) {
      query += ` AND a.slug = $1 GROUP BY a.id LIMIT 1`;
      params.push(slug);
    } else if (id) {
      query += ` AND a.id = $1 GROUP BY a.id LIMIT 1`;
      params.push(Number(id));
    } else {
      query += ` GROUP BY a.id ORDER BY a.id DESC`;
    }

    const res = await queryDb(query, params).catch(() => ({ rows: [] }));

    if (slug || id) {
      const record = res.rows[0] || null;
      if (!record) {
        return NextResponse.json({ success: false, error: 'Application not found or not published.' }, { status: 404 });
      }
      return NextResponse.json({ success: true, app: record });
    }

    return NextResponse.json({ success: true, apps: res.rows || [] });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch published applications.' },
      { status: 500 }
    );
  }
}
