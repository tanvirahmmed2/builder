'use client';

import { useContext } from 'react';
import Link from 'next/link';
import { BiSun, BiMoon } from 'react-icons/bi';
import { COMPANY_NAME, COMPANY_URL, SITE_ADDRESS, SITE_CONTACT, SITE_MAIL, SITE_NAME } from '@/lib/db/secret';
import { Context } from '@/components/helper/Context';
import SubscribeForm from '@/components/home/bar/SubscribeForm';
import TranslateButton from '@/components/ui/TranslateButton';

const Footer = () => {
  const { theme = 'light', toggleTheme } = useContext(Context) || {};
  const isDark = theme === 'dark';

  return (
    <footer className='w-full bg-primary dark:bg-slate-900 p-6 sm:p-10 lg:p-16 flex flex-col items-center justify-center gap-12 text-light transition-colors border-t border-primary/20 dark:border-slate-800'>
      <div className='w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12'>
        {/* Brand & Tagline */}
        <div className='w-full flex flex-col space-y-3'>
          <Link href="/" className='text-3xl md:text-5xl font-extrabold tracking-tight text-white'>
            {SITE_NAME}
          </Link>
          <p className="text-xs sm:text-sm text-white/90 font-medium">Build your identity on the modern web</p>
          <p className="text-xs text-white/75 leading-relaxed">
            The all-in-one portfolio website builder designed for creators, developers, designers, and web professionals.
          </p>
        </div>

        {/* Quick Links */}
        <div className="space-y-3">
          <p className='text-base font-bold uppercase tracking-wider text-white/90'>Platform</p>
          <div className='flex flex-col space-y-2 text-xs text-white/80'>
            <Link href={'/creator/login'} className="hover:text-white transition-colors">Creator Studio Login</Link>
            <Link href={'/packages'} className="hover:text-white transition-colors">Pricing &amp; Plans</Link>
            <Link href={'/updates'} className="hover:text-white transition-colors">Changelog &amp; Releases</Link>
            <Link href={'/blogs'} className="hover:text-white transition-colors">Articles &amp; Guides</Link>
            <Link href={'/faqs'} className="hover:text-white transition-colors">Frequently Asked Questions</Link>
            <Link href={'/reviews'} className="hover:text-white transition-colors">Reviews &amp; Testimonials</Link>
            <Link href={'/tutorials'} className="hover:text-white transition-colors">Video Tutorials</Link>
          </div>
        </div>

        {/* Contact & Support */}
        <div className="space-y-3">
          <p className='text-base font-bold uppercase tracking-wider text-white/90'>Support</p>
          <div className='flex flex-col space-y-2 text-xs text-white/80'>
            <p className="flex items-center gap-1.5 font-mono">{SITE_MAIL}</p>
            <p className="flex items-center gap-1.5">{SITE_CONTACT}</p>
            <p className="leading-relaxed">{SITE_ADDRESS}</p>
            <div className="pt-2">
              <Link
                href="/contact"
                className="inline-flex items-center text-xs font-bold text-white hover:underline"
              >
                Contact Support &rarr;
              </Link>
            </div>
          </div>
        </div>

        {/* Newsletter Subscription Component */}
        <div className="w-full">
          <SubscribeForm source="HOME_FOOTER" />
        </div>
      </div>

      <div className='w-full flex flex-col md:flex-row items-center justify-between gap-4 text-light font-sans pt-4 border-t border-white/15'>
        <p>2026 {SITE_NAME} | Build Your Identity on Web</p>

        {/* Controls: Color Mode & Translation */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          <div className="flex items-center gap-2">
            <span className="text-xs opacity-80">Theme:</span>
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/25 bg-black/20 hover:bg-black/35 text-white text-xs font-semibold backdrop-blur-md transition-all cursor-pointer shadow-xs"
              title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
              aria-label="Toggle colour mode"
            >
              {isDark ? (
                <>
                  <BiSun className="text-amber-300 text-sm" />
                  <span>Light</span>
                </>
              ) : (
                <>
                  <BiMoon className="text-slate-200 text-sm" />
                  <span>Dark</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs opacity-80">Translate:</span>
            <TranslateButton align="right" variant="dark" />
          </div>
        </div>

        <p>A Product of <Link href={`${COMPANY_URL}`}>{COMPANY_NAME}</Link></p>
      </div>
    </footer>
  );
};

export default Footer;