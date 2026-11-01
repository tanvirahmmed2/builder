import { NextResponse } from 'next/server';
import { resolveWebsiteFromRequest } from '@/lib/middleware/user';
import { getWebsiteClientSession } from '@/lib/middleware/website/user';
import { queryDb } from '@/lib/db/pg';

export async function GET(req, { params }) {
  try {
    const { domain } = await params;
    const website = await resolveWebsiteFromRequest(req, domain);

    if (!website) {
      return NextResponse.json({ success: false, error: 'Website not found' }, { status: 404 });
    }

    const session = await getWebsiteClientSession(req, website.id);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const websiteId = website.id;

    // Fetch user addresses and recent order count
    const [addressesRes, ordersRes] = await Promise.all([
      queryDb('SELECT * FROM website_user_addresses WHERE website_id = $1 AND user_id = $2 ORDER BY is_default DESC', [websiteId, session.id]),
      queryDb('SELECT COUNT(*) AS total_orders, COALESCE(SUM(grand_total), 0) AS total_spent FROM website_ecommerce_orders WHERE website_id = $1 AND customer_id = $2', [websiteId, session.customer?.id || 0])
    ]);

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: session.id,
          first_name: session.first_name,
          last_name: session.last_name,
          email: session.email,
          phone: session.phone,
          avatar_url: session.avatar_url
        },
        customer: session.customer,
        addresses: addressesRes.rows,
        stats: ordersRes.rows[0]
      }
    });
  } catch (error) {
    console.error('Customer me API error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch customer profile' }, { status: 500 });
  }
}

