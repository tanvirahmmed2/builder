import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';
import { getControlAuth, logWebsiteActivity } from '@/lib/website-control';

export async function PUT(request, context) {
  try {
    const { website, user, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const params = await context.params;
    const paymentId = Number(params.id);
    const body = await request.json();

    const { amount, payment_month, payment_method, status, transaction_id, payment_date, account_details } = body;

    const res = await queryDb(
      `UPDATE website_salary_payments
       SET amount = COALESCE($1, amount),
           payment_month = COALESCE($2, payment_month),
           payment_method = COALESCE($3, payment_method),
           status = COALESCE($4, status),
           transaction_id = COALESCE($5, transaction_id),
           payment_date = COALESCE($6, payment_date),
           account_details = COALESCE($7, account_details)
       WHERE id = $8 AND website_id = $9
       RETURNING id, id AS payment_id, website_id, staff_id, amount, payment_month, payment_method, status, transaction_id, payment_date, created_at`,
      [
        amount !== undefined ? parseFloat(amount) : null,
        payment_month,
        payment_method,
        status,
        transaction_id,
        payment_date,
        account_details,
        paymentId,
        website.id
      ]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Salary payment not found' }, { status: 404 });
    }

    await logWebsiteActivity({
      websiteId: website.id,
      userId: user?.id,
      userName: user?.name,
      action: 'SALARY_PAYMENT_UPDATED',
      details: `Updated salary payment #${paymentId}`,
      req: request
    });

    return NextResponse.json(res.rows[0]);
  } catch (error) {
    console.error('Salary payment PUT ID error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, context) {
  try {
    const { website, user, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const params = await context.params;
    const paymentId = Number(params.id);

    const res = await queryDb(
      `DELETE FROM website_salary_payments
       WHERE id = $1 AND website_id = $2
       RETURNING id, amount, staff_id`,
      [paymentId, website.id]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Salary payment not found' }, { status: 404 });
    }

    await logWebsiteActivity({
      websiteId: website.id,
      userId: user?.id,
      userName: user?.name,
      action: 'SALARY_PAYMENT_DELETED',
      details: `Deleted salary payment #${paymentId}`,
      req: request
    });

    return NextResponse.json({ success: true, message: 'Salary payment deleted successfully' });
  } catch (error) {
    console.error('Salary payment DELETE ID error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
