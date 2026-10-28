'use client';
import React, { useContext } from 'react';
import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { Context } from '@/components/helper/Context';
import { ROLE_PERMISSIONS } from '@/app/[domain]/(panel)/panel/control/layout';
import {
  BiHome,
  BiCart,
  BiTimeFive,
  BiCheckCircle,
  BiHistory,
  BiUndo,
  BiPackage,
  BiCategory,
  BiBookmark,
  BiArchive,
  BiBarcode,
  BiShoppingBag,
  BiCreditCard,
  BiBuilding,
  BiUserCheck,
  BiWallet,
  BiMoney,
  BiTrendingUp,
  BiReceipt,
  BiLineChart,
  BiCoin,
  BiGroup,
  BiDollarCircle,
  BiMapPin,
  BiStar,
  BiSupport,
  BiEnvelope,
  BiErrorCircle,
  BiBell,
  BiCog,
  BiGridAlt,
  BiListUl,
  BiShieldCheck,
  BiCloudDownload,
  BiUser,
  BiLogOut,
  BiX
} from 'react-icons/bi';

const NAV_SECTIONS = [
  {
    title: 'Core & POS',
    items: [
      { slug: 'overview', label: 'Admin Overview', icon: BiHome, path: 'overview' },
      { slug: 'sale', label: 'POS Terminal', icon: BiCart, path: 'sale' },
      { slug: 'pending-sale', label: 'Pending Sales', icon: BiTimeFive, path: 'pending-sale' },
      { slug: 'confirmed-sale', label: 'Confirmed Sales', icon: BiCheckCircle, path: 'confirmed-sale' },
      { slug: 'out_for_delivery', label: 'Out For Delivery', icon: BiShoppingBag, path: 'out_for_delivery' },
      { slug: 'completed-sale', label: 'Completed Sales', icon: BiCheckCircle, path: 'completed-sale' },
      { slug: 'history', label: 'Sales History', icon: BiHistory, path: 'history' },
      { slug: 'return', label: 'Returns', icon: BiUndo, path: 'return' },
    ]
  },
  {
    title: 'Inventory & Catalog',
    items: [
      { slug: 'product', label: 'Products Catalog', icon: BiPackage, path: 'product' },
      { slug: 'category', label: 'Categories', icon: BiCategory, path: 'category' },
      { slug: 'brands', label: 'Brands', icon: BiBookmark, path: 'brands' },
      { slug: 'stock', label: 'Inventory Stock', icon: BiArchive, path: 'stock' },
      { slug: 'price-tag', label: 'Price Tags & Barcodes', icon: BiBarcode, path: 'price-tag' },
    ]
  },
  {
    title: 'Purchases & CRM',
    items: [
      { slug: 'purchase', label: 'Supplier Purchases', icon: BiShoppingBag, path: 'purchase' },
      { slug: 'purchase-payments', label: 'Purchase Payments', icon: BiCreditCard, path: 'purchase-payments' },
      { slug: 'supplier', label: 'Suppliers', icon: BiBuilding, path: 'supplier' },
      { slug: 'customers', label: 'Customer Directory', icon: BiUserCheck, path: 'customers' },
    ]
  },
  {
    title: 'Finance & Accounts',
    items: [
      { slug: 'balance', label: 'Balance & Ledger', icon: BiWallet, path: 'balance' },
      { slug: 'available-balance', label: 'Available Balance', icon: BiMoney, path: 'available-balance' },
      { slug: 'profits', label: 'Profits & Transfers', icon: BiTrendingUp, path: 'profits' },
      { slug: 'expenses', label: 'Expenses', icon: BiReceipt, path: 'expenses' },
      { slug: 'expense-payments', label: 'Expense Payments', icon: BiCreditCard, path: 'expense-payments' },
      { slug: 'investor', label: 'Investors', icon: BiLineChart, path: 'investor' },
      { slug: 'investments', label: 'Investments', icon: BiMoney, path: 'investments' },
      { slug: 'shares', label: 'Equity & Shares', icon: BiCoin, path: 'shares' },
      { slug: 'withdrawals', label: 'Withdrawals', icon: BiWallet, path: 'withdrawals' },
    ]
  },
  {
    title: 'HRM & Payroll',
    items: [
      { slug: 'people', label: 'Staff & People', icon: BiGroup, path: 'people' },
      { slug: 'salaries', label: 'Salary Structures', icon: BiDollarCircle, path: 'salaries' },
      { slug: 'staff-salaries', label: 'Staff Salaries', icon: BiDollarCircle, path: 'staff-salaries' },
      { slug: 'salary-payments', label: 'Salary Payments', icon: BiCreditCard, path: 'salary-payments' },
      { slug: 'my-salary', label: 'My Salary', icon: BiWallet, path: 'my-salary' },
    ]
  },
  {
    title: 'Operations & Helpdesk',
    items: [
      { slug: 'branches', label: 'Store Outlets', icon: BiMapPin, path: 'branches' },
      { slug: 'reviews', label: 'Customer Reviews', icon: BiStar, path: 'reviews' },
      { slug: 'support', label: 'Support Tickets', icon: BiSupport, path: 'support' },
      { slug: 'contact', label: 'Contact Inquiries', icon: BiEnvelope, path: 'contact' },
      { slug: 'issue', label: 'Issue Tracker', icon: BiErrorCircle, path: 'issue' },
      { slug: 'notices', label: 'Notice Board', icon: BiBell, path: 'notices' },
    ]
  },
  {
    title: 'System & Tools',
    items: [
      { slug: 'settings', label: 'Console Settings', icon: BiCog, path: 'settings' },
      { slug: 'modules', label: 'Active Modules', icon: BiGridAlt, path: 'modules' },
      { slug: 'activity-logs', label: 'Activity Logs', icon: BiListUl, path: 'activity-logs' },
      { slug: 'login-logs', label: 'Login Logs', icon: BiShieldCheck, path: 'login-logs' },
      { slug: 'backup', label: 'Database Backup', icon: BiCloudDownload, path: 'backup' },
      { slug: 'profile', label: 'My Profile', icon: BiUser, path: 'profile' },
    ]
  }
];

