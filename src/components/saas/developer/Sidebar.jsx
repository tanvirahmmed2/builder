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
  BiReceipt,
  BiCheckShield,
  BiShieldQuarter,
  BiDesktop,
  BiEnvelope,
  BiPalette,
  BiTrendingUp,
  BiUser,
  BiGroup,
  BiStar,
  BiShieldX,
  BiGridAlt,
  BiCog,
  BiHelpCircle,
  BiBell,
  BiTask,
  BiVideo,
  BiLogoFacebookCircle,
  BiLogoInstagram,
  BiLogoWhatsapp,
  BiBriefcase,
} from 'react-icons/bi';
import { ROLE_PERMISSIONS } from '@/app/(developers)/developer/layout';

export const ADMIN_NAV_SECTIONS = [
  {
    title: 'Workspace & Overview',
    links: [
      { href: '/developer', label: 'Overview', icon: BiLayer, exact: true },
      { href: '/developer/tasks', label: 'Tasks & Sprints', icon: BiTask },
      { href: '/developer/notices', label: 'Company Notices', icon: BiBell },
      { href: '/developer/chats', label: 'Internal Chat', icon: BiMessageSquareDetail },
    ],
  },
  {
    title: 'Websites & Audience',
    links: [
      { href: '/developer/websites', label: 'Websites', icon: BiDesktop },
      { href: '/developer/creators', label: 'Creators', icon: BiGroup },
      { href: '/developer/users', label: 'End-Users', icon: BiUser },
      { href: '/developer/leads', label: 'Leads', icon: BiTrendingUp },
      { href: '/developer/subscribers', label: 'Subscribers', icon: BiEnvelope },
    ],
  },
  {
    title: 'Commerce & Plans',
    links: [
      { href: '/developer/packages', label: 'Packages & Modules', icon: BiCube },
      { href: '/developer/subscriptions', label: 'Subscriptions', icon: BiCheckShield },
      { href: '/developer/purchases', label: 'Purchases', icon: BiReceipt },
      { href: '/developer/payments', label: 'Payments', icon: BiCreditCard },
      { href: '/developer/projects', label: 'Custom Projects', icon: BiBriefcase },
    ],
  },
  {
    title: 'Content & Design',
    links: [
      { href: '/developer/themes', label: 'Themes', icon: BiPalette },
      { href: '/developer/blogs', label: 'Blogs', icon: BiFile },
      { href: '/developer/policies', label: 'Company Policies', icon: BiCheckShield },
      { href: '/developer/updates', label: 'Product Updates', icon: BiBell },
      { href: '/developer/tutorials', label: 'Video Tutorials', icon: BiVideo },
      { href: '/developer/faqs', label: 'FAQs', icon: BiHelpCircle },
    ],
  },
  {
    title: 'Support & Comms',
    links: [
      { href: '/developer/support', label: 'Support Tickets', icon: BiHeadphone },
      { href: '/developer/live-chats', label: 'Live Chats', icon: BiChat },
      { href: '/developer/contacts', label: 'Contacts', icon: BiEnvelope },
      { href: '/developer/reports', label: 'Reports', icon: BiMessageSquareDetail },
      { href: '/developer/reviews', label: 'Reviews', icon: BiStar },
    ],
  },
  {
    title: 'Meta Channels',
    links: [
      { href: '/developer/facebook-messages', label: 'Facebook Messages', icon: BiLogoFacebookCircle },
      { href: '/developer/instagram-messages', label: 'Instagram Messages', icon: BiLogoInstagram },
      { href: '/developer/whatsapp-messages', label: 'WhatsApp Messages', icon: BiLogoWhatsapp },
    ],
  },
  {
    title: 'Team & Organization',
    links: [
      { href: '/developer/developers', label: 'Developers Team', icon: BiUserCheck },
      { href: '/developer/roles', label: 'Roles & Permissions', icon: BiShieldQuarter },
      { href: '/developer/payroll', label: 'Payroll & Salaries', icon: BiCreditCard },
      { href: '/developer/my-salaries', label: 'My Salaries', icon: BiCreditCard },
      { href: '/developer/careers', label: 'Careers & Applicants', icon: BiBriefcase },
    ],
  },
  {
    title: 'Platform & Settings',
    links: [
      { href: '/developer/services', label: 'Services & Modules', icon: BiGridAlt },
      { href: '/developer/spams', label: 'Spam Defense', icon: BiShieldX },
      { href: '/developer/settings', label: 'Settings', icon: BiCog },
      { href: '/developer/profile', label: 'My Profile', icon: BiUser },
    ],
  },
];

export const DEVELOPER_NAV_SECTIONS = ADMIN_NAV_SECTIONS;

export default function DeveloperSidebar({ isOpen, onClose, currentUser = null }) {
  const pathname = usePathname();
  const router = useRouter();

  const userPerms = Array.isArray(currentUser?.permissions) ? currentUser.permissions : null;
  const role = (currentUser?.role || 'developer').toLowerCase();
  const fallbackModules = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.developer || [];
  const allowedModules = userPerms && userPerms.length > 0 ? userPerms : fallbackModules;

  const isLinkAllowed = (link) => {
    const segments = link.href.split('/').filter(Boolean);
    const moduleName = segments[1] || 'overview';
    return (
      moduleName === 'overview' ||
      moduleName === 'profile' ||
      moduleName === 'settings' ||
      allowedModules.includes(moduleName) ||
      (moduleName === 'services' && (allowedModules.includes('services') || allowedModules.includes('apps'))) ||
      (moduleName === 'roles' && (allowedModules.includes('developers') || allowedModules.includes('roles')))
    );
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/saas/developer-auth/logout', {
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
    return pathname.startsWith(link.href);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800 bg-slate-900/50">
          <Link href="/developer" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <BiLayer className="text-xl" />
            </div>
            <div>
              <span className="font-bold text-white text-base tracking-tight block leading-tight">
                {SITE_NAME}
              </span>
              <span className="text-[10px] uppercase font-semibold text-indigo-400 tracking-wider">
                Developer Console
              </span>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <BiX className="text-2xl" />
          </button>
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6 custom-scrollbar">
          {DEVELOPER_NAV_SECTIONS.map((section, idx) => {
            const filteredLinks = section.links.filter(isLinkAllowed);
            if (filteredLinks.length === 0) return null;

            return (
              <div key={idx} className="space-y-1">
                <p className="px-3 text-[11px] font-semibold tracking-wider text-slate-400 uppercase mb-2">
                  {section.title}
                </p>
                {filteredLinks.map((link) => {
                  const Icon = link.icon;
                  const active = isLinkActive(link);

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => onClose && onClose()}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                        active
                          ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      <Icon className={`text-lg shrink-0 ${active ? 'text-white' : 'text-slate-400'}`} />
                      <span className="truncate">{link.label}</span>
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* User Footer Profile & Logout */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/80">
          <div className="flex items-center justify-between gap-3 p-2 rounded-xl bg-slate-800/40 border border-slate-800">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm shrink-0 uppercase">
                {currentUser?.name?.charAt(0) || 'D'}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate leading-tight">
                  {currentUser?.name || 'Developer'}
                </p>
                <p className="text-xs text-slate-400 truncate capitalize">
                  {currentUser?.role || 'Staff'}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition shrink-0"
            >
              <BiLogOut className="text-lg" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
