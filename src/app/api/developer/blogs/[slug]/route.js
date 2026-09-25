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
    const auth = await hasModulePermission(request, 'blogs');
    if (!auth.success) {
      return NextResponse.json({ success: false, error: auth.message }, { status: auth.status || 401 });
    }

    const { slug } = await params;
    const cleanSlug = decodeURIComponent(slug || '').trim();

    const query = `
      SELECT 
        b.id,
        b.app_id,
        b.title,
        b.slug,
        b.summary,
        b.content,
        b.cover_image,
        b.author_id,
        b.is_published,
        b.published_at,
        b.created_at,
        b.updated_at,
        d.name AS author_name,
        d.email AS author_email,
        COALESCE(dr.slug, 'developer') AS author_role,
        a.title AS app_title,
        a.slug AS app_slug,
        COALESCE(
          json_agg(
            json_build_object(
              'id', bi.id,
              'blog_id', bi.blog_id,
              'image_url', bi.image_url,
              'alt_text', bi.alt_text,
              'caption', bi.caption,
              'created_at', bi.created_at
            ) ORDER BY bi.id ASC
          ) FILTER (WHERE bi.id IS NOT NULL),
          '[]'::json
        ) AS images
      FROM blogs b
      LEFT JOIN developers d ON b.author_id = d.id
      LEFT JOIN roles dr ON d.role_id = dr.id
      LEFT JOIN apps a ON b.app_id = a.id
      LEFT JOIN blogs_image bi ON b.id = bi.blog_id
      WHERE b.slug = $1 OR b.id::text = $1
      GROUP BY b.id, d.name, d.email, dr.slug, a.title, a.slug
      LIMIT 1
    `;

    const res = await queryDb(query, [cleanSlug]);
    if (res.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Blog not found' }, { status: 404 });
    }

    const record = res.rows[0];
    return NextResponse.json({ success: true, record, blog: record, ...record });
  } catch (error) {
    console.error('Developer blog GET error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const auth = await hasModulePermission(request, 'blogs');
    if (!auth.success) {
      return NextResponse.json({ success: false, error: auth.message }, { status: auth.status || 401 });
    }

    const { slug } = await params;
    const cleanSlug = decodeURIComponent(slug || '').trim();

    // Verify existing record
    const existingRes = await queryDb(
      `SELECT * FROM blogs WHERE slug = $1 OR id::text = $1 LIMIT 1`,
      [cleanSlug]
    );
    if (existingRes.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Blog not found' }, { status: 404 });
    }

    const currentBlog = existingRes.rows[0];
    const body = await request.json();
    const data = body.data || body;

    const newTitle = data.title !== undefined ? data.title.trim() : currentBlog.title;
    let newSlug = currentBlog.slug;
    if (data.slug && data.slug.trim() && data.slug !== currentBlog.slug) {
      newSlug = slugify(data.slug);
      const slugCheck = await queryDb(
        'SELECT id FROM blogs WHERE slug = $1 AND id != $2 LIMIT 1',
        [newSlug, currentBlog.id]
      );
      if (slugCheck.rows.length > 0) {
        newSlug = `${newSlug}-${Date.now().toString().slice(-4)}`;
      }
    }

    const newSummary = data.summary !== undefined ? (data.summary ? data.summary.trim() : null) : currentBlog.summary;
    const newContent = data.content !== undefined ? data.content.trim() : currentBlog.content;
    const newCover = data.cover_image !== undefined ? (data.cover_image ? data.cover_image.trim() : null) : currentBlog.cover_image;
    const newAppId = data.app_id !== undefined ? (data.app_id ? Number(data.app_id) : null) : currentBlog.app_id;
    const newPublished = data.is_published !== undefined ? Boolean(data.is_published) : currentBlog.is_published;

    const updateRes = await queryDb(
      `UPDATE blogs 
       SET title = $1, slug = $2, summary = $3, content = $4, cover_image = $5,
           app_id = $6, is_published = $7, updated_at = CURRENT_TIMESTAMP
       WHERE id = $8
       RETURNING *`,
      [newTitle, newSlug, newSummary, newContent, newCover, newAppId, newPublished, currentBlog.id]
    );

    // Handle new gallery images if provided
    if (Array.isArray(data.new_images) && data.new_images.length > 0) {
      for (const img of data.new_images) {
        if (img.image_url) {
          await queryDb(
            `INSERT INTO blogs_image (blog_id, image_url, alt_text, caption)
             VALUES ($1, $2, $3, $4)`,
            [currentBlog.id, img.image_url, img.alt_text || null, img.caption || null]
          );
        }
      }
    }

    return NextResponse.json({
      success: true,
      record: updateRes.rows[0],
      blog: updateRes.rows[0],
      message: 'Blog updated successfully',
    });
  } catch (error) {
    console.error('Developer blog PUT error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const auth = await hasModulePermission(request, 'blogs');
    if (!auth.success) {
      return NextResponse.json({ success: false, error: auth.message }, { status: auth.status || 401 });
    }

    const { slug } = await params;
    const cleanSlug = decodeURIComponent(slug || '').trim();

    const deleteRes = await queryDb(
      `DELETE FROM blogs WHERE slug = $1 OR id::text = $1 RETURNING id, title`,
      [cleanSlug]
    );

    if (deleteRes.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Blog not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Blog "${deleteRes.rows[0].title}" deleted successfully`,
    });
  } catch (error) {
    console.error('Developer blog DELETE error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
