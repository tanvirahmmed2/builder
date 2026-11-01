import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';
import { getControlAuth } from '@/lib/website-control';
import slugify from 'slugify';

export async function GET(request, context) {
  try {
    const { website, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(request.url);
    const tab = searchParams.get('tab') || 'items';

    if (tab === 'menus') {
      const res = await queryDb(
        `SELECT id, branch_id, name, description, is_active, created_at, updated_at
         FROM website_restaurant_menus
         WHERE website_id = $1
         ORDER BY id DESC`,
        [website.id]
      );
      return NextResponse.json(res.rows);
    }

    if (tab === 'tables') {
      const res = await queryDb(
        `SELECT id, branch_id, floor_plan_id, table_number, capacity, status, created_at, updated_at
         FROM website_restaurant_tables
         WHERE website_id = $1
         ORDER BY table_number ASC`,
        [website.id]
      );
      return NextResponse.json(res.rows);
    }

    if (tab === 'reservations') {
      const res = await queryDb(
        `SELECT r.id, r.table_id, r.customer_name, r.customer_phone, r.party_size, r.reservation_time, r.status, r.notes, r.created_at,
                t.table_number
         FROM website_restaurant_table_reservations r
         LEFT JOIN website_restaurant_tables t ON r.table_id = t.id
         WHERE r.website_id = $1
         ORDER BY r.reservation_time DESC`,
        [website.id]
      );
      return NextResponse.json(res.rows);
    }

    // Default: menu items
    const res = await queryDb(
      `SELECT id, category_id, name, slug, description, base_price, image_url, preparation_time_minutes, is_vegetarian, is_spicy, is_available, created_at, updated_at
       FROM website_restaurant_menu_items
       WHERE website_id = $1
       ORDER BY id DESC`,
      [website.id]
    );
    return NextResponse.json(res.rows);
  } catch (error) {
    console.error('Restaurant GET error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request, context) {
  try {
    const { website, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const body = await request.json();
    const type = body.type || 'item';

    if (type === 'menu') {
      const { name, description = '', is_active = true } = body;
      if (!name?.trim()) return NextResponse.json({ success: false, error: 'Menu name is required' }, { status: 400 });
      const res = await queryDb(
        `INSERT INTO website_restaurant_menus (website_id, name, description, is_active, created_at, updated_at)
         VALUES ($1, $2, $3, $4, NOW(), NOW())
         RETURNING *`,
        [website.id, name.trim(), description, is_active]
      );
      return NextResponse.json({ success: true, menu: res.rows[0] });
    }

    if (type === 'table') {
      const { table_number, capacity = 4, status = 'available' } = body;
      if (!table_number) return NextResponse.json({ success: false, error: 'Table number is required' }, { status: 400 });
      const res = await queryDb(
        `INSERT INTO website_restaurant_tables (website_id, table_number, capacity, status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, NOW(), NOW())
         RETURNING *`,
        [website.id, String(table_number), Number(capacity) || 4, status]
      );
      return NextResponse.json({ success: true, table: res.rows[0] });
    }

    if (type === 'reservation') {
      const { table_id = null, customer_name, customer_phone, party_size = 2, reservation_time = new Date(), notes = '' } = body;
      if (!customer_name?.trim() || !customer_phone?.trim()) {
        return NextResponse.json({ success: false, error: 'Customer name and phone are required' }, { status: 400 });
      }
      const res = await queryDb(
        `INSERT INTO website_restaurant_table_reservations
         (website_id, table_id, customer_name, customer_phone, party_size, reservation_time, status, notes, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, 'confirmed', $7, NOW(), NOW())
         RETURNING *`,
        [website.id, table_id || null, customer_name.trim(), customer_phone.trim(), Number(party_size) || 2, reservation_time, notes]
      );
      return NextResponse.json({ success: true, reservation: res.rows[0] });
    }

    // Default: item
    const { name, description = '', base_price = 0, image_url = '', preparation_time_minutes = 15, is_vegetarian = false, is_spicy = false, is_available = true } = body;
    if (!name?.trim()) return NextResponse.json({ success: false, error: 'Food item name is required' }, { status: 400 });
    const slug = slugify(name, { lower: true, strict: true }) + '-' + Date.now().toString(36);
    const res = await queryDb(
      `INSERT INTO website_restaurant_menu_items
       (website_id, name, slug, description, base_price, image_url, preparation_time_minutes, is_vegetarian, is_spicy, is_available, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
       RETURNING *`,
      [website.id, name.trim(), slug, description, Number(base_price) || 0, image_url, Number(preparation_time_minutes) || 15, is_vegetarian, is_spicy, is_available]
    );
    return NextResponse.json({ success: true, item: res.rows[0] });
  } catch (error) {
    console.error('Restaurant POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

