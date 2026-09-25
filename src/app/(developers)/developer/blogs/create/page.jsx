'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BiArrowBack, BiFile, BiLoaderAlt } from 'react-icons/bi';
import BlogForm from '@/components/developer/forms/BlogForm';

export default function CreateBlogPage() {
  const router = useRouter();
  const [apps, setApps] = useState([]);
  const [loadingApps, setLoadingApps] = useState(true);

  useEffect(() => {
    async function loadApps() {
      try {
        const res = await fetch('/api/developer/apps');
        const data = await res.json();
        if (data.apps) setApps(data.apps);
        else if (data.records) setApps(data.records);
      } catch (err) {
        console.error('Failed to load apps:', err);
      } finally {
        setLoadingApps(false);
      }
    }
    loadApps();
  }, []);

  const handleSuccess = (createdBlog) => {
    const slug = createdBlog?.slug;
    if (slug) {
      router.push(`/developer/blogs/${slug}`);
    } else {
      router.push('/developer/blogs');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header and Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <Link href="/developer" className="hover:text-secondary">Dashboard</Link>
            <span>/</span>
            <Link href="/developer/blogs" className="hover:text-secondary">Blogs</Link>
            <span>/</span>
            <span className="text-slate-800 dark:text-slate-200">Create</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center text-xl">
              <BiFile />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                Create Blog Article
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Draft, format, and publish a new engineering insight, platform tutorial, or announcement.
              </p>
            </div>
          </div>
        </div>

        <Link
          href="/developer/blogs"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold transition-all cursor-pointer w-fit"
        >
          <BiArrowBack className="text-base" />
          <span>Back to Blogs</span>
        </Link>
      </div>

      {/* Editor Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs">
        {loadingApps ? (
          <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
            <BiLoaderAlt className="text-3xl animate-spin text-secondary" />
            <span className="text-xs font-medium">Preparing article studio...</span>
          </div>
        ) : (
          <BlogForm
            apps={apps}
            onSuccess={handleSuccess}
            onCancel={() => router.push('/developer/blogs')}
          />
        )}
      </div>
    </div>
  );
}
