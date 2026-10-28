import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';
import { getControlAuth, logWebsiteActivity } from '@/lib/website-control';

export async function POST(request, context) {
  try {
    const { website, user, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const body = await request.json();
    const { email, phone, address, sociallink, social_links } = body;

    const linksObj = social_links || (typeof sociallink === 'string' ? { link: sociallink } : sociallink);

    const res = await queryDb(
      `INSERT INTO website_settings (website_id, contact_email, contact_phone, address, social_links)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (website_id) DO UPDATE
       SET contact_email = COALESCE(EXCLUDED.contact_email, website_settings.contact_email),
           contact_phone = COALESCE(EXCLUDED.contact_phone, website_settings.contact_phone),
           address = COALESCE(EXCLUDED.address, website_settings.address),
           social_links = COALESCE(EXCLUDED.social_links, website_settings.social_links),
           updated_at = NOW()
       RETURNING *`,
      [website.id, email || null, phone || null, address || null, linksObj ? JSON.stringify(linksObj) : null]
    );

    await logWebsiteActivity({
      websiteId: website.id,
      userId: user?.id,
      userName: user?.name,
      action: 'SETTINGS_IDENTITY_UPDATED',
      details: `Updated website identity: email, phone, address, social links`,
      req: request
    });

    return NextResponse.json(res.rows[0]);
  } catch (error) {
    console.error('Settings identity POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
