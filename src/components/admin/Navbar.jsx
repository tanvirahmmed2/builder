'use client';

import Link from 'next/link';
import { SITE_NAME } from '@/lib/db/secret';
import { BiMenu, BiLogOut, BiHome, BiShieldQuarter } from 'react-icons/bi';
import { useRouter } from 'next/navigation';

export default function AdminNavbar({ onToggleSidebar }) {
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

  return (
    <nav className="w-full flex flex-row items-center justify-between bg-white px-4 shadow-sm lg:px-8 h-14 sticky top-0 z-30 border-b border-slate-200">
      <div className="w-auto flex flex-row items-center justify-center gap-2">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="text-2xl md:hidden flex items-center justify-center p-1 text-slate-700 hover:text-primary transition-colors cursor-pointer"
          aria-label="Toggle admin navigation menu"
        >
          <BiMenu />
        </button>
        <Link href="/admin" className="text-xl font-semibold h-14 flex items-center gap-2">
          <span>{SITE_NAME}</span>
          <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-secondary/10 text-secondary border border-secondary/20">
            Console
          </span>
        </Link>
      </div>

      <div className="w-auto hidden md:flex flex-row items-center justify-center gap-2 h-14">
        <Link
          href="/admin"
          className="text-xs font-semibold hover:text-primary px-3 h-14 flex items-center justify-center transition-colors text-slate-600"
        >
          Dashboard
        </Link>
        <Link
          href="/admin/packages"
          className="text-xs font-semibold hover:text-primary px-3 h-14 flex items-center justify-center transition-colors text-slate-600"
        >
          Packages
        </Link>
        <Link
          href="/admin/blogs"
          className="text-xs font-semibold hover:text-primary px-3 h-14 flex items-center justify-center transition-colors text-slate-600"
        >
          Blogs
        </Link>
        <Link
          href="/admin/support"
          className="text-xs font-semibold hover:text-primary px-3 h-14 flex items-center justify-center transition-colors text-slate-600"
        >
          Support
        </Link>
        <Link
          href="/"
          className="text-xs font-semibold hover:text-primary px-3 h-14 flex items-center justify-center transition-colors text-slate-500"
          title="Visit Public Website"
        >
          <BiHome className="text-base mr-1" />
          Public Site
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full text-xs text-slate-700 font-medium">
          <BiShieldQuarter className="text-secondary text-sm" />
          <span>Operator</span>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center justify-center border border-secondary text-secondary hover:bg-secondary hover:text-white px-3 py-1 rounded-full font-semibold transition-colors duration-200 text-xs md:text-sm cursor-pointer gap-1"
        >
          <BiLogOut className="text-sm" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </nav>
  );
}
