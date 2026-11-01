import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';
import { getControlAuth } from '@/lib/website-control';
import slugify from 'slugify';

export async function GET(request, context) {
  try {
    const { website, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(request.url);
    const tab = searchParams.get('tab') || 'packages';

    if (tab === 'spots') {
      const res = await queryDb(
        `SELECT id, name, slug, location, description, thumbnail_url, is_active, created_at, updated_at
         FROM website_tour_spots
         WHERE website_id = $1
         ORDER BY name ASC`,
        [website.id]
      );
      return NextResponse.json(res.rows);
    }

    if (tab === 'bookings') {
      const res = await queryDb(
        `SELECT b.id, b.package_id, b.customer_name, b.customer_email, b.customer_phone, b.travel_date, b.total_guests, b.total_amount, b.payment_status, b.booking_status, b.created_at,
                p.title as package_title
         FROM website_tour_bookings b
         LEFT JOIN website_tour_packages p ON b.package_id = p.id
         WHERE b.website_id = $1
         ORDER BY b.id DESC`,
        [website.id]
      );
      return NextResponse.json(res.rows);
    }

    // Default: packages
    const res = await queryDb(
      `SELECT id, title, slug, duration_days, duration_nights, base_price, description, thumbnail_url, is_featured, is_active, created_at, updated_at
       FROM website_tour_packages
       WHERE website_id = $1
       ORDER BY is_featured DESC, id DESC`,
      [website.id]
    );
    return NextResponse.json(res.rows);
  } catch (error) {
    console.error('Tours GET error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request, context) {
  try {
    const { website, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const body = await request.json();
    const type = body.type || 'package';

    if (type === 'spot') {
      const { name, location = '', description = '', thumbnail_url = '', is_active = true } = body;
      if (!name?.trim()) return NextResponse.json({ success: false, error: 'Destination name is required' }, { status: 400 });
      const slug = slugify(name, { lower: true, strict: true }) + '-' + Date.now().toString(36);
      const res = await queryDb(
        `INSERT INTO website_tour_spots (website_id, name, slug, location, description, thumbnail_url, is_active, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
         RETURNING *`,
        [website.id, name.trim(), slug, location, description, thumbnail_url, is_active]
      );
      return NextResponse.json({ success: true, spot: res.rows[0] });
    }

    if (type === 'booking') {
      const { package_id = null, customer_name, customer_email = '', customer_phone, travel_date = new Date(), total_guests = 1, total_amount = 0 } = body;
      if (!customer_name?.trim() || !customer_phone?.trim()) {
        return NextResponse.json({ success: false, error: 'Customer name and phone are required' }, { status: 400 });
      }
      const res = await queryDb(
        `INSERT INTO website_tour_bookings
         (website_id, package_id, customer_name, customer_email, customer_phone, travel_date, total_guests, total_amount, payment_status, booking_status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending', 'confirmed', NOW(), NOW())
         RETURNING *`,
        [website.id, package_id || null, customer_name.trim(), customer_email.trim(), customer_phone.trim(), travel_date, Number(total_guests) || 1, Number(total_amount) || 0]
      );
      return NextResponse.json({ success: true, booking: res.rows[0] });
    }

    // Default: package
    const { title, duration_days = 3, duration_nights = 2, base_price = 0, description = '', thumbnail_url = '', is_featured = false, is_active = true } = body;
    if (!title?.trim()) return NextResponse.json({ success: false, error: 'Tour package title is required' }, { status: 400 });
    const slug = slugify(title, { lower: true, strict: true }) + '-' + Date.now().toString(36);
    const res = await queryDb(
      `INSERT INTO website_tour_packages
       (website_id, title, slug, duration_days, duration_nights, base_price, description, thumbnail_url, is_featured, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
       RETURNING *`,
      [website.id, title.trim(), slug, Number(duration_days) || 1, Number(duration_nights) || 0, Number(base_price) || 0, description, thumbnail_url, is_featured, is_active]
    );
    return NextResponse.json({ success: true, package: res.rows[0] });
  } catch (error) {
    console.error('Tours POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

