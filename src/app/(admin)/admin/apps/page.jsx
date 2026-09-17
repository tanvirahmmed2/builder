'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BiGridAlt, BiSearch, BiCheckCircle, BiLinkExternal, BiCodeAlt, BiLayer, BiStore, BiBookOpen, BiBuildings, BiFile } from 'react-icons/bi';

const ECOSYSTEM_APPS = [
  {
    id: 1,
    title: 'E-commerce',
    slug: 'e-commerce',
    path: '/apps/e-commerce',
    category: 'Commerce & Retail',
    description: 'Full-featured online storefront with product catalog, cart flows, checkout, and inventory tracking.',
    icon: BiStore,
    badge: 'Core Suite',
    status: 'ACTIVE',
    version: 'v2.4.0',
    features: ['Multi-currency checkout', 'Stripe & PayPal billing', 'Inventory syncing', 'Custom invoice generator'],
  },
  {
    id: 2,
    title: 'Restaurant',
    slug: 'restaurant',
    path: '/apps/restaurant',
    category: 'Hospitality & Dining',
    description: 'Digital interactive menu, table reservation booking engine, and takeout ordering solution.',
    icon: BiLayer,
    badge: 'Specialized',
    status: 'ACTIVE',
    version: 'v1.8.2',
    features: ['QR code menus', 'Table booking scheduler', 'Kitchen order stream', 'Dietary allergen tags'],
  },
  {
    id: 3,
    title: 'LMS (Learning Management)',
    slug: 'lms',
    path: '/apps/lms',
    category: 'Education & Courses',
    description: 'Course authoring, video lessons hosting, student enrollment dashboards, and quiz grading modules.',
    icon: BiBookOpen,
    badge: 'Education',
    status: 'ACTIVE',
    version: 'v2.1.0',
    features: ['Video hosting player', 'Certificate generator', 'Drip content schedule', 'Student progress tracker'],
  },
  {
    id: 4,
    title: 'School Management',
    slug: 'school-management',
    path: '/apps/school-management',
    category: 'Academic Administration',
    description: 'Institutional management system for student rosters, faculty grading, attendance, and parent notices.',
    icon: BiBuildings,
    badge: 'Enterprise',
    status: 'ACTIVE',
    version: 'v1.5.0',
    features: ['Gradebook portal', 'Attendance roll calls', 'Parent notifications', 'Tuition billing ledger'],
  },
  {
    id: 5,
    title: 'CMS (Content Management)',
    slug: 'cms',
    path: '/apps/cms',
    category: 'Publishing & Media',
    description: 'Headless blog publishing, dynamic page builder, markdown documentation, and media library manager.',
    icon: BiFile,
    badge: 'Core Suite',
    status: 'ACTIVE',
    version: 'v3.0.1',
    features: ['Markdown editor', 'Cloudinary image CDN', 'SEO meta tagger', 'Multi-author permissions'],
  },
];

export default function AdminAppsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [apps, setApps] = useState(ECOSYSTEM_APPS);

  const filteredApps = apps.filter((app) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      app.title.toLowerCase().includes(q) ||
      app.category.toLowerCase().includes(q) ||
      app.description.toLowerCase().includes(q) ||
      app.path.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Platform Ecosystem Apps</h1>
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-secondary/10 text-secondary border border-secondary/20">
              Ecosystem
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Catalog of plug-and-play applications and vertical engines integrated into the platform builder.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs"
          >
            <span>Overview Hub</span>
          </Link>
        </div>
      </div>

      {/* Search Filter */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
        <div className="relative">
          <BiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search ecosystem apps by title, category, or features..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
          />
        </div>
      </div>

      {/* Grid of Apps */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredApps.map((app) => {
          const Icon = app.icon;
          return (
            <div
              key={app.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-secondary/40 hover:shadow-sm transition-all flex flex-col justify-between group"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-secondary/10 text-secondary border border-secondary/20">
                      <Icon className="text-xl" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-secondary transition-colors">
                        {app.title}
                      </h3>
                      <div className="text-[11px] text-slate-400 font-medium">{app.category}</div>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <BiCheckCircle className="text-xs" />
                    <span>{app.status}</span>
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{app.description}</p>

                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Included Capabilities</div>
                  <div className="flex flex-wrap gap-1.5">
                    {app.features.map((feat, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] bg-slate-50 border border-slate-200 text-slate-600 px-2 py-0.5 rounded-md font-medium"
                      >
                        {feat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1 font-mono text-[11px] text-slate-400">
                  <BiCodeAlt className="text-sm" />
                  <span>{app.path}</span>
                </div>

                <Link
                  href={app.path}
                  className="inline-flex items-center gap-1 text-xs font-bold text-secondary hover:text-secondary-dark transition-colors"
                >
                  <span>Launch</span>
                  <BiLinkExternal className="text-sm" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
