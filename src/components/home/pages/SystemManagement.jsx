'use client';

import React from 'react';
import Link from 'next/link';
import {
  BiGridAlt,
  BiMessageSquareDetail,
  BiCalendar,
  BiGroup,
  BiShieldQuarter,
  BiLineChart,
  BiRightArrowAlt,
  BiCheckCircle,
  BiCheck,
  BiDesktop,
} from 'react-icons/bi';

export default function SystemManagement() {
  return (
    <section className="w-full py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Section Heading */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-bold uppercase tracking-wider">
            <BiGridAlt className="text-blue-500 text-sm" />
            <span>Unified Business Operations</span>
          </div>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-snug">
            One central command hub for your entire business
          </h2>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            Say goodbye to stitching together 10 different subscription services. Manage websites, live chat inquiries, appointments, customer databases, and team roles from a single, unified operations dashboard.
          </p>
        </div>

        {/* 6 Capabilities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Module 1: Multi-Site */}
          <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 space-y-3 shadow-xs hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center text-2xl">
              <BiDesktop />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Multi-Website Portfolio Hub</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Launch, organize, and administer multiple client or personal websites from a single account without separate logins or confusing hostings.
            </p>
          </div>

          {/* Module 2: Live Chat */}
          <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 space-y-3 shadow-xs hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-2xl">
              <BiMessageSquareDetail />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Live Customer Chat &amp; Inquiries</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Connect with visitors while they browse your site. Direct real-time messaging, visitor identification, and automated offline lead capture.
            </p>
          </div>

          {/* Module 3: Appointments */}
          <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 space-y-3 shadow-xs hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center text-2xl">
              <BiCalendar />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Built-in Calendar &amp; Bookings</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Set availability slots, collect booking deposits, send automated reminder notifications, and sync appointments with zero external fees.
            </p>
          </div>

          {/* Module 4: Analytics */}
          <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 space-y-3 shadow-xs hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-2xl">
              <BiLineChart />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Visitor Analytics &amp; Telemetry</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Real-time traffic metrics, top performing pages, conversion funnels, country breakdown, and device telemetry without invasive third-party cookies.
            </p>
          </div>

          {/* Module 5: Team Roles */}
          <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 space-y-3 shadow-xs hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center text-2xl">
              <BiGroup />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Role-Based Team Collaboration</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Invite editors, developers, marketers, and support operators with granular module-level permission assignments and secure session controls.
            </p>
          </div>

          {/* Module 6: Spam Defense */}
          <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 space-y-3 shadow-xs hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center text-2xl">
              <BiShieldQuarter />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Proactive Spam &amp; DDoS Defense</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Smart bot detection, automated honeypots on contact forms, IP rate limiting, and brute-force protection guarding your platform 24/7.
            </p>
          </div>
        </div>

        {/* Dashboard Preview Banner */}
        <div className="rounded-3xl p-8 bg-slate-950 border border-slate-800 text-white shadow-2xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <h4 className="text-lg font-bold">Platform Operations Live Feed</h4>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Real-time activity across all connected websites and stores</p>
            </div>
            <Link
              href="/creator/login"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-md w-fit"
            >
              <span>Access Creator Dashboard</span>
              <BiRightArrowAlt className="text-base" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400">Total Pageviews</span>
              <span className="text-xl sm:text-2xl font-black text-white font-mono block mt-1">142,850</span>
              <span className="text-[10px] text-emerald-400 font-bold">+18.4% vs last week</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400">Active Bookings</span>
              <span className="text-xl sm:text-2xl font-black text-white font-mono block mt-1">38</span>
              <span className="text-[10px] text-purple-400 font-bold">100% confirmed</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400">Live Inquiries</span>
              <span className="text-xl sm:text-2xl font-black text-white font-mono block mt-1">12</span>
              <span className="text-[10px] text-blue-400 font-bold">Avg reply: 2 mins</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400">System Uptime</span>
              <span className="text-xl sm:text-2xl font-black text-white font-mono block mt-1">99.98%</span>
              <span className="text-[10px] text-emerald-400 font-bold">Zero downtime</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}