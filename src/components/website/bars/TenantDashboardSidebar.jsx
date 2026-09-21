'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BiBarChartSquare,
  BiBookOpen,
  BiCalendar,
  BiDollarCircle,
  BiEnvelope,
  BiGlobe,
  BiGroup,
  BiImage,
  BiLayer,
  BiPackage,
  BiShield,
  BiShoppingBag,
  BiSupport,
  BiTag,
  BiTimeFive,
} from 'react-icons/bi';

export default function TenantDashboardSidebar({ slug, website }) {
  const pathname = usePathname();
  const primaryColor = website?.settings?.primary_color || '#6366f1';

  const menuItems = [
    { label: 'Overview', href: `/website/${slug}/dashboard`, icon: BiBarChartSquare, exact: true },
    { label: 'Products', href: `/website/${slug}/dashboard/products`, icon: BiPackage },
    { label: 'Orders & Payments', href: `/website/${slug}/dashboard/orders`, icon: BiShoppingBag },
    { label: 'Appointments', href: `/website/${slug}/dashboard/appointments`, icon: BiCalendar },
    { label: 'Blog & Articles', href: `/website/${slug}/dashboard/blogs`, icon: BiBookOpen },
    { label: 'Contact Inquiries', href: `/website/${slug}/dashboard/contacts`, icon: BiEnvelope },
    { label: 'Roles & Permissions', href: `/website/${slug}/dashboard/roles`, icon: BiShield },
    { label: 'Team & Users', href: `/website/${slug}/dashboard/users`, icon: BiGroup },
    { label: 'Experiences', href: `/website/${slug}/dashboard/experiences`, icon: BiTimeFive },
    { label: 'Portfolio Gallery', href: `/website/${slug}/dashboard/gallery`, icon: BiImage },
    { label: 'Services', href: `/website/${slug}/dashboard/services`, icon: BiLayer },
    { label: 'Offers & Discounts', href: `/website/${slug}/dashboard/offers`, icon: BiTag },
    { label: 'Support Tickets', href: `/website/${slug}/dashboard/support`, icon: BiSupport },
    { label: 'Settings & Domain', href: `/website/${slug}/dashboard/settings`, icon: BiGlobe },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4 shrink-0 flex flex-col justify-between hidden md:flex min-h-[calc(100vh-4rem)]">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Tenant Website Management
        </div>

        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? pathname === item.href || pathname === item.href.replace('/website/', '/webites/')
              : pathname.startsWith(item.href) || pathname.startsWith(item.href.replace('/website/', '/webites/'));

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
                style={isActive ? { backgroundColor: primaryColor } : {}}
              >
                <Icon className="text-lg shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 text-[11px] text-slate-500">
        <div className="font-bold text-slate-700 dark:text-slate-300">Tenant Portal</div>
        <div className="text-[10px] text-slate-400 mt-0.5 truncate">{slug}.saasplatform.com</div>
      </div>
    </aside>
  );
}
