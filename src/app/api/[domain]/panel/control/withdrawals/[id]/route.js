import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';
import { getControlAuth, logWebsiteActivity } from '@/lib/website-control';

export async function DELETE(request, context) {
  try {
    const { website, user, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const params = await context.params;
    const withdrawalId = Number(params.id);

    const res = await queryDb(
      `DELETE FROM website_withdrawals
       WHERE id = $1 AND website_id = $2
       RETURNING id, amount, investor_id`,
      [withdrawalId, website.id]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Withdrawal not found' }, { status: 404 });
    }

    await logWebsiteActivity({
      websiteId: website.id,
      userId: user?.id,
      userName: user?.name,
      action: 'WITHDRAWAL_DELETED',
      details: `Deleted withdrawal #${withdrawalId} of ৳${res.rows[0].amount}`,
      req: request
    });

    return NextResponse.json({ success: true, message: 'Withdrawal deleted successfully' });
  } catch (error) {
    console.error('Withdrawal DELETE ID error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
