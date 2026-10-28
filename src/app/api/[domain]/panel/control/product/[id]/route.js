import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';
import { getControlAuth, logWebsiteActivity } from '@/lib/website-control';
import slugify from 'slugify';

export async function GET(request, context) {
  try {
    const { website, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const params = await context.params;
    const identifier = params.id;
    const isNum = !isNaN(Number(identifier));

    let res;
    if (isNum) {
      res = await queryDb(
        `SELECT p.id, p.id AS product_id, p.website_id, p.category_id, p.brand_id, p.name, p.slug,
                p.sku, p.barcode, p.unit, p.buy_price, p.sale_price, p.discount_price, p.stock,
                p.description, p.image, p.is_active, p.variants, p.created_at, p.updated_at,
                c.name AS category_name, b.name AS brand_name
         FROM website_products p
         LEFT JOIN website_categories c ON c.id = p.category_id
         LEFT JOIN website_brands b ON b.id = p.brand_id
         WHERE (p.id = $1 OR p.slug = $2) AND p.website_id = $3
         LIMIT 1`,
        [Number(identifier), String(identifier), website.id]
      );
    } else {
      res = await queryDb(
        `SELECT p.id, p.id AS product_id, p.website_id, p.category_id, p.brand_id, p.name, p.slug,
                p.sku, p.barcode, p.unit, p.buy_price, p.sale_price, p.discount_price, p.stock,
                p.description, p.image, p.is_active, p.variants, p.created_at, p.updated_at,
                c.name AS category_name, b.name AS brand_name
         FROM website_products p
         LEFT JOIN website_categories c ON c.id = p.category_id
         LEFT JOIN website_brands b ON b.id = p.brand_id
         WHERE p.slug = $1 AND p.website_id = $2
         LIMIT 1`,
        [String(identifier), website.id]
      );
    }

    if (res.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(res.rows[0]);
  } catch (error) {
    console.error('Product GET ID error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request, context) {
  try {
    const { website, user, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const params = await context.params;
    const identifier = params.id;
    const isNum = !isNaN(Number(identifier));

    let body;
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      body = {
        name: formData.get('name'),
        slug: formData.get('slug'),
        category_id: formData.get('category_id'),
        brand_id: formData.get('brand_id'),
        sku: formData.get('sku'),
        barcode: formData.get('barcode'),
        unit: formData.get('unit'),
        buy_price: formData.get('buy_price'),
        sale_price: formData.get('sale_price'),
        discount_price: formData.get('discount_price'),
        stock: formData.get('stock'),
        description: formData.get('description'),
        image: formData.get('image') || formData.get('image_url'),
        is_active: formData.get('is_active') !== null ? formData.get('is_active') !== 'false' : undefined,
        variants: formData.get('variants') ? JSON.parse(formData.get('variants')) : undefined
      };
    } else {
      body = await request.json();
    }

    const {
      name, slug, category_id, brand_id, sku, barcode, unit,
      buy_price, sale_price, discount_price, stock, description, image,
      is_active, variants
    } = body;

    const finalSlug = slug ? slugify(slug, { lower: true, strict: true }) : (name ? slugify(name, { lower: true, strict: true }) : null);

    const condition = isNum ? '(id = $15 OR slug = $16)' : 'slug = $16';
    const paramsList = [
      name, finalSlug, category_id ? Number(category_id) : null,
      brand_id ? Number(brand_id) : null, sku, barcode, unit,
      buy_price !== undefined ? parseFloat(buy_price) : null,
      sale_price !== undefined ? parseFloat(sale_price) : null,
      discount_price !== undefined ? parseFloat(discount_price) : null,
      stock !== undefined ? parseInt(stock, 10) : null,
      description, image, is_active,
      isNum ? Number(identifier) : -1,
      String(identifier),
      website.id,
      variants ? JSON.stringify(variants) : null
    ];

    const res = await queryDb(
      `UPDATE website_products
       SET name = COALESCE($1, name),
           slug = COALESCE($2, slug),
           category_id = COALESCE($3, category_id),
           brand_id = COALESCE($4, brand_id),
           sku = COALESCE($5, sku),
           barcode = COALESCE($6, barcode),
           unit = COALESCE($7, unit),
           buy_price = COALESCE($8, buy_price),
           sale_price = COALESCE($9, sale_price),
           discount_price = COALESCE($10, discount_price),
           stock = COALESCE($11, stock),
           description = COALESCE($12, description),
           image = COALESCE($13, image),
           is_active = COALESCE($14, is_active),
           variants = COALESCE($18, variants),
           updated_at = NOW()
       WHERE ${condition} AND website_id = $17
       RETURNING id, id AS product_id, website_id, category_id, brand_id, name, slug, sku, barcode, unit,
                 buy_price, sale_price, discount_price, stock, description, image, is_active, variants, created_at, updated_at`,
      paramsList
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    await logWebsiteActivity({
      websiteId: website.id,
      userId: user?.id,
      userName: user?.name,
      action: 'PRODUCT_UPDATED',
      details: `Updated product "${res.rows[0].name}" (#${res.rows[0].id})`,
      req: request
    });

    return NextResponse.json(res.rows[0]);
  } catch (error) {
    console.error('Product PUT ID error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, context) {
  try {
    const { website, user, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const params = await context.params;
    const identifier = params.id;
    const isNum = !isNaN(Number(identifier));

    const condition = isNum ? '(id = $1 OR slug = $2)' : 'slug = $2';
    const res = await queryDb(
      `DELETE FROM website_products
       WHERE ${condition} AND website_id = $3
       RETURNING id, name`,
      [isNum ? Number(identifier) : -1, String(identifier), website.id]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    await logWebsiteActivity({
      websiteId: website.id,
      userId: user?.id,
      userName: user?.name,
      action: 'PRODUCT_DELETED',
      details: `Deleted product "${res.rows[0].name}" (#${res.rows[0].id})`,
      req: request
    });

    return NextResponse.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Product DELETE ID error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
