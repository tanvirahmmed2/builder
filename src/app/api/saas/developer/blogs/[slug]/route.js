import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';
import { hasModulePermission } from '@/lib/middleware/developer';
import cloudinary, { uploadToCloudinary, deleteFromCloudinary } from '@/lib/db/cloudinary';

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
        b.service_id,
        b.service_id AS app_id,
        b.title,
        b.slug,
        b.summary,
        b.content,
        b.author_id,
        b.is_published,
        b.published_at,
        b.created_at,
        b.updated_at,
        d.name AS author_name,
        d.email AS author_email,
        COALESCE(dr.slug, 'developer') AS author_role,
        s.title AS service_title,
        s.slug AS service_slug,
        s.title AS app_title,
        s.slug AS app_slug,
        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'id', bi.id,
                'blog_id', bi.blog_id,
                'image_url', bi.image_url,
                'image', COALESCE(bi.image, bi.image_url),
                'image_id', bi.image_id,
                'title', bi.title,
                'alt_text', bi.alt_text,
                'caption', bi.caption,
                'created_at', bi.created_at
              ) ORDER BY bi.id ASC
            )
            FROM blogs_image bi
            WHERE bi.blog_id = b.id
          ),
          '[]'::json
        ) AS images
      FROM blogs b
      LEFT JOIN developers d ON b.author_id = d.id
      LEFT JOIN roles dr ON d.role_id = dr.id
      LEFT JOIN services s ON b.service_id = s.id
      WHERE b.slug = $1 OR b.id::text = $1
      LIMIT 1
    `;

    const res = await queryDb(query, [cleanSlug]);

    if (res.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Blog not found' }, { status: 404 });
    }

    const record = res.rows[0];

    return NextResponse.json({
      success: true,
      record,
      blog: record,
      data: record,
    });
  } catch (error) {
    console.error('Blog slug GET error:', error);
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

    const existingRes = await queryDb('SELECT * FROM blogs WHERE slug = $1 OR id::text = $1 LIMIT 1', [cleanSlug]);
    if (existingRes.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Blog not found' }, { status: 404 });
    }

    const currentBlog = existingRes.rows[0];
    const blogId = currentBlog.id;

    let title = null;
    let summary = null;
    let content = null;
    let service_id = undefined;
    let is_published = null;
    let imageFiles = [];
    let attachPublicId = null;
    let attachAssetId = null;
    let attachTitle = null;
    let attachSecureUrl = null;

    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('multipart/form-data') || contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData();
      if (formData.has('title')) title = (formData.get('title') || '').trim();
      if (formData.has('summary')) summary = formData.get('summary');
      if (formData.has('content')) content = formData.get('content');
      if (formData.has('service_id') || formData.has('app_id')) {
        const raw = formData.get('service_id') || formData.get('app_id');
        service_id = raw ? Number(raw) : null;
      }
      if (formData.has('is_published') || formData.has('is_active')) {
        const pubVal = formData.get('is_published') ?? formData.get('is_active');
        is_published = pubVal === 'true' || pubVal === true;
      }

      attachPublicId = formData.get('public_id');
      attachAssetId = formData.get('asset_id');
      attachTitle = formData.get('image_title') || formData.get('alt_text');
      attachSecureUrl = formData.get('secure_url');

      for (const [key, val] of formData.entries()) {
        if (val && typeof val === 'object' && typeof val.arrayBuffer === 'function' && val.size > 0) {
          imageFiles.push(val);
        }
      }
    } else {
      const body = await request.json().catch(() => ({}));
      const data = body.data || body;
      if (data.title !== undefined) title = data.title.trim();
      if (data.summary !== undefined) summary = data.summary;
      if (data.content !== undefined) content = data.content;
      if (data.service_id !== undefined || data.app_id !== undefined) {
        service_id = data.service_id || data.app_id ? Number(data.service_id || data.app_id) : null;
      }
      if (data.is_published !== undefined || data.is_active !== undefined) {
        const val = data.is_published ?? data.is_active;
        is_published = Boolean(val);
      }
      attachPublicId = data.public_id || body.public_id;
      attachAssetId = data.asset_id || body.asset_id;
      attachTitle = data.image_title || data.alt_text || body.image_title;
      attachSecureUrl = data.secure_url || body.secure_url;
    }

    await queryDb('BEGIN');

    const newTitle = title !== null ? title : currentBlog.title;
    let newSlug = currentBlog.slug;
    if (title !== null && title !== currentBlog.title && title.trim()) {
      const baseSlug = slugify(newTitle) || 'article';
      newSlug = baseSlug;
      const slugCheck = await queryDb('SELECT id FROM blogs WHERE slug = $1 AND id != $2 LIMIT 1', [newSlug, blogId]);
      if (slugCheck.rows.length > 0) {
        newSlug = `${baseSlug}-${Math.floor(1000 + Math.random() * 9000)}`;
      }
    }

    const newSummary = summary !== null ? (summary ? summary.trim() : null) : currentBlog.summary;
    const newContent = content !== null ? content.trim() : currentBlog.content;
    const newServiceId = service_id !== undefined ? service_id : currentBlog.service_id;
    const newPublished = is_published !== null ? is_published : currentBlog.is_published;

    await queryDb(
      `UPDATE blogs 
       SET title = $1, slug = $2, summary = $3, content = $4,
           service_id = $5, is_published = $6, updated_at = CURRENT_TIMESTAMP
       WHERE id = $7`,
      [newTitle, newSlug, newSummary, newContent, newServiceId, newPublished, blogId]
    );

    for (const file of imageFiles) {
      const uploadResult = await uploadToCloudinary(file, 'portfoliobuilder/blogs');
      if (uploadResult) {
        const imgUrl = uploadResult.url || uploadResult.id;
        const imgId = uploadResult.id;
        await queryDb(
          `INSERT INTO blogs_image (blog_id, image_url, image, image_id, title, alt_text)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [blogId, imgUrl, imgUrl, imgId, file.name || newTitle, file.name || newTitle]
        );
      }
    }

    if (attachSecureUrl) {
      await queryDb(
        `INSERT INTO blogs_image (blog_id, image_url, image, image_id, title, alt_text)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [blogId, attachSecureUrl, attachSecureUrl, attachPublicId || attachAssetId || null, attachTitle || newTitle, attachTitle || newTitle]
      );
    }

    await queryDb('COMMIT');

    const updatedRes = await queryDb(
      `SELECT 
        b.*,
        b.service_id AS app_id,
        d.name AS author_name,
        d.email AS author_email,
        COALESCE(dr.slug, 'developer') AS author_role,
        s.title AS service_title,
        s.slug AS service_slug,
        s.title AS app_title,
        s.slug AS app_slug,
        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'id', bi.id,
                'blog_id', bi.blog_id,
                'image_url', bi.image_url,
                'image', COALESCE(bi.image, bi.image_url),
                'image_id', bi.image_id,
                'title', bi.title,
                'alt_text', bi.alt_text,
                'caption', bi.caption,
                'created_at', bi.created_at
              ) ORDER BY bi.id ASC
            )
            FROM blogs_image bi
            WHERE bi.blog_id = b.id
          ),
          '[]'::json
        ) AS images
      FROM blogs b
      LEFT JOIN developers d ON b.author_id = d.id
      LEFT JOIN roles dr ON d.role_id = dr.id
      LEFT JOIN services s ON b.service_id = s.id
      WHERE b.id = $1`,
      [blogId]
    );

    const record = updatedRes.rows[0];

    return NextResponse.json({
      success: true,
      record,
      blog: record,
      images: record?.images || [],
      message: 'Blog updated successfully.',
    });
  } catch (error) {
    await queryDb('ROLLBACK').catch(() => {});
    console.error('Blog slug PUT error:', error);
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

    const existingRes = await queryDb('SELECT id FROM blogs WHERE slug = $1 OR id::text = $1 LIMIT 1', [cleanSlug]);
    if (existingRes.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Blog not found' }, { status: 404 });
    }

    const blogId = existingRes.rows[0].id;

    const imgRows = await queryDb('SELECT image, image_url, image_id FROM blogs_image WHERE blog_id = $1', [blogId]);
    for (const r of imgRows.rows) {
      const publicId = r.image_id || r.image_url || r.image;
      if (publicId) {
        try {
          await deleteFromCloudinary(publicId);
        } catch (_) {}
      }
    }

    await queryDb('DELETE FROM blogs_image WHERE blog_id = $1', [blogId]);
    await queryDb('DELETE FROM blogs WHERE id = $1', [blogId]);

    return NextResponse.json({ success: true, message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('Blog slug DELETE error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
