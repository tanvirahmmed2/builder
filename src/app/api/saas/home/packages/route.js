import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const serviceFilter =
      searchParams.get('serviceId') ||
      searchParams.get('service_id') ||
      searchParams.get('service') ||
      searchParams.get('appId') ||
      searchParams.get('app_id') ||
      searchParams.get('app');
    const id = searchParams.get('id');

    let query = `
      SELECT 
        p.*,
        s.title AS service_title,
        s.slug AS service_slug,
        s.title AS app_title,
        s.slug AS app_slug,
        COALESCE(
          (
            SELECT json_agg(
              DISTINCT pm.module_name
            )
            FROM package_modules pm
            WHERE pm.package_id = p.id AND pm.is_enabled = TRUE
          ),
          '[]'::json
        ) AS allowed_modules,
        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'id', pm.id,
                'name', pm.module_name,
                'slug', pm.module_slug,
                'is_enabled', pm.is_enabled,
                'limits', pm.limits
              ) ORDER BY pm.id ASC
            )
            FROM package_modules pm
            WHERE pm.package_id = p.id
          ),
          '[]'::json
        ) AS package_modules
      FROM packages p
      LEFT JOIN services s ON p.service_id = s.id
      WHERE p.is_active = TRUE
    `;

    const params = [];
    if (id) {
      query += ` AND p.id = $1 LIMIT 1`;
      params.push(Number(id));
    } else if (serviceFilter && serviceFilter !== 'ALL' && serviceFilter !== 'all') {
      if (!isNaN(serviceFilter)) {
        params.push(Number(serviceFilter));
        query += ` AND p.service_id = $${params.length} ORDER BY COALESCE(p.monthly_price_usd, p.price_in_cents / 100.0, 0) ASC, p.id ASC`;
      } else {
        params.push(serviceFilter.toLowerCase());
        query += ` AND LOWER(s.slug) = $${params.length} ORDER BY COALESCE(p.monthly_price_usd, p.price_in_cents / 100.0, 0) ASC, p.id ASC`;
      }
    } else {
      query += ` ORDER BY COALESCE(p.monthly_price_usd, p.price_in_cents / 100.0, 0) ASC, p.id ASC`;
    }

    const servicesQuery = `
      SELECT 
        s.id,
        s.title,
        s.slug,
        s.short_description,
        COUNT(p.id)::int AS package_count
      FROM services s
      LEFT JOIN packages p ON p.service_id = s.id AND p.is_active = TRUE
      WHERE s.is_published = TRUE
      GROUP BY s.id, s.title, s.slug, s.short_description
      ORDER BY s.order_index ASC, s.title ASC
    `;

    const [res, servicesRes] = await Promise.all([
      queryDb(query, params).catch((err) => {
        console.error('Error fetching packages:', err);
        return { rows: [] };
      }),
      queryDb(servicesQuery).catch((err) => {
        console.error('Error fetching services for package categories:', err);
        return { rows: [] };
      }),
    ]);

    if (id) {
      if (res.rows.length === 0) {
        return NextResponse.json({ success: false, error: 'Package not found.' }, { status: 404 });
      }
      const record = res.rows[0];
      return NextResponse.json({
        success: true,
        package: {
          ...record,
          max_websites: Number(record.max_websites ?? record.max_portfolios ?? 1),
          max_portfolios: Number(record.max_websites ?? record.max_portfolios ?? 1),
          monthly_price_usd: Number(record.monthly_price_usd ?? ((record.price_in_cents || 0) / 100)),
          yearly_price_usd: Number(record.yearly_price_usd ?? 0),
          monthly_price_bdt: Number(record.monthly_price_bdt ?? 0),
          yearly_price_bdt: Number(record.yearly_price_bdt ?? 0),
          app_id: record.service_id,
        },
      });
    }

    const formattedPackages = (res.rows || []).map((p) => ({
      ...p,
      app_id: p.service_id,
      max_websites: Number(p.max_websites ?? p.max_portfolios ?? 1),
      max_portfolios: Number(p.max_websites ?? p.max_portfolios ?? 1),
      monthly_price_usd: Number(p.monthly_price_usd ?? ((p.price_in_cents || 0) / 100)),
      yearly_price_usd: Number(p.yearly_price_usd ?? 0),
      monthly_price_bdt: Number(p.monthly_price_bdt ?? 0),
      yearly_price_bdt: Number(p.yearly_price_bdt ?? 0),
    }));

    return NextResponse.json({
      success: true,
      packages: formattedPackages,
      services: servicesRes.rows || [],
      apps: servicesRes.rows || [], // backwards compatibility
    });
  } catch (error) {
    console.error('Failed to load packages:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
