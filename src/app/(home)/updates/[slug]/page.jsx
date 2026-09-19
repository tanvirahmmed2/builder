import Link from 'next/link';
import { notFound } from 'next/navigation';
import { queryDb } from '@/lib/db/pg';
import { SITE_NAME } from '@/lib/db/secret';
import {
  BiArrowBack,
  BiCalendar,
  BiBell,
  BiShareAlt,
  BiCheckCircle,
} from 'react-icons/bi';

async function getUpdate(slug) {
  try {
    const res = await queryDb(
      'SELECT id, title, description, slug, created_at, updated_at FROM updates WHERE slug = $1 LIMIT 1',
      [slug]
    );
    if (res.rows.length === 0) return null;
    return res.rows[0];
  } catch (err) {
    console.error('Error fetching update:', err);
    return null;
  }
}

async function getRecentUpdates(currentId) {
  try {
    const res = await queryDb(
      'SELECT id, title, slug, created_at FROM updates WHERE id != $1 ORDER BY created_at DESC LIMIT 3',
      [currentId || 0]
    );
    return res.rows;
  } catch (err) {
    return [];
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const item = await getUpdate(slug);

  if (!item) {
    return {
      title: `Update Not Found - ${SITE_NAME}`,
      description: 'The requested product update announcement could not be found.',
    };
  }

  // Strip HTML for meta description
  const cleanDesc = item.description?.replace(/<[^>]+>/g, '').slice(0, 160) || '';

  return {
    title: `${item.title} | ${SITE_NAME} Product Updates`,
    description: cleanDesc,
    openGraph: {
      title: `${item.title} | ${SITE_NAME}`,
      description: cleanDesc,
    },
  };
}

export default async function SingleUpdatePage({ params }) {
  const { slug } = await params;
  const update = await getUpdate(slug);

  if (!update) {
    notFound();
  }

  const recentUpdates = await getRecentUpdates(update.id);

  const formattedDate = new Date(update.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="w-full min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between text-xs text-slate-500">
          <Link
            href="/updates"
            className="inline-flex items-center gap-1.5 font-bold text-slate-700 hover:text-emerald-700 transition-colors"
          >
            <BiArrowBack className="text-base" />
            <span>Back to all updates</span>
          </Link>

          <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-400">
            <span>Updates</span>
            <span>/</span>
            <span className="text-slate-600 truncate max-w-[150px]">{update.slug}</span>
          </div>
        </div>

        {/* Article Main Card */}
        <article className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xs space-y-8">
          {/* Header Info */}
          <div className="space-y-4 border-b border-slate-100 pb-8">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                <BiBell className="text-sm" /> Product Update
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="inline-flex items-center gap-1 text-xs text-slate-500 font-medium">
                <BiCalendar className="text-sm text-slate-400" />
                {formattedDate}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {update.title}
            </h1>
          </div>

          {/* Description Content with TipTap Rich Typography */}
          <div
            className="prose prose-slate max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-slate-900 prose-p:text-slate-600 prose-p:leading-relaxed prose-li:text-slate-600 prose-code:text-emerald-700 prose-code:bg-slate-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-pre:rounded-xl prose-blockquote:border-emerald-600 prose-blockquote:text-slate-700"
            dangerouslySetInnerHTML={{ __html: update.description }}
          />

          {/* Footer Callout */}
          <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <BiCheckCircle className="text-emerald-600 text-base" />
              <span>Published by {SITE_NAME} Engineering Team</span>
            </div>

            <Link
              href="/updates"
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold transition-colors"
            >
              View All Releases
            </Link>
          </div>
        </article>

        {/* Other Recent Updates */}
        {recentUpdates.length > 0 && (
          <div className="space-y-4 pt-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Recent Announcements
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {recentUpdates.map((rec) => (
                <Link
                  key={rec.id}
                  href={`/updates/${rec.slug}`}
                  className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:border-emerald-300 hover:shadow-sm transition-all block group"
                >
                  <p className="text-[11px] text-slate-400 mb-1">
                    {new Date(rec.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                  <h4 className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 transition-colors line-clamp-2">
                    {rec.title}
                  </h4>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
