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
    const customerId = session.customer?.id;

    if (!customerId) {
      return NextResponse.json({ success: true, data: [] });
    }

    const ordersRes = await queryDb(
      `SELECT o.id, o.order_number, o.order_type, o.status, o.payment_status,
              o.subtotal, o.shipping_fee, o.grand_total, o.created_at,
              json_agg(json_build_object(
                'id', oi.id,
                'product_name', oi.product_name,
                'quantity', oi.quantity,
                'unit_price', oi.unit_price,
                'total_price', oi.total_price
              )) AS items
       FROM website_ecommerce_orders o
       LEFT JOIN website_ecommerce_order_items oi ON o.id = oi.order_id AND oi.website_id = $1
       WHERE o.website_id = $1 AND o.customer_id = $2
       GROUP BY o.id
       ORDER BY o.id DESC`,
      [websiteId, customerId]
    );

    return NextResponse.json({ success: true, data: ordersRes.rows });
  } catch (error) {
    console.error('Customer orders API error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch customer orders' }, { status: 500 });
  }
}

