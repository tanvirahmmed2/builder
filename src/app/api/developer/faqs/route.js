import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';
import { isManagerOrAdmin } from '@/lib/middleware/developer';

export async function GET() {
  try {
    const res = await queryDb('SELECT * FROM faqs ORDER BY id ASC').catch(() => ({ rows: [] }));
    return NextResponse.json({ success: true, table: 'faqs', records: res.rows });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// CREATE FAQ
export async function POST(request) {
  try {
    const authCheck = await isManagerOrAdmin(request);
    if (!authCheck.success) {
      return NextResponse.json(
        { success: false, error: authCheck.message || 'Access denied: Only Admin and Manager roles can create FAQs.' },
        { status: authCheck.status || 403 }
      );
    }

    const body = await request.json();
    const question = body.question?.trim();
    const answer = body.answer?.trim();

    if (!question || !answer) {
      return NextResponse.json({ success: false, error: 'Both question and answer are required.' }, { status: 400 });
    }

    const res = await queryDb(
      `INSERT INTO faqs (question, answer) VALUES ($1, $2) RETURNING *`,
      [question, answer]
    );

    return NextResponse.json({ success: true, record: res.rows[0], message: 'FAQ created successfully.' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// UPDATE FAQ
export async function PUT(request) {
  try {
    const authCheck = await isManagerOrAdmin(request);
    if (!authCheck.success) {
      return NextResponse.json(
        { success: false, error: authCheck.message || 'Access denied: Only Admin and Manager roles can update FAQs.' },
        { status: authCheck.status || 403 }
      );
    }

    const body = await request.json();
    const id = body.id;
    const question = body.question?.trim();
    const answer = body.answer?.trim();

    if (!id) {
      return NextResponse.json({ success: false, error: 'FAQ ID is required for update.' }, { status: 400 });
    }
    if (!question || !answer) {
      return NextResponse.json({ success: false, error: 'Both question and answer are required.' }, { status: 400 });
    }

    const res = await queryDb(
      `UPDATE faqs SET question = $1, answer = $2 WHERE id = $3 RETURNING *`,
      [question, answer, id]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'FAQ item not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, record: res.rows[0], message: 'FAQ updated successfully.' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE FAQ
export async function DELETE(request) {
  try {
    const authCheck = await isManagerOrAdmin(request);
    if (!authCheck.success) {
      return NextResponse.json(
        { success: false, error: authCheck.message || 'Access denied: Only Admin and Manager roles can delete FAQs.' },
        { status: authCheck.status || 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    let id = searchParams.get('id');
    if (!id) {
      const body = await request.json().catch(() => ({}));
      id = body.id;
    }
    if (!id) {
      return NextResponse.json({ success: false, error: 'FAQ ID is required.' }, { status: 400 });
    }

    await queryDb('DELETE FROM faqs WHERE id = $1', [id]);
    return NextResponse.json({ success: true, message: 'FAQ deleted successfully.' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
