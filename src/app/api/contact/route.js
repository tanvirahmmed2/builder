import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ success: false, error: 'Name, email and message are required.' }, { status: 400 });
    }

    const res = await queryDb(
      `INSERT INTO contacts (name, email, subject, message) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [name, email, subject || 'General Inquiry', message]
    );

    return NextResponse.json({ success: true, contact: res.rows[0] });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
