import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';
import { hasModulePermission } from '@/lib/middleware/developer';

function slugify(text) {
  return (text || '')
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

export async function GET(request) {
  try {
    const auth = await hasModulePermission(request, 'themes');
    if (!auth.success) {
      return NextResponse.json({ success: false, error: auth.message }, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const serviceFilter = searchParams.get('service_id') || searchParams.get('app_id');

    let sql = `
      SELECT 
        st.*,
        st.name AS title,
        st.service_id AS app_id,
        s.title AS service_title,
        s.slug AS service_slug,
        s.title AS app_title,
        s.slug AS app_slug
      FROM service_themes st
      LEFT JOIN services s ON st.service_id = s.id
    `;
    const params = [];
    if (serviceFilter && !isNaN(serviceFilter)) {
      sql += ` WHERE st.service_id = $1`;
      params.push(Number(serviceFilter));
    }
    sql += ` ORDER BY st.id ASC`;

    const res = await queryDb(sql, params).catch(() => ({ rows: [] }));
    return NextResponse.json({
      success: true,
      table: 'service_themes',
      records: res.rows,
      themes: res.rows,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// CREATE THEME
export async function POST(request) {
  try {
    const auth = await hasModulePermission(request, 'themes');
    if (!auth.success) {
      return NextResponse.json({ success: false, error: auth.message }, { status: auth.status });
    }
    const body = await request.json().catch(() => ({}));
    const data = body.data || body || {};
    const themeName = (data.title || data.name || 'Untitled Theme').trim();

    let serviceId = data.service_id || data.app_id ? Number(data.service_id || data.app_id) : null;
    if (!serviceId) {
      const defaultSrv = await queryDb('SELECT id FROM services ORDER BY id ASC LIMIT 1');
      if (defaultSrv.rows.length > 0) {
        serviceId = defaultSrv.rows[0].id;
      }
    }

    const baseSlug = slugify(themeName) || 'theme';
    let slug = baseSlug;
    const checkSlug = await queryDb('SELECT id FROM service_themes WHERE slug = $1 AND service_id = $2 LIMIT 1', [slug, serviceId]);
    if (checkSlug.rows.length > 0) {
      slug = `${baseSlug}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    const previewImage = data.preview_image || data.image || '';
    const themeConfig = data.theme_config || {};
    const isActive = data.is_active !== undefined ? Boolean(data.is_active) : true;
    const isPremium = data.is_premium !== undefined ? Boolean(data.is_premium) : false;

    const res = await queryDb(
      `INSERT INTO service_themes (service_id, name, slug, preview_image, theme_config, is_active, is_premium)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [serviceId, themeName, slug, previewImage, JSON.stringify(themeConfig), isActive, isPremium]
    );

    return NextResponse.json({
      success: true,
      message: 'Theme created successfully',
      record: res.rows[0],
      theme: res.rows[0],
    });
  } catch (error) {
    console.error('Error creating service theme:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
