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

// ============================================================================
// GET: List blogs with author info, associated service, and blogs_image gallery
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
    const listCloudinary = searchParams.get('cloudinary_assets');

    // Return Cloudinary asset library for media picker
    if (listCloudinary === 'true') {
      try {
        const cloudRes = await cloudinary.api.resources({
          type: 'upload',
          max_results: 50,
        });
        const assets = (cloudRes.resources || []).map((r) => ({
          public_id: r.public_id,
          asset_id: r.asset_id,
          format: r.format,
          secure_url: r.secure_url,
        }));
        return NextResponse.json({ success: true, assets }, { status: 200 });
      } catch (err) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
      }
    }

    let query = `
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

    query += ` ORDER BY b.created_at DESC, b.id DESC`;

    const res = await queryDb(query, params);

    if (blogId || slug) {
      const record = res.rows[0] || null;
      if (!record) {
        return NextResponse.json({ success: false, error: 'Blog not found.' }, { status: 404 });
      }
      return NextResponse.json({ success: true, blog: record, data: record });
    }

    return NextResponse.json({
      success: true,
      blogs: res.rows,
      data: res.rows,
    });
  } catch (error) {
    console.error('Blog GET error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// ============================================================================
// POST: Create a new blog post with media attachments
// ============================================================================
export async function POST(request) {
  try {
    const auth = await hasModulePermission(request, 'blogs');
    if (!auth.success) {
      return NextResponse.json({ success: false, error: auth.message || 'Unauthorized' }, { status: auth.status || 401 });
    }

    let title = '';
    let summary = '';
    let content = '';
    let service_id = null;
    let is_published = false;
    let imageFiles = [];
    let attachPublicId = null;
    let attachAssetId = null;
    let attachTitle = null;
    let attachSecureUrl = null;
    let imagesPayload = [];

    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('multipart/form-data') || contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData();
      title = (formData.get('title') || '').trim();
      summary = (formData.get('summary') || '').trim();
      content = (formData.get('content') || '').trim();
      const rawService = formData.get('service_id') || formData.get('app_id');
      service_id = rawService ? Number(rawService) : null;
      const pubVal = formData.get('is_published') ?? formData.get('is_active');
      is_published = pubVal === 'true' || pubVal === true;

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
      title = (data.title || '').trim();
      summary = (data.summary || '').trim();
      content = (data.content || '').trim();
      service_id = data.service_id || data.app_id ? Number(data.service_id || data.app_id) : null;
      if (data.is_published !== undefined) {
        is_published = Boolean(data.is_published);
      }
      attachPublicId = data.public_id || body.public_id;
      attachAssetId = data.asset_id || body.asset_id;
      attachTitle = data.image_title || data.alt_text || body.image_title;
      attachSecureUrl = data.secure_url || body.secure_url;
      imagesPayload = Array.isArray(data.images) ? data.images : [];
    }

    const cleanTitle = title || 'Untitled Article';
    const cleanContent = content || '<p>Write your article content here...</p>';

    const baseSlug = slugify(cleanTitle) || 'article';
    let slug = baseSlug;

    const checkSlug = await queryDb('SELECT id FROM blogs WHERE slug = $1 LIMIT 1', [slug]);
    if (checkSlug.rows.length > 0) {
      slug = `${baseSlug}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    const authorId = auth.developer?.id || auth.staff?.id || null;

    await queryDb('BEGIN');

    const insertRes = await queryDb(
      `INSERT INTO blogs (
        service_id, title, slug, summary, content, author_id, is_published, published_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
      RETURNING *`,
      [
        service_id,
        cleanTitle,
        slug,
        summary || null,
        cleanContent,
        authorId,
        is_published,
      ]
    );

    const newBlog = insertRes.rows[0];

    for (const imgFile of imageFiles) {
      const uploadResult = await uploadToCloudinary(imgFile, 'portfoliobuilder/blogs');
      if (uploadResult) {
        const imgUrl = uploadResult.url || uploadResult.id;
        const imgId = uploadResult.id;
        await queryDb(
          `INSERT INTO blogs_image (blog_id, image_url, image, image_id, title, alt_text)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [newBlog.id, imgUrl, imgUrl, imgId, imgFile.name || cleanTitle, imgFile.name || cleanTitle]
        );
      }
    }

    if (attachSecureUrl) {
      await queryDb(
        `INSERT INTO blogs_image (blog_id, image_url, image, image_id, title, alt_text)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [newBlog.id, attachSecureUrl, attachSecureUrl, attachPublicId || attachAssetId || null, attachTitle || cleanTitle, attachTitle || cleanTitle]
      );
    }

    if (imagesPayload && imagesPayload.length > 0) {
      for (const img of imagesPayload) {
        const url = img.image_url || img.secure_url || (typeof img === 'string' ? img : null);
        if (url) {
          await queryDb(
            `INSERT INTO blogs_image (blog_id, image_url, image, image_id, title, alt_text, caption)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [newBlog.id, url, url, img.public_id || img.image_id || null, img.title || cleanTitle, img.alt_text || cleanTitle, img.caption || null]
          );
        }
      }
    }

    await queryDb('COMMIT');

    return NextResponse.json({
      success: true,
      record: newBlog,
      blog: newBlog,
      message: 'Blog article created successfully.',
    }, { status: 201 });
  } catch (error) {
    await queryDb('ROLLBACK').catch(() => {});
    console.error('Blog POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

// ============================================================================
// PUT: Update a blog post
// ============================================================================
export async function PUT(request) {
  try {
    const auth = await hasModulePermission(request, 'blogs');
    if (!auth.success) {
      return NextResponse.json({ success: false, error: auth.message || 'Unauthorized' }, { status: auth.status || 401 });
    }

    let id = null;
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
    let newImages = [];

    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('multipart/form-data') || contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData();
      id = formData.get('id') || formData.get('blog_id');
      if (formData.has('title')) title = (formData.get('title') || '').trim();
      if (formData.has('summary')) summary = formData.get('summary');
      if (formData.has('content')) content = formData.get('content');
      if (formData.has('service_id') || formData.has('app_id')) {
        const rawSrv = formData.get('service_id') || formData.get('app_id');
        service_id = rawSrv ? Number(rawSrv) : null;
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
      id = body.id || data.id;
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
      newImages = Array.isArray(data.new_images) ? data.new_images : Array.isArray(data.images) ? data.images : [];
    }

    if (!id) {
      return NextResponse.json({ success: false, error: 'Blog ID is required.' }, { status: 400 });
    }

    const blogId = Number(id);

    await queryDb('BEGIN');

    const currentRes = await queryDb('SELECT * FROM blogs WHERE id = $1', [blogId]);
    if (currentRes.rows.length === 0) {
      await queryDb('ROLLBACK');
      return NextResponse.json({ success: false, error: 'Blog not found.' }, { status: 404 });
    }
    const currentBlog = currentRes.rows[0];

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

    if (newImages && newImages.length > 0) {
      for (const img of newImages) {
        const url = img.image_url || img.secure_url || (typeof img === 'string' ? img : null);
        if (url) {
          await queryDb(
            `INSERT INTO blogs_image (blog_id, image_url, image, image_id, title, alt_text, caption)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [blogId, url, url, img.public_id || img.image_id || null, img.title || newTitle, img.alt_text || newTitle, img.caption || null]
          );
        }
      }
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

    const record = updatedRes.rows[0] || null;

    return NextResponse.json({
      success: true,
      record,
      blog: record,
      images: record?.images || [],
      ...record,
      message: 'Blog updated successfully.',
    });
  } catch (error) {
    await queryDb('ROLLBACK').catch(() => {});
    console.error('Blog PUT error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

// ============================================================================
// DELETE: Delete a blog post or an individual blogs_image from Cloudinary & DB
// ============================================================================
export async function DELETE(request) {
  try {
    const auth = await hasModulePermission(request, 'blogs');
    if (!auth.success) {
      return NextResponse.json({ success: false, error: auth.message || 'Unauthorized' }, { status: auth.status || 401 });
    }

    const { searchParams } = new URL(request.url);
    let id = searchParams.get('id') || searchParams.get('blog_id');
    let imageId = searchParams.get('image_id');

    if (!id && !imageId) {
      const body = await request.json().catch(() => ({}));
      id = body.id || body.blog_id;
      imageId = body.image_id;
    }

    if (imageId) {
      const imgRow = await queryDb('SELECT image, image_url, image_id FROM blogs_image WHERE id = $1', [imageId]);
      if (imgRow.rows.length > 0) {
        const row = imgRow.rows[0];
        const publicId = row.image_id || row.image_url || row.image;
        if (publicId) {
          try {
            await deleteFromCloudinary(publicId);
          } catch (err) {
            console.warn('Cloudinary delete image warning:', err.message);
          }
        }
        await queryDb('DELETE FROM blogs_image WHERE id = $1', [imageId]);
      }
      return NextResponse.json({ success: true, message: 'Blog image deleted from Cloudinary and database.' });
    }

    if (!id) {
      return NextResponse.json({ success: false, error: 'Blog ID or Image ID is required for deletion.' }, { status: 400 });
    }

    const blogId = Number(id);

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

    return NextResponse.json({ success: true, message: 'Blog article and associated Cloudinary assets deleted.' });
  } catch (error) {
    console.error('Blog DELETE error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
