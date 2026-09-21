'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import TenantStatsCard from '@/components/website/cards/TenantStatsCard';
import {
  BiBarChartSquare,
  BiBookOpen,
  BiCalendar,
  BiCheckCircle,
  BiDollarCircle,
  BiEnvelope,
  BiGlobe,
  BiGroup,
  BiImage,
  BiLayer,
  BiLoaderAlt,
  BiPackage,
  BiShield,
  BiShoppingBag,
  BiTag,
  BiTimeFive,
  BiChevronRight,
} from 'react-icons/bi';

export default function TenantDashboardOverviewPage({ params }) {
  const unwrappedParams = use(params);
  const slug = unwrappedParams.slug;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch(`/api/webites/${slug}/dashboard`);
      const resData = await res.json();
      if (resData.success) {
        setData(resData);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [slug]);

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-slate-400 gap-3">
        <BiLoaderAlt className="animate-spin text-4xl text-indigo-600" />
        <p className="text-xs font-semibold tracking-wider uppercase">Loading Overview...</p>
      </div>
    );
  }

  const {
    website,
    kpis = {},
    orders = [],
    appointments = [],
    contacts = [],
    products = [],
    blogs = [],
  } = data || {};

  const primaryColor = website?.settings?.primary_color || '#6366f1';

  const tableShortcuts = [
    { title: 'Products & Inventory', count: products.length, href: `/website/${slug}/dashboard/products`, icon: BiPackage, desc: 'Manage catalog, stock & pricing' },
    { title: 'Orders & Payments', count: orders.length, href: `/website/${slug}/dashboard/orders`, icon: BiShoppingBag, desc: 'Track sales & transaction status' },
    { title: 'Appointments', count: appointments.length, href: `/website/${slug}/dashboard/appointments`, icon: BiCalendar, desc: 'Consultations & client schedule' },
    { title: 'Blog & Articles', count: blogs.length, href: `/website/${slug}/dashboard/blogs`, icon: BiBookOpen, desc: 'Publish posts & thought leadership' },
    { title: 'Contact Inquiries', count: contacts.length, href: `/website/${slug}/dashboard/contacts`, icon: BiEnvelope, desc: 'Incoming messages & leads' },
    { title: 'Roles & Permissions', count: '4 Roles', href: `/website/${slug}/dashboard/roles`, icon: BiShield, desc: 'Custom roles & 45 permissions' },
    { title: 'Team & Users', count: 'Multi-Role', href: `/website/${slug}/dashboard/users`, icon: BiGroup, desc: 'User permissions & team access' },
    { title: 'Work Experience', count: `${data?.experiences?.length || 0}`, href: `/website/${slug}/dashboard/experiences`, icon: BiTimeFive, desc: 'Career timeline & achievements' },
    { title: 'Portfolio Gallery', count: `${data?.gallery?.length || 0}`, href: `/website/${slug}/dashboard/gallery`, icon: BiImage, desc: 'Visual media & creative showcase' },
    { title: 'Services & Packages', count: `${data?.services?.length || 0}`, href: `/website/${slug}/dashboard/services`, icon: BiLayer, desc: 'Consulting packages & pricing' },
    { title: 'Special Offers', count: `${data?.offers?.length || 0}`, href: `/website/${slug}/dashboard/offers`, icon: BiTag, desc: 'Promo discounts & campaign coupons' },
    { title: 'Settings & Domain', count: 'Config', href: `/website/${slug}/dashboard/settings`, icon: BiGlobe, desc: 'Branding, DNS & custom domain' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* Welcome Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Active Tenant Site
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {website?.settings?.site_title || website?.name || 'Creator Studio'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            Welcome to your centralized website dashboard. Monitor sales, appointments, manage multi-role team access, and curate your portfolio content.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href={`/website/${slug}`}
            target="_blank"
            className="px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors"
          >
            Visit Live Site
          </Link>
          <Link
            href={`/website/${slug}/dashboard/settings`}
            className="px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white shadow-xs transition-colors"
          >
            Site Settings
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <TenantStatsCard
          title="Total Revenue"
          value={`$${(Number(kpis.total_revenue || 0) / 100).toFixed(2)}`}
          subtext="From store orders"
          icon={BiDollarCircle}
          color="emerald"
        />
        <TenantStatsCard
          title="Orders Placed"
          value={kpis.total_orders || 0}
          subtext="Purchases processed"
          icon={BiShoppingBag}
          color="indigo"
        />
        <TenantStatsCard
          title="Appointments"
          value={kpis.total_appointments || 0}
          subtext={`${kpis.pending_appointments || 0} awaiting action`}
          icon={BiCalendar}
          color="blue"
        />
        <TenantStatsCard
          title="Inquiries / Leads"
          value={kpis.total_inquiries || 0}
          subtext="Contact messages"
          icon={BiEnvelope}
          color="amber"
        />
      </div>

      {/* Tables & Modules Directory Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Database Tables & Management Modules
            </h2>
            <p className="text-xs text-slate-500">
              Each table is organized into its own dedicated management view.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {tableShortcuts.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.title}
                href={item.href}
                className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                      <Icon />
                    </div>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {item.count}
                    </span>
                  </div>
                  <div className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {item.title}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                    {item.desc}
                  </p>
                </div>
                <div className="flex items-center justify-between text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 pt-4 mt-2 border-t border-slate-100 dark:border-slate-800">
                  <span>Manage Table</span>
                  <BiChevronRight className="text-sm group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activity Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Appointments */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BiCalendar className="text-indigo-500" /> Upcoming Bookings
            </h3>
            <Link
              href={`/website/${slug}/dashboard/appointments`}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              View All
            </Link>
          </div>

          {appointments.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No upcoming appointments.</p>
          ) : (
            <div className="space-y-3">
              {appointments.slice(0, 4).map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">{a.client_name}</div>
                    <div className="text-[11px] text-slate-400">{a.service_name || 'Consultation'}</div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    a.status === 'confirmed'
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-amber-50 text-amber-600'
                  }`}>
                    {a.status || 'pending'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Inquiries */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BiEnvelope className="text-indigo-500" /> Recent Inquiries
            </h3>
            <Link
              href={`/website/${slug}/dashboard/contacts`}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              View All
            </Link>
          </div>

          {contacts.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No inquiries received yet.</p>
          ) : (
            <div className="space-y-3">
              {contacts.slice(0, 4).map((c) => (
                <div
                  key={c.id}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white">{c.name}</span>
                    <span className="text-[10px] text-slate-400">{new Date(c.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1">{c.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
