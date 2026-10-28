import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';
import { getControlAuth, logWebsiteActivity } from '@/lib/website-control';

export async function GET(request, context) {
  try {
    const { website, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const params = await context.params;
    const supplierId = Number(params.id);

    const res = await queryDb(
      `SELECT id, id AS supplier_id, website_id, name, company_name, email, phone, address, balance, note, is_active, created_at, updated_at
       FROM website_suppliers
       WHERE id = $1 AND website_id = $2
       LIMIT 1`,
      [supplierId, website.id]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Supplier not found' }, { status: 404 });
    }

    return NextResponse.json(res.rows[0]);
  } catch (error) {
    console.error('Supplier GET ID error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request, context) {
  try {
    const { website, user, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const params = await context.params;
    const supplierId = Number(params.id);
    const body = await request.json();

    const { name, company_name, email, phone, address, balance, note, is_active } = body;

    const res = await queryDb(
      `UPDATE website_suppliers
       SET name = COALESCE($1, name),
           company_name = COALESCE($2, company_name),
           email = COALESCE($3, email),
           phone = COALESCE($4, phone),
           address = COALESCE($5, address),
           balance = COALESCE($6, balance),
           note = COALESCE($7, note),
           is_active = COALESCE($8, is_active),
           updated_at = NOW()
       WHERE id = $9 AND website_id = $10
       RETURNING id, id AS supplier_id, website_id, name, company_name, email, phone, address, balance, note, is_active, created_at, updated_at`,
      [name, company_name, email, phone, address, balance !== undefined ? parseFloat(balance) : null, note, is_active, supplierId, website.id]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Supplier not found' }, { status: 404 });
    }

    await logWebsiteActivity({
      websiteId: website.id,
      userId: user?.id,
      userName: user?.name,
      action: 'SUPPLIER_UPDATED',
      details: `Updated supplier #${supplierId}`,
      req: request
    });

    return NextResponse.json(res.rows[0]);
  } catch (error) {
    console.error('Supplier PUT ID error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, context) {
  try {
    const { website, user, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const params = await context.params;
    const supplierId = Number(params.id);

    const res = await queryDb(
      `DELETE FROM website_suppliers
       WHERE id = $1 AND website_id = $2
       RETURNING id, name`,
      [supplierId, website.id]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Supplier not found' }, { status: 404 });
    }

    await logWebsiteActivity({
      websiteId: website.id,
      userId: user?.id,
      userName: user?.name,
      action: 'SUPPLIER_DELETED',
      details: `Deleted supplier "${res.rows[0].name}" (#${supplierId})`,
      req: request
    });

    return NextResponse.json({ success: true, message: 'Supplier deleted successfully' });
  } catch (error) {
    console.error('Supplier DELETE ID error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
