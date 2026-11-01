'use client';
import React from 'react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import {
  BiGridAlt,
  BiShoppingBag,
  BiCalendar,
  BiSupport,
  BiUser,
  BiCog
} from 'react-icons/bi';

export default function CustomerSidebar() {
  const params = useParams();
  const pathname = usePathname();
  const domain = params?.domain || '';
  const basePrefix = domain ? `/${domain}` : '';

  const links = [
    { label: 'Overview', icon: BiGridAlt, href: `${basePrefix}/user/control` },
    { label: 'My Orders', icon: BiShoppingBag, href: `${basePrefix}/user/control/orders` },
    { label: 'Appointments', icon: BiCalendar, href: `${basePrefix}/user/control/appointments` },
    { label: 'Support Tickets', icon: BiSupport, href: `${basePrefix}/user/control/supports` },
    { label: 'Profile', icon: BiUser, href: `${basePrefix}/user/control/profile` },
    { label: 'Settings', icon: BiCog, href: `${basePrefix}/user/control/settings` }
  ];

  return (
    <aside className="w-64 border-r border-white/10 bg-slate-950 p-4 flex flex-col justify-between hidden md:flex">
      <div className="space-y-6">
        <div className="px-3 py-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Customer Dashboard
          </span>
        </div>

        <nav className="space-y-1">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <link.icon className="text-base" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-4 text-xs text-slate-400">
        <p className="font-semibold text-white">Need immediate help?</p>
        <p className="text-[11px] text-slate-500 mt-1">Our support specialists are standing by 24/7.</p>
        <Link
          href={`${basePrefix}/user/control/supports`}
          className="mt-3 block text-center rounded-lg bg-slate-800 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors"
        >
          Open Ticket
        </Link>
      </div>
    </aside>
  );
}

