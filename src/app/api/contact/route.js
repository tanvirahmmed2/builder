import { NextResponse } from 'next/server';
import { dbStore } from '@/lib/db/store';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ success: false, error: 'Name, email and message are required.' }, { status: 400 });
    }

    const contact = dbStore.addContact({
      name,
      email,
      subject: subject || 'General Inquiry',
      message,
    });

    return NextResponse.json({ success: true, contact });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
