'use client';

import Link from 'next/link';
import { SITE_NAME } from '@/lib/db/secret';
import { BiMenu, BiLogOut, BiHome, BiShieldQuarter, BiCog } from 'react-icons/bi';
import { useRouter } from 'next/navigation';

export default function AdminNavbar({ onToggleSidebar, currentUser = null }) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/developer/me/logout', {
        method: 'POST',
      });
    } catch (_) {}
    router.push('/developer-auth/login');
    router.refresh();
  };

  const isUserAdmin = Boolean(
    currentUser?.isAdmin || (currentUser?.role || '').toLowerCase() === 'admin'
  );

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
        <Link href="/developer" className="text-xl font-semibold h-14 flex items-center gap-2">
          <span>{SITE_NAME}</span>
        </Link>
      </div>

      <div className="flex items-center gap-2.5">
        <Link
          href="/developer/profile"
          className="hidden sm:flex items-center gap-2 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 px-3 py-1 rounded-full text-xs text-slate-700 font-medium transition-colors"
          title="View My Profile"
        >
          <BiShieldQuarter className={`text-sm ${isUserAdmin ? 'text-purple-600' : 'text-secondary'}`} />
          <span className="font-semibold text-slate-800">
            {currentUser?.name || currentUser?.email}
          </span>
        </Link>

        <Link
          href="/developer/settings"
          className="p-1.5 rounded-full border border-slate-200 text-slate-600 hover:text-secondary hover:bg-slate-50 transition-colors"
          title="Account Settings"
        >
          <BiCog className="text-lg" />
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center justify-center border border-secondary text-secondary hover:bg-secondary hover:text-white px-3 py-1 rounded-full font-semibold transition-colors duration-200 text-xs md:text-sm cursor-pointer gap-1"
        >
          <BiLogOut className="text-sm" />
          <span className="hidden sm:inline">Log Out</span>
        </button>
      </div>
    </nav>
  );
}
