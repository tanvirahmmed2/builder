import { NextResponse } from 'next/server';
import { dbStore } from '@/lib/db/store';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const portfolioId = searchParams.get('portfolioId') || 'd0000000-0000-0000-0000-000000000001';

    const portfolio = dbStore.getPortfolioById(portfolioId);
    const sections = dbStore.getSectionsByPortfolioId(portfolioId);

    return NextResponse.json({
      success: true,
      portfolio,
      sections,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, portfolioId } = body;

    // 1. Reorder sections
    if (action === 'reorder_sections') {
      const sections = dbStore.updateSectionOrder(portfolioId, body.orderedSectionIds);
      return NextResponse.json({ success: true, sections });
    }

    // 2. Add new section
    if (action === 'add_section') {
      const section = dbStore.createSection(portfolioId, body.sectionData);
      return NextResponse.json({ success: true, section });
    }

    // 3. Update section content or styles
    if (action === 'update_section') {
      const section = dbStore.updateSection(body.id, body.updates);
      return NextResponse.json({ success: true, section });
    }

    // 4. Delete section
    if (action === 'delete_section') {
      const removed = dbStore.deleteSection(body.id);
      return NextResponse.json({ success: true, removed });
    }

    // 5. Publish portfolio
    if (action === 'publish_portfolio') {
      const updated = dbStore.updatePortfolio(portfolioId, { isPublished: body.isPublished });
      return NextResponse.json({ success: true, portfolio: updated });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
