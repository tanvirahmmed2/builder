import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';
import { getControlAuth } from '@/lib/website-control';

export async function GET(request, context) {
  try {
    const { website, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(request.url);
    const tab = searchParams.get('tab') || 'programs';

    if (tab === 'tiers') {
      const res = await queryDb(
        `SELECT id, program_id, name, min_points, discount_percentage, perks, created_at, updated_at
         FROM website_loyalty_tiers
         WHERE website_id = $1
         ORDER BY min_points ASC`,
        [website.id]
      );
      return NextResponse.json(res.rows);
    }

    // Default: programs
    const res = await queryDb(
      `SELECT id, name, points_per_currency, currency_per_point, is_active, created_at, updated_at
       FROM website_loyalty_programs
       WHERE website_id = $1
       ORDER BY id DESC`,
      [website.id]
    );
    return NextResponse.json(res.rows);
  } catch (error) {
    console.error('Loyalty GET error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request, context) {
  try {
    const { website, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const body = await request.json();
    const type = body.type || 'program';

    if (type === 'tier') {
      const { program_id = null, name, min_points = 500, discount_percentage = 5, perks = '' } = body;
      if (!name?.trim()) return NextResponse.json({ success: false, error: 'Tier name is required' }, { status: 400 });
      const res = await queryDb(
        `INSERT INTO website_loyalty_tiers (website_id, program_id, name, min_points, discount_percentage, perks, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
         RETURNING *`,
        [website.id, program_id || null, name.trim(), Number(min_points) || 0, Number(discount_percentage) || 0, perks]
      );
      return NextResponse.json({ success: true, tier: res.rows[0] });
    }

    // Default: program
    const { name, points_per_currency = 1, currency_per_point = 0.05, is_active = true } = body;
    if (!name?.trim()) return NextResponse.json({ success: false, error: 'Program name is required' }, { status: 400 });
    const res = await queryDb(
      `INSERT INTO website_loyalty_programs (website_id, name, points_per_currency, currency_per_point, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       RETURNING *`,
      [website.id, name.trim(), Number(points_per_currency) || 1, Number(currency_per_point) || 0.05, is_active]
    );
    return NextResponse.json({ success: true, program: res.rows[0] });
  } catch (error) {
    console.error('Loyalty POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

