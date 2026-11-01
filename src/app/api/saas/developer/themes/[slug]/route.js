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

export async function GET(request, { params }) {
  try {
    const auth = await hasModulePermission(request, 'themes');
    if (!auth.success) {
      return NextResponse.json({ success: false, error: auth.message }, { status: auth.status || 401 });
    }

    const { slug } = await params;
    const cleanSlug = decodeURIComponent(slug || '').trim();

    const res = await queryDb(
      `SELECT st.*, st.name AS title, st.service_id AS app_id, s.title AS service_title, s.slug AS service_slug, s.title AS app_title, s.slug AS app_slug
       FROM service_themes st
       LEFT JOIN services s ON st.service_id = s.id
       WHERE st.slug = $1 OR st.id::text = $1
       LIMIT 1`,
      [cleanSlug]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Theme not found' }, { status: 404 });
    }

    const record = res.rows[0];
    return NextResponse.json({ success: true, record, theme: record, ...record });
  } catch (error) {
    console.error('Developer theme GET error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const auth = await hasModulePermission(request, 'themes');
    if (!auth.success) {
      return NextResponse.json({ success: false, error: auth.message }, { status: auth.status || 401 });
    }

    const { slug } = await params;
    const cleanSlug = decodeURIComponent(slug || '').trim();

    const existingRes = await queryDb('SELECT * FROM service_themes WHERE slug = $1 OR id::text = $1 LIMIT 1', [cleanSlug]);
    if (existingRes.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Theme not found' }, { status: 404 });
    }

    const current = existingRes.rows[0];
    const body = await request.json().catch(() => ({}));
    const data = body.data || body || {};

    const name = data.name || data.title ? (data.name || data.title).trim() : current.name;
    let newSlug = data.slug ? slugify(data.slug) : current.slug;
    const serviceId = data.service_id || data.app_id ? Number(data.service_id || data.app_id) : current.service_id;
    const previewImage = data.preview_image !== undefined ? data.preview_image : current.preview_image;
    const themeConfig = data.theme_config !== undefined ? data.theme_config : current.theme_config;
    const isActive = data.is_active !== undefined ? Boolean(data.is_active) : current.is_active;
    const isPremium = data.is_premium !== undefined ? Boolean(data.is_premium) : current.is_premium;

    const res = await queryDb(
      `UPDATE service_themes SET
        name = $1,
        slug = $2,
        service_id = $3,
        preview_image = $4,
        theme_config = $5,
        is_active = $6,
        is_premium = $7,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $8
       RETURNING *`,
      [name, newSlug, serviceId, previewImage, JSON.stringify(themeConfig), isActive, isPremium, current.id]
    );

    return NextResponse.json({
      success: true,
      message: 'Theme updated successfully',
      record: res.rows[0],
      theme: res.rows[0],
    });
  } catch (error) {
    console.error('Developer theme PUT error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const auth = await hasModulePermission(request, 'themes');
    if (!auth.success) {
      return NextResponse.json({ success: false, error: auth.message }, { status: auth.status || 401 });
    }

    const { slug } = await params;
    const cleanSlug = decodeURIComponent(slug || '').trim();

    const res = await queryDb('DELETE FROM service_themes WHERE slug = $1 OR id::text = $1 RETURNING id, name, slug', [cleanSlug]);
    if (res.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Theme not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Theme deleted successfully',
      deleted: res.rows[0],
    });
  } catch (error) {
    console.error('Developer theme DELETE error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
