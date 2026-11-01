import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';
import { resolveWebsiteFromRequest } from '@/lib/middleware/user';

export async function GET(req, { params }) {
  try {
    const { domain } = await params;
    const website = await resolveWebsiteFromRequest(req, domain);

    if (!website) {
      return NextResponse.json({ success: false, error: 'Website not found' }, { status: 404 });
    }

    const websiteId = website.id;
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');

    if (slug) {
      const blogRes = await queryDb(
        `SELECT b.id, b.title, b.slug, b.summary, b.content, b.thumbnail_url, b.published_at, b.view_count,
                s.first_name AS author_name
         FROM website_blogs b
         LEFT JOIN website_staffs s ON b.author_id = s.id AND s.website_id = $1
         WHERE b.website_id = $1 AND b.slug = $2 AND b.is_published = TRUE
         LIMIT 1`,
        [websiteId, slug]
      );

      if (blogRes.rows.length === 0) {
        return NextResponse.json({ success: false, error: 'Blog not found' }, { status: 404 });
      }

      // Increment view count
      await queryDb('UPDATE website_blogs SET view_count = view_count + 1 WHERE id = $1 AND website_id = $2', [blogRes.rows[0].id, websiteId]);

      return NextResponse.json({ success: true, data: blogRes.rows[0] });
    }

    const [blogsRes, categoriesRes] = await Promise.all([
      queryDb(
        `SELECT b.id, b.title, b.slug, b.summary, b.thumbnail_url, b.published_at, b.view_count,
                s.first_name AS author_name
         FROM website_blogs b
         LEFT JOIN website_staffs s ON b.author_id = s.id AND s.website_id = $1
         WHERE b.website_id = $1 AND b.is_published = TRUE
         ORDER BY b.published_at DESC LIMIT 30`,
        [websiteId]
      ),
      queryDb('SELECT id, name, slug FROM website_blog_categories WHERE website_id = $1 AND is_active = TRUE', [websiteId])
    ]);

    return NextResponse.json({
      success: true,
      data: {
        blogs: blogsRes.rows,
        categories: categoriesRes.rows
      }
    });
  } catch (error) {
    console.error('Home blogs API error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch blogs' }, { status: 500 });
  }
}

