import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';
import { getControlAuth } from '@/lib/website-control';

export async function GET(request, context) {
  try {
    const { website, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(request.url);
    const tab = searchParams.get('tab') || 'affiliates';

    if (tab === 'commissions') {
      const res = await queryDb(
        `SELECT c.id, c.affiliate_id, c.order_id, c.order_amount, c.commission_amount, c.status, c.created_at,
                a.affiliate_code
         FROM website_affiliate_commissions c
         LEFT JOIN website_affiliates a ON c.affiliate_id = a.id
         WHERE c.website_id = $1
         ORDER BY c.id DESC`,
        [website.id]
      );
      return NextResponse.json(res.rows);
    }

    // Default: affiliates
    const res = await queryDb(
      `SELECT a.id, a.user_id, a.affiliate_code, a.commission_rate, a.total_earnings, a.balance, a.status, a.created_at, a.updated_at,
              u.name as user_name, u.email as user_email
       FROM website_affiliates a
       LEFT JOIN website_users u ON a.user_id = u.id
       WHERE a.website_id = $1
       ORDER BY a.id DESC`,
      [website.id]
    );
    return NextResponse.json(res.rows);
  } catch (error) {
    console.error('Affiliates GET error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request, context) {
  try {
    const { website, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const body = await request.json();
    const { affiliate_code, commission_rate = 10, user_id = null } = body;

    const code = (affiliate_code || 'REF-' + Math.random().toString(36).substring(2, 8)).toUpperCase();

    const res = await queryDb(
      `INSERT INTO website_affiliates (website_id, user_id, affiliate_code, commission_rate, total_earnings, balance, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, 0, 0, 'active', NOW(), NOW())
       RETURNING *`,
      [website.id, user_id || null, code, Number(commission_rate) || 10]
    );

    return NextResponse.json({ success: true, affiliate: res.rows[0] });
  } catch (error) {
    console.error('Affiliates POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

