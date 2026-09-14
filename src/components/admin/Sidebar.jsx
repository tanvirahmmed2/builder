'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SITE_NAME } from '@/lib/db/secret';
import { BiX, BiLogOut, BiHome, BiLayer, BiCube, BiMessageSquareDetail, BiUserCheck, BiFile, BiImage, BiChat, BiHeadphone, BiCreditCard, BiCheckShield, BiDesktop, BiEnvelope, BiPalette, BiTrendingUp } from 'react-icons/bi';
import { useRouter } from 'next/navigation';

export const ADMIN_NAV_SECTIONS = [
  {
    title: 'Platform Core',
    links: [
      { href: '/admin', label: 'Overview', icon: BiLayer, exact: true },
      { href: '/admin/admins', label: 'Admin Team', icon: BiUserCheck },
      { href: '/admin/tenants', label: 'Tenants', icon: BiDesktop },
    ],
  },
  {
    title: 'Content & Media',
    links: [
      { href: '/admin/blogs', label: 'Blogs', icon: BiFile },
      { href: '/admin/blogs-image', label: 'Blogs Image', icon: BiImage },
      { href: '/admin/themes', label: 'Themes', icon: BiPalette },
    ],
  },
  {
    title: 'Commerce & Plans',
    links: [
      { href: '/admin/packages', label: 'Packages', icon: BiCube },
      { href: '/admin/features', label: 'Feature', icon: BiCheckShield },
      { href: '/admin/packages-features', label: 'Packages Feature', icon: BiLayer },
      { href: '/admin/package-images', label: 'Package Image', icon: BiImage },
      { href: '/admin/payments', label: 'Payment', icon: BiCreditCard },
      { href: '/admin/subscriptions', label: 'Subscription', icon: BiCheckShield },
    ],
  },
  {
    title: 'Support & Comms',
    links: [
      { href: '/admin/live-chats', label: 'Live Chats', icon: BiChat },
      { href: '/admin/live-chat-messages', label: 'Live Chat Messages', icon: BiMessageSquareDetail },
      { href: '/admin/contacts', label: 'Contacts', icon: BiEnvelope },
      { href: '/admin/support', label: 'Support Tickets', icon: BiHeadphone },
      { href: '/admin/support-messages', label: 'Support Messages', icon: BiMessageSquareDetail },
      { href: '/admin/support-images', label: 'Support Images', icon: BiImage },
      { href: '/admin/reports', label: 'Reports', icon: BiMessageSquareDetail },
    ],
  },
  {
    title: 'Growth & Audience',
    links: [
      { href: '/admin/leads', label: 'Leads', icon: BiTrendingUp },
      { href: '/admin/subscribers', label: 'Subscribers', icon: BiEnvelope },
    ],
  },
];

export default function AdminSidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'logout' }),
      });
      router.push('/admin-access/login');
      router.refresh();
    } catch (e) {
      router.push('/admin-access/login');
    }
  };

  const isLinkActive = (link) => {
    if (link.exact) return pathname === link.href;
    return pathname === link.href || pathname.startsWith(`${link.href}/`);
  };

  const navContent = (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Brand Header */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-slate-100 bg-white sticky top-0 z-10">
        <Link
          href="/admin"
          onClick={onClose}
          className="text-lg font-bold text-slate-800 hover:text-primary transition-colors flex items-center gap-2"
        >
          <span>{SITE_NAME}</span>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-secondary/10 text-secondary border border-secondary/20">
            Admin
          </span>
        </Link>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="md:hidden text-2xl p-1 text-slate-500 hover:text-secondary rounded-md transition-colors cursor-pointer"
            aria-label="Close menu"
          >
            <BiX />
          </button>
        )}
      </div>

      {/* Navigation Sections */}
      <div className="p-3 space-y-5 flex-1">
        {ADMIN_NAV_SECTIONS.map((section) => (
          <div key={section.title} className="space-y-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
              {section.title}
            </div>
            {section.links.map((link) => {
              const Icon = link.icon;
              const active = isLinkActive(link);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    active
                      ? 'bg-primary/15 text-slate-900 border-l-4 border-primary font-bold shadow-xs'
                      : 'text-slate-600 hover:text-primary hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`text-base ${active ? 'text-primary' : 'text-slate-400'}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer CTA and Actions */}
      <div className="p-3 border-t border-slate-100 bg-white space-y-2 sticky bottom-0">
        <Link
          href="/"
          onClick={onClose}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium transition-colors"
        >
          <BiHome className="text-sm" />
          <span>Platform Home</span>
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 border border-secondary text-secondary hover:bg-secondary hover:text-white py-2 px-3 rounded-lg font-semibold transition-colors duration-200 text-xs cursor-pointer"
        >
          <BiLogOut className="text-sm" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Backdrop overlay */}
      <div
        className={`fixed inset-0 bg-black/40 z-50 md:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Mobile Drawer (exact match to home sidebar style) */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-72 max-w-[85vw] bg-white z-50 md:hidden flex flex-col justify-between shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Admin Mobile Navigation"
      >
        {navContent}
      </aside>

      {/* Desktop Persistent Sidebar */}
      <aside
        className="hidden md:flex md:w-64 md:flex-col md:shrink-0 bg-white border-r border-slate-200 h-screen sticky top-0 z-30"
        aria-label="Admin Desktop Navigation"
      >
        {navContent}
      </aside>
    </>
  );
}
