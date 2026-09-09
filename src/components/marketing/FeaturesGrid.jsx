'use client';

import { BoxIcon, MessageSquareIcon, StarIcon, CheckCircleIcon } from '@/components/ui/Icons';

export default function FeaturesGrid() {
  const modules = [
    {
      title: 'Visual Drag & Drop Canvas',
      desc: 'Rearrange Hero, About, Blog, Appointments, and Skills in real-time with responsive mobile/tablet preview.',
      tag: 'Core Engine',
      color: 'text-indigo-400',
    },
    {
      title: 'Appointment Booking Module',
      desc: 'Clients can select time slots directly on the portfolio website, creating bookings that creators manage effortlessly.',
      tag: 'Conversion Module',
      color: 'text-purple-400',
    },
    {
      title: 'Case Studies & Blogging',
      desc: 'Publish comprehensive technical articles and project deep dives with cover photos, markdown, and instant indexing.',
      tag: 'Publishing',
      color: 'text-emerald-400',
    },
    {
      title: 'Career Experience Timeline',
      desc: 'Showcase work history, company milestones, and technology stacks in an elegant interactive career roadmap.',
      tag: 'Credibility',
      color: 'text-amber-400',
    },
    {
      title: 'Verified 1-5★ Client Reviews',
      desc: 'End-users and visitors can submit ratings and written testimonials with creator moderation tools.',
      tag: 'Social Proof',
      color: 'text-pink-400',
    },
    {
      title: 'Role Guarded Collaboration',
      desc: 'Full multi-tenant authority for Creators and Managers with secure team roles and isolated subdomain scopes.',
      tag: 'Security',
      color: 'text-cyan-400',
    },
  ];

  return (
    <section className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-white">Engineered For High-Converting Creator Sites</h2>
        <p className="text-sm text-slate-400 max-w-xl mx-auto">
          Every tenant portfolio comes preloaded with production-ready modules that creators and managers can customize.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((m, i) => (
          <div
            key={i}
            className="p-6 rounded-2xl bg-slate-900/50 border border-white/5 hover:border-white/15 hover:bg-slate-900/80 transition-all space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-bold uppercase tracking-wider ${m.color}`}>
                {m.tag}
              </span>
              <CheckCircleIcon className="w-4 h-4 text-slate-600" />
            </div>
            <h3 className="text-lg font-bold text-white">{m.title}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">{m.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
