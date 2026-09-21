'use client';

import Link from 'next/link';
import { BiCheckCircle, BiCodeAlt } from 'react-icons/bi';

export default function TenantServices({ services = [], primaryColor = '#6366f1', subdomain = '' }) {
  if (!services || services.length === 0) return null;

  return (
    <section id="services" className="py-16 bg-slate-50/70 dark:bg-slate-900/40 border-y border-slate-200/80 dark:border-slate-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-2">
          <span
            className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-slate-200/60 dark:bg-slate-800"
            style={{ color: primaryColor }}
          >
            Capabilities & Packages
          </span>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Services & Solutions
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
            Comprehensive offerings tailored to your business roadmap and technical requirements.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((s, idx) => {
            const features = Array.isArray(s.features) ? s.features : [];
            const price = s.price_starting_at ? `$${s.price_starting_at}` : 'Custom';

            return (
              <div
                key={s.id || idx}
                className="rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group"
              >
                <div className="space-y-4">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-2xl shadow-sm"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <BiCodeAlt />
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                      {s.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {s.description}
                    </p>
                  </div>

                  <div className="pt-2">
                    <span className="text-[11px] text-slate-400 font-medium">Starting from</span>
                    <div className="text-2xl font-black text-slate-900 dark:text-white">{price}</div>
                  </div>

                  {features.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-700 space-y-2">
                      {features.map((feat, fIdx) => (
                        <div key={fIdx} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                          <BiCheckCircle className="text-emerald-500 shrink-0 text-sm" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-6">
                  <Link
                    href={subdomain ? `/website/${subdomain}/appointments?service=${encodeURIComponent(s.title)}` : '#appointments'}
                    className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Inquire / Book Service</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
