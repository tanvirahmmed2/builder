import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';
import { hasModulePermission } from '@/lib/middleware/developer';

function generateSlug(text) {
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
    const auth = await hasModulePermission(request, 'packages');
    if (!auth.success) {
      return NextResponse.json({ success: false, error: auth.message }, { status: auth.status || 401 });
    }

    const { slug } = await params;
    const cleanSlug = decodeURIComponent(slug || '').trim();

    const res = await queryDb(
      `SELECT p.*, a.title AS app_title, a.slug AS app_slug,
              COALESCE(
                (
                  SELECT json_agg(am.module_title ORDER BY am.id ASC)
                  FROM allowed_modules am
                  WHERE am.package_id = p.id
                ),
                '[]'::json
              ) AS allowed_modules
       FROM packages p
       LEFT JOIN apps a ON p.app_id = a.id
       WHERE p.slug = $1 OR p.id::text = $1
       LIMIT 1`,
      [cleanSlug]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Package not found' }, { status: 404 });
    }

    const record = res.rows[0];

    // Count subscribers / active subscriptions
    let subscriptionsCount = 0;
    try {
      const subRes = await queryDb(
        `SELECT COUNT(*)::int AS count FROM subscription WHERE package_id = $1`,
        [record.id]
      );
      subscriptionsCount = subRes.rows[0]?.count || 0;
    } catch (_) {}

    return NextResponse.json({
      success: true,
      record,
      package: record,
      subscriptions_count: subscriptionsCount,
    });
  } catch (error) {
    console.error('Developer package GET error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const auth = await hasModulePermission(request, 'packages');
    if (!auth.success) {
      return NextResponse.json({ success: false, error: auth.message }, { status: auth.status || 401 });
    }

    const { slug } = await params;
    const cleanSlug = decodeURIComponent(slug || '').trim();

    const existingRes = await queryDb('SELECT * FROM packages WHERE slug = $1 OR id::text = $1 LIMIT 1', [cleanSlug]);
    if (existingRes.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Package not found' }, { status: 404 });
    }

    const current = existingRes.rows[0];
    const body = await request.json();
    const data = body.data || body;

    const name = data.name !== undefined ? data.name.trim() : current.name;
    let newSlug = current.slug;
    if (data.slug && data.slug.trim() && data.slug !== current.slug) {
      newSlug = generateSlug(data.slug);
      const slugCheck = await queryDb('SELECT id FROM packages WHERE slug = $1 AND id != $2 LIMIT 1', [newSlug, current.id]);
      if (slugCheck.rows.length > 0) {
        newSlug = `${newSlug}-${Date.now().toString().slice(-4)}`;
      }
    }

    const description = data.description !== undefined ? data.description : current.description;
    const priceInCents = data.price_in_cents !== undefined
      ? Number(data.price_in_cents)
      : (data.price !== undefined ? Math.round(Number(data.price) * 100) : current.price_in_cents);
    const currency = data.currency !== undefined ? (data.currency || 'USD').toUpperCase() : current.currency;
    const billingInterval = (data.billing_interval || data.billingInterval) !== undefined
      ? (data.billing_interval || data.billingInterval || 'MONTHLY').toUpperCase()
      : current.billing_interval;
    const maxPortfolios = data.max_portfolios !== undefined
      ? Math.max(1, Number(data.max_portfolios))
      : current.max_portfolios;
    const isActive = data.is_active !== undefined ? Boolean(data.is_active) : current.is_active;
    const appId = data.app_id !== undefined ? (data.app_id ? Number(data.app_id) : null) : current.app_id;

    const res = await queryDb(
      `UPDATE packages
       SET name = $1, slug = $2, description = $3, price_in_cents = $4,
           currency = $5, billing_interval = $6, max_portfolios = $7,
           is_active = $8, app_id = $9, updated_at = CURRENT_TIMESTAMP
       WHERE id = $10
       RETURNING *`,
      [name, newSlug, description, priceInCents, currency, billingInterval, maxPortfolios, isActive, appId, current.id]
    );

    const updatedPackage = res.rows[0];

    // Synchronize allowed_modules if provided
    const modulesToSave = Array.isArray(data.allowed_modules)
      ? data.allowed_modules
      : (Array.isArray(data.modules) ? data.modules : null);

    if (modulesToSave !== null) {
      await queryDb('DELETE FROM allowed_modules WHERE package_id = $1', [current.id]);
      for (const modTitle of modulesToSave) {
        const cleanTitle = String(modTitle || '').trim();
        if (cleanTitle) {
          await queryDb(
            `INSERT INTO allowed_modules (package_id, module_title) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
            [current.id, cleanTitle]
          ).catch((e) => console.warn('Error syncing allowed_module:', e.message));
        }
      }
    }

    const modRes = await queryDb(
      `SELECT module_title FROM allowed_modules WHERE package_id = $1 ORDER BY id ASC`,
      [current.id]
    ).catch(() => ({ rows: [] }));

    updatedPackage.allowed_modules = modRes.rows.map((r) => r.module_title);

    return NextResponse.json({
      success: true,
      record: updatedPackage,
      package: updatedPackage,
      message: 'Package updated successfully',
    });
  } catch (error) {
    console.error('Developer package PUT error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const auth = await hasModulePermission(request, 'packages');
    if (!auth.success) {
      return NextResponse.json({ success: false, error: auth.message }, { status: auth.status || 401 });
    }

    const { slug } = await params;
    const cleanSlug = decodeURIComponent(slug || '').trim();

    const deleteRes = await queryDb(
      'DELETE FROM packages WHERE slug = $1 OR id::text = $1 RETURNING id, name',
      [cleanSlug]
    );

    if (deleteRes.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Package not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Package "${deleteRes.rows[0].name}" deleted successfully`,
    });
  } catch (error) {
    console.error('Developer package DELETE error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
