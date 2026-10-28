import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';
import { getControlAuth, logWebsiteActivity } from '@/lib/website-control';
import slugify from 'slugify';

export async function GET(request, context) {
  try {
    const { website, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const res = await queryDb(
      `SELECT id, id AS category_id, website_id, parent_id, name, slug, type, description, image_url, created_at, updated_at
       FROM website_categories
       WHERE website_id = $1
       ORDER BY name ASC`,
      [website.id]
    );

    return NextResponse.json(res.rows);
  } catch (error) {
    console.error('Category GET API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request, context) {
  try {
    const { website, user, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    let name, slug, description, image_url, parent_id, type;

    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      name = formData.get('name');
      slug = formData.get('slug');
      description = formData.get('description');
      image_url = formData.get('image_url') || formData.get('image');
      parent_id = formData.get('parent_id') ? Number(formData.get('parent_id')) : null;
      type = formData.get('type') || 'PRODUCT';
    } else {
      const body = await request.json();
      name = body.name;
      slug = body.slug;
      description = body.description;
      image_url = body.image_url || body.image;
      parent_id = body.parent_id ? Number(body.parent_id) : null;
      type = body.type || 'PRODUCT';
    }

    if (!name || !String(name).trim()) {
      return NextResponse.json({ success: false, error: 'Category name is required' }, { status: 400 });
    }

    const finalSlug = slugify(slug || name, { lower: true, strict: true }) || 'cat-' + Date.now();

    const res = await queryDb(
      `INSERT INTO website_categories (website_id, parent_id, name, slug, type, description, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, id AS category_id, website_id, parent_id, name, slug, type, description, image_url, created_at, updated_at`,
      [website.id, parent_id, String(name).trim(), finalSlug, type, description || null, image_url || null]
    );

    await logWebsiteActivity({
      websiteId: website.id,
      userId: user?.id,
      userName: user?.name,
      action: 'CATEGORY_CREATED',
      details: `Created category "${name}"`,
      req: request
    });

    return NextResponse.json(res.rows[0], { status: 201 });
  } catch (error) {
    console.error('Category POST API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
