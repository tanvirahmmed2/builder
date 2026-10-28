import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';
import { getControlAuth, logWebsiteActivity } from '@/lib/website-control';

export async function GET(request, context) {
  try {
    const { website, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const params = await context.params;
    const branchId = Number(params.id);

    const res = await queryDb(
      `SELECT id, id AS branch_id, website_id, name, code, phone, email, address, is_active, created_at, updated_at
       FROM website_branches
       WHERE id = $1 AND website_id = $2
       LIMIT 1`,
      [branchId, website.id]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Branch not found' }, { status: 404 });
    }

    return NextResponse.json(res.rows[0]);
  } catch (error) {
    console.error('Branches GET ID error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request, context) {
  try {
    const { website, user, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const params = await context.params;
    const branchId = Number(params.id);
    const body = await request.json();

    const { name, code, phone, email, address, is_active } = body;

    const res = await queryDb(
      `UPDATE website_branches
       SET name = COALESCE($1, name),
           code = COALESCE($2, code),
           phone = COALESCE($3, phone),
           email = COALESCE($4, email),
           address = COALESCE($5, address),
           is_active = COALESCE($6, is_active),
           updated_at = NOW()
       WHERE id = $7 AND website_id = $8
       RETURNING id, id AS branch_id, website_id, name, code, phone, email, address, is_active, created_at, updated_at`,
      [name, code, phone, email, address, is_active, branchId, website.id]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Branch not found' }, { status: 404 });
    }

    await logWebsiteActivity({
      websiteId: website.id,
      userId: user?.id,
      userName: user?.name,
      action: 'BRANCH_UPDATED',
      details: `Updated branch #${branchId}`,
      req: request
    });

    return NextResponse.json(res.rows[0]);
  } catch (error) {
    console.error('Branches PUT ID error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, context) {
  try {
    const { website, user, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const params = await context.params;
    const branchId = Number(params.id);

    const res = await queryDb(
      `DELETE FROM website_branches
       WHERE id = $1 AND website_id = $2
       RETURNING id`,
      [branchId, website.id]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Branch not found' }, { status: 404 });
    }

    await logWebsiteActivity({
      websiteId: website.id,
      userId: user?.id,
      userName: user?.name,
      action: 'BRANCH_DELETED',
      details: `Deleted branch #${branchId}`,
      req: request
    });

    return NextResponse.json({ success: true, message: 'Branch deleted successfully' });
  } catch (error) {
    console.error('Branches DELETE ID error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
