'use client';

export default function WebsiteStatsCard({ title, value, subtext, icon: Icon, color = '#6366f1' }) {
  return (
    <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-between gap-4">
      <div className="space-y-1">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
          {title}
        </span>
        <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          {value}
        </div>
        {subtext && (
          <span className="text-[11px] text-slate-400 font-medium block">
            {subtext}
          </span>
        )}
      </div>

      {Icon && (
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-2xl shadow-sm shrink-0"
          style={{ backgroundColor: color }}
        >
          <Icon />
        </div>
      )}
    </div>
  );
}
