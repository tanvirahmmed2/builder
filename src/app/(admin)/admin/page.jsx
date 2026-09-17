'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SITE_NAME } from '@/lib/db/secret';
import {
  BiLayer,
  BiUserCheck,
  BiCube,
  BiCreditCard,
  BiHeadphone,
  BiDesktop,
  BiFile,
  BiChat,
  BiTrendingUp,
  BiEnvelope,
  BiPalette,
  BiRightArrowAlt,
} from 'react-icons/bi';

export default function AdminOverviewPage() {
  const [data, setData] = useState({
    admins: [],
    blogs: [],
    packages: [],
    websites: [],
    support: [],
    payment: [],
    live_chats: [],
    leads: [],
    subscribers: [],
    themes: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/admin');
        const json = await res.json();
        if (json.success) {
          setData(json);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalRevenue = (data.payment || []).reduce(
    (acc, p) => acc + (p.amount_in_cents || p.amountInCents || 0),
    0
  ) / 100;

  const statCards = [
    {
      title: 'Platform Admins',
      value: (data.admins || []).length,
      icon: BiUserCheck,
      href: '/admin/admins',
      color: 'secondary',
    },
    {
      title: 'Active Packages',
      value: (data.packages || []).length,
      icon: BiCube,
      href: '/admin/packages',
      color: 'primary',
    },
    {
      title: 'Websites',
      value: (data.websites || []).length,
      icon: BiDesktop,
      href: '/admin/websites',
      color: 'secondary',
    },
    {
      title: 'Blog Articles',
      value: (data.blogs || []).length,
      icon: BiFile,
      href: '/admin/blogs',
      color: 'primary',
    },
    {
      title: 'Open Support Tickets',
      value: (data.support || []).filter((s) => s.status === 'OPEN').length,
      icon: BiHeadphone,
      href: '/admin/support',
      color: 'secondary',
    },
    {
      title: 'Total Revenue',
      value: `$${totalRevenue.toFixed(2)}`,
      icon: BiCreditCard,
      href: '/admin/payments',
      color: 'primary',
    },
    {
      title: 'Inbound Leads',
      value: (data.leads || []).length,
      icon: BiTrendingUp,
      href: '/admin/leads',
      color: 'secondary',
    },
    {
      title: 'Subscribers',
      value: (data.subscribers || []).length,
      icon: BiEnvelope,
      href: '/admin/subscribers',
      color: 'primary',
    },
  ];

  const moduleCategories = [
    {
      category: 'Core Management',
      items: [
        { label: 'Admin Team', path: '/admin/admins', desc: 'Internal platform operators and staff' },
        { label: 'Creators Directory', path: '/admin/creators', desc: 'Registered creators and appointed managers' },
        { label: 'End-Users Directory', path: '/admin/users', desc: 'Registered site visitors and comment reviewers' },
        { label: 'Hosted Websites', path: '/admin/websites', desc: 'Provisioned portfolio subdomains and containers' },
      ],
    },
    {
      category: 'Content & Design',
      items: [
        { label: 'Blog Articles', path: '/admin/blogs', desc: 'Platform articles, guides, and releases' },
        { label: 'Themes Gallery', path: '/admin/themes', desc: 'Design templates and layout presets' },
      ],
    },
    {
      category: 'Billing & Monetization',
      items: [
        { label: 'Packages', path: '/admin/packages', desc: 'Subscription tiers and pricing limits' },
        { label: 'Feature Catalog', path: '/admin/features', desc: 'Modular platform feature definitions' },
        { label: 'Payments', path: '/admin/payments', desc: 'Revenue transactions and billing records' },
        { label: 'Subscriptions', path: '/admin/subscriptions', desc: 'Recurring memberships and renewal schedules' },
      ],
    },
    {
      category: 'Support & Real-Time Comms',
      items: [
        { label: 'Live Chats', path: '/admin/live-chats', desc: 'Active visitor and client chat sessions' },
        { label: 'Contacts', path: '/admin/contacts', desc: 'Inbound inquiry forms from website' },
        { label: 'Support Tickets', path: '/admin/support', desc: 'Technical trouble tickets and assistance' },
        { label: 'Moderation Reports', path: '/admin/reports', desc: 'Platform abuse and content reports' },
      ],
    },
    {
      category: 'Security & Moderation',
      items: [
        { label: 'Reviews Moderation', path: '/admin/reviews', desc: 'Moderate client feedback and site testimonials' },
        { label: 'Spam Defense', path: '/admin/spams', desc: 'Automated heuristic spam blocks and moderation' },
      ],
    },
    {
      category: 'Audience & Growth',
      items: [
        { label: 'Sales Leads', path: '/admin/leads', desc: 'Inbound customer prospects and agency evaluations' },
        { label: 'Subscribers', path: '/admin/subscribers', desc: 'Newsletter audience email list' },
        { label: 'Ecosystem Apps', path: '/admin/apps', desc: 'Active platform applications and integrations' },
      ],
    },
  ];

  return (
    <div className="space-y-8">
      {/* Banner matching home style */}
      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-secondary/10 text-secondary border border-secondary/20">
              Admin Console
            </span>
            <span className="text-xs text-slate-500 font-semibold">• Multi-Website SaaS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Welcome to {SITE_NAME} Operations
          </h1>
          <p className="text-sm text-slate-500 max-w-xl">
            Central administration hub for platform packages, website portfolios, customer support, and financial reporting.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/packages"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-secondary hover:bg-secondary-dark text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <span>Manage Packages</span>
            <BiRightArrowAlt className="text-base" />
          </Link>
          <Link
            href="/admin/support"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors"
          >
            <span>Support Center</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Link
              key={idx}
              href={stat.href}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-secondary/40 hover:shadow-sm transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`p-2 rounded-xl ${
                    stat.color === 'secondary'
                      ? 'bg-secondary/10 text-secondary'
                      : 'bg-primary/10 text-primary'
                  }`}
                >
                  <Icon className="text-xl" />
                </div>
                <BiRightArrowAlt className="text-slate-300 group-hover:text-secondary group-hover:translate-x-1 transition-all text-lg" />
              </div>
              <div className="text-2xl font-bold text-slate-900 tracking-tight">
                {loading ? '—' : stat.value}
              </div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">{stat.title}</div>
            </Link>
          );
        })}
      </div>

      {/* Categorized Modules Navigation Matrix (All 20 Tables) */}
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Platform Database Modules</h2>
          <p className="text-xs text-slate-500">Access and edit any of the 20 platform management tables directly.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {moduleCategories.map((cat, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3 flex flex-col justify-between"
            >
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-secondary border-b border-slate-100 pb-2 mb-3">
                  {cat.category}
                </h3>
                <div className="space-y-2">
                  {cat.items.map((item, itemIdx) => (
                    <Link
                      key={itemIdx}
                      href={item.path}
                      className="group flex items-start justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      <div>
                        <div className="text-xs font-bold text-slate-800 group-hover:text-secondary transition-colors">
                          {item.label}
                        </div>
                        <div className="text-[11px] text-slate-400 line-clamp-1">{item.desc}</div>
                      </div>
                      <BiRightArrowAlt className="text-slate-300 group-hover:text-secondary text-base shrink-0 mt-1 transition-colors" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
