import { ExternalLinkIcon, StarIcon } from '@/components/ui/Icons'
import React from 'react'
import Link from 'next/link'

const Theme = ({theme}) => {
  const t=theme
  return (
    <div
            key={t.id}
            className="group rounded-3xl bg-slate-900/60 border border-white/10 overflow-hidden shadow-2xl hover:border-indigo-500/40 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="relative aspect-16/10 overflow-hidden bg-slate-950">
               
                {t.isPremium ? (
                  <span className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-linear-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-[10px] tracking-wider uppercase shadow flex items-center gap-1">
                    <StarIcon filled className="w-3 h-3 text-slate-950" />
                    PREMIUM
                  </span>
                ) : (
                  <span className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur border border-white/10 text-white font-bold text-[10px] uppercase">
                    INCLUDED
                  </span>
                )}
              </div>

              {/* Details */}
              <div className="p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white tracking-tight">{t.name}</h3>
                  <span className="text-[11px] text-indigo-400 font-mono font-semibold uppercase">
                    {t.category}
                  </span>
                </div>
                {t.description && (
                  <p className="text-xs text-slate-400 leading-relaxed">{t.description}</p>
                )}

                {/* Color Palette & Font */}
                <div className="pt-2 flex items-center justify-between border-t border-white/5 text-xs">
                  <div className="flex items-center gap-1.5">
                    {Array.isArray(t.colors) &&
                      t.colors.map((c, i) => (
                        <span
                          key={i}
                          className="w-3.5 h-3.5 rounded-full border border-white/20"
                          style={{ backgroundColor: c }}
                          title={c}
                        />
                      ))}
                  </div>
                  {t.font && (
                    <span className="text-[11px] text-slate-500 font-medium">{t.font}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 pt-0 flex items-center gap-2">
              <Link
                href="/creator/login"
                className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold text-center shadow-md shadow-indigo-600/25 transition-all"
              >
                Use in Studio
              </Link>
            </div>
          </div>
  )
}

export default Theme