import { NextResponse } from 'next/server';
import { dbStore } from '@/lib/db/store';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const subdomain = searchParams.get('subdomain') || 'alex-design';

    const portfolio = dbStore.getPortfolioBySubdomain(subdomain);
    if (!portfolio) {
      return NextResponse.json({ success: false, error: 'Portfolio not found' }, { status: 404 });
    }

    const sections = dbStore.getSectionsByPortfolioId(portfolio.id);
    const blogs = dbStore.getBlogsByPortfolioId(portfolio.id);
    const appointments = dbStore.getAppointmentsByPortfolioId(portfolio.id);
    const experiences = dbStore.getExperiencesByPortfolioId(portfolio.id);
    const reviews = dbStore.getReviewsByPortfolioId(portfolio.id);

    return NextResponse.json({
      success: true,
      portfolio,
      sections,
      blogs,
      appointments,
      experiences,
      reviews,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { action } = body;

    // 1. Visitor Book Appointment
    if (action === 'book_appointment') {
      const appt = dbStore.bookAppointment(body.appointmentData);
      return NextResponse.json({ success: true, appointment: appt });
    }

    // 2. Visitor Submit Review
    if (action === 'submit_review') {
      const review = dbStore.submitReview(body.reviewData);
      return NextResponse.json({ success: true, review });
    }

    // 3. User Submit Problem Report
    if (action === 'submit_report') {
      const report = dbStore.createReport(body.reportData);
      return NextResponse.json({ success: true, report });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
