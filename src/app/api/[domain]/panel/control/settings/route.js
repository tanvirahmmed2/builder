import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';
import { getControlAuth, logWebsiteActivity } from '@/lib/website-control';

export async function GET(request, context) {
  try {
    const { website, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const res = await queryDb(
      `SELECT id, website_id, site_title, tagline, bio, logo_url, favicon_url,
              primary_color, secondary_color, font_family, contact_email, contact_phone,
              address, currency, currency_symbol, social_links, hero_title, hero_subtitle,
              is_sale_active, excluded_tax, tax_amount, is_share_investment, seo_config,
              custom_domain_verified, created_at, updated_at
       FROM website_settings
       WHERE website_id = $1
       LIMIT 1`,
      [website.id]
    );

    let settings = res.rows[0];
    if (!settings) {
      // Create default settings row if missing
      const insertRes = await queryDb(
        `INSERT INTO website_settings (website_id, site_title)
         VALUES ($1, $2)
         ON CONFLICT (website_id) DO UPDATE SET updated_at = NOW()
         RETURNING *`,
        [website.id, website.name || 'Store']
      );
      settings = insertRes.rows[0];
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Settings GET API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request, context) {
  try {
    const { website, user, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const body = await request.json();
    const {
      site_title, tagline, bio, primary_color, secondary_color, font_family,
      contact_email, contact_phone, address, currency, currency_symbol,
      social_links, hero_title, hero_subtitle, is_sale_active, excluded_tax,
      tax_amount, is_share_investment
    } = body;

    const res = await queryDb(
      `INSERT INTO website_settings (
         website_id, site_title, tagline, bio, primary_color, secondary_color,
         font_family, contact_email, contact_phone, address, currency, currency_symbol,
         social_links, hero_title, hero_subtitle, is_sale_active, excluded_tax,
         tax_amount, is_share_investment
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
       ON CONFLICT (website_id) DO UPDATE
       SET site_title = COALESCE(EXCLUDED.site_title, website_settings.site_title),
           tagline = COALESCE(EXCLUDED.tagline, website_settings.tagline),
           bio = COALESCE(EXCLUDED.bio, website_settings.bio),
           primary_color = COALESCE(EXCLUDED.primary_color, website_settings.primary_color),
           secondary_color = COALESCE(EXCLUDED.secondary_color, website_settings.secondary_color),
           font_family = COALESCE(EXCLUDED.font_family, website_settings.font_family),
           contact_email = COALESCE(EXCLUDED.contact_email, website_settings.contact_email),
           contact_phone = COALESCE(EXCLUDED.contact_phone, website_settings.contact_phone),
           address = COALESCE(EXCLUDED.address, website_settings.address),
           currency = COALESCE(EXCLUDED.currency, website_settings.currency),
           currency_symbol = COALESCE(EXCLUDED.currency_symbol, website_settings.currency_symbol),
           social_links = COALESCE(EXCLUDED.social_links, website_settings.social_links),
           hero_title = COALESCE(EXCLUDED.hero_title, website_settings.hero_title),
           hero_subtitle = COALESCE(EXCLUDED.hero_subtitle, website_settings.hero_subtitle),
           is_sale_active = COALESCE(EXCLUDED.is_sale_active, website_settings.is_sale_active),
           excluded_tax = COALESCE(EXCLUDED.excluded_tax, website_settings.excluded_tax),
           tax_amount = COALESCE(EXCLUDED.tax_amount, website_settings.tax_amount),
           is_share_investment = COALESCE(EXCLUDED.is_share_investment, website_settings.is_share_investment),
           updated_at = NOW()
       RETURNING *`,
      [
        website.id, site_title, tagline, bio, primary_color, secondary_color,
        font_family, contact_email, contact_phone, address, currency, currency_symbol,
        social_links ? JSON.stringify(social_links) : null,
        hero_title, hero_subtitle, is_sale_active, excluded_tax,
        tax_amount !== undefined ? parseFloat(tax_amount) : null,
        is_share_investment
      ]
    );

    await logWebsiteActivity({
      websiteId: website.id,
      userId: user?.id,
      userName: user?.name,
      action: 'SETTINGS_UPDATED',
      details: `Updated website general settings`,
      req: request
    });

    return NextResponse.json(res.rows[0]);
  } catch (error) {
    console.error('Settings PUT API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
