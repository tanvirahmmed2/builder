import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';
import { getControlAuth, logWebsiteActivity } from '@/lib/website-control';
import slugify from 'slugify';

export async function GET(request, context) {
  try {
    const { website, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const params = await context.params;
    const categoryId = Number(params.id);

    const res = await queryDb(
      `SELECT id, id AS category_id, website_id, parent_id, name, slug, type, description, image_url, created_at, updated_at
       FROM website_categories
       WHERE id = $1 AND website_id = $2
       LIMIT 1`,
      [categoryId, website.id]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json(res.rows[0]);
  } catch (error) {
    console.error('Category GET ID error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request, context) {
  try {
    const { website, user, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const params = await context.params;
    const categoryId = Number(params.id);

    let name, slug, description, image_url, parent_id, type;
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      name = formData.get('name');
      slug = formData.get('slug');
      description = formData.get('description');
      image_url = formData.get('image_url') || formData.get('image');
      parent_id = formData.get('parent_id') !== null ? Number(formData.get('parent_id')) : undefined;
      type = formData.get('type');
    } else {
      const body = await request.json();
      name = body.name;
      slug = body.slug;
      description = body.description;
      image_url = body.image_url || body.image;
      parent_id = body.parent_id !== undefined ? Number(body.parent_id) : undefined;
      type = body.type;
    }

    const finalSlug = slug ? slugify(slug, { lower: true, strict: true }) : (name ? slugify(name, { lower: true, strict: true }) : null);

    const res = await queryDb(
      `UPDATE website_categories
       SET name = COALESCE($1, name),
           slug = COALESCE($2, slug),
           description = COALESCE($3, description),
           image_url = COALESCE($4, image_url),
           parent_id = COALESCE($5, parent_id),
           type = COALESCE($6, type),
           updated_at = NOW()
       WHERE id = $7 AND website_id = $8
       RETURNING id, id AS category_id, website_id, parent_id, name, slug, type, description, image_url, created_at, updated_at`,
      [name, finalSlug, description, image_url, parent_id, type, categoryId, website.id]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
    }

    await logWebsiteActivity({
      websiteId: website.id,
      userId: user?.id,
      userName: user?.name,
      action: 'CATEGORY_UPDATED',
      details: `Updated category #${categoryId}`,
      req: request
    });

    return NextResponse.json(res.rows[0]);
  } catch (error) {
    console.error('Category PUT ID error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, context) {
  try {
    const { website, user, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const params = await context.params;
    const categoryId = Number(params.id);

    const res = await queryDb(
      `DELETE FROM website_categories
       WHERE id = $1 AND website_id = $2
       RETURNING id`,
      [categoryId, website.id]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
    }

    await logWebsiteActivity({
      websiteId: website.id,
      userId: user?.id,
      userName: user?.name,
      action: 'CATEGORY_DELETED',
      details: `Deleted category #${categoryId}`,
      req: request
    });

    return NextResponse.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Category DELETE ID error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
