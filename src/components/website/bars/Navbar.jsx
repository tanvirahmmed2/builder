'use client';
import React, { useContext, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import axios from 'axios';
import { Context } from '@/components/helper/Context';
import {
  BiMenu,
  BiStoreAlt,
  BiExternalLink,
  BiCart,
  BiUser,
  BiLogOut,
  BiSun,
  BiMoon,
  BiBell,
  BiCheckCircle,
  BiShieldQuarter
} from 'react-icons/bi';

export default function ControlNavbar() {
  const { dashSidebar, toggleDashSidebar, user, setUser, setStaff, theme, toggleTheme } = useContext(Context);
  const pathname = usePathname();
  const params = useParams();
  const domain = params?.domain || '';

  const [profileOpen, setProfileOpen] = useState(false);
  const [storeName, setStoreName] = useState('Website Console');

  // Load website settings for branding
  useEffect(() => {
    let isMounted = true;
    async function loadSettings() {
      try {
        const res = await axios.get('/api/settings');
        if (res.data && res.data.site_title && isMounted) {
          setStoreName(res.data.site_title);
        }
      } catch (_) {
        // Fallback store name
      }
    }
    loadSettings();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = async () => {
    try {
      await axios.delete('/api/staff/sessions');
    } catch (_) {}
    if (setUser) setUser(null);
    if (setStaff) setStaff(null);
    window.location.replace('/');
  };

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'ST';

  // Base paths
  const basePath = domain ? `/${domain}/panel/control` : '/panel/control';
  const liveSitePath = domain ? `/${domain}` : '/';

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="h-full px-4 sm:px-6 flex items-center justify-between gap-4">
        
        {/* Left Side: Hamburger & Branding */}
        <div className="flex items-center gap-3 md:gap-4">
          <button
            type="button"
            onClick={toggleDashSidebar}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            title="Toggle Sidebar"
            aria-label="Toggle Navigation Sidebar"
          >
            <BiMenu className="text-2xl" />
          </button>

          <Link href={`${basePath}/overview`} className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <BiStoreAlt />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-sm sm:text-base text-slate-800 dark:text-white leading-tight tracking-tight line-clamp-1">
                {storeName}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Control Console
              </span>
            </div>
          </Link>
        </div>

        {/* Right Side: Quick Action Buttons & Staff Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Quick POS Button */}
          <Link
            href={`${basePath}/sale`}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 text-xs font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition shadow-xs"
          >
            <BiCart className="text-base" />
            <span>POS Terminal</span>
          </Link>

          {/* View Live Website */}
          <a
            href={liveSitePath}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold transition"
          >
            <span>Live Site</span>
            <BiExternalLink className="text-sm" />
          </a>

          {/* Theme Switcher */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            title="Toggle color theme"
          >
            {theme === 'dark' ? <BiSun className="text-lg text-amber-400" /> : <BiMoon className="text-lg" />}
          </button>

          {/* Staff Profile Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                {initials}
              </div>
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-800 dark:text-white leading-tight">
                  {user?.name || 'Staff User'}
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">
                  {user?.role || 'Staff'}
                </span>
              </div>
            </button>

            {profileOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setProfileOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 py-2 divide-y divide-slate-100 dark:divide-slate-800">
                  <div className="px-4 py-2.5">
                    <p className="text-xs font-bold text-slate-800 dark:text-white">{user?.name || 'Staff Member'}</p>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">{user?.email || 'staff@website.com'}</p>
                    <div className="mt-1.5">
                      <span className="px-2 py-0.5 text-[9px] font-bold uppercase rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                        {user?.role || 'Staff'}
                      </span>
                    </div>
                  </div>

                  <div className="py-1">
                    <Link
                      href={`${basePath}/profile`}
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                    >
                      <BiUser className="text-base text-slate-400" />
                      <span>Account Profile</span>
                    </Link>
                    <Link
                      href={`${basePath}/settings`}
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                    >
                      <BiShieldQuarter className="text-base text-slate-400" />
                      <span>Console Settings</span>
                    </Link>
                  </div>

                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setProfileOpen(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition text-left cursor-pointer"
                    >
                      <BiLogOut className="text-base" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

        </div>

      </div>
    </header>
  );
}
