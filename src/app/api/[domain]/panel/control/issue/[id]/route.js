import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';
import { getControlAuth, logWebsiteActivity } from '@/lib/website-control';

export async function DELETE(request, context) {
  try {
    const { website, user, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const params = await context.params;
    const issueId = Number(params.id);

    const res = await queryDb(
      `DELETE FROM website_issues
       WHERE id = $1 AND website_id = $2
       RETURNING id, title`,
      [issueId, website.id]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Issue not found' }, { status: 404 });
    }

    await logWebsiteActivity({
      websiteId: website.id,
      userId: user?.id,
      userName: user?.name,
      action: 'ISSUE_DELETED',
      details: `Deleted issue log #${issueId}`,
      req: request
    });

    return NextResponse.json({ success: true, message: 'Issue deleted successfully' });
  } catch (error) {
    console.error('Issue DELETE ID error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
