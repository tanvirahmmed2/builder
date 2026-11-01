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
    const type = body.type || 'property';

    if (type === 'development') {
      const { title, developer_name, location, status, total_units } = body;
      const res = await queryDb(
        `UPDATE website_real_estate_developments
         SET title = COALESCE($1, title), developer_name = COALESCE($2, developer_name), location = COALESCE($3, location),
             status = COALESCE($4, status), total_units = COALESCE($5, total_units), updated_at = NOW()
         WHERE id = $6 AND website_id = $7
         RETURNING *`,
        [title, developer_name, location, status, total_units ? Number(total_units) : null, id, website.id]
      );
      if (res.rowCount === 0) return NextResponse.json({ success: false, error: 'Development not found' }, { status: 404 });
      return NextResponse.json({ success: true, development: res.rows[0] });
    }

    if (type === 'agent') {
      const { full_name, email, phone, bio, license_number, is_active } = body;
      const res = await queryDb(
        `UPDATE website_real_estate_agents
         SET full_name = COALESCE($1, full_name), email = COALESCE($2, email), phone = COALESCE($3, phone),
             bio = COALESCE($4, bio), license_number = COALESCE($5, license_number), is_active = COALESCE($6, is_active), updated_at = NOW()
         WHERE id = $7 AND website_id = $8
         RETURNING *`,
        [full_name, email, phone, bio, license_number, is_active, id, website.id]
      );
      if (res.rowCount === 0) return NextResponse.json({ success: false, error: 'Agent not found' }, { status: 404 });
      return NextResponse.json({ success: true, agent: res.rows[0] });
    }

    if (type === 'viewing') {
      const { status, notes } = body;
      const res = await queryDb(
        `UPDATE website_real_estate_viewing_bookings
         SET status = COALESCE($1, status), notes = COALESCE($2, notes), updated_at = NOW()
         WHERE id = $3 AND website_id = $4
         RETURNING *`,
        [status, notes, id, website.id]
      );
      if (res.rowCount === 0) return NextResponse.json({ success: false, error: 'Viewing not found' }, { status: 404 });
      return NextResponse.json({ success: true, viewing: res.rows[0] });
    }

    // Default: property
    const { title, property_type, listing_type, price, bedrooms, bathrooms, area_sqft, status, is_featured } = body;
    const res = await queryDb(
      `UPDATE website_real_estate_properties
       SET title = COALESCE($1, title),
           property_type = COALESCE($2, property_type),
           listing_type = COALESCE($3, listing_type),
           price = COALESCE($4, price),
           bedrooms = COALESCE($5, bedrooms),
           bathrooms = COALESCE($6, bathrooms),
           area_sqft = COALESCE($7, area_sqft),
           status = COALESCE($8, status),
           is_featured = COALESCE($9, is_featured),
           updated_at = NOW()
       WHERE id = $10 AND website_id = $11
       RETURNING *`,
      [title, property_type, listing_type, price ? Number(price) : null, bedrooms ? Number(bedrooms) : null, bathrooms ? Number(bathrooms) : null, area_sqft ? Number(area_sqft) : null, status, is_featured, id, website.id]
    );
    if (res.rowCount === 0) return NextResponse.json({ success: false, error: 'Property not found' }, { status: 404 });
    return NextResponse.json({ success: true, property: res.rows[0] });
  } catch (error) {
    console.error('Real Estate PUT error:', error);
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
    const type = searchParams.get('type') || 'property';

    let table = 'website_real_estate_properties';
    if (type === 'development') table = 'website_real_estate_developments';
    if (type === 'agent') table = 'website_real_estate_agents';
    if (type === 'viewing') table = 'website_real_estate_viewing_bookings';

    const res = await queryDb(
      `DELETE FROM ${table} WHERE id = $1 AND website_id = $2 RETURNING id`,
      [id, website.id]
    );

    if (res.rowCount === 0) return NextResponse.json({ success: false, error: 'Item not found' }, { status: 404 });
    return NextResponse.json({ success: true, deletedId: id });
  } catch (error) {
    console.error('Real Estate DELETE error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

