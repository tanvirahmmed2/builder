'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BiVideo,
  BiSearch,
  BiPlayCircle,
  BiHelpCircle,
  BiCalendar,
  BiUser,
  BiArrowBack,
} from 'react-icons/bi';

function extractYoutubeId(url) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export default function TutorialsPage() {
  const [tutorials, setTutorials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadTutorials() {
      try {
        setLoading(true);
        const res = await fetch('/api/tutorials');
        const data = await res.json();
        if (data.success && Array.isArray(data.tutorials)) {
          setTutorials(data.tutorials);
        }
      } catch (err) {
        console.error('Failed to load tutorials:', err);
      } finally {
        setLoading(false);
      }
    }
    loadTutorials();
  }, []);

  const filteredTutorials = tutorials.filter((t) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      (t.title || '').toLowerCase().includes(q) ||
      (t.description || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="w-full min-h-screen bg-slate-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Hero Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-bold uppercase tracking-wider">
            <BiVideo className="text-base" />
            <span>Official Video Guides</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Learn How to Build, Customize & Scale
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            Step-by-step masterclasses covering visual portfolio building, custom domain routing, e-commerce storefronts, and team permissions.
          </p>

          {/* Search Box */}
          <div className="pt-4 max-w-xl mx-auto">
            <div className="relative">
              <BiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tutorials by topic, feature, or keyword..."
                className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-slate-800 shadow-sm focus:outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/10 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Video Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-80 bg-white rounded-3xl border border-slate-200 animate-pulse" />
            ))}
          </div>
        ) : filteredTutorials.length === 0 ? (
          <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl space-y-3 p-8">
            <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-3xl">
              <BiVideo />
            </div>
            <h3 className="font-bold text-slate-800 text-base">No tutorials matched your search</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Try searching with different keywords or clear the search filter above to explore all guides.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredTutorials.map((tut) => {
              const videoId = extractYoutubeId(tut.youtube_link);
              return (
                <div
                  key={tut.id}
                  className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-xl transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Video Player */}
                    <div className="relative aspect-video w-full bg-slate-950">
                      {videoId ? (
                        <iframe
                          src={`https://www.youtube-nocookie.com/embed/${videoId}`}
                          title={tut.title}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="w-full h-full border-0"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 space-y-2">
                          <BiPlayCircle className="text-4xl" />
                          <span className="text-xs font-semibold">Video preview unavailable</span>
                        </div>
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="p-6 space-y-3">
                      <h3 className="font-extrabold text-slate-900 text-lg group-hover:text-secondary transition-colors">
                        {tut.title}
                      </h3>
                      {tut.description && (
                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3">
                          {tut.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="p-6 pt-0 flex items-center justify-between text-xs text-slate-400 border-t border-slate-100 mt-2">
                    {tut.author_name && tut.author_name !== 'Platform Team' ? (
                      <span className="flex items-center gap-1 font-semibold text-slate-600">
                        <BiUser className="text-secondary" /> {tut.author_name}
                      </span>
                    ) : (
                      <span />
                    )}
                    <span className="flex items-center gap-1">
                      <BiCalendar /> {new Date(tut.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Support CTA */}
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 to-indigo-950 p-8 sm:p-10 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center sm:text-left">
            <h3 className="text-xl sm:text-2xl font-black">Still have questions?</h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-lg">
              Explore our comprehensive frequently asked questions or open a ticket with our dedicated customer support specialists.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/faqs"
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/20"
            >
              Browse FAQs
            </Link>
            <Link
              href="/contact"
              className="px-5 py-2.5 rounded-xl bg-secondary hover:bg-secondary/90 text-white text-xs font-bold transition-all shadow-md"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
