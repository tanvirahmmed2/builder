'use client';
import React, { useContext, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { WebsiteContext } from '@/components/website/context/WebsiteContext';
import { BiCalendar, BiUser, BiRightArrowAlt, BiNews } from 'react-icons/bi';

export default function StoreBlogsPage() {
  const { website } = useContext(WebsiteContext) || {};
  const params = useParams();
  const domain = params?.domain || '';
  const basePrefix = domain ? `/${domain}` : '';

  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchBlogs() {
      try {
        const res = await axios.get(`/api/${domain}/home/blogs`);
        if (res.data?.success && isMounted) {
          setBlogs(res.data.data.blogs || []);
          setCategories(res.data.data.categories || []);
        }
      } catch (err) {
        console.error('Failed to load blogs:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (domain) fetchBlogs();
    return () => {
      isMounted = false;
    };
  }, [domain]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Insights</span>
        <h1 className="text-4xl font-extrabold text-white">Articles & Updates</h1>
        <p className="text-sm text-slate-400">
          Latest company announcements, technology articles, and product tutorials.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {blogs.length > 0 ? (
          blogs.map((b) => (
            <article
              key={b.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40 hover:bg-slate-900/80 transition-all hover:border-blue-500/30"
            >
              <div className="aspect-video w-full bg-slate-800 overflow-hidden">
                {b.thumbnail_url ? (
                  <img src={b.thumbnail_url} alt={b.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-slate-600">
                    <BiNews className="text-4xl" />
                  </div>
                )}
              </div>
              <div className="p-6 flex flex-1 flex-col">
                <div className="flex items-center gap-4 text-xs text-slate-400 mb-2">
                  <span className="flex items-center gap-1">
                    <BiCalendar />
                    {new Date(b.published_at || Date.now()).toLocaleDateString()}
                  </span>
                  {b.author_name && (
                    <span className="flex items-center gap-1">
                      <BiUser />
                      {b.author_name}
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-white hover:text-blue-400 transition-colors">
                  <Link href={`${basePrefix}/blogs/${b.slug}`}>{b.title}</Link>
                </h3>
                <p className="mt-2 text-xs text-slate-400 line-clamp-3 leading-relaxed flex-1">
                  {b.summary || 'Read the full article to discover in-depth insights and updates.'}
                </p>
                <div className="mt-4 pt-4 border-t border-white/5">
                  <Link
                    href={`${basePrefix}/blogs/${b.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300"
                  >
                    <span>Read Article</span>
                    <BiRightArrowAlt />
                  </Link>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="col-span-full py-16 text-center text-slate-500">
            <BiNews className="mx-auto text-4xl mb-2" />
            <p>No articles published yet. Stay tuned for future stories.</p>
          </div>
        )}
      </div>
    </div>
  );
}

