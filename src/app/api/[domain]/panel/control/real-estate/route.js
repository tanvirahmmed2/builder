import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';
import { getControlAuth } from '@/lib/website-control';
import slugify from 'slugify';

export async function GET(request, context) {
  try {
    const { website, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(request.url);
    const tab = searchParams.get('tab') || 'properties';

    if (tab === 'developments') {
      const res = await queryDb(
        `SELECT id, title, slug, developer_name, location, status, total_units, created_at, updated_at
         FROM website_real_estate_developments
         WHERE website_id = $1
         ORDER BY id DESC`,
        [website.id]
      );
      return NextResponse.json(res.rows);
    }

    if (tab === 'agents') {
      const res = await queryDb(
        `SELECT id, full_name, email, phone, avatar_url, bio, license_number, is_active, created_at, updated_at
         FROM website_real_estate_agents
         WHERE website_id = $1
         ORDER BY full_name ASC`,
        [website.id]
      );
      return NextResponse.json(res.rows);
    }

    if (tab === 'viewings') {
      const res = await queryDb(
        `SELECT v.id, v.property_id, v.client_name, v.client_email, v.client_phone, v.viewing_date, v.status, v.notes, v.created_at,
                p.title as property_title
         FROM website_real_estate_viewing_bookings v
         LEFT JOIN website_real_estate_properties p ON v.property_id = p.id
         WHERE v.website_id = $1
         ORDER BY v.viewing_date DESC`,
        [website.id]
      );
      return NextResponse.json(res.rows);
    }

    // Default: properties
    const res = await queryDb(
      `SELECT id, building_id, title, slug, property_type, listing_type, price, bedrooms, bathrooms, area_sqft, status, is_featured, created_at, updated_at
       FROM website_real_estate_properties
       WHERE website_id = $1
       ORDER BY is_featured DESC, id DESC`,
      [website.id]
    );
    return NextResponse.json(res.rows);
  } catch (error) {
    console.error('Real Estate GET error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request, context) {
  try {
    const { website, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const body = await request.json();
    const type = body.type || 'property';

    if (type === 'development') {
      const { title, developer_name = '', location = '', status = 'under_construction', total_units = 10 } = body;
      if (!title?.trim()) return NextResponse.json({ success: false, error: 'Project development title is required' }, { status: 400 });
      const slug = slugify(title, { lower: true, strict: true }) + '-' + Date.now().toString(36);
      const res = await queryDb(
        `INSERT INTO website_real_estate_developments (website_id, title, slug, developer_name, location, status, total_units, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
         RETURNING *`,
        [website.id, title.trim(), slug, developer_name, location, status, Number(total_units) || 1]
      );
      return NextResponse.json({ success: true, development: res.rows[0] });
    }

    if (type === 'agent') {
      const { full_name, email = '', phone = '', avatar_url = '', bio = '', license_number = '', is_active = true } = body;
      if (!full_name?.trim()) return NextResponse.json({ success: false, error: 'Agent name is required' }, { status: 400 });
      const res = await queryDb(
        `INSERT INTO website_real_estate_agents (website_id, full_name, email, phone, avatar_url, bio, license_number, is_active, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
         RETURNING *`,
        [website.id, full_name.trim(), email.trim(), phone.trim(), avatar_url, bio, license_number, is_active]
      );
      return NextResponse.json({ success: true, agent: res.rows[0] });
    }

    // Default: property
    const { title, property_type = 'Apartment', listing_type = 'sale', price = 0, bedrooms = 3, bathrooms = 2, area_sqft = 1200, status = 'available', is_featured = false } = body;
    if (!title?.trim()) return NextResponse.json({ success: false, error: 'Property title is required' }, { status: 400 });
    const slug = slugify(title, { lower: true, strict: true }) + '-' + Date.now().toString(36);
    const res = await queryDb(
      `INSERT INTO website_real_estate_properties
       (website_id, title, slug, property_type, listing_type, price, bedrooms, bathrooms, area_sqft, status, is_featured, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
       RETURNING *`,
      [website.id, title.trim(), slug, property_type, listing_type, Number(price) || 0, Number(bedrooms) || 1, Number(bathrooms) || 1, Number(area_sqft) || 500, status, is_featured]
    );
    return NextResponse.json({ success: true, property: res.rows[0] });
  } catch (error) {
    console.error('Real Estate POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

