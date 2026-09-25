import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';
import { hasModulePermission } from '@/lib/middleware/developer';

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

// ============================================================================
// GET: List blogs with author info, associated app, and blogs_image gallery
// ============================================================================
export async function GET(request) {
  try {
    const auth = await hasModulePermission(request, 'blogs');
    if (!auth.success) {
      return NextResponse.json({ success: false, error: auth.message || 'Unauthorized' }, { status: auth.status || 401 });
    }

    const { searchParams } = new URL(request.url);
    const blogId = searchParams.get('id');
    const slug = searchParams.get('slug');
    const status = searchParams.get('status');
    const search = searchParams.get('search') || searchParams.get('q');

    let query = `
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
    `;

    const conditions = [];
    const params = [];
    let idx = 1;

    if (blogId) {
      conditions.push(`b.id = $${idx++}`);
      params.push(Number(blogId));
    }
    if (slug) {
      conditions.push(`b.slug = $${idx++}`);
      params.push(slug.trim());
    }
    if (status === 'published') {
      conditions.push(`b.is_published = TRUE`);
    } else if (status === 'draft') {
      conditions.push(`b.is_published = FALSE`);
    }
    if (search && search.trim()) {
      conditions.push(`(LOWER(b.title) LIKE $${idx} OR LOWER(COALESCE(b.summary, '')) LIKE $${idx})`);
      params.push(`%${search.trim().toLowerCase()}%`);
      idx++;
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ` GROUP BY b.id, d.name, d.email, dr.slug, a.title, a.slug ORDER BY b.created_at DESC`;

    const res = await queryDb(query, params);

    if (blogId || slug) {
      const record = res.rows[0] || null;
      if (!record) {
        return NextResponse.json({ success: false, error: 'Blog not found.' }, { status: 404 });
      }
      return NextResponse.json({ success: true, record, ...record });
    }

    // List of apps for the app_id selector
    const appsRes = await queryDb('SELECT id, title, slug FROM apps ORDER BY title ASC');

    return NextResponse.json({
      success: true,
      table: 'blogs',
      records: res.rows,
      blogs: res.rows,
      apps: appsRes.rows,
    });
  } catch (error) {
    console.error('Developer blogs GET error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// ============================================================================
// POST: Create a new blog article and optionally attach images to blogs_image
// ============================================================================
export async function POST(request) {
  try {
    const auth = await hasModulePermission(request, 'blogs');
    if (!auth.success) {
      return NextResponse.json({ success: false, error: auth.message || 'Unauthorized' }, { status: auth.status || 401 });
    }

    const body = await request.json();
    const data = body.data || body;
    const { title, summary, content, cover_image, app_id, is_published = true, images = [] } = data;

    const cleanTitle = (title && title.trim()) || 'Untitled Article';
    const cleanContent = (content && content.trim()) || '<p>Write your article content here...</p>';

    const baseSlug = slugify(cleanTitle) || 'article';
    let slug = baseSlug;

    // Check slug uniqueness
    const checkSlug = await queryDb('SELECT id FROM blogs WHERE slug = $1 LIMIT 1', [slug]);
    if (checkSlug.rows.length > 0) {
      slug = `${baseSlug}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    const insertRes = await queryDb(
      `INSERT INTO blogs (
        app_id, title, slug, summary, content, cover_image, author_id, is_published, published_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
      RETURNING *`,
      [
        app_id ? Number(app_id) : null,
        cleanTitle,
        slug,
        summary ? summary.trim() : null,
        cleanContent,
        cover_image ? cover_image.trim() : null,
        auth.staff.id,
        Boolean(is_published),
      ]
    );

    const newBlog = insertRes.rows[0];

    // Insert gallery images into blogs_image
    const savedImages = [];
    if (Array.isArray(images) && images.length > 0) {
      for (const img of images) {
        if (!img.image_url) continue;
        const imgRes = await queryDb(
          `INSERT INTO blogs_image (blog_id, image_url, alt_text, caption)
           VALUES ($1, $2, $3, $4)
           RETURNING *`,
          [newBlog.id, img.image_url.trim(), img.alt_text || null, img.caption || null]
        );
        savedImages.push(imgRes.rows[0]);
      }
    }

    return NextResponse.json({
      success: true,
      record: { ...newBlog, images: savedImages },
      message: 'Blog article created successfully.',
    });
  } catch (error) {
    console.error('Blog POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

// ============================================================================
// PUT: Update blog article and manage blogs_image gallery
// ============================================================================
export async function PUT(request) {
  try {
    const auth = await hasModulePermission(request, 'blogs');
    if (!auth.success) {
      return NextResponse.json({ success: false, error: auth.message || 'Unauthorized' }, { status: auth.status || 401 });
    }

    const body = await request.json();
    const data = body.data || body;
    const id = body.id || data.id;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Blog ID is required.' }, { status: 400 });
    }

    // Verify blog exists
    const currentRes = await queryDb('SELECT * FROM blogs WHERE id = $1', [id]);
    if (currentRes.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Blog not found.' }, { status: 404 });
    }
    const currentBlog = currentRes.rows[0];

    const newTitle = data.title !== undefined ? data.title.trim() : currentBlog.title;
    let newSlug = currentBlog.slug;
    if (newTitle && newTitle !== currentBlog.title) {
      const baseSlug = slugify(newTitle) || 'article';
      newSlug = baseSlug;
      const slugCheck = await queryDb('SELECT id FROM blogs WHERE slug = $1 AND id != $2 LIMIT 1', [newSlug, id]);
      if (slugCheck.rows.length > 0) {
        newSlug = `${baseSlug}-${Math.floor(1000 + Math.random() * 9000)}`;
      }
    }

    const newSummary = data.summary !== undefined ? (data.summary ? data.summary.trim() : null) : currentBlog.summary;
    const newContent = data.content !== undefined ? data.content.trim() : currentBlog.content;
    const newCover = data.cover_image !== undefined ? (data.cover_image ? data.cover_image.trim() : null) : currentBlog.cover_image;
    const newAppId = data.app_id !== undefined ? (data.app_id ? Number(data.app_id) : null) : currentBlog.app_id;
    const newPublished = data.is_published !== undefined ? Boolean(data.is_published) : currentBlog.is_published;

    await queryDb(
      `UPDATE blogs 
       SET title = $1, slug = $2, summary = $3, content = $4, cover_image = $5,
           app_id = $6, is_published = $7, updated_at = CURRENT_TIMESTAMP
       WHERE id = $8`,
      [newTitle, newSlug, newSummary, newContent, newCover, newAppId, newPublished, id]
    );

    // If new images provided to attach to blogs_image
    if (Array.isArray(data.new_images) && data.new_images.length > 0) {
      for (const img of data.new_images) {
        if (!img.image_url) continue;
        await queryDb(
          `INSERT INTO blogs_image (blog_id, image_url, alt_text, caption)
           VALUES ($1, $2, $3, $4)`,
          [id, img.image_url.trim(), img.alt_text || null, img.caption || null]
        );
      }
    }

    // Return updated record with all images
    const updatedRes = await queryDb(`
      SELECT 
        b.*,
        d.name AS author_name,
        COALESCE(dr.slug, 'developer') AS author_role,
        a.title AS app_title,
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
      WHERE b.id = $1
      GROUP BY b.id, d.name, dr.slug, a.title
    `, [id]);

    return NextResponse.json({
      success: true,
      record: updatedRes.rows[0],
      message: 'Blog updated successfully.',
    });
  } catch (error) {
    console.error('Blog PUT error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

// ============================================================================
// DELETE: Delete a blog post or an individual blogs_image
// ============================================================================
export async function DELETE(request) {
  try {
    const auth = await hasModulePermission(request, 'blogs');
    if (!auth.success) {
      return NextResponse.json({ success: false, error: auth.message || 'Unauthorized' }, { status: auth.status || 401 });
    }

    const { searchParams } = new URL(request.url);
    let id = searchParams.get('id');
    let imageId = searchParams.get('image_id');

    if (!id && !imageId) {
      const body = await request.json().catch(() => ({}));
      id = body.id;
      imageId = body.image_id;
    }

    // 1. Delete single image from blogs_image
    if (imageId) {
      await queryDb('DELETE FROM blogs_image WHERE id = $1', [imageId]);
      return NextResponse.json({ success: true, message: 'Blog image deleted successfully.' });
    }

    if (!id) {
      return NextResponse.json({ success: false, error: 'Blog ID is required.' }, { status: 400 });
    }

    // 2. Delete blog post (cascades to blogs_image)
    await queryDb('DELETE FROM blogs WHERE id = $1', [id]);
    return NextResponse.json({ success: true, message: 'Blog article deleted successfully.' });
  } catch (error) {
    console.error('Blog DELETE error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
