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
    const type = body.type || 'program';

    if (type === 'tier') {
      const { name, min_points, discount_percentage, perks } = body;
      const res = await queryDb(
        `UPDATE website_loyalty_tiers
         SET name = COALESCE($1, name),
             min_points = COALESCE($2, min_points),
             discount_percentage = COALESCE($3, discount_percentage),
             perks = COALESCE($4, perks),
             updated_at = NOW()
         WHERE id = $5 AND website_id = $6
         RETURNING *`,
        [name, min_points ? Number(min_points) : null, discount_percentage ? Number(discount_percentage) : null, perks, id, website.id]
      );
      if (res.rowCount === 0) return NextResponse.json({ success: false, error: 'Tier not found' }, { status: 404 });
      return NextResponse.json({ success: true, tier: res.rows[0] });
    }

    // Default: program
    const { name, points_per_currency, currency_per_point, is_active } = body;
    const res = await queryDb(
      `UPDATE website_loyalty_programs
       SET name = COALESCE($1, name),
           points_per_currency = COALESCE($2, points_per_currency),
           currency_per_point = COALESCE($3, currency_per_point),
           is_active = COALESCE($4, is_active),
           updated_at = NOW()
       WHERE id = $5 AND website_id = $6
       RETURNING *`,
      [name, points_per_currency ? Number(points_per_currency) : null, currency_per_point ? Number(currency_per_point) : null, is_active, id, website.id]
    );
    if (res.rowCount === 0) return NextResponse.json({ success: false, error: 'Program not found' }, { status: 404 });
    return NextResponse.json({ success: true, program: res.rows[0] });
  } catch (error) {
    console.error('Loyalty PUT error:', error);
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
    const type = searchParams.get('type') || 'program';

    const table = type === 'tier' ? 'website_loyalty_tiers' : 'website_loyalty_programs';
    const res = await queryDb(`DELETE FROM ${table} WHERE id = $1 AND website_id = $2 RETURNING id`, [id, website.id]);

    if (res.rowCount === 0) return NextResponse.json({ success: false, error: 'Item not found' }, { status: 404 });
    return NextResponse.json({ success: true, deletedId: id });
  } catch (error) {
    console.error('Loyalty DELETE error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

