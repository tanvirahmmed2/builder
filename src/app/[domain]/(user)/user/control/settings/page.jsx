'use client';
import React from 'react';
import { BiCog, BiBell, BiShieldQuarter } from 'react-icons/bi';

export default function CustomerSettingsPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div className="border-b border-white/10 pb-4">
        <h1 className="text-2xl font-bold text-white">Account Settings</h1>
        <p className="text-xs text-slate-400 mt-1">Configure notification preferences and security options.</p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-white">Order SMS Notifications</h4>
            <p className="text-xs text-slate-400">Receive tracking updates when your items ship</p>
          </div>
          <span className="text-xs font-semibold text-emerald-400">Active</span>
        </div>

        <div className="flex items-center justify-between border-t border-white/5 pt-4">
          <div>
            <h4 className="text-sm font-semibold text-white">Promotional Newsletters</h4>
            <p className="text-xs text-slate-400">Exclusive coupon codes and seasonal announcements</p>
          </div>
          <span className="text-xs font-semibold text-slate-400">Subscribed</span>
        </div>
      </div>
    </div>
  );
}

