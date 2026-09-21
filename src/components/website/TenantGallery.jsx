'use client';

import { useState } from 'react';
import { BiImage, BiX } from 'react-icons/bi';

export default function TenantGallery({ gallery = [], primaryColor = '#6366f1' }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeCategory, setActiveCategory] = useState('ALL');

  if (!gallery || gallery.length === 0) return null;

  const categories = ['ALL', ...new Set(gallery.map((g) => g.category || 'Portfolio'))];

  const filteredItems = activeCategory === 'ALL'
    ? gallery
    : gallery.filter((g) => (g.category || 'Portfolio') === activeCategory);

  return (
    <section id="gallery" className="py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-2">
          <span
            className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800"
            style={{ color: primaryColor }}
          >
            Visual Showcase
          </span>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Portfolio Gallery
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Curated snapshots, UI/UX designs, case studies, and engineering projects.
          </p>
        </div>

        {/* Category Filters */}
        {categories.length > 2 && (
          <div className="flex flex-wrap items-center justify-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  activeCategory === cat
                    ? 'text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
                style={activeCategory === cat ? { backgroundColor: primaryColor } : {}}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Media Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredItems.map((item, idx) => (
            <div
              key={item.id || idx}
              onClick={() => setSelectedImage(item)}
              className="rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 relative group cursor-pointer aspect-4/3 shadow-xs hover:shadow-lg transition-all"
            >
              {item.image_url ? (
                <img
                  src={item.image_url}
                  alt={item.title || 'Gallery item'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                  <BiImage className="text-4xl" />
                  <span className="text-xs font-semibold">{item.title}</span>
                </div>
              )}

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-5 flex flex-col justify-end text-white">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                  {item.category || 'Portfolio'}
                </span>
                <h4 className="text-sm font-bold mt-0.5">{item.title}</h4>
                {item.caption && (
                  <p className="text-xs text-slate-200 line-clamp-2 mt-1 font-light">
                    {item.caption}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-16/9 bg-slate-900 flex items-center justify-center">
              {selectedImage.image_url ? (
                <img
                  src={selectedImage.image_url}
                  alt={selectedImage.title}
                  className="w-full h-full object-contain"
                />
              ) : (
                <BiImage className="text-6xl text-slate-500" />
              )}
              <button
                type="button"
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-900/70 text-white flex items-center justify-center hover:bg-slate-900 transition-colors cursor-pointer"
              >
                <BiX className="text-2xl" />
              </button>
            </div>
            <div className="p-6 space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {selectedImage.category || 'Portfolio Showcase'}
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {selectedImage.title}
              </h3>
              {selectedImage.caption && (
                <p className="text-xs text-slate-600 dark:text-slate-300 pt-1 leading-relaxed">
                  {selectedImage.caption}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
