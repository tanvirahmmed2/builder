'use client';

import { useContext, useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { BiLoaderAlt, BiShieldX, BiArrowBack } from 'react-icons/bi';
import { Context } from '@/components/helper/Context';
import Navbar from '@/components/developer/Navbar';
import Sidebar from '@/components/developer/Sidebar';

export const ROLE_PERMISSIONS = {
  admin: [
    'overview', 'developers', 'team', 'creators', 'users', 'websites',
    'blogs', 'themes', 'packages', 'features', 'payments', 'subscriptions',
    'live-chats', 'contacts', 'support', 'reports', 'reviews', 'spams',
    'leads', 'subscribers', 'apps', 'profile', 'settings'
  ],
  manager: [
    'overview', 'creators', 'users', 'websites', 'packages', 'features',
    'payments', 'subscriptions', 'live-chats', 'contacts', 'support',
    'reports', 'reviews', 'leads', 'subscribers', 'apps', 'profile', 'settings'
  ],
  developer: [
    'overview', 'websites', 'themes', 'packages', 'features',
    'apps', 'spams', 'reports', 'blogs', 'support', 'profile', 'settings'
  ],
  marketer: [
    'overview', 'blogs', 'themes', 'leads', 'subscribers',
    'packages', 'reviews', 'creators', 'profile', 'settings'
  ],
  support: [
    'overview', 'live-chats', 'contacts', 'support', 'reports',
    'reviews', 'users', 'creators', 'profile', 'settings'
  ]
};

export default function DeveloperLayout({ children }) {
  const { user, loading } = useContext(Context);
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/developer-auth/login');
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-2">
        <BiLoaderAlt className="animate-spin text-4xl text-slate-800" />
        <p className="text-slate-600 text-sm font-semibold animate-pulse">Authenticating staff session...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-2">
        <BiLoaderAlt className="animate-spin text-4xl text-slate-800" />
        <p className="text-slate-600 text-sm font-semibold">Redirecting to login...</p>
      </div>
    );
  }

  const segments = pathname.split('/').filter(Boolean);
  const moduleName = segments[1];
  const role = user?.role || 'developer';
  const allowedModules = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.developer;
  const isAllowed = !moduleName || moduleName === 'profile' || allowedModules.includes(moduleName);

  if (!isAllowed) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 flex">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          currentUser={user}
        />
        <div className="flex-1 flex flex-col min-w-0">
          <Navbar
            onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
            currentUser={user}
          />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto flex items-center justify-center">
            <div className="max-w-md w-full bg-white border border-rose-200 rounded-2xl p-8 text-center shadow-xs">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center text-3xl">
                <BiShieldX />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Access Restricted</h2>
              <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                Your account role (<span className="font-bold text-slate-800 capitalize">{role}</span>) does not have permission to access the <span className="font-semibold text-rose-600 font-mono">/{moduleName}</span> module.
              </p>
              <Link
                href="/developer"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors shadow-xs"
              >
                <BiArrowBack className="text-sm" />
                <span>Return to Overview</span>
              </Link>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex">
      {/* Sidebar: persistent on desktop, drawer on mobile */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentUser={user}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          currentUser={user}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
