'use client';

export default function MarketingStats() {
  const stats = [
    { label: 'Active Tenant Sites', value: '12,450+' },
    { label: 'Client Appointments Booked', value: '185,000+' },
    { label: 'Drag-Drop Actions Rendered', value: '4.8M+' },
    { label: 'Customer Satisfaction Rate', value: '99.8%' },
  ];

  return (
    <section className="p-8 rounded-3xl bg-slate-900/60 border border-white/10 shadow-2xl">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y sm:divide-y-0 sm:divide-x divide-white/5">
        {stats.map((stat, i) => (
          <div key={i} className="pt-4 sm:pt-0 sm:px-4 space-y-1">
            <div className="text-3xl sm:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
              {stat.value}
            </div>
            <div className="text-xs text-slate-400 font-medium">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
