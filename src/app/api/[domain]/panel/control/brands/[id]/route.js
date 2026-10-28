import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';
import { getControlAuth, logWebsiteActivity } from '@/lib/website-control';
import slugify from 'slugify';

export async function GET(request, context) {
  try {
    const { website, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const params = await context.params;
    const brandId = Number(params.id);

    const res = await queryDb(
      `SELECT id, id AS brand_id, website_id, name, slug, image_url, description, is_active, created_at, updated_at
       FROM website_brands
       WHERE id = $1 AND website_id = $2
       LIMIT 1`,
      [brandId, website.id]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Brand not found' }, { status: 404 });
    }

    return NextResponse.json(res.rows[0]);
  } catch (error) {
    console.error('Brands GET ID error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request, context) {
  try {
    const { website, user, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const params = await context.params;
    const brandId = Number(params.id);

    let name, slug, image_url, description, is_active;
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      name = formData.get('name');
      slug = formData.get('slug');
      image_url = formData.get('image_url') || formData.get('image');
      description = formData.get('description');
      is_active = formData.get('is_active') !== null ? formData.get('is_active') !== 'false' : undefined;
    } else {
      const body = await request.json();
      name = body.name;
      slug = body.slug;
      image_url = body.image_url || body.image;
      description = body.description;
      is_active = body.is_active;
    }

    const finalSlug = slug ? slugify(slug, { lower: true, strict: true }) : (name ? slugify(name, { lower: true, strict: true }) : null);

    const res = await queryDb(
      `UPDATE website_brands
       SET name = COALESCE($1, name),
           slug = COALESCE($2, slug),
           image_url = COALESCE($3, image_url),
           description = COALESCE($4, description),
           is_active = COALESCE($5, is_active),
           updated_at = NOW()
       WHERE id = $6 AND website_id = $7
       RETURNING id, id AS brand_id, website_id, name, slug, image_url, description, is_active, created_at, updated_at`,
      [name, finalSlug, image_url, description, is_active, brandId, website.id]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Brand not found' }, { status: 404 });
    }

    await logWebsiteActivity({
      websiteId: website.id,
      userId: user?.id,
      userName: user?.name,
      action: 'BRAND_UPDATED',
      details: `Updated brand #${brandId}`,
      req: request
    });

    return NextResponse.json(res.rows[0]);
  } catch (error) {
    console.error('Brands PUT ID error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, context) {
  try {
    const { website, user, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const params = await context.params;
    const brandId = Number(params.id);

    const res = await queryDb(
      `DELETE FROM website_brands
       WHERE id = $1 AND website_id = $2
       RETURNING id`,
      [brandId, website.id]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Brand not found' }, { status: 404 });
    }

    await logWebsiteActivity({
      websiteId: website.id,
      userId: user?.id,
      userName: user?.name,
      action: 'BRAND_DELETED',
      details: `Deleted brand #${brandId}`,
      req: request
    });

    return NextResponse.json({ success: true, message: 'Brand deleted successfully' });
  } catch (error) {
    console.error('Brands DELETE ID error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
