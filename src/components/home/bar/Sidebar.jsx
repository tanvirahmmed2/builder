'use client';

import { useState, useContext } from 'react';
import Link from 'next/link';
import { SITE_NAME } from '@/lib/db/secret';
import { BiX, BiChevronDown, BiChevronUp } from 'react-icons/bi';
import { Context } from '@/components/helper/Context';

export default function Sidebar({ isOpen, onClose }) {
  const { apps } = useContext(Context);
  const [appsOpen, setAppsOpen] = useState(false);

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className={`fixed inset-0 bg-black/40 z-50 md:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-72 max-w-[85vw] bg-white z-50 md:hidden flex flex-col justify-between shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Mobile Navigation"
      >
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Header */}
          <div className="h-14 px-4 flex items-center justify-between border-b border-slate-100">
            <Link
              href="/"
              onClick={onClose}
              className="text-lg font-bold text-slate-800 hover:text-primary transition-colors"
            >
              {SITE_NAME}
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="text-2xl p-1 text-slate-600 hover:text-secondary rounded-md transition-colors cursor-pointer"
              aria-label="Close menu"
            >
              <BiX />
            </button>
          </div>

          {/* Nav links */}
          <nav className="flex flex-col p-4 space-y-1">
            <Link
              href="/themes"
              onClick={onClose}
              className="px-3 py-2 rounded-lg font-medium text-slate-700 hover:text-primary hover:bg-slate-50 transition-colors"
            >
              Themes
            </Link>

            {/* Apps with expandable sub-items */}
            <div>
              <div className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors">
                <Link
                  href="/apps"
                  onClick={onClose}
                  className="font-medium text-slate-700 hover:text-primary transition-colors flex-1"
                >
                  Apps
                </Link>
                {apps && apps.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setAppsOpen((prev) => !prev)}
                    className="p-1 text-slate-500 hover:text-primary transition-colors cursor-pointer"
                    aria-label="Toggle apps sub-menu"
                  >
                    {appsOpen ? <BiChevronUp className="text-xl" /> : <BiChevronDown className="text-xl" />}
                  </button>
                )}
              </div>

              {appsOpen && apps && apps.length > 0 && (
                <div className="ml-4 pl-2 border-l-2 border-primary/30 flex flex-col space-y-1 mt-1">
                  {apps.map((app) => (
                    <Link
                      key={app.id}
                      href={app.path || `/apps/${app.slug}`}
                      onClick={onClose}
                      className="px-3 py-1.5 text-sm text-slate-600 hover:text-primary rounded-md transition-colors"
                    >
                      {app.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/packages"
              onClick={onClose}
              className="px-3 py-2 rounded-lg font-medium text-slate-700 hover:text-primary hover:bg-slate-50 transition-colors"
            >
              Packages
            </Link>
            <Link
              href="/updates"
              onClick={onClose}
              className="px-3 py-2 rounded-lg font-medium text-slate-700 hover:text-primary hover:bg-slate-50 transition-colors"
            >
              Updates
            </Link>
            <Link
              href="/faqs"
              onClick={onClose}
              className="px-3 py-2 rounded-lg font-medium text-slate-700 hover:text-primary hover:bg-slate-50 transition-colors"
            >
              FAQs
            </Link>
            <Link
              href="/contact"
              onClick={onClose}
              className="px-3 py-2 rounded-lg font-medium text-slate-700 hover:text-primary hover:bg-slate-50 transition-colors"
            >
              Contact
            </Link>
            <Link
              href="/about"
              onClick={onClose}
              className="px-3 py-2 rounded-lg font-medium text-slate-700 hover:text-primary hover:bg-slate-50 transition-colors"
            >
              About
            </Link>
          </nav>
        </div>

        {/* Footer CTA */}
        <div className="p-4 border-t border-slate-100">
          <Link
            href="/creator/login"
            onClick={onClose}
            className="w-full inline-flex items-center justify-center border border-secondary text-secondary hover:bg-secondary hover:text-light py-2 px-4 rounded-full font-semibold transition-colors duration-200 text-sm"
          >
            Start Now
          </Link>
        </div>
      </aside>
    </>
  );
}
