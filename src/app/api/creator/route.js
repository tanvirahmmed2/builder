import { NextResponse } from 'next/server';
import { dbStore } from '@/lib/db/store';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const creatorId = searchParams.get('creatorId') || 'c0000000-0000-0000-0000-000000000001';

    const creator = dbStore.getCreatorById(creatorId);
    const portfolio = dbStore.getPortfolioByCreatorId(creatorId);
    const creators = dbStore.getCreators();

    const portfolioId = portfolio?.id || 'd0000000-0000-0000-0000-000000000001';
    const blogs = dbStore.getBlogsByPortfolioId(portfolioId);
    const appointments = dbStore.getAppointmentsByPortfolioId(portfolioId);
    const experiences = dbStore.getExperiencesByPortfolioId(portfolioId);
    const reviews = dbStore.getReviewsByPortfolioId(portfolioId);
    const packages = dbStore.getPackages();

    return NextResponse.json({
      success: true,
      creator,
      portfolio,
      creators,
      blogs,
      appointments,
      experiences,
      reviews,
      packages,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { action } = body;

    // 1. Creator Registration
    if (action === 'register') {
      const creator = dbStore.registerCreator(body.creatorData);
      return NextResponse.json({ success: true, creator });
    }

    // 2. Creator Account Recovery
    if (action === 'recover') {
      const result = dbStore.recoverCreatorAccount(body.email);
      return NextResponse.json({ success: true, ...result });
    }

    // 3. Purchase Package & Create Subscription -> Auto Provision Tenant Portfolio
    if (action === 'purchase_subscription') {
      const result = dbStore.purchasePackageAndSubscribe({
        creatorId: body.creatorId || 'c0000000-0000-0000-0000-000000000001',
        packageId: body.packageId,
        paymentMethod: body.paymentMethod || 'CARD',
      });
      return NextResponse.json({ success: true, ...result });
    }

    // 4. Update Role between 'creator' and 'manager'
    if (action === 'update_role') {
      const updated = dbStore.updateCreatorRole(body.creatorId, body.role);
      return NextResponse.json({ success: true, creator: updated });
    }

    // 5. Blog Module: Create post
    if (action === 'create_blog') {
      const blog = dbStore.createBlog(body.blogData);
      return NextResponse.json({ success: true, blog });
    }
    if (action === 'delete_blog') {
      const removed = dbStore.deleteBlog(body.id);
      return NextResponse.json({ success: true, removed });
    }

    // 6. Appointment Module: Update status
    if (action === 'update_appointment') {
      const appt = dbStore.updateAppointmentStatus(body.id, body.status);
      return NextResponse.json({ success: true, appointment: appt });
    }

    // 7. Experience Module: Create experience
    if (action === 'create_experience') {
      const exp = dbStore.createExperience(body.experienceData);
      return NextResponse.json({ success: true, experience: exp });
    }
    if (action === 'delete_experience') {
      const removed = dbStore.deleteExperience(body.id);
      return NextResponse.json({ success: true, removed });
    }

    // 8. Reviews Module: Moderate review
    if (action === 'moderate_review') {
      const rev = dbStore.moderateReview(body.id, body.status);
      return NextResponse.json({ success: true, review: rev });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
