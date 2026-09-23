'use client';

import Link from 'next/link';
import { SITE_NAME } from '@/lib/db/secret';
import { BiMenu, BiChevronDown, BiGridAlt } from 'react-icons/bi';
import { useContext, useState } from 'react';
import { Context } from '@/components/helper/Context';
import Sidebar from './Sidebar';

export default function HomeNavbar() {
  const { apps = [] } = useContext(Context) || {};
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <nav className="w-full flex flex-row items-center justify-between bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 shadow-xs lg:px-8 h-14 sticky top-0 z-40 transition-colors">
        <div className="w-auto flex flex-row items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="text-2xl md:hidden flex items-center justify-center p-1 text-slate-700 dark:text-slate-300 hover:text-primary transition-colors cursor-pointer"
            aria-label="Toggle menu"
          >
            <BiMenu />
          </button>
          <Link href={'/'} className="text-xl font-bold tracking-tight text-slate-900 dark:text-white h-14 flex items-center">
            {SITE_NAME}
          </Link>
        </div>

        <div className="w-auto hidden md:flex flex-row items-center justify-center gap-1 relative h-14">
          <Link
            href={'/themes'}
            className="font-medium text-slate-700 dark:text-slate-300 hover:text-primary px-3.5 h-14 flex items-center justify-center transition-colors text-sm"
          >
            Themes
          </Link>

          <div className="relative h-14 group flex items-center">
            <Link
              href={'/apps'}
              className="font-medium text-slate-700 dark:text-slate-300 hover:text-primary px-3.5 h-14 flex items-center justify-center gap-1 transition-colors text-sm"
            >
              <span>Apps</span>
              {apps && apps.length > 0 && (
                <BiChevronDown className="text-xs text-slate-400 group-hover:text-primary transition-transform duration-200 group-hover:rotate-180" />
              )}
            </Link>

            {apps && apps.length > 0 && (
              <div className="absolute left-0 top-14 hidden group-hover:flex flex-col py-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 min-w-56 z-50 transition-all">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800 flex items-center gap-1.5">
                  <BiGridAlt className="text-primary text-xs" /> Ecosystem Apps
                </div>
                <div className="max-h-64 overflow-y-auto py-1">
                  {apps.map((a) => (
                    <Link
                      key={a.id}
                      href={a.path || `/apps/${a.slug}`}
                      className="px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-secondary flex items-center justify-between"
                    >
                      <span className="truncate">{a.title}</span>
                    </Link>
                  ))}
                </div>
                <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800 px-3">
                  <Link
                    href="/apps"
                    className="block text-center py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-primary/10 hover:text-primary text-[11px] font-bold transition-colors"
                  >
                    Browse All Apps &rarr;
                  </Link>
                </div>
              </div>
            )}
          </div>

          <Link
            href={'/packages'}
            className="font-medium text-slate-700 dark:text-slate-300 hover:text-primary px-3.5 h-14 flex items-center justify-center transition-colors text-sm"
          >
            Packages
          </Link>
       
          <Link
            href={'/contact'}
            className="font-medium text-slate-700 dark:text-slate-300 hover:text-primary px-3.5 h-14 flex items-center justify-center transition-colors text-sm"
          >
            Contact
          </Link>
          <Link
            href={'/about'}
            className="font-medium text-slate-700 dark:text-slate-300 hover:text-primary px-3.5 h-14 flex items-center justify-center transition-colors text-sm"
          >
            About
          </Link>
        </div>

        <div>
          <Link
            href={'/creator/login'}
            className="inline-flex items-center justify-center border border-secondary text-secondary hover:bg-secondary hover:text-white px-4 py-1.5 rounded-full font-semibold transition-colors duration-200 text-sm md:text-base shadow-xs"
          >
            Start Now
          </Link>
        </div>
      </nav>

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </>
  );
}
