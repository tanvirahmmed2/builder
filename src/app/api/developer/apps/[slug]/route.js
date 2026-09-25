import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';
import { hasModulePermission } from '@/lib/middleware/developer';

function slugify(text) {
  return (text || '')
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

export async function GET(request, { params }) {
  try {
    const auth = await hasModulePermission(request, 'apps');
    if (!auth.success) {
      return NextResponse.json({ success: false, error: auth.message }, { status: auth.status || 403 });
    }

    const { slug } = await params;
    const cleanSlug = decodeURIComponent(slug || '').trim();

    const sql = `
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
      WHERE a.slug = $1 OR a.id::text = $1
      GROUP BY a.id
      LIMIT 1
    `;

    const res = await queryDb(sql, [cleanSlug]);
    if (res.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'App not found' }, { status: 404 });
    }

    const app = res.rows[0];

    // Fetch associated themes
    const themesRes = await queryDb(
      `SELECT id, title, slug, link, description FROM themes WHERE app_id = $1 ORDER BY id ASC`,
      [app.id]
    );

    // Fetch associated packages
    const pkgsRes = await queryDb(
      `SELECT id, name, slug, price, discount, is_active FROM packages WHERE app_id = $1 ORDER BY price ASC`,
      [app.id]
    );

    return NextResponse.json({
      success: true,
      app,
      record: app,
      themes: themesRes.rows || [],
      packages: pkgsRes.rows || [],
    });
  } catch (error) {
    console.error('Developer app GET error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const auth = await hasModulePermission(request, 'apps');
    if (!auth.success) {
      return NextResponse.json({ success: false, error: auth.message }, { status: auth.status || 403 });
    }

    const { slug } = await params;
    const cleanSlug = decodeURIComponent(slug || '').trim();

    const existingRes = await queryDb('SELECT * FROM apps WHERE slug = $1 OR id::text = $1 LIMIT 1', [cleanSlug]);
    if (existingRes.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'App not found' }, { status: 404 });
    }

    const currentApp = existingRes.rows[0];
    const body = await request.json();
    const data = body.data || body;

    const newTitle = data.title !== undefined ? data.title.trim() : currentApp.title;
    let newSlug = currentApp.slug;
    if (data.slug && data.slug.trim() && data.slug !== currentApp.slug) {
      newSlug = slugify(data.slug);
      const slugCheck = await queryDb(
        'SELECT id FROM apps WHERE slug = $1 AND id != $2 LIMIT 1',
        [newSlug, currentApp.id]
      );
      if (slugCheck.rows.length > 0) {
        newSlug = `${newSlug}-${Date.now().toString().slice(-4)}`;
      }
    }

    const newShort = data.short_description !== undefined ? data.short_description : currentApp.short_description;
    const newDesc = data.description !== undefined ? data.description : currentApp.description;
    const newPublished = data.is_published !== undefined ? Boolean(data.is_published) : currentApp.is_published;

    const updateRes = await queryDb(
      `UPDATE apps
       SET title = $1, slug = $2, short_description = $3, description = $4,
           is_published = $5, updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING *`,
      [newTitle, newSlug, newShort, newDesc, newPublished, currentApp.id]
    );

    return NextResponse.json({
      success: true,
      record: updateRes.rows[0],
      app: updateRes.rows[0],
      message: 'App updated successfully',
    });
  } catch (error) {
    console.error('Developer app PUT error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const auth = await hasModulePermission(request, 'apps');
    if (!auth.success) {
      return NextResponse.json({ success: false, error: auth.message }, { status: auth.status || 403 });
    }

    const { slug } = await params;
    const cleanSlug = decodeURIComponent(slug || '').trim();

    const deleteRes = await queryDb(
      'DELETE FROM apps WHERE slug = $1 OR id::text = $1 RETURNING id, title',
      [cleanSlug]
    );

    if (deleteRes.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'App not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `App "${deleteRes.rows[0].title}" deleted successfully`,
    });
  } catch (error) {
    console.error('Developer app DELETE error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
