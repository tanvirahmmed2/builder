'use client';

import Image from 'next/image';
import Link from 'next/link';
import { BiGridAlt, BiRightArrowAlt, BiCheckCircle, BiImage, BiCube } from 'react-icons/bi';

export default function HomeServiceCard({ service, app }) {
  const item = service || app;
  const images = Array.isArray(item?.images) ? item.images : [];
  const primaryImage = images.find((img) => img.is_primary) || images[0];
  const imageUrl = primaryImage?.image || primaryImage?.url || null;

  // Clean description HTML tags for preview text
  const cleanSnippet = item?.description
    ? item.description.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
    : '';

  return (
    <div className="group rounded-3xl bg-white border border-slate-200/80 hover:border-secondary/40 transition-all duration-300 shadow-xs hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between overflow-hidden">
      <Link href={`/services/${item?.slug}`}>
        {/* Cover / Image Preview Area */}
        <div className="relative aspect-16/10 overflow-hidden bg-slate-900 flex items-center justify-center">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={item?.title || 'Service Cover'}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-linear-to-br from-slate-900 via-slate-800 to-slate-950 flex flex-col items-center justify-center text-slate-400 p-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-white mb-2 shadow-inner">
                <BiCube className="text-3xl" />
              </div>
              <span className="text-xs font-semibold tracking-wider uppercase text-slate-400">
                {item?.title}
              </span>
            </div>
          )}

          {item?.badge && (
            <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-secondary text-white shadow-md">
              {item.badge}
            </span>
          )}

          {/* Screenshot counter pill if multiple images */}
          {images.length > 1 && (
            <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-white font-mono text-[10px] flex items-center gap-1">
              <BiImage className="text-xs" /> {images.length}
            </div>
          )}
        </div>

        {/* Content Details */}
        <div className="p-6 space-y-3">
          <div>
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-secondary transition-colors tracking-tight">
                {item?.title}
              </h3>
            </div>
          </div>

          {item?.short_description && (
            <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
              {item.short_description}
            </p>
          )}

          {!item?.short_description && cleanSnippet && (
            <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
              {cleanSnippet}
            </p>
          )}

          {/* Feature Modules preview pills */}
          {Array.isArray(item?.modules) && item.modules.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2">
              {item.modules.slice(0, 3).map((mod, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700"
                >
                  <BiCheckCircle className="text-secondary text-xs" />
                  <span>{mod.name || mod.module_name}</span>
                </span>
              ))}
              {item.modules.length > 3 && (
                <span className="text-[10px] text-slate-400 self-center font-semibold">
                  +{item.modules.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>
      </Link>

      {/* Card Footer Actions */}
      <div className="px-6 py-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
        <Link
          href={`/packages?service=${item?.slug}`}
          className="text-xs font-bold text-secondary hover:text-secondary-dark flex items-center gap-1 group/btn"
        >
          <span>View Plans</span>
          <BiRightArrowAlt className="text-base group-hover/btn:translate-x-0.5 transition-transform" />
        </Link>
        <Link
          href={`/services/${item?.slug}`}
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          Learn More &rarr;
        </Link>
      </div>
    </div>
  );
}

