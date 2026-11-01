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
    const type = body.type || 'workflow';

    if (type === 'webhook') {
      const { name, url, events, is_active } = body;
      const res = await queryDb(
        `UPDATE website_webhooks
         SET name = COALESCE($1, name), url = COALESCE($2, url), events = COALESCE($3, events), is_active = COALESCE($4, is_active), updated_at = NOW()
         WHERE id = $5 AND website_id = $6
         RETURNING *`,
        [name, url, events, is_active, id, website.id]
      );
      if (res.rowCount === 0) return NextResponse.json({ success: false, error: 'Webhook not found' }, { status: 404 });
      return NextResponse.json({ success: true, webhook: res.rows[0] });
    }

    // Default: workflow
    const { name, description, trigger_type, is_active } = body;
    const res = await queryDb(
      `UPDATE website_automation_workflows
       SET name = COALESCE($1, name), description = COALESCE($2, description), trigger_type = COALESCE($3, trigger_type), is_active = COALESCE($4, is_active), updated_at = NOW()
       WHERE id = $5 AND website_id = $6
       RETURNING *`,
      [name, description, trigger_type, is_active, id, website.id]
    );
    if (res.rowCount === 0) return NextResponse.json({ success: false, error: 'Workflow not found' }, { status: 404 });
    return NextResponse.json({ success: true, workflow: res.rows[0] });
  } catch (error) {
    console.error('Automation PUT error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, context) {
  try {
    const { website, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const params = context?.params ? await context.params : {};
    const id = params?.id;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'workflow';

    const table = type === 'webhook' ? 'website_webhooks' : 'website_automation_workflows';
    const res = await queryDb(`DELETE FROM ${table} WHERE id = $1 AND website_id = $2 RETURNING id`, [id, website.id]);

    if (res.rowCount === 0) return NextResponse.json({ success: false, error: 'Item not found' }, { status: 404 });
    return NextResponse.json({ success: true, deletedId: id });
  } catch (error) {
    console.error('Automation DELETE error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

