import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';
import { getControlAuth, logWebsiteActivity } from '@/lib/website-control';

export async function POST(request, context) {
  try {
    const { website, user, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const body = await request.json();
    const { hero_title, hero_subtitle, is_sale_active, excluded_tax, tax_amount } = body;

    const res = await queryDb(
      `INSERT INTO website_settings (website_id, hero_title, hero_subtitle, is_sale_active, excluded_tax, tax_amount)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (website_id) DO UPDATE
       SET hero_title = COALESCE(EXCLUDED.hero_title, website_settings.hero_title),
           hero_subtitle = COALESCE(EXCLUDED.hero_subtitle, website_settings.hero_subtitle),
           is_sale_active = COALESCE(EXCLUDED.is_sale_active, website_settings.is_sale_active),
           excluded_tax = COALESCE(EXCLUDED.excluded_tax, website_settings.excluded_tax),
           tax_amount = COALESCE(EXCLUDED.tax_amount, website_settings.tax_amount),
           updated_at = NOW()
       RETURNING *`,
      [
        website.id,
        hero_title || null,
        hero_subtitle || null,
        is_sale_active !== undefined ? is_sale_active : true,
        excluded_tax !== undefined ? excluded_tax : false,
        tax_amount !== undefined ? parseFloat(tax_amount) : 0
      ]
    );

    await logWebsiteActivity({
      websiteId: website.id,
      userId: user?.id,
      userName: user?.name,
      action: 'SETTINGS_HERO_UPDATED',
      details: `Updated hero banner and POS tax settings`,
      req: request
    });

    return NextResponse.json(res.rows[0]);
  } catch (error) {
    console.error('Settings hero POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
