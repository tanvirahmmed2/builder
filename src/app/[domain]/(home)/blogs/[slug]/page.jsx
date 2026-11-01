'use client';
import React, { useContext, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { WebsiteContext } from '@/components/website/context/WebsiteContext';
import { BiCalendar, BiUser, BiArrowBack, BiShareAlt } from 'react-icons/bi';

export default function BlogDetailPage() {
  const { website } = useContext(WebsiteContext) || {};
  const params = useParams();
  const domain = params?.domain || '';
  const slug = params?.slug || '';
  const basePrefix = domain ? `/${domain}` : '';

  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchBlog() {
      try {
        const res = await axios.get(`/api/${domain}/home/blogs?slug=${slug}`);
        if (res.data?.success && isMounted) {
          setBlog(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load blog:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (domain && slug) fetchBlog();
    return () => {
      isMounted = false;
    };
  }, [domain, slug]);

  if (loading) {
    return <div className="py-24 text-center text-slate-500">Loading article...</div>;
  }

  if (!blog) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h2 className="text-2xl font-bold text-white">Article Not Found</h2>
        <p className="mt-2 text-sm text-slate-400">The article you were looking for is unavailable.</p>
        <Link
          href={`${basePrefix}/blogs`}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500"
        >
          <BiArrowBack />
          <span>All Articles</span>
        </Link>
      </div>
    );
  }

  return (
    <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      <Link
        href={`${basePrefix}/blogs`}
        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
      >
        <BiArrowBack />
        <span>Back to Insights</span>
      </Link>

      <div className="space-y-4">
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
          {blog.title}
        </h1>

        <div className="flex items-center gap-4 text-xs text-slate-400 pb-6 border-b border-white/10">
          <span className="flex items-center gap-1.5">
            <BiCalendar className="text-blue-400" />
            {new Date(blog.published_at || Date.now()).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}
          </span>
          {blog.author_name && (
            <span className="flex items-center gap-1.5">
              <BiUser className="text-blue-400" />
              {blog.author_name}
            </span>
          )}
          <span className="text-slate-500">&bull; {blog.view_count || 1} views</span>
        </div>
      </div>

      {blog.thumbnail_url && (
        <div className="overflow-hidden rounded-3xl border border-white/10 aspect-video w-full">
          <img src={blog.thumbnail_url} alt={blog.title} className="h-full w-full object-cover" />
        </div>
      )}

      {/* Article Body */}
      <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed space-y-4 text-base">
        {blog.content ? (
          <div dangerouslySetInnerHTML={{ __html: blog.content }} />
        ) : (
          <p>{blog.summary || 'Content is being crafted for this article.'}</p>
        )}
      </div>
    </article>
  );
}

