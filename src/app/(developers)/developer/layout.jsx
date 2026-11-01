'use client';

import { useContext, useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { BiLoaderAlt, BiShieldX, BiArrowBack } from 'react-icons/bi';
import { Context } from '@/components/helper/Context';
import Navbar from '@/components/saas/developer/Navbar';
import Sidebar from '@/components/saas/developer/Sidebar';

/**
 * @deprecated ROLE_PERMISSIONS is deprecated in favor of dynamic permissions stored in the database
 * and returned by authenticateStaff / /api/saas/developer/me. Retained solely as a fallback for unmigrated sessions.
 */
export const ROLE_PERMISSIONS = {
  admin: [
    'overview', 'developers', 'roles', 'team', 'creators', 'users', 'websites',
    'blogs', 'themes', 'packages', 'purchases', 'payments', 'subscriptions', 'payroll', 'my-salaries',
    'live-chats', 'chats', 'contacts', 'support', 'projects', 'reports', 'reviews', 'spams',
    'facebook-messages', 'instagram-messages', 'whatsapp-messages',
    'leads', 'subscribers', 'services', 'apps', 'profile', 'settings', 'faqs', 'updates', 'tasks', 'notices', 'tutorials', 'careers', 'policies'
  ],
  manager: [
    'overview', 'creators', 'users', 'websites', 'packages',
    'purchases', 'payments', 'subscriptions', 'live-chats', 'chats', 'contacts', 'support', 'projects', 'my-salaries',
    'facebook-messages', 'instagram-messages', 'whatsapp-messages',
    'reports', 'reviews', 'leads', 'subscribers', 'services', 'apps', 'profile', 'settings', 'faqs', 'updates', 'tasks', 'notices', 'tutorials', 'careers', 'policies'
  ],
  developer: [
    'overview', 'websites', 'themes', 'packages',
    'services', 'apps', 'spams', 'reports', 'blogs', 'support', 'projects', 'profile', 'settings', 'chats', 'tasks', 'notices', 'my-salaries', 'tutorials', 'faqs', 'updates', 'policies'
  ],
  marketer: [
    'overview', 'blogs', 'themes', 'leads',
    'packages', 'reviews', 'profile', 'settings', 'chats', 'tasks', 'notices', 'my-salaries', 'tutorials', 'faqs', 'updates', 'policies'
  ],
  support: [
    'overview', 'live-chats', 'chats', 'contacts', 'support', 'reports',
    'facebook-messages', 'instagram-messages', 'whatsapp-messages',
    'reviews', 'users', 'creators', 'subscribers', 'profile', 'settings', 'tasks', 'notices', 'my-salaries', 'tutorials', 'faqs', 'updates', 'policies'
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
    return null;
  }

  // Active module authorization check
  const pathSegments = pathname.split('/').filter(Boolean);
  const activeModule = pathSegments[1] || 'overview';

  const userPerms = Array.isArray(user?.permissions) ? user.permissions : null;
  const role = (user?.role || 'developer').toLowerCase();
  const fallbackModules = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.developer || [];
  const allowedModules = userPerms && userPerms.length > 0 ? userPerms : fallbackModules;

  // Unrestricted developer endpoints
  const isPublicSection =
    activeModule === 'overview' ||
    activeModule === 'profile' ||
    activeModule === 'settings' ||
    (activeModule === 'roles' && (allowedModules.includes('developers') || allowedModules.includes('roles')));

  const isAuthorized =
    isPublicSection ||
    allowedModules.includes(activeModule) ||
    (activeModule === 'services' && allowedModules.includes('apps')) ||
    (activeModule === 'apps' && allowedModules.includes('services'));

  if (!isAuthorized) {
    return (
      <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          currentUser={user}
        />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Navbar onMenuClick={() => setSidebarOpen(true)} currentUser={user} />
          <main className="flex-1 overflow-y-auto p-4 md:p-8 flex items-center justify-center">
            <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-8 max-w-md w-full text-center">
              <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-100">
                <BiShieldX className="text-3xl" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Restricted Access</h2>
              <p className="text-slate-600 text-sm mb-6 leading-relaxed">
                Your role (<span className="font-semibold capitalize text-slate-800">{user?.role}</span>) does not have permission to access the <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-xs text-rose-600 font-semibold">{activeModule}</span> module.
              </p>
              <div className="flex flex-col gap-2">
                <Link
                  href="/developer"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm rounded-xl transition shadow-sm"
                >
                  <BiArrowBack className="text-lg" />
                  Return to Overview
                </Link>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentUser={user}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar onMenuClick={() => setSidebarOpen(true)} currentUser={user} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
