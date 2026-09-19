import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';
import { isManagerOrAdmin } from '@/lib/middleware/developer';

function generateSlug(text) {
  return (text || '')
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const res = await queryDb(
        `SELECT p.*, a.title AS app_title, a.slug AS app_slug
         FROM packages p
         LEFT JOIN apps a ON p.app_id = a.id
         WHERE p.id = $1
         LIMIT 1`,
        [Number(id)]
      );
      if (res.rows.length === 0) {
        return NextResponse.json({ success: false, error: 'Package not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, record: res.rows[0] });
    }

    const res = await queryDb(
      `SELECT p.*, a.title AS app_title, a.slug AS app_slug
       FROM packages p
       LEFT JOIN apps a ON p.app_id = a.id
       ORDER BY p.id ASC`
    ).catch(() => ({ rows: [] }));

    return NextResponse.json({ success: true, table: 'packages', records: res.rows });
  } catch (error) {
    console.error('Error fetching packages:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const auth = await isManagerOrAdmin(request);
    if (!auth.success) {
      return NextResponse.json(
        { success: false, error: auth.message || 'Forbidden: Only Admin and Manager roles can manage packages.' },
        { status: auth.status || 403 }
      );
    }

    const body = await request.json();

    // CREATE PACKAGE
    const data = body.data || body;
    const name = (data.name || '').trim();
    if (!name) {
      return NextResponse.json({ success: false, error: 'Package name is required' }, { status: 400 });
    }

    let slug = generateSlug(data.slug || name);
    if (!slug) slug = `pkg-${Date.now()}`;

    // Check if slug already taken, append timestamp if so
    const slugCheck = await queryDb('SELECT id FROM packages WHERE slug = $1 LIMIT 1', [slug]);
    if (slugCheck.rows.length > 0) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const description = data.description || '';
    const priceInCents = data.price_in_cents !== undefined
      ? Number(data.price_in_cents)
      : (data.price !== undefined ? Math.round(Number(data.price) * 100) : 0);
    const currency = (data.currency || 'USD').toUpperCase();
    const billingInterval = (data.billing_interval || data.billingInterval || 'MONTHLY').toUpperCase();
    const maxPortfolios = data.max_portfolios !== undefined ? Math.max(1, Number(data.max_portfolios)) : 1;
    const isActive = data.is_active !== undefined ? Boolean(data.is_active) : true;
    const appId = data.app_id ? Number(data.app_id) : null;

    const res = await queryDb(
      `INSERT INTO packages (
        name, slug, description, price_in_cents, currency, billing_interval, max_portfolios, is_active, app_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [name, slug, description, priceInCents, currency, billingInterval, maxPortfolios, isActive, appId]
    );

    return NextResponse.json({
      success: true,
      message: 'Package created successfully',
      record: res.rows[0],
    }, { status: 201 });
  } catch (error) {
    console.error('Error processing package POST request:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function PUT(request) {
  try {
    const auth = await isManagerOrAdmin(request);
    if (!auth.success) {
      return NextResponse.json(
        { success: false, error: auth.message || 'Forbidden: Only Admin and Manager roles can update packages.' },
        { status: auth.status || 403 }
      );
    }

    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id') || body.id || body.packageId || body.data?.id;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Package ID is required' }, { status: 400 });
    }

    const existingRes = await queryDb('SELECT * FROM packages WHERE id = $1', [Number(id)]);
    if (existingRes.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Package not found' }, { status: 404 });
    }
    const current = existingRes.rows[0];

    const data = body.data || body;
    const name = data.name !== undefined ? (data.name || '').trim() : current.name;
    if (!name) {
      return NextResponse.json({ success: false, error: 'Package name cannot be empty' }, { status: 400 });
    }

    let slug = data.slug !== undefined ? generateSlug(data.slug) : current.slug;
    if (!slug) {
      slug = generateSlug(name) || `pkg-${Date.now()}`;
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
       SET name = $1,
           slug = $2,
           description = $3,
           price_in_cents = $4,
           currency = $5,
           billing_interval = $6,
           max_portfolios = $7,
           is_active = $8,
           app_id = $9,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $10
       RETURNING *`,
      [name, slug, description, priceInCents, currency, billingInterval, maxPortfolios, isActive, appId, Number(id)]
    );

    return NextResponse.json({
      success: true,
      message: 'Package updated successfully',
      record: res.rows[0],
    });
  } catch (error) {
    console.error('Error updating package PUT:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(request) {
  try {
    const auth = await isManagerOrAdmin(request);
    if (!auth.success) {
      return NextResponse.json(
        { success: false, error: auth.message || 'Forbidden: Only Admin and Manager roles can delete packages.' },
        { status: auth.status || 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    let id = searchParams.get('id') || searchParams.get('packageId');
    if (!id) {
      const body = await request.json().catch(() => ({}));
      id = body.id || body.packageId;
    }
    if (!id) {
      return NextResponse.json({ success: false, error: 'Package ID is required' }, { status: 400 });
    }

    const res = await queryDb('DELETE FROM packages WHERE id = $1 RETURNING id, name', [Number(id)]);
    if (res.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Package not found or already deleted' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Package deleted successfully', deleted: res.rows[0] });
  } catch (error) {
    console.error('Error deleting package:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const auth = await isManagerOrAdmin(request);
    if (!auth.success) {
      return NextResponse.json(
        { success: false, error: auth.message || 'Forbidden: Only Admin and Manager roles can update packages.' },
        { status: auth.status || 403 }
      );
    }

    const body = await request.json();
    const id = body.id || body.packageId;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Package ID is required' }, { status: 400 });
    }

    const res = await queryDb(
      `UPDATE packages
       SET is_active = NOT is_active, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [Number(id)]
    );
    if (res.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Package not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, record: res.rows[0] });
  } catch (error) {
    console.error('Error toggling package status:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
