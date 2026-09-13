import React from 'react'

const Package = ({pkg,price}) => {
  return (
    <div
              key={pkg.id}
              className={`relative rounded-3xl p-8 border bg-gradient-to-b ${pkg.color} flex flex-col justify-between shadow-2xl transition-all hover:translate-y-[-4px]`}
            >
              {pkg.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 text-white text-[11px] font-extrabold uppercase tracking-wider shadow-lg flex items-center gap-1">
                  <StarIcon filled className="w-3 h-3 text-amber-300" />
                  <span>Most Popular Choice</span>
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white">{pkg.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{pkg.description}</p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white font-mono">${price}</span>
                  <span className="text-xs text-slate-400 font-medium">/ month</span>
                  {billingCycle === 'YEARLY' && (
                    <span className="text-[10px] text-emerald-400 font-bold ml-2">billed annually</span>
                  )}
                </div>

                <div className="text-xs text-indigo-300 bg-indigo-500/10 px-3 py-1.5 rounded-xl border border-indigo-500/20 w-fit font-medium">
                  {pkg.maxPortfolios} {pkg.maxPortfolios === 1 ? 'website Portfolio' : 'website Portfolios'} Included
                </div>

                <div className="border-t border-white/10 pt-6 space-y-3">
                  <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                    What is included:
                  </span>
                  <ul className="space-y-2.5 text-xs text-slate-300">
                    {pkg.features.map((feat, fidx) => (
                      <li key={fidx} className="flex items-start gap-2.5">
                        <CheckCircleIcon className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-8">
                <Link
                  href={`/checkout?packageId=${pkg.id}`}
                  className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg ${
                    pkg.popular
                      ? 'bg-secondary text-white hover:opacity-95 shadow-indigo-500/25'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  <span>{pkg.cta}</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
  )
}

export default Package