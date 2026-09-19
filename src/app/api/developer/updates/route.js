import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';
import { isManagerOrAdmin } from '@/lib/middleware/developer';
import slugify from 'slugify';

function formatSlug(text) {
  return slugify(text || '', {
    lower: true,
    strict: true,
    trim: true,
  });
}

export async function GET() {
  try {
    const res = await queryDb('SELECT * FROM updates ORDER BY created_at DESC').catch(() => ({ rows: [] }));
    return NextResponse.json({ success: true, table: 'updates', records: res.rows });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// CREATE UPDATE
export async function POST(request) {
  try {
    const authCheck = await isManagerOrAdmin(request);
    if (!authCheck.success) {
      return NextResponse.json(
        { success: false, error: authCheck.message || 'Access denied: Only Admin and Manager roles can create product updates.' },
        { status: authCheck.status || 403 }
      );
    }

    const body = await request.json();
    const title = body.title?.trim();
    const description = body.description?.trim();
    let slug = body.slug?.trim() || formatSlug(title);

    if (!title) {
      return NextResponse.json({ success: false, error: 'Title is required.' }, { status: 400 });
    }
    if (!description) {
      return NextResponse.json({ success: false, error: 'Description is required.' }, { status: 400 });
    }
    if (!slug) {
      slug = formatSlug(title);
    }

    // Check slug uniqueness
    const existingSlug = await queryDb('SELECT id FROM updates WHERE slug = $1 LIMIT 1', [slug]);
    if (existingSlug.rows.length > 0) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const res = await queryDb(
      `INSERT INTO updates (title, description, slug) VALUES ($1, $2, $3) RETURNING *`,
      [title, description, slug]
    );

    return NextResponse.json({ success: true, record: res.rows[0], message: 'Update published successfully.' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// UPDATE RECORD
export async function PUT(request) {
  try {
    const authCheck = await isManagerOrAdmin(request);
    if (!authCheck.success) {
      return NextResponse.json(
        { success: false, error: authCheck.message || 'Access denied: Only Admin and Manager roles can update product updates.' },
        { status: authCheck.status || 403 }
      );
    }

    const body = await request.json();
    const id = body.id;
    const title = body.title?.trim();
    const description = body.description?.trim();
    let slug = body.slug?.trim() || formatSlug(title);

    if (!id) {
      return NextResponse.json({ success: false, error: 'Update ID is required for update.' }, { status: 400 });
    }
    if (!title) {
      return NextResponse.json({ success: false, error: 'Title is required.' }, { status: 400 });
    }
    if (!description) {
      return NextResponse.json({ success: false, error: 'Description is required.' }, { status: 400 });
    }
    if (!slug) {
      slug = formatSlug(title);
    }

    // Check slug uniqueness excluding current record
    const existingSlug = await queryDb('SELECT id FROM updates WHERE slug = $1 AND id != $2 LIMIT 1', [slug, id]);
    if (existingSlug.rows.length > 0) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const res = await queryDb(
      `UPDATE updates SET title = $1, description = $2, slug = $3 WHERE id = $4 RETURNING *`,
      [title, description, slug, id]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Update record not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, record: res.rows[0], message: 'Update saved successfully.' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE RECORD
export async function DELETE(request) {
  try {
    const authCheck = await isManagerOrAdmin(request);
    if (!authCheck.success) {
      return NextResponse.json(
        { success: false, error: authCheck.message || 'Access denied: Only Admin and Manager roles can delete product updates.' },
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
      return NextResponse.json({ success: false, error: 'Update ID is required.' }, { status: 400 });
    }

    await queryDb('DELETE FROM updates WHERE id = $1', [id]);
    return NextResponse.json({ success: true, message: 'Update deleted successfully.' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
