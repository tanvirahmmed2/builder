import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';
import { getControlAuth, logWebsiteActivity } from '@/lib/website-control';

export async function GET(request, context) {
  try {
    const { website, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const res = await queryDb(
      `SELECT id, id AS module_id, website_id, name, slug, description, is_enabled, is_active, settings, created_at, updated_at
       FROM website_modules
       WHERE website_id = $1
       ORDER BY id ASC`,
      [website.id]
    );

    return NextResponse.json(res.rows);
  } catch (error) {
    console.error('Modules GET API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request, context) {
  try {
    const { website, user, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const body = await request.json();
    const { slug, is_enabled, is_active } = body;

    if (!slug) {
      return NextResponse.json({ success: false, error: 'Module slug is required' }, { status: 400 });
    }

    const res = await queryDb(
      `UPDATE website_modules
       SET is_enabled = COALESCE($1, is_enabled),
           is_active = COALESCE($2, is_active),
           updated_at = NOW()
       WHERE slug = $3 AND website_id = $4
       RETURNING *`,
      [is_enabled, is_active, slug, website.id]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Module not found' }, { status: 404 });
    }

    await logWebsiteActivity({
      websiteId: website.id,
      userId: user?.id,
      userName: user?.name,
      action: 'MODULE_TOGGLED',
      details: `Toggled module "${slug}"`,
      req: request
    });

    return NextResponse.json(res.rows[0]);
  } catch (error) {
    console.error('Modules PUT API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
