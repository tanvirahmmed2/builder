import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';
import { getControlAuth } from '@/lib/website-control';

export async function GET(request, context) {
  try {
    const { website, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const res = await queryDb(
      `SELECT id, folder_id, file_name, file_url, public_id, file_type, mime_type, file_size, width, height, alt_text, created_at, updated_at
       FROM website_media
       WHERE website_id = $1
       ORDER BY id DESC`,
      [website.id]
    );

    return NextResponse.json(res.rows);
  } catch (error) {
    console.error('Media GET error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request, context) {
  try {
    const { website, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const body = await request.json();
    const { file_name, file_url, file_type = 'image', mime_type = 'image/jpeg', file_size = 0, alt_text = '' } = body;

    if (!file_name?.trim() || !file_url?.trim()) {
      return NextResponse.json({ success: false, error: 'File name and file URL are required' }, { status: 400 });
    }

    const res = await queryDb(
      `INSERT INTO website_media (website_id, file_name, file_url, file_type, mime_type, file_size, alt_text, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
       RETURNING *`,
      [website.id, file_name.trim(), file_url.trim(), file_type, mime_type, Number(file_size) || 0, alt_text]
    );

    return NextResponse.json({ success: true, media: res.rows[0] });
  } catch (error) {
    console.error('Media POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

