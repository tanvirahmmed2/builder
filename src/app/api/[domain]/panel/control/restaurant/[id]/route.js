import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';
import { getControlAuth } from '@/lib/website-control';

export async function PUT(request, context) {
  try {
    const { website, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const params = context?.params ? await context.params : {};
    const id = params?.id;
    const body = await request.json();
    const type = body.type || 'item';

    if (type === 'table') {
      const { table_number, capacity, status } = body;
      const res = await queryDb(
        `UPDATE website_restaurant_tables
         SET table_number = COALESCE($1, table_number),
             capacity = COALESCE($2, capacity),
             status = COALESCE($3, status),
             updated_at = NOW()
         WHERE id = $4 AND website_id = $5
         RETURNING *`,
        [table_number, capacity ? Number(capacity) : null, status, id, website.id]
      );
      if (res.rowCount === 0) return NextResponse.json({ success: false, error: 'Table not found' }, { status: 404 });
      return NextResponse.json({ success: true, table: res.rows[0] });
    }

    if (type === 'reservation') {
      const { status, notes } = body;
      const res = await queryDb(
        `UPDATE website_restaurant_table_reservations
         SET status = COALESCE($1, status),
             notes = COALESCE($2, notes),
             updated_at = NOW()
         WHERE id = $3 AND website_id = $4
         RETURNING *`,
        [status, notes, id, website.id]
      );
      if (res.rowCount === 0) return NextResponse.json({ success: false, error: 'Reservation not found' }, { status: 404 });
      return NextResponse.json({ success: true, reservation: res.rows[0] });
    }

    // Default: item
    const { name, description, base_price, image_url, preparation_time_minutes, is_vegetarian, is_spicy, is_available } = body;
    const res = await queryDb(
      `UPDATE website_restaurant_menu_items
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           base_price = COALESCE($3, base_price),
           image_url = COALESCE($4, image_url),
           preparation_time_minutes = COALESCE($5, preparation_time_minutes),
           is_vegetarian = COALESCE($6, is_vegetarian),
           is_spicy = COALESCE($7, is_spicy),
           is_available = COALESCE($8, is_available),
           updated_at = NOW()
       WHERE id = $9 AND website_id = $10
       RETURNING *`,
      [name, description, base_price ? Number(base_price) : null, image_url, preparation_time_minutes ? Number(preparation_time_minutes) : null, is_vegetarian, is_spicy, is_available, id, website.id]
    );
    if (res.rowCount === 0) return NextResponse.json({ success: false, error: 'Item not found' }, { status: 404 });
    return NextResponse.json({ success: true, item: res.rows[0] });
  } catch (error) {
    console.error('Restaurant PUT error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, context) {
  try {
    const { website, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const params = context?.params ? await context.params : {};
    const id = params?.id;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'item';

    let table = 'website_restaurant_menu_items';
    if (type === 'table') table = 'website_restaurant_tables';
    if (type === 'reservation') table = 'website_restaurant_table_reservations';
    if (type === 'menu') table = 'website_restaurant_menus';

    const res = await queryDb(
      `DELETE FROM ${table} WHERE id = $1 AND website_id = $2 RETURNING id`,
      [id, website.id]
    );

    if (res.rowCount === 0) return NextResponse.json({ success: false, error: 'Item not found' }, { status: 404 });
    return NextResponse.json({ success: true, deletedId: id });
  } catch (error) {
    console.error('Restaurant DELETE error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

