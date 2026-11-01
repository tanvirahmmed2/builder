import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';
import { resolveWebsiteFromRequest } from '@/lib/middleware/user';

export async function GET(req, { params }) {
  try {
    const { domain } = await params;
    const website = await resolveWebsiteFromRequest(req, domain);

    if (!website) {
      return NextResponse.json({ success: false, error: 'Website not found' }, { status: 404 });
    }

    const websiteId = website.id;

    // Fetch theme, navigation, active currencies, and public settings
    const [settingsRes, themeRes, navRes, modulesRes, currenciesRes] = await Promise.all([
      queryDb('SELECT * FROM website_settings WHERE website_id = $1 LIMIT 1', [websiteId]),
      queryDb('SELECT * FROM website_themes WHERE website_id = $1 AND is_active = TRUE LIMIT 1', [websiteId]),
      queryDb('SELECT * FROM website_navigation WHERE website_id = $1 AND is_visible = TRUE ORDER BY sort_order ASC', [websiteId]),
      queryDb('SELECT * FROM website_modules WHERE website_id = $1 AND is_enabled = TRUE', [websiteId]),
      queryDb('SELECT * FROM website_currencies WHERE website_id = $1 AND is_active = TRUE ORDER BY is_default DESC', [websiteId])
    ]);

    const settings = settingsRes.rows[0] || website.settings || {
      site_name: website.name,
      currency: 'USD',
      currency_symbol: '$'
    };

    const theme = themeRes.rows[0] || {
      theme_name: 'Default Dark',
      color_primary: '#3b82f6',
      color_secondary: '#64748b',
      color_background: '#090d16',
      color_surface: '#111827',
      color_text: '#f9fafb',
      font_heading: 'Inter',
      font_body: 'Inter'
    };

    return NextResponse.json({
      success: true,
      data: {
        website: {
          id: website.id,
          name: website.name,
          subdomain: website.subdomain,
          custom_domain: website.custom_domain,
          website_type: website.website_type || 'ecommerce'
        },
        settings,
        theme,
        navigation: navRes.rows,
        modules: modulesRes.rows,
        currencies: currenciesRes.rows
      }
    });
  } catch (error) {
    console.error('Home bootstrap API error:', error);
    return NextResponse.json({ success: false, error: 'Failed to bootstrap website' }, { status: 500 });
  }
}

