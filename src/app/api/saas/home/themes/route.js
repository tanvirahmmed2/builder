import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';

// ============================================================================
// GET: Public list of active themes categorized by services
// ============================================================================
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const serviceFilter =
      searchParams.get('service') ||
      searchParams.get('service_id') ||
      searchParams.get('app') ||
      searchParams.get('app_id') ||
      '';
    const search = searchParams.get('search') || '';
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit'), 10) : null;

    // 1. Build query for active themes joined with services table
    const conditions = ['st.is_active = TRUE'];
    const params = [];

    if (serviceFilter && serviceFilter !== 'ALL' && serviceFilter !== 'all') {
      if (!isNaN(serviceFilter)) {
        params.push(Number(serviceFilter));
        conditions.push(`st.service_id = $${params.length}`);
      } else {
        params.push(serviceFilter.toLowerCase());
        conditions.push(`LOWER(s.slug) = $${params.length}`);
      }
    }

    if (search.trim()) {
      params.push(`%${search.trim().toLowerCase()}%`);
      const idx = params.length;
      conditions.push(`(
        LOWER(st.name) LIKE $${idx} OR 
        LOWER(COALESCE(st.slug, '')) LIKE $${idx} OR 
        LOWER(COALESCE(s.title, '')) LIKE $${idx}
      )`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    let themesQuery = `
      SELECT 
        st.id,
        st.service_id,
        st.service_id AS app_id,
        st.name,
        st.slug,
        st.preview_image,
        st.theme_config,
        st.is_active,
        st.is_premium,
        st.created_at,
        st.updated_at,
        s.title AS service_title,
        s.slug AS service_slug,
        s.title AS app_title,
        s.slug AS app_slug,
        s.short_description AS app_short_description
      FROM service_themes st
      LEFT JOIN services s ON st.service_id = s.id
      ${whereClause}
      ORDER BY st.id DESC
    `;

    if (limit && !isNaN(limit) && limit > 0) {
      params.push(limit);
      themesQuery += ` LIMIT $${params.length}`;
    }

    // 2. Query for published services to build categories
    const servicesQuery = `
      SELECT 
        s.id,
        s.title,
        s.slug,
        s.short_description,
        COUNT(st.id)::int AS theme_count
      FROM services s
      LEFT JOIN service_themes st ON st.service_id = s.id AND st.is_active = TRUE
      WHERE s.is_published = TRUE
      GROUP BY s.id, s.title, s.slug, s.short_description
      ORDER BY s.order_index ASC, s.title ASC
    `;

    const [themesResult, servicesResult] = await Promise.all([
      queryDb(themesQuery, params).catch((err) => {
        console.error('Error fetching service themes:', err);
        return { rows: [] };
      }),
      queryDb(servicesQuery).catch((err) => {
        console.error('Error fetching services for theme categories:', err);
        return { rows: [] };
      }),
    ]);

    return NextResponse.json({
      success: true,
      themes: themesResult.rows || [],
      services: servicesResult.rows || [],
      apps: servicesResult.rows || [], // backwards compatibility
    });
  } catch (error) {
    console.error('Failed to load themes:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
