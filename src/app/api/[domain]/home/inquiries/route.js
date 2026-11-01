import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';
import { resolveWebsiteFromRequest } from '@/lib/middleware/user';

export async function POST(req, { params }) {
  try {
    const { domain } = await params;
    const website = await resolveWebsiteFromRequest(req, domain);

    if (!website) {
      return NextResponse.json({ success: false, error: 'Website not found' }, { status: 404 });
    }

    const websiteId = website.id;
    const body = await req.json();
    const { type, name, email, phone, subject, message, appointmentDate, startTime, serviceName } = body;

    if (!name || (!email && !phone)) {
      return NextResponse.json({ success: false, error: 'Name and email or phone are required' }, { status: 400 });
    }

    if (type === 'appointment') {
      const res = await queryDb(
        `INSERT INTO website_appointments (website_id, appointment_date, start_time, end_time, service_name, note, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'scheduled')
         RETURNING id`,
        [
          websiteId,
          appointmentDate || new Date().toISOString().split('T')[0],
          startTime || '10:00:00',
          startTime ? `${parseInt(startTime.split(':')[0], 10) + 1}:00:00` : '11:00:00',
          serviceName || 'General Consultation',
          `Booked by ${name} (${email || phone}). Note: ${message || 'None'}`
        ]
      );

      return NextResponse.json({
        success: true,
        message: 'Appointment request received successfully',
        data: { id: res.rows[0].id }
      });
    }

    // Default: General contact inquiry
    const res = await queryDb(
      `INSERT INTO website_contacts (website_id, name, email, phone, subject, message, status, is_read)
       VALUES ($1, $2, $3, $4, $5, $6, 'new', FALSE)
       RETURNING id`,
      [websiteId, name, email || '', phone || '', subject || 'Website Contact Form', message || '']
    );

    return NextResponse.json({
      success: true,
      message: 'Your message has been sent successfully',
      data: { id: res.rows[0].id }
    });
  } catch (error) {
    console.error('Home inquiries API error:', error);
    return NextResponse.json({ success: false, error: 'Failed to submit inquiry' }, { status: 500 });
  }
}

