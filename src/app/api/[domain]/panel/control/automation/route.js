import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';
import { getControlAuth } from '@/lib/website-control';

export async function GET(request, context) {
  try {
    const { website, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(request.url);
    const tab = searchParams.get('tab') || 'workflows';

    if (tab === 'webhooks') {
      const res = await queryDb(
        `SELECT id, name, url, events, is_active, created_at, updated_at
         FROM website_webhooks
         WHERE website_id = $1
         ORDER BY id DESC`,
        [website.id]
      );
      return NextResponse.json(res.rows);
    }

    // Default: workflows
    const res = await queryDb(
      `SELECT id, name, description, is_active, trigger_type, created_at, updated_at
       FROM website_automation_workflows
       WHERE website_id = $1
       ORDER BY id DESC`,
      [website.id]
    );
    return NextResponse.json(res.rows);
  } catch (error) {
    console.error('Automation GET error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request, context) {
  try {
    const { website, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const body = await request.json();
    const type = body.type || 'workflow';

    if (type === 'webhook') {
      const { name, url, events = 'order.created,order.completed', is_active = true } = body;
      if (!name?.trim() || !url?.trim()) {
        return NextResponse.json({ success: false, error: 'Webhook name and target URL are required' }, { status: 400 });
      }
      const secret_key = 'whsec_' + Math.random().toString(36).substring(2, 12);
      const res = await queryDb(
        `INSERT INTO website_webhooks (website_id, name, url, secret_key, events, is_active, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
         RETURNING *`,
        [website.id, name.trim(), url.trim(), secret_key, events, is_active]
      );
      return NextResponse.json({ success: true, webhook: res.rows[0] });
    }

    // Default: workflow
    const { name, description = '', trigger_type = 'order_placed', is_active = true } = body;
    if (!name?.trim()) return NextResponse.json({ success: false, error: 'Workflow name is required' }, { status: 400 });

    const res = await queryDb(
      `INSERT INTO website_automation_workflows (website_id, name, description, is_active, trigger_type, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       RETURNING *`,
      [website.id, name.trim(), description, is_active, trigger_type]
    );

    return NextResponse.json({ success: true, workflow: res.rows[0] });
  } catch (error) {
    console.error('Automation POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

