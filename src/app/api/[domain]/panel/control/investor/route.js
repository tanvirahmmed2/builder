import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';
import { getControlAuth, logWebsiteActivity } from '@/lib/website-control';

export async function GET(request, context) {
  try {
    const { website, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const res = await queryDb(
      `SELECT i.id, i.id AS investor_id, i.website_id, i.name, i.phone, i.email,
              i.address, i.nid_passport, i.is_active, i.note, i.created_at, i.updated_at,
              COALESCE(inv.total_invested, 0) AS total_invested,
              COALESCE(w.total_withdrawn, 0) AS total_withdrawn,
              COALESCE(s.shares_count, 0) AS shares_count,
              COALESCE(s.share_percentage, 0) AS share_percentage
       FROM website_investors i
       LEFT JOIN (
         SELECT investor_id, SUM(amount) AS total_invested
         FROM website_investments
         WHERE website_id = $1
         GROUP BY investor_id
       ) inv ON inv.investor_id = i.id
       LEFT JOIN (
         SELECT investor_id, SUM(amount) AS total_withdrawn
         FROM website_withdrawals
         WHERE website_id = $1
         GROUP BY investor_id
       ) w ON w.investor_id = i.id
       LEFT JOIN (
         SELECT investor_id, SUM(shares_count) AS shares_count, SUM(share_percentage) AS share_percentage
         FROM website_shares
         WHERE website_id = $1
         GROUP BY investor_id
       ) s ON s.investor_id = i.id
       WHERE i.website_id = $1
       ORDER BY i.name ASC`,
      [website.id]
    );

    return NextResponse.json(res.rows);
  } catch (error) {
    console.error('Investor GET API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request, context) {
  try {
    const { website, user, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const body = await request.json();
    const { name, phone, email, address, nid_passport, is_active = true, note } = body;

    if (!name || !phone) {
      return NextResponse.json({ success: false, error: 'Name and phone are required' }, { status: 400 });
    }

    const res = await queryDb(
      `INSERT INTO website_investors (website_id, name, phone, email, address, nid_passport, is_active, note)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, id AS investor_id, website_id, name, phone, email, address, nid_passport, is_active, note, created_at, updated_at`,
      [website.id, name.trim(), phone.trim(), email || null, address || null, nid_passport || null, is_active, note || null]
    );

    await logWebsiteActivity({
      websiteId: website.id,
      userId: user?.id,
      userName: user?.name,
      action: 'INVESTOR_CREATED',
      details: `Created investor "${name}" (${phone})`,
      req: request
    });

    return NextResponse.json(res.rows[0], { status: 201 });
  } catch (error) {
    console.error('Investor POST API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
