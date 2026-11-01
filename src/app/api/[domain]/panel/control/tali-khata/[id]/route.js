import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';
import { getControlAuth } from '@/lib/website-control';

export async function PUT(request, context) {
  try {
    const { website, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const params = context?.params ? await context.params : {};
    const id = params?.id;
    const body = await request.json();
    const { name, phone, email, address, is_active } = body;

    const res = await queryDb(
      `UPDATE website_tali_parties
       SET name = COALESCE($1, name),
           phone = COALESCE($2, phone),
           email = COALESCE($3, email),
           address = COALESCE($4, address),
           is_active = COALESCE($5, is_active),
           updated_at = NOW()
       WHERE id = $6 AND website_id = $7
       RETURNING *`,
      [name, phone, email, address, is_active, id, website.id]
    );

    if (res.rowCount === 0) return NextResponse.json({ success: false, error: 'Party not found' }, { status: 404 });
    return NextResponse.json({ success: true, party: res.rows[0] });
  } catch (error) {
    console.error('Tali Khata PUT error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, context) {
  try {
    const { website, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const params = context?.params ? await context.params : {};
    const id = params?.id;

    // Delete transactions first
    await queryDb(`DELETE FROM website_tali_transactions WHERE party_id = $1 AND website_id = $2`, [id, website.id]);
    const res = await queryDb(`DELETE FROM website_tali_parties WHERE id = $1 AND website_id = $2 RETURNING id`, [id, website.id]);

    if (res.rowCount === 0) return NextResponse.json({ success: false, error: 'Party not found' }, { status: 404 });
    return NextResponse.json({ success: true, deletedId: id });
  } catch (error) {
    console.error('Tali Khata DELETE error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

