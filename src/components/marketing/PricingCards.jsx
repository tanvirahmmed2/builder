'use client';

import Link from 'next/link';

export default function PricingCards() {
  const plans = [
    {
      id: 'b0000000-0000-0000-0000-000000000001',
      name: 'Starter Creator',
      price: '$15',
      interval: 'per month',
      desc: 'Ideal for freelance designers and individual software engineers.',
      features: [
        '1 Tenant Portfolio Website',
        'Drag & Drop Canvas Builder',
        'Experience Timeline Module',
        'Standard Subdomain (.platform)',
        'Up to 10 Sections per site',
      ],
      popular: false,
    },
    {
      id: 'b0000000-0000-0000-0000-000000000002',
      name: 'Pro Studio',
      price: '$35',
      interval: 'per month',
      desc: 'For top creators requiring blogging, appointments, and custom domains.',
      features: [
        '5 Multi-Tenant Sites',
        'Appointment Booking Engine',
        'Full Blogging System',
        'Custom Domain Access (SSL)',
        'Client Reviews & Testimonials',
        'Manager Role Collaboration',
      ],
      popular: true,
    },
  ];

  return (
    <section className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-white">Simple, Transparent Creator Pricing</h2>
        <p className="text-sm text-slate-400">Subscribe now to provision your dedicated portfolio tenant instantly.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {plans.map((p) => (
          <div
            key={p.id}
            className={`p-8 rounded-3xl border flex flex-col justify-between transition-all ${
              p.popular
                ? 'bg-slate-900/90 border-indigo-500 shadow-2xl ring-2 ring-indigo-500/20 relative'
                : 'bg-slate-900/50 border-white/10 hover:border-white/20'
            }`}
          >
            {p.popular && (
              <span className="absolute -top-3.5 right-6 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-[10px] font-bold uppercase tracking-wider shadow">
                Most Popular
              </span>
            )}

            <div>
              <h3 className="text-xl font-bold text-white">{p.name}</h3>
              <p className="text-xs text-slate-400 mt-1">{p.desc}</p>

              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-black text-white">{p.price}</span>
                <span className="text-xs text-slate-400">/ {p.interval}</span>
              </div>

              <ul className="mt-6 space-y-2.5 text-xs text-slate-300">
                {p.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-white/5">
              <Link
                href={`/creator/checkout?packageId=${p.id}`}
                className={`w-full py-3 rounded-xl text-xs font-bold text-center block transition-all shadow-lg ${
                  p.popular
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                Purchase & Launch Portfolio
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
