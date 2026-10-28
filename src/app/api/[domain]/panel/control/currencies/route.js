import { NextResponse } from 'next/server';
import { queryDb, pool } from '@/lib/db/pg';
import { getControlAuth, logWebsiteActivity } from '@/lib/website-control';

export async function GET(request, context) {
  try {
    const { website, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const res = await queryDb(
      `SELECT id, id AS currency_id, website_id, name, code, symbol, exchange_rate, is_default, created_at, updated_at
       FROM website_currencies
       WHERE website_id = $1
       ORDER BY is_default DESC, name ASC`,
      [website.id]
    );

    // If no currencies exist for this store yet, insert defaults (BDT & USD)
    if (res.rows.length === 0) {
      await queryDb(
        `INSERT INTO website_currencies (website_id, name, code, symbol, is_default)
         VALUES ($1, 'Bangladeshi Taka', 'BDT', '৳', TRUE),
                ($1, 'US Dollar', 'USD', '$', FALSE)
         ON CONFLICT DO NOTHING`,
        [website.id]
      );

      const refreshed = await queryDb(
        `SELECT id, id AS currency_id, website_id, name, code, symbol, exchange_rate, is_default, created_at, updated_at
         FROM website_currencies
         WHERE website_id = $1
         ORDER BY is_default DESC, name ASC`,
        [website.id]
      );
      return NextResponse.json(refreshed.rows);
    }

    return NextResponse.json(res.rows);
  } catch (error) {
    console.error('Currencies GET API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request, context) {
  try {
    const { website, user, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const body = await request.json();
    const { name, code, symbol, exchange_rate = 1.0, is_default = false } = body;

    if (!name || !code || !symbol) {
      return NextResponse.json({ success: false, error: 'Name, code, and symbol are required' }, { status: 400 });
    }

    const res = await queryDb(
      `INSERT INTO website_currencies (website_id, name, code, symbol, exchange_rate, is_default)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, id AS currency_id, website_id, name, code, symbol, exchange_rate, is_default, created_at, updated_at`,
      [website.id, name.trim(), code.trim().toUpperCase(), symbol.trim(), parseFloat(exchange_rate) || 1.0, is_default]
    );

    await logWebsiteActivity({
      websiteId: website.id,
      userId: user?.id,
      userName: user?.name,
      action: 'CURRENCY_ADDED',
      details: `Added new store currency: ${code} (${symbol})`,
      req: request
    });

    return NextResponse.json(res.rows[0], { status: 201 });
  } catch (error) {
    console.error('Currencies POST API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request, context) {
  const client = await pool.connect();
  try {
    const { website, user, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) {
      client.release();
      return errorResponse;
    }

    const body = await request.json();
    const { currency_id } = body;

    if (!currency_id) {
      client.release();
      return NextResponse.json({ success: false, error: 'currency_id is required' }, { status: 400 });
    }

    await client.query('BEGIN');

    // Reset default for other currencies
    await client.query(
      `UPDATE website_currencies SET is_default = FALSE WHERE website_id = $1`,
      [website.id]
    );

    // Set new default
    const curRes = await client.query(
      `UPDATE website_currencies
       SET is_default = TRUE, updated_at = NOW()
       WHERE id = $1 AND website_id = $2
       RETURNING *`,
      [Number(currency_id), website.id]
    );

    if (curRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json({ success: false, error: 'Currency not found' }, { status: 404 });
    }

    const defaultCur = curRes.rows[0];

    // Update settings table with active currency and symbol
    await client.query(
      `UPDATE website_settings
       SET currency = $1, currency_symbol = $2, updated_at = NOW()
       WHERE website_id = $3`,
      [defaultCur.code, defaultCur.symbol, website.id]
    );

    await client.query('COMMIT');

    await logWebsiteActivity({
      websiteId: website.id,
      userId: user?.id,
      userName: user?.name,
      action: 'CURRENCY_ACTIVATED',
      details: `Activated default store currency: ${defaultCur.code} (${defaultCur.symbol})`,
      req: request
    });

    return NextResponse.json({
      success: true,
      currency: defaultCur
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Currencies PATCH API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}
