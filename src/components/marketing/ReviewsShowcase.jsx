'use client';

import { StarIcon } from '@/components/ui/Icons';

export default function ReviewsShowcase() {
  const reviews = [
    {
      author: 'Marcus Thorne',
      role: 'Venture Partner & Tech Founder',
      rating: 5,
      title: 'Converted 4 enterprise contracts in 2 weeks',
      comment: 'The appointment booking engine connected to my drag-and-drop portfolio completely transformed my client onboarding pipeline.',
    },
    {
      author: 'Elena Rostova',
      role: 'Staff UI/UX Engineer',
      rating: 5,
      title: '60fps canvas editor is pure luxury',
      comment: 'Reordering sections on tablet and desktop without page reloads feels like using a native desktop application.',
    },
    {
      author: 'Julian Barnes',
      role: 'Design Studio Director',
      rating: 5,
      title: 'Our managers run client portfolios with zero code',
      comment: 'The separation between creator and manager roles gave our junior team members all the editing power without risking billing changes.',
    },
  ];

  return (
    <section className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-white">Loved by Modern Creators & Studios</h2>
        <p className="text-sm text-slate-400">Authentic reviews submitted by active portfolio creators and visitors.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reviews.map((r, i) => (
          <div key={i} className="p-6 rounded-2xl bg-slate-900/50 border border-white/5 space-y-3">
            <div className="flex text-amber-400">
              {[...Array(r.rating)].map((_, j) => (
                <StarIcon key={j} className="w-4 h-4" filled />
              ))}
            </div>
            <h4 className="text-sm font-bold text-white">&quot;{r.title}&quot;</h4>
            <p className="text-xs text-slate-300 leading-relaxed">&quot;{r.comment}&quot;</p>
            <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px]">
              <span className="font-semibold text-white">{r.author}</span>
              <span className="text-slate-500">{r.role}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
