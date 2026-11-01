import { NextResponse } from 'next/server';
import { query } from '@/lib/db/pg';
import { hasModulePermission } from '@/lib/middleware/developer';
import { deleteFromCloudinary } from '@/lib/db/cloudinary';

export async function GET(request, { params }) {
  try {
    const auth = await hasModulePermission(request, 'services');
    if (!auth.success) {
      return NextResponse.json({ success: false, error: auth.message }, { status: auth.status || 401 });
    }

    const { slug } = await params;
    const cleanSlug = decodeURIComponent(slug || '').trim();

    const res = await query(
      `SELECT 
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
                'service_id', si.service_id,
                'image', si.image,
                'image_id', si.image_id,
                'title', si.title,
                'alt_text', si.alt_text,
                'is_primary', si.is_primary,
                'sort_order', si.sort_order,
                'created_at', si.created_at
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
                'service_id', sm.service_id,
                'module_name', sm.module_name,
                'module_slug', sm.module_slug,
                'description', sm.description,
                'is_active', sm.is_active
              ) ORDER BY sm.id ASC
            )
            FROM service_modules sm
            WHERE sm.service_id = s.id
          ),
          '[]'::json
        ) AS modules,
        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'id', st.id,
                'service_id', st.service_id,
                'name', st.name,
                'slug', st.slug,
                'preview_image', st.preview_image,
                'theme_config', st.theme_config,
                'is_active', st.is_active,
                'is_premium', st.is_premium
              ) ORDER BY st.id ASC
            )
            FROM service_themes st
            WHERE st.service_id = s.id
          ),
          '[]'::json
        ) AS themes
      FROM services s
      WHERE s.slug = $1 OR s.id::text = $1
      LIMIT 1`,
      [cleanSlug]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Service not found' }, { status: 404 });
    }

    const service = res.rows[0];

    // Packages linked to this service
    const pkgRes = await query(
      `SELECT id, name, slug, monthly_price_usd, yearly_price_usd, is_active 
       FROM packages 
       WHERE service_id = $1 
       ORDER BY monthly_price_usd ASC`,
      [service.id]
    ).catch(() => ({ rows: [] }));

    return NextResponse.json({
      success: true,
      service,
      data: service,
      packages: pkgRes.rows,
    });
  } catch (error) {
    console.error('Service slug GET error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const auth = await hasModulePermission(request, 'services');
    if (!auth.success) {
      return NextResponse.json({ success: false, error: auth.message }, { status: auth.status || 401 });
    }

    const { slug } = await params;
    const cleanSlug = decodeURIComponent(slug || '').trim();

    const existing = await query(
      `SELECT id FROM services WHERE slug = $1 OR id::text = $1 LIMIT 1`,
      [cleanSlug]
    );

    if (existing.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Service not found' }, { status: 404 });
    }

    const serviceId = existing.rows[0].id;

    const imgRows = await query('SELECT image_id FROM service_images WHERE service_id = $1', [serviceId]);
    for (const r of imgRows.rows) {
      if (r.image_id) {
        await deleteFromCloudinary(r.image_id).catch(() => {});
      }
    }

    await query('DELETE FROM service_images WHERE service_id = $1', [serviceId]);
    await query('DELETE FROM service_modules WHERE service_id = $1', [serviceId]);
    await query('DELETE FROM service_themes WHERE service_id = $1', [serviceId]);
    await query('UPDATE packages SET service_id = NULL WHERE service_id = $1', [serviceId]).catch(() => {});
    await query('UPDATE blogs SET service_id = NULL WHERE service_id = $1', [serviceId]).catch(() => {});
    await query('UPDATE subscription SET service_id = NULL WHERE service_id = $1', [serviceId]).catch(() => {});

    await query('DELETE FROM services WHERE id = $1', [serviceId]);

    return NextResponse.json({
      success: true,
      message: 'Service deleted successfully',
    });
  } catch (error) {
    console.error('Service slug DELETE error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

