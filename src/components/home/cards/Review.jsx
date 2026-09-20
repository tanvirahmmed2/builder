import React from 'react';
import { BiUser, BiStar, BiCheckShield, BiCube } from 'react-icons/bi';

export default function Review({ review }) {
  if (!review) return null;

  const name = review.creator_name || review.name || 'Verified Creator';
  const avatar = review.creator_avatar || null;
  const rating = Number(review.rating || 5);
  const packageName = review.package_name || review.country || 'Subscriber';

  return (
    <div className="w-[320px] sm:w-[380px] bg-white border border-slate-200 rounded-3xl p-6 flex flex-col justify-between gap-4 shrink-0 shadow-xs hover:shadow-md transition-all">
      <div className="space-y-3">
        {/* Star Rating & Verified Pill */}
        <div className="flex items-center justify-between">
          <div className="flex text-amber-400 text-sm">
            {[1, 2, 3, 4, 5].map((s) => (
              <BiStar
                key={s}
                className={s <= rating ? 'fill-current' : 'opacity-25'}
              />
            ))}
          </div>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
            <BiCheckShield className="text-xs" />
            <span>Verified</span>
          </span>
        </div>

        {review.title && (
          <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
            {review.title}
          </h4>
        )}

        <p className="text-xs text-slate-600 leading-relaxed italic line-clamp-4 min-h-[4.5rem]">
          &ldquo;{review.comment}&rdquo;
        </p>
      </div>

      {/* Author Details */}
      <div className="pt-3 border-t border-slate-100 flex items-center gap-3">
        {avatar ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={avatar}
            alt={name}
            className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
            {name.charAt(0).toUpperCase()}
          </div>
        )}

        <div className="flex flex-col min-w-0">
          <p className="text-xs font-bold text-slate-900 truncate">{name}</p>
          <p className="text-[11px] text-slate-500 truncate flex items-center gap-1">
            <BiCube className="text-indigo-500 text-xs" />
            <span>{packageName}</span>
          </p>
        </div>
      </div>
    </div>
  );
}