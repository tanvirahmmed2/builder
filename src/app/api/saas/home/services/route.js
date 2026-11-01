import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const id = searchParams.get('id');

    let query = `
      SELECT 
        s.id,
        s.title,
        s.slug,
        s.description,
        s.short_description,
        s.icon,
        s.badge,
        s.is_published,
        s.is_featured,
        s.order_index,
        s.created_at,
        s.updated_at,
        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'id', si.id,
                'image', si.image,
                'image_id', si.image_id,
                'title', si.title,
                'alt_text', si.alt_text,
                'is_primary', si.is_primary,
                'sort_order', si.sort_order
              ) ORDER BY si.sort_order ASC, si.id ASC
            )
            FROM service_images si
            WHERE si.service_id = s.id
          ),
          '[]'::json
        ) AS images,
        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'id', sm.id,
                'name', sm.module_name,
                'slug', sm.module_slug,
                'description', sm.description
              ) ORDER BY sm.id ASC
            )
            FROM service_modules sm
            WHERE sm.service_id = s.id AND sm.is_active = TRUE
          ),
          '[]'::json
        ) AS modules,
        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'id', st.id,
                'name', st.name,
                'slug', st.slug,
                'preview_image', st.preview_image,
                'theme_config', st.theme_config,
                'is_premium', st.is_premium
              ) ORDER BY st.id ASC
            )
            FROM service_themes st
            WHERE st.service_id = s.id AND st.is_active = TRUE
          ),
          '[]'::json
        ) AS themes,
        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'id', p.id,
                'name', p.name,
                'slug', p.slug,
                'monthly_price_usd', p.monthly_price_usd,
                'yearly_price_usd', p.yearly_price_usd,
                'monthly_price_bdt', p.monthly_price_bdt,
                'yearly_price_bdt', p.yearly_price_bdt,
                'max_websites', p.max_websites
              ) ORDER BY p.monthly_price_usd ASC
            )
            FROM packages p
            WHERE p.service_id = s.id AND p.is_active = TRUE
          ),
          '[]'::json
        ) AS packages
      FROM services s
      WHERE s.is_published = TRUE
    `;

    const params = [];

    if (slug) {
      params.push(slug);
      query += ` AND s.slug = $${params.length} LIMIT 1`;
    } else if (id) {
      params.push(Number(id));
      query += ` AND s.id = $${params.length} LIMIT 1`;
    } else {
      query += ` ORDER BY s.order_index ASC, s.id DESC`;
    }

    const res = await queryDb(query, params);

    if ((slug || id) && res.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Service not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      services: slug || id ? res.rows[0] : res.rows,
      data: slug || id ? res.rows[0] : res.rows,
    });
  } catch (error) {
    console.error('Public Services API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