export default function ControlSidebar() {
  const { dashSidebar, toggleDashSidebar, user, setUser, setStaff } = useContext(Context);
  const pathname = usePathname();
  const params = useParams();
  const domain = params?.domain || '';

  const basePath = domain ? `/${domain}/panel/control` : '/panel/control';
  const role = (user?.role || 'staff').toLowerCase();
  const allowedModules = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.staff || [];

  const isItemAllowed = (slug) => {
    if (slug === 'profile') return true;
    if (role === 'admin') return true;
    return allowedModules.includes(slug);
  };

  const handleLogout = async () => {
    try {
      const axios = (await import('axios')).default;
      await axios.delete('/api/staff/sessions');
    } catch (_) {}
    if (setUser) setUser(null);
    if (setStaff) setStaff(null);
    window.location.replace('/');
  };

  const sidebarContent = (
    <div className="flex flex-col h-full overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 scrollbar-thin">
      
      {/* Mobile Drawer Header */}
      <div className="lg:hidden h-16 px-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
            C
          </div>
          <span className="font-bold text-sm text-slate-800 dark:text-white">Navigation</span>
        </div>
        <button
          type="button"
          onClick={toggleDashSidebar}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white"
        >
          <BiX className="text-2xl" />
        </button>
      </div>

      {/* Navigation Sections */}
      <div className="p-3 space-y-5 flex-1">
        {NAV_SECTIONS.map((section) => {
          const visibleItems = section.items.filter((item) => isItemAllowed(item.slug));
          if (visibleItems.length === 0) return null;

          return (
            <div key={section.title} className="space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 py-1">
                {section.title}
              </div>
              <div className="space-y-0.5">
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  const itemHref = `${basePath}/${item.path}`;
                  const isActive = pathname === itemHref || pathname.startsWith(`${itemHref}/`);

                  return (
                    <Link
                      key={item.slug}
                      href={itemHref}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30 font-bold'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <Icon className={`text-base shrink-0 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Sidebar Footer */}
      <div className="p-3 bg-white dark:bg-slate-900 sticky bottom-0 border-t border-slate-200 dark:border-slate-800 space-y-2">
        <Link
          href={`${basePath}/profile`}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition"
        >
          <BiUser className="text-base text-slate-400" />
          <span className="truncate">Staff Profile</span>
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-bold transition cursor-pointer"
        >
          <BiLogOut className="text-base" />
          <span>Sign Out</span>
        </button>
      </div>

    </div>
  );

  return (
    <>
      {/* Mobile Backdrop */}
      <div
        className={`fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 lg:hidden transition-opacity duration-300 ${
          dashSidebar ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={toggleDashSidebar}
        aria-hidden="true"
      />

      {/* Mobile Drawer */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-72 max-w-[85vw] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-50 lg:hidden shadow-2xl transition-transform duration-300 ease-in-out ${
          dashSidebar ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Staff Mobile Navigation"
      >
        {sidebarContent}
      </aside>

      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden lg:flex fixed top-16 left-0 bottom-0 w-64 flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-30 transition-transform duration-300 ease-in-out ${
          dashSidebar ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Staff Desktop Navigation"
      >
        {sidebarContent}
      </aside>
    </>
  );
}
