import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';
import { getControlAuth, logWebsiteActivity } from '@/lib/website-control';

export async function GET(request, context) {
  try {
    const { website, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const res = await queryDb(
      `SELECT id, id AS branch_id, website_id, name, code, phone, email, address, is_active, created_at, updated_at
       FROM website_branches
       WHERE website_id = $1
       ORDER BY id ASC`,
      [website.id]
    );

    return NextResponse.json(res.rows);
  } catch (error) {
    console.error('Branches GET API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request, context) {
  try {
    const { website, user, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const body = await request.json();
    const { name, code, phone, email, address, is_active = true } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, error: 'Branch name is required' }, { status: 400 });
    }

    const res = await queryDb(
      `INSERT INTO website_branches (website_id, name, code, phone, email, address, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, id AS branch_id, website_id, name, code, phone, email, address, is_active, created_at, updated_at`,
      [website.id, name.trim(), code || null, phone || null, email || null, address || null, is_active]
    );

    await logWebsiteActivity({
      websiteId: website.id,
      userId: user?.id,
      userName: user?.name,
      action: 'BRANCH_CREATED',
      details: `Created new branch "${name}"`,
      req: request
    });

    return NextResponse.json(res.rows[0], { status: 201 });
  } catch (error) {
    console.error('Branches POST API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
