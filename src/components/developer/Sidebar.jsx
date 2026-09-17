'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { SITE_NAME } from '@/lib/db/secret';
import {
  BiX,
  BiLogOut,
  BiHome,
  BiLayer,
  BiCube,
  BiMessageSquareDetail,
  BiUserCheck,
  BiFile,
  BiChat,
  BiHeadphone,
  BiCreditCard,
  BiCheckShield,
  BiDesktop,
  BiEnvelope,
  BiPalette,
  BiTrendingUp,
  BiUser,
  BiGroup,
  BiStar,
  BiShieldX,
  BiGridAlt,
} from 'react-icons/bi';
import { ROLE_PERMISSIONS } from '@/app/(developers)/developer/layout';

export const ADMIN_NAV_SECTIONS = [
  {
    title: 'Platform Core',
    links: [
      { href: '/developer', label: 'Overview', icon: BiLayer, exact: true },
      { href: '/developer/developers', label: 'Developers Team', icon: BiUserCheck },
      { href: '/developer/creators', label: 'Creators', icon: BiGroup },
      { href: '/developer/users', label: 'End-Users', icon: BiUser },
      { href: '/developer/websites', label: 'Websites', icon: BiDesktop },
    ],
  },
  {
    title: 'Content & Design',
    links: [
      { href: '/developer/blogs', label: 'Blogs', icon: BiFile },
      { href: '/developer/themes', label: 'Themes', icon: BiPalette },
    ],
  },
  {
    title: 'Commerce & Plans',
    links: [
      { href: '/developer/packages', label: 'Packages', icon: BiCube },
      { href: '/developer/features', label: 'Features', icon: BiCheckShield },
      { href: '/developer/payments', label: 'Payments', icon: BiCreditCard },
      { href: '/developer/subscriptions', label: 'Subscriptions', icon: BiCheckShield },
    ],
  },
  {
    title: 'Support & Comms',
    links: [
      { href: '/developer/live-chats', label: 'Live Chats', icon: BiChat },
      { href: '/developer/contacts', label: 'Contacts', icon: BiEnvelope },
      { href: '/developer/support', label: 'Support Tickets', icon: BiHeadphone },
      { href: '/developer/reports', label: 'Reports', icon: BiMessageSquareDetail },
    ],
  },
  {
    title: 'Security & Trust',
    links: [
      { href: '/developer/reviews', label: 'Reviews', icon: BiStar },
      { href: '/developer/spams', label: 'Spam Defense', icon: BiShieldX },
    ],
  },
  {
    title: 'Growth & Ecosystem',
    links: [
      { href: '/developer/leads', label: 'Leads', icon: BiTrendingUp },
      { href: '/developer/subscribers', label: 'Subscribers', icon: BiEnvelope },
      { href: '/developer/apps', label: 'Ecosystem Apps', icon: BiGridAlt },
    ],
  },
];

export const DEVELOPER_NAV_SECTIONS = ADMIN_NAV_SECTIONS;

export default function DeveloperSidebar({ isOpen, onClose, currentUser = null }) {
  const pathname = usePathname();
  const router = useRouter();

  const role = currentUser?.role || 'developer';
  const allowedModules = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.developer || [];

  const isLinkAllowed = (link) => {
    const segments = link.href.split('/').filter(Boolean);
    const moduleName = segments[1];
    return !moduleName || moduleName === 'profile' || allowedModules.includes(moduleName);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/developer/me/logout', {
        method: 'POST',
      });
      router.push('/developer-auth/login');
      router.refresh();
    } catch (e) {
      router.push('/developer-auth/login');
    }
  };

  const isLinkActive = (link) => {
    if (link.exact) return pathname === link.href;
    return pathname === link.href || pathname.startsWith(`${link.href}/`);
  };

  const navContent = (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="h-14 px-4 flex items-center justify-between border-b border-slate-100 bg-white sticky top-0 z-10">
        <Link
          href="/developer"
          onClick={onClose}
          className="flex items-center gap-2.5 font-bold text-slate-900 hover:text-primary transition-colors"
        >
          <span className="w-8 h-8 rounded-lg bg-secondary/10 text-secondary border border-secondary/20 flex items-center justify-center font-black text-xs">
            PB
          </span>
          <div className="flex flex-col">
            <span className="text-xs font-bold leading-tight">{SITE_NAME}</span>
            <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase">Developer Center</span>
          </div>
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
        {DEVELOPER_NAV_SECTIONS.map((section) => {
          const visibleLinks = section.links.filter(isLinkAllowed);
          if (visibleLinks.length === 0) return null;

          return (
            <div key={section.title} className="space-y-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
                {section.title}
              </div>
              {visibleLinks.map((link) => {
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
          );
        })}
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

      {/* Mobile Drawer */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-72 max-w-[85vw] bg-white z-50 md:hidden flex flex-col justify-between shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Developer Mobile Navigation"
      >
        {navContent}
      </aside>

      {/* Desktop Persistent Sidebar */}
      <aside
        className="hidden md:flex md:w-64 md:flex-col md:shrink-0 bg-white border-r border-slate-200 h-screen sticky top-0 z-30"
        aria-label="Developer Desktop Navigation"
      >
        {navContent}
      </aside>
    </>
  );
}
