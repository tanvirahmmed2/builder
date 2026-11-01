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
    const type = body.type || 'package';

    if (type === 'spot') {
      const { name, location, description, thumbnail_url, is_active } = body;
      const res = await queryDb(
        `UPDATE website_tour_spots
         SET name = COALESCE($1, name), location = COALESCE($2, location), description = COALESCE($3, description),
             thumbnail_url = COALESCE($4, thumbnail_url), is_active = COALESCE($5, is_active), updated_at = NOW()
         WHERE id = $6 AND website_id = $7
         RETURNING *`,
        [name, location, description, thumbnail_url, is_active, id, website.id]
      );
      if (res.rowCount === 0) return NextResponse.json({ success: false, error: 'Destination not found' }, { status: 404 });
      return NextResponse.json({ success: true, spot: res.rows[0] });
    }

    if (type === 'booking') {
      const { booking_status, payment_status } = body;
      const res = await queryDb(
        `UPDATE website_tour_bookings
         SET booking_status = COALESCE($1, booking_status), payment_status = COALESCE($2, payment_status), updated_at = NOW()
         WHERE id = $3 AND website_id = $4
         RETURNING *`,
        [booking_status, payment_status, id, website.id]
      );
      if (res.rowCount === 0) return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 });
      return NextResponse.json({ success: true, booking: res.rows[0] });
    }

    // Default: package
    const { title, duration_days, duration_nights, base_price, description, thumbnail_url, is_featured, is_active } = body;
    const res = await queryDb(
      `UPDATE website_tour_packages
       SET title = COALESCE($1, title),
           duration_days = COALESCE($2, duration_days),
           duration_nights = COALESCE($3, duration_nights),
           base_price = COALESCE($4, base_price),
           description = COALESCE($5, description),
           thumbnail_url = COALESCE($6, thumbnail_url),
           is_featured = COALESCE($7, is_featured),
           is_active = COALESCE($8, is_active),
           updated_at = NOW()
       WHERE id = $9 AND website_id = $10
       RETURNING *`,
      [title, duration_days ? Number(duration_days) : null, duration_nights ? Number(duration_nights) : null, base_price ? Number(base_price) : null, description, thumbnail_url, is_featured, is_active, id, website.id]
    );
    if (res.rowCount === 0) return NextResponse.json({ success: false, error: 'Package not found' }, { status: 404 });
    return NextResponse.json({ success: true, package: res.rows[0] });
  } catch (error) {
    console.error('Tours PUT error:', error);
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
    const type = searchParams.get('type') || 'package';

    let table = 'website_tour_packages';
    if (type === 'spot') table = 'website_tour_spots';
    if (type === 'booking') table = 'website_tour_bookings';

    const res = await queryDb(
      `DELETE FROM ${table} WHERE id = $1 AND website_id = $2 RETURNING id`,
      [id, website.id]
    );

    if (res.rowCount === 0) return NextResponse.json({ success: false, error: 'Item not found' }, { status: 404 });
    return NextResponse.json({ success: true, deletedId: id });
  } catch (error) {
    console.error('Tours DELETE error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

