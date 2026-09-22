import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const appId = searchParams.get('appId') || searchParams.get('app_id');
    const id = searchParams.get('id');

    let query = `
      SELECT 
        p.*,
        a.title AS app_title,
        a.slug AS app_slug,
        COALESCE(
          json_agg(DISTINCT am.module_title) FILTER (WHERE am.id IS NOT NULL),
          '[]'::json
        ) AS allowed_modules,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', f.id,
              'name', f.name,
              'key', f.key,
              'description', f.description,
              'value', pf.value,
              'is_enabled', pf.is_enabled
            )
          ) FILTER (WHERE f.id IS NOT NULL),
          '[]'::json
        ) AS features
      FROM packages p
      LEFT JOIN apps a ON p.app_id = a.id
      LEFT JOIN allowed_modules am ON p.id = am.package_id
      LEFT JOIN packages_feature pf ON p.id = pf.package_id
      LEFT JOIN feature f ON pf.feature_id = f.id
      WHERE p.is_active = TRUE
    `;

    const params = [];
    if (id) {
      query += ` AND p.id = $1 GROUP BY p.id, a.id LIMIT 1`;
      params.push(Number(id));
    } else if (appId) {
      query += ` AND p.app_id = $1 GROUP BY p.id, a.id ORDER BY p.price_in_cents ASC`;
      params.push(Number(appId));
    } else {
      query += ` GROUP BY p.id, a.id ORDER BY p.price_in_cents ASC`;
    }

    const res = await queryDb(query, params);

    if (id) {
      if (res.rows.length === 0) {
        return NextResponse.json({ success: false, error: 'Package not found.' }, { status: 404 });
      }
      return NextResponse.json({ success: true, package: res.rows[0] });
    }

    return NextResponse.json({ success: true, packages: res.rows });
  } catch (error) {
    console.error('Public packages GET error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch packages.' },
      { status: 500 }
    );
  }
}
