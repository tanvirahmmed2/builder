import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';
import { getControlAuth } from '@/lib/website-control';

export async function DELETE(request, context) {
  try {
    const { website, user, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    if (!user || !user.id) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const params = await context.params;
    const sessionId = Number(params.id);

    await queryDb(
      `DELETE FROM website_staff_sessions WHERE id = $1 AND user_id = $2 AND website_id = $3`,
      [sessionId, user.id, website.id]
    );

    return NextResponse.json({ success: true, message: 'Session revoked successfully' });
  } catch (error) {
    console.error('Staff session DELETE ID error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
