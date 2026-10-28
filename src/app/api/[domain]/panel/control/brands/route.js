import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';
import { getControlAuth, logWebsiteActivity } from '@/lib/website-control';
import slugify from 'slugify';

export async function GET(request, context) {
  try {
    const { website, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const res = await queryDb(
      `SELECT id, id AS brand_id, website_id, name, slug, image_url, description, is_active, created_at, updated_at
       FROM website_brands
       WHERE website_id = $1
       ORDER BY name ASC`,
      [website.id]
    );

    return NextResponse.json(res.rows);
  } catch (error) {
    console.error('Brands GET API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request, context) {
  try {
    const { website, user, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    let name, slug, image_url, description, is_active;

    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      name = formData.get('name');
      slug = formData.get('slug');
      image_url = formData.get('image_url') || formData.get('image');
      description = formData.get('description');
      is_active = formData.get('is_active') !== 'false';
    } else {
      const body = await request.json();
      name = body.name;
      slug = body.slug;
      image_url = body.image_url || body.image;
      description = body.description;
      is_active = body.is_active !== false;
    }

    if (!name || !String(name).trim()) {
      return NextResponse.json({ success: false, error: 'Brand name is required' }, { status: 400 });
    }

    const finalSlug = slugify(slug || name, { lower: true, strict: true }) || 'brand-' + Date.now();

    const res = await queryDb(
      `INSERT INTO website_brands (website_id, name, slug, image_url, description, is_active)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, id AS brand_id, website_id, name, slug, image_url, description, is_active, created_at, updated_at`,
      [website.id, String(name).trim(), finalSlug, image_url || null, description || null, is_active]
    );

    await logWebsiteActivity({
      websiteId: website.id,
      userId: user?.id,
      userName: user?.name,
      action: 'BRAND_CREATED',
      details: `Created brand "${name}"`,
      req: request
    });

    return NextResponse.json(res.rows[0], { status: 201 });
  } catch (error) {
    console.error('Brands POST API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
