import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';
import { getControlAuth, logWebsiteActivity } from '@/lib/website-control';

export async function PATCH(request, context) {
  try {
    const { website, user, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const params = await context.params;
    const reviewId = Number(params.id);
    const body = await request.json();

    const { is_approved } = body;

    const res = await queryDb(
      `UPDATE website_reviews
       SET is_approved = $1
       WHERE id = $2 AND website_id = $3
       RETURNING *`,
      [is_approved, reviewId, website.id]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Review not found' }, { status: 404 });
    }

    await logWebsiteActivity({
      websiteId: website.id,
      userId: user?.id,
      userName: user?.name,
      action: 'REVIEW_STATUS_CHANGED',
      details: `Changed review #${reviewId} approval status to ${is_approved}`,
      req: request
    });

    return NextResponse.json(res.rows[0]);
  } catch (error) {
    console.error('Reviews PATCH ID error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, context) {
  try {
    const { website, user, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const params = await context.params;
    const reviewId = Number(params.id);

    const res = await queryDb(
      `DELETE FROM website_reviews
       WHERE id = $1 AND website_id = $2
       RETURNING id`,
      [reviewId, website.id]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Review not found' }, { status: 404 });
    }

    await logWebsiteActivity({
      websiteId: website.id,
      userId: user?.id,
      userName: user?.name,
      action: 'REVIEW_DELETED',
      details: `Deleted review #${reviewId}`,
      req: request
    });

    return NextResponse.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Reviews DELETE ID error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
