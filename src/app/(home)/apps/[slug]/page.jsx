'use client';

import { useState, useEffect, use } from 'react';
import axios from 'axios';
import Link from 'next/link';
import {
  BiArrowBack,
  BiCheckCircle,
  BiGridAlt,
  BiImage,
  BiRocket,
  BiRightArrowAlt,
} from 'react-icons/bi';

export default function SingleAppPage({ params }) {
  const unwrappedParams = use(params);
  const slug = unwrappedParams?.slug;

  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    if (!slug) return;

    const fetchAppDetail = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get(`/api/apps?slug=${encodeURIComponent(slug)}`);
        if (res.data?.success && res.data?.app) {
          setApp(res.data.app);
        } else {
          setError(res.data?.error || 'Application not found.');
        }
      } catch (err) {
        setError(err.response?.data?.error || err.message || 'Failed to load application.');
      } finally {
        setLoading(false);
      }
    };

    fetchAppDetail();
  }, [slug]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-secondary/10 text-secondary border border-secondary/20 flex items-center justify-center mx-auto animate-spin text-2xl">
            <BiRocket />
          </div>
          <p className="text-xs font-semibold text-slate-500">Loading application details...</p>
        </div>
      </main>
    );
  }

  if (error || !app) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xs text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto text-2xl">
            <BiGridAlt />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Application Unavailable</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            {error || 'The requested application could not be found or has not been published.'}
          </p>
          <Link
            href="/apps"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
          >
            <BiArrowBack /> Back to Apps Directory
          </Link>
        </div>
      </main>
    );
  }

  const images = Array.isArray(app.images) ? app.images : [];
  const currentImgObj = images[activeImageIndex] || images[0] || null;
  const activeImage = currentImgObj?.image || currentImgObj?.url || null;

  return (
    <main className="min-h-screen bg-slate-50/70 pb-20">
      {/* Top Breadcrumbs & Hero */}
      <section className="bg-slate-950 text-white pt-10 pb-12 px-4 lg:px-8 border-b border-white/10">
        <div className="max-w-6xl mx-auto space-y-6">
          <Link
            href="/apps"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <BiArrowBack className="text-sm" /> All Applications
          </Link>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-bold uppercase tracking-wider">
                <BiCheckCircle /> Published Ecosystem App
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">{app.title}</h1>
              {app.short_description && (
                <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
                  {app.short_description}
                </p>
              )}
            </div>

            <Link
              href="/creator/login"
              className="px-6 py-3 rounded-2xl bg-secondary hover:bg-secondary-dark text-white font-bold text-xs sm:text-sm shadow-xl flex items-center justify-center gap-2 self-start md:self-auto transition-all hover:scale-105 shrink-0"
            >
              <span>Deploy Application</span>
              <BiRightArrowAlt className="text-lg" />
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="max-w-6xl mx-auto px-4 lg:px-8 pt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Media Gallery & Rich Description */}
        <div className="lg:col-span-2 space-y-8">
          {/* Main Gallery Display */}
          {images.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-xs space-y-3">
              <div className="aspect-16/10 rounded-2xl overflow-hidden bg-slate-900 border border-slate-100 flex items-center justify-center">
                {activeImage ? (
                  <img
                    src={activeImage}
                    alt={app.title}
                    className="w-full h-full object-cover transition-all duration-300"
                  />
                ) : (
                  <div className="text-slate-500 text-sm flex items-center gap-2">
                    <BiImage className="text-xl" /> Preview Unavailable
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2.5 overflow-x-auto py-1">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      className={`w-16 h-12 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                        idx === activeImageIndex
                          ? 'border-secondary shadow-xs scale-105'
                          : 'border-slate-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img.image || img.url} alt={img.title || app.title} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Full Rich Text Capabilities (Tiptap HTML Output) */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
            <h2 className="text-lg font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
              <BiRocket className="text-primary" /> Application Details & Features
            </h2>

            {app.description ? (
              <div
                className="prose prose-slate max-w-none text-sm text-slate-700 leading-relaxed [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-slate-900 [&_h3]:text-sm [&_h3]:font-bold [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_blockquote]:border-l-4 [&_blockquote]:border-secondary [&_blockquote]:pl-3 [&_blockquote]:italic"
                dangerouslySetInnerHTML={{ __html: app.description }}
              />
            ) : (
              <p className="text-xs text-slate-500 italic">No detailed description provided.</p>
            )}
          </div>
        </div>

        {/* Right Sidebar: App Specs & Integration */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Application Info</h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-400">Route Endpoint</span>
                <span className="font-mono font-semibold text-slate-700">/apps/{app.slug}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-400">Status</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1">
                  <BiCheckCircle /> Active
                </span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-400">Visual Assets</span>
                <span className="font-semibold text-slate-700">{images.length} Image{images.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Updated</span>
                <span className="font-semibold text-slate-700">
                  {new Date(app.updated_at || app.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="pt-3">
              <Link
                href="/creator/login"
                className="w-full py-2.5 rounded-xl bg-secondary hover:bg-secondary-dark text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                <span>Launch with this App</span>
                <BiRightArrowAlt className="text-base" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
