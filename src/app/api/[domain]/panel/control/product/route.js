import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';
import { getControlAuth, logWebsiteActivity } from '@/lib/website-control';
import slugify from 'slugify';

export async function GET(request, context) {
  try {
    const { website, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const brand = searchParams.get('brand') || '';
    const status = searchParams.get('status') || '';

    let sql = `
      SELECT p.id, p.id AS product_id, p.website_id, p.category_id, p.brand_id, p.name, p.slug,
             p.sku, p.barcode, p.unit, p.buy_price, p.sale_price, p.discount_price, p.stock,
             p.description, p.image, p.is_active, p.variants, p.created_at, p.updated_at,
             c.name AS category_name, b.name AS brand_name
      FROM website_products p
      LEFT JOIN website_categories c ON c.id = p.category_id
      LEFT JOIN website_brands b ON b.id = p.brand_id
      WHERE p.website_id = $1
    `;
    const params = [website.id];
    let paramIndex = 2;

    if (search.trim()) {
      sql += ` AND (LOWER(p.name) LIKE $${paramIndex} OR LOWER(p.sku) LIKE $${paramIndex} OR LOWER(COALESCE(p.barcode, '')) LIKE $${paramIndex} OR LOWER(COALESCE(p.description, '')) LIKE $${paramIndex})`;
      params.push(`%${search.trim().toLowerCase()}%`);
      paramIndex++;
    }

    if (category) {
      sql += ` AND (p.category_id = $${paramIndex} OR LOWER(c.slug) = $${paramIndex + 1})`;
      params.push(isNaN(Number(category)) ? -1 : Number(category), category.toLowerCase());
      paramIndex += 2;
    }

    if (brand) {
      sql += ` AND (p.brand_id = $${paramIndex} OR LOWER(b.slug) = $${paramIndex + 1})`;
      params.push(isNaN(Number(brand)) ? -1 : Number(brand), brand.toLowerCase());
      paramIndex += 2;
    }

    if (status) {
      sql += ` AND p.is_active = $${paramIndex}`;
      params.push(status.toLowerCase() === 'active');
      paramIndex++;
    }

    sql += ` ORDER BY p.id DESC`;

    const res = await queryDb(sql, params);
    return NextResponse.json(res.rows);
  } catch (error) {
    console.error('Product GET API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request, context) {
  try {
    const { website, user, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

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
        unit: formData.get('unit') || 'pcs',
        buy_price: formData.get('buy_price'),
        sale_price: formData.get('sale_price'),
        discount_price: formData.get('discount_price'),
        stock: formData.get('stock'),
        description: formData.get('description'),
        image: formData.get('image') || formData.get('image_url'),
        is_active: formData.get('is_active') !== 'false',
        variants: formData.get('variants') ? JSON.parse(formData.get('variants')) : []
      };
    } else {
      body = await request.json();
    }

    const {
      name, slug, category_id, brand_id, sku, barcode, unit = 'pcs',
      buy_price = 0, sale_price = 0, discount_price = 0, stock = 0,
      description, image, is_active = true, variants = []
    } = body;

    if (!name || !String(name).trim()) {
      return NextResponse.json({ success: false, error: 'Product name is required' }, { status: 400 });
    }

    const finalSlug = slugify(slug || name, { lower: true, strict: true }) + '-' + Math.floor(1000 + Math.random() * 9000);

    const res = await queryDb(
      `INSERT INTO website_products (
         website_id, category_id, brand_id, name, slug, sku, barcode, unit,
         buy_price, sale_price, discount_price, stock, description, image, is_active, variants
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
       RETURNING id, id AS product_id, website_id, category_id, brand_id, name, slug, sku, barcode, unit,
                 buy_price, sale_price, discount_price, stock, description, image, is_active, variants, created_at, updated_at`,
      [
        website.id,
        category_id ? Number(category_id) : null,
        brand_id ? Number(brand_id) : null,
        String(name).trim(),
        finalSlug,
        sku || null,
        barcode || null,
        unit,
        parseFloat(buy_price) || 0,
        parseFloat(sale_price) || 0,
        parseFloat(discount_price) || 0,
        parseInt(stock, 10) || 0,
        description || null,
        image || null,
        is_active,
        JSON.stringify(variants)
      ]
    );

    await logWebsiteActivity({
      websiteId: website.id,
      userId: user?.id,
      userName: user?.name,
      action: 'PRODUCT_CREATED',
      details: `Created product "${name}" (ID #${res.rows[0].id})`,
      req: request
    });

    return NextResponse.json(res.rows[0], { status: 201 });
  } catch (error) {
    console.error('Product POST API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
