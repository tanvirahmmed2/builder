'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
  BiArrowBack,
  BiCalendar,
  BiUser,
  BiBookOpen,
  BiRocket,
  BiImage,
  BiRightArrowAlt,
  BiShareAlt,
  BiCheck,
} from 'react-icons/bi';

export default function SingleBlogPage({ params }) {
  const unwrappedParams = use(params);
  const slug = unwrappedParams?.slug;

  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [selectedGalleryImage, setSelectedGalleryImage] = useState(null);

  useEffect(() => {
    if (!slug) return;

    const fetchBlog = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/blogs?slug=${encodeURIComponent(slug)}`);
        const data = await res.json();
        if (data.success && data.blog) {
          setBlog(data.blog);
        } else {
          setError(data.error || 'Article not found or unpublished.');
        }
      } catch (err) {
        setError(err.message || 'Failed to load article.');
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [slug]);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-secondary/10 text-secondary border border-secondary/20 flex items-center justify-center mx-auto animate-spin text-2xl">
            <BiBookOpen />
          </div>
          <p className="text-xs font-semibold text-slate-500">Loading article...</p>
        </div>
      </main>
    );
  }

  if (error || !blog) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xs text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto text-2xl">
            <BiBookOpen />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Article Unavailable</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            {error || 'The requested article could not be found or has not been published.'}
          </p>
          <Link
            href="/blogs"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
          >
            <BiArrowBack /> Back to Articles
          </Link>
        </div>
      </main>
    );
  }

  const galleryImages = Array.isArray(blog.images) ? blog.images : [];
  const publishedDate = blog.published_at
    ? new Date(blog.published_at).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  return (
    <main className="min-h-screen bg-slate-50/60 pb-24">
      {/* Top Header & Breadcrumb */}
      <section className="bg-slate-950 text-white pt-10 pb-16 px-4 lg:px-8 border-b border-white/10">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <Link
              href="/blogs"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              <BiArrowBack className="text-sm" /> All Articles
            </Link>

            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-semibold transition-colors cursor-pointer border border-white/10"
            >
              {copied ? <BiCheck className="text-emerald-400 text-sm" /> : <BiShareAlt className="text-sm" />}
              <span>{copied ? 'Link Copied!' : 'Share'}</span>
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              {blog.app_title ? (
                <Link
                  href={`/apps/${blog.app_slug}`}
                  className="inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1 rounded-full bg-indigo-900/70 text-indigo-200 border border-indigo-500/30 hover:bg-indigo-900 transition-colors"
                >
                  <BiRocket className="text-xs" /> {blog.app_title}
                </Link>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1 rounded-full bg-white/10 text-primary border border-white/15">
                  <BiBookOpen className="text-xs" /> Platform Guide
                </span>
              )}

              {publishedDate && (
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  <BiCalendar className="text-sm" /> {publishedDate}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
              {blog.title}
            </h1>

            {blog.summary && (
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-light">
                {blog.summary}
              </p>
            )}

            {blog.author_name && (
              <div className="flex items-center gap-2 pt-2 text-xs text-slate-400">
                <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                  <BiUser />
                </div>
                <span>By <strong className="text-white">{blog.author_name}</strong></span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Body & Gallery */}
      <article className="max-w-4xl mx-auto px-4 lg:px-8 -mt-8 space-y-10">
        {/* Cover Image */}
        {blog.cover_image && (
          <div className="rounded-3xl overflow-hidden shadow-2xl border border-slate-200 bg-slate-900 aspect-16/9">
            <img
              src={blog.cover_image}
              alt={blog.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Content Box */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xs space-y-6">
          <div className="prose prose-slate max-w-none text-slate-800 text-sm sm:text-base leading-relaxed whitespace-pre-line font-sans">
            {blog.content}
          </div>
        </div>

        {/* blogs_image Supplementary Gallery */}
        {galleryImages.length > 0 && (
          <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <BiImage className="text-primary text-xl" /> Article Visual Gallery
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Screenshots, diagrams, and illustrative assets attached to this article.
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                {galleryImages.length} Image{galleryImages.length === 1 ? '' : 's'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {galleryImages.map((img) => (
                <div
                  key={img.id}
                  className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 group hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedGalleryImage(img)}
                >
                  <div className="aspect-16/10 overflow-hidden bg-slate-900">
                    <img
                      src={img.image_url}
                      alt={img.alt_text || blog.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  {(img.alt_text || img.caption) && (
                    <div className="p-3 text-xs space-y-0.5">
                      {img.alt_text && (
                        <div className="font-bold text-slate-800">{img.alt_text}</div>
                      )}
                      {img.caption && (
                        <div className="text-slate-500 italic text-[11px]">&ldquo;{img.caption}&rdquo;</div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Modal for full image zoom */}
        {selectedGalleryImage && (
          <div
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-xs cursor-pointer"
            onClick={() => setSelectedGalleryImage(null)}
          >
            <div className="max-w-4xl max-h-[90vh] bg-white rounded-2xl overflow-hidden p-2 shadow-2xl relative">
              <img
                src={selectedGalleryImage.image_url}
                alt={selectedGalleryImage.alt_text || 'Full image'}
                className="max-h-[80vh] w-auto mx-auto object-contain rounded-xl"
              />
              {selectedGalleryImage.caption && (
                <p className="text-center text-xs text-slate-600 font-medium py-2">
                  {selectedGalleryImage.caption}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Associated App Promotion Banner */}
        {blog.app_title && (
          <div className="bg-linear-to-r from-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-indigo-500/20 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center sm:text-left">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Integrated Application
              </span>
              <h3 className="text-xl font-bold">{blog.app_title}</h3>
              <p className="text-xs text-slate-300 max-w-md">
                Deploy this pre-built vertical application directly to your creator workspace with one click.
              </p>
            </div>

            <Link
              href={`/apps/${blog.app_slug}`}
              className="px-5 py-2.5 rounded-xl bg-secondary hover:bg-secondary-dark text-white font-bold text-xs shadow-md flex items-center gap-1.5 transition-all hover:scale-105 shrink-0 cursor-pointer"
            >
              <span>Explore {blog.app_title}</span>
              <BiRightArrowAlt className="text-base" />
            </Link>
          </div>
        )}

        {/* Back Link */}
        <div className="pt-4 text-center">
          <Link
            href="/blogs"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:border-slate-300 text-xs font-bold transition-all shadow-xs"
          >
            <BiArrowBack className="text-base" /> Back to All Articles
          </Link>
        </div>
      </article>
    </main>
  );
}
