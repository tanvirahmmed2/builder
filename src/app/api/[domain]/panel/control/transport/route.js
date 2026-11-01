import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';
import { getControlAuth } from '@/lib/website-control';

export async function GET(request, context) {
  try {
    const { website, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(request.url);
    const tab = searchParams.get('tab') || 'routes';

    if (tab === 'vehicles') {
      const res = await queryDb(
        `SELECT id, registration_number, model, total_seats, status, is_active, created_at, updated_at
         FROM website_transport_vehicles
         WHERE website_id = $1
         ORDER BY id DESC`,
        [website.id]
      );
      return NextResponse.json(res.rows);
    }

    if (tab === 'trips') {
      const res = await queryDb(
        `SELECT t.id, t.route_id, t.vehicle_id, t.departure_time, t.arrival_time, t.status, t.created_at,
                r.route_name, r.origin, r.destination,
                v.registration_number, v.model as vehicle_model
         FROM website_transport_trips t
         LEFT JOIN website_transport_routes r ON t.route_id = r.id
         LEFT JOIN website_transport_vehicles v ON t.vehicle_id = v.id
         WHERE t.website_id = $1
         ORDER BY t.departure_time DESC`,
        [website.id]
      );
      return NextResponse.json(res.rows);
    }

    if (tab === 'bookings') {
      const res = await queryDb(
        `SELECT b.id, b.trip_id, b.booking_code, b.passenger_name, b.passenger_phone, b.total_seats, b.total_fare, b.booking_status, b.payment_status, b.created_at,
                r.route_name, t.departure_time
         FROM website_transport_bookings b
         LEFT JOIN website_transport_trips t ON b.trip_id = t.id
         LEFT JOIN website_transport_routes r ON t.route_id = r.id
         WHERE b.website_id = $1
         ORDER BY b.id DESC`,
        [website.id]
      );
      return NextResponse.json(res.rows);
    }

    // Default: routes
    const res = await queryDb(
      `SELECT id, route_name, origin, destination, distance_km, estimated_duration_minutes, is_active, created_at, updated_at
       FROM website_transport_routes
       WHERE website_id = $1
       ORDER BY route_name ASC`,
      [website.id]
    );
    return NextResponse.json(res.rows);
  } catch (error) {
    console.error('Transport GET error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request, context) {
  try {
    const { website, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const body = await request.json();
    const type = body.type || 'route';

    if (type === 'vehicle') {
      const { registration_number, model = '', total_seats = 40, status = 'available', is_active = true } = body;
      if (!registration_number?.trim()) return NextResponse.json({ success: false, error: 'Registration number is required' }, { status: 400 });
      const res = await queryDb(
        `INSERT INTO website_transport_vehicles (website_id, registration_number, model, total_seats, status, is_active, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
         RETURNING *`,
        [website.id, registration_number.trim(), model, Number(total_seats) || 1, status, is_active]
      );
      return NextResponse.json({ success: true, vehicle: res.rows[0] });
    }

    if (type === 'trip') {
      const { route_id, vehicle_id = null, departure_time, arrival_time = null, status = 'scheduled' } = body;
      if (!route_id || !departure_time) return NextResponse.json({ success: false, error: 'Route and departure time are required' }, { status: 400 });
      const res = await queryDb(
        `INSERT INTO website_transport_trips (website_id, route_id, vehicle_id, departure_time, arrival_time, status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
         RETURNING *`,
        [website.id, route_id, vehicle_id || null, departure_time, arrival_time || null, status]
      );
      return NextResponse.json({ success: true, trip: res.rows[0] });
    }

    if (type === 'booking') {
      const { trip_id, passenger_name, passenger_phone, total_seats = 1, total_fare = 500 } = body;
      if (!passenger_name?.trim() || !passenger_phone?.trim()) return NextResponse.json({ success: false, error: 'Passenger name and phone are required' }, { status: 400 });
      const booking_code = 'TKT-' + Math.random().toString(36).substring(2, 8).toUpperCase();
      const res = await queryDb(
        `INSERT INTO website_transport_bookings (website_id, trip_id, booking_code, passenger_name, passenger_phone, total_seats, total_fare, booking_status, payment_status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'confirmed', 'paid', NOW(), NOW())
         RETURNING *`,
        [website.id, trip_id || null, booking_code, passenger_name.trim(), passenger_phone.trim(), Number(total_seats) || 1, Number(total_fare) || 0]
      );
      return NextResponse.json({ success: true, booking: res.rows[0] });
    }

    // Default: route
    const { route_name, origin, destination, distance_km = 0, estimated_duration_minutes = 60, is_active = true } = body;
    if (!route_name?.trim() || !origin?.trim() || !destination?.trim()) {
      return NextResponse.json({ success: false, error: 'Route name, origin, and destination are required' }, { status: 400 });
    }
    const res = await queryDb(
      `INSERT INTO website_transport_routes (website_id, route_name, origin, destination, distance_km, estimated_duration_minutes, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
       RETURNING *`,
      [website.id, route_name.trim(), origin.trim(), destination.trim(), Number(distance_km) || 0, Number(estimated_duration_minutes) || 60, is_active]
    );
    return NextResponse.json({ success: true, route: res.rows[0] });
  } catch (error) {
    console.error('Transport POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

