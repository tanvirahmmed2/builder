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
    const type = body.type || 'route';

    if (type === 'vehicle') {
      const { registration_number, model, total_seats, status, is_active } = body;
      const res = await queryDb(
        `UPDATE website_transport_vehicles
         SET registration_number = COALESCE($1, registration_number),
             model = COALESCE($2, model),
             total_seats = COALESCE($3, total_seats),
             status = COALESCE($4, status),
             is_active = COALESCE($5, is_active),
             updated_at = NOW()
         WHERE id = $6 AND website_id = $7
         RETURNING *`,
        [registration_number, model, total_seats ? Number(total_seats) : null, status, is_active, id, website.id]
      );
      if (res.rowCount === 0) return NextResponse.json({ success: false, error: 'Vehicle not found' }, { status: 404 });
      return NextResponse.json({ success: true, vehicle: res.rows[0] });
    }

    if (type === 'trip') {
      const { status, departure_time, arrival_time } = body;
      const res = await queryDb(
        `UPDATE website_transport_trips
         SET status = COALESCE($1, status),
             departure_time = COALESCE($2, departure_time),
             arrival_time = COALESCE($3, arrival_time),
             updated_at = NOW()
         WHERE id = $4 AND website_id = $5
         RETURNING *`,
        [status, departure_time, arrival_time, id, website.id]
      );
      if (res.rowCount === 0) return NextResponse.json({ success: false, error: 'Trip not found' }, { status: 404 });
      return NextResponse.json({ success: true, trip: res.rows[0] });
    }

    // Default: route
    const { route_name, origin, destination, distance_km, estimated_duration_minutes, is_active } = body;
    const res = await queryDb(
      `UPDATE website_transport_routes
       SET route_name = COALESCE($1, route_name),
           origin = COALESCE($2, origin),
           destination = COALESCE($3, destination),
           distance_km = COALESCE($4, distance_km),
           estimated_duration_minutes = COALESCE($5, estimated_duration_minutes),
           is_active = COALESCE($6, is_active),
           updated_at = NOW()
       WHERE id = $7 AND website_id = $8
       RETURNING *`,
      [route_name, origin, destination, distance_km ? Number(distance_km) : null, estimated_duration_minutes ? Number(estimated_duration_minutes) : null, is_active, id, website.id]
    );
    if (res.rowCount === 0) return NextResponse.json({ success: false, error: 'Route not found' }, { status: 404 });
    return NextResponse.json({ success: true, route: res.rows[0] });
  } catch (error) {
    console.error('Transport PUT error:', error);
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
    const type = searchParams.get('type') || 'route';

    let table = 'website_transport_routes';
    if (type === 'vehicle') table = 'website_transport_vehicles';
    if (type === 'trip') table = 'website_transport_trips';
    if (type === 'booking') table = 'website_transport_bookings';

    const res = await queryDb(
      `DELETE FROM ${table} WHERE id = $1 AND website_id = $2 RETURNING id`,
      [id, website.id]
    );

    if (res.rowCount === 0) return NextResponse.json({ success: false, error: 'Item not found' }, { status: 404 });
    return NextResponse.json({ success: true, deletedId: id });
  } catch (error) {
    console.error('Transport DELETE error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

