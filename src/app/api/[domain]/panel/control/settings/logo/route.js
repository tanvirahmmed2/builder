import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';
import { getControlAuth, logWebsiteActivity } from '@/lib/website-control';

export async function POST(request, context) {
  try {
    const { website, user, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    let logoUrl = '';
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('logo') || formData.get('file');
      const url = formData.get('logo_url');

      if (url && typeof url === 'string') {
        logoUrl = url;
      } else if (file && typeof file === 'object') {
        // Simple base64 fallback or data URI for store logo
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        logoUrl = `data:${file.type || 'image/png'};base64,${buffer.toString('base64')}`;
      }
    } else {
      const body = await request.json();
      logoUrl = body.logo_url || body.logo || '';
    }

    if (!logoUrl) {
      return NextResponse.json({ success: false, error: 'No logo file or URL provided' }, { status: 400 });
    }

    const res = await queryDb(
      `INSERT INTO website_settings (website_id, logo_url)
       VALUES ($1, $2)
       ON CONFLICT (website_id) DO UPDATE
       SET logo_url = EXCLUDED.logo_url, updated_at = NOW()
       RETURNING *`,
      [website.id, logoUrl]
    );

    await logWebsiteActivity({
      websiteId: website.id,
      userId: user?.id,
      userName: user?.name,
      action: 'LOGO_UPDATED',
      details: `Updated store brand logo`,
      req: request
    });

    return NextResponse.json({
      success: true,
      logo_url: logoUrl,
      settings: res.rows[0]
    });

  } catch (error) {
    console.error('Settings logo POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
