'use client';

import Link from 'next/link';
import { useCreator } from './layout';
import {
  BiCube,
  BiDesktop,
  BiCreditCard,
  BiCheckShield,
  BiPlus,
  BiLinkExternal,
  BiTimeFive,
  BiCheckCircle,
  BiPalette,
  BiRightArrowAlt,
  BiBell,
} from 'react-icons/bi';

export default function CreatorOverviewPage() {
  const {
    creator,
    creatorId,
    activeSubscription,
    websites = [],
    payments = [],
    updates = [],
    stats = {},
    openCreateWebsiteModal,
  } = useCreator();

  const daysRemaining = stats?.daysRemaining || 0;
  const hasActivePackage = stats?.hasActivePackage ?? Boolean(activeSubscription);
  const maxWebsites = stats?.maxWebsites || activeSubscription?.max_portfolios || 1;
  const totalSpentFormatted = (Number(stats?.totalSpentCents || 0) / 100).toFixed(2);

  const statCards = [
    {
      title: 'Active Package Tier',
      value: activeSubscription?.package_name || 'No Active Plan',
      sub: daysRemaining > 0 ? `${daysRemaining} days remaining in cycle` : 'Select package to launch site',
      icon: BiCube,
      href: `/creator/${creatorId}/purchases`,
      color: 'indigo',
    },
    {
      title: 'Websites Hosted',
      value: `${websites.length} / ${maxWebsites}`,
      sub: `${Math.max(0, maxWebsites - websites.length)} slot(s) available in plan`,
      icon: BiDesktop,
      href: `/creator/${creatorId}/webites`,
      color: 'emerald',
    },
    {
      title: 'Total Billing Invested',
      value: `$${totalSpentFormatted} USD`,
      sub: `Across ${payments.length} settled transaction(s)`,
      icon: BiCreditCard,
      href: `/creator/${creatorId}/payments`,
      color: 'purple',
    },
    {
      title: 'Storage & Security',
      value: `${stats?.totalStorageMb || 0} MB`,
      sub: creator?.two_factor_enabled ? '2FA Enabled • Verified Account' : 'Verified Creator Account',
      icon: BiCheckShield,
      href: `/creator/${creatorId}/settings`,
      color: 'teal',
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Welcome Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-secondary/10 text-secondary border border-secondary/20">
              {hasActivePackage ? activeSubscription?.package_name : 'CREATOR WORKSPACE'}
            </span>
            <span className="text-xs text-slate-500 font-semibold">
              • {daysRemaining > 0 ? `${daysRemaining} Days Active` : 'Package Required'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Welcome back, {creator?.name || 'Creator'}!
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            {creator?.bio ||
              'Build, publish, and scale bespoke portfolio websites with our instant drag-and-drop studio.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {hasActivePackage ? (
            <button
              type="button"
              onClick={openCreateWebsiteModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <BiPlus className="text-base" />
              <span>New Website</span>
            </button>
          ) : (
            <Link
              href={`/creator/${creatorId}/purchases`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-secondary hover:bg-secondary-dark text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <BiCube className="text-base" />
              <span>Purchase Package</span>
            </Link>
          )}

          <Link
            href={`/creator/${creatorId}/webites`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors cursor-pointer"
          >
            <span>My Websites ({websites.length})</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Link
              key={idx}
              href={stat.href}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-slate-100 text-slate-800">
                    <Icon className="text-xl" />
                  </div>
                  <BiRightArrowAlt className="text-slate-400 group-hover:text-slate-800 group-hover:translate-x-1 transition-all text-lg" />
                </div>
                <div className="text-2xl font-bold text-slate-900 tracking-tight">{stat.value}</div>
                <div className="text-xs text-slate-500 font-semibold mt-1">{stat.title}</div>
              </div>
              <div className="text-[11px] text-slate-500 mt-3 pt-2 border-t border-slate-100">
                {stat.sub}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Hosted Websites Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BiDesktop className="text-slate-800 text-xl" />
              <span>Your Hosted Portfolio Websites</span>
            </h2>
            <p className="text-xs text-slate-500">
              Live websites and visual templates provisioned under your package subscription.
            </p>
          </div>

          <Link
            href={`/creator/${creatorId}/webites`}
            className="text-xs text-secondary hover:underline font-semibold flex items-center gap-1"
          >
            <span>Manage All Websites</span>
            <BiRightArrowAlt className="text-base" />
          </Link>
        </div>

        {websites.length === 0 ? (
          <div className="p-8 rounded-3xl bg-white border border-slate-200 text-center space-y-4 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center mx-auto text-3xl">
              <BiDesktop />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="text-base font-bold text-slate-900">No Websites Created Yet</h3>
              <p className="text-xs text-slate-500">
                {hasActivePackage
                  ? 'Your package is active. Launch your flagship website now with edge subdomain hosting.'
                  : 'You need an active package before creating your website. Select a package to start.'}
              </p>
            </div>
            <div>
              {hasActivePackage ? (
                <button
                  type="button"
                  onClick={openCreateWebsiteModal}
                  className="px-5 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  Create Your First Website
                </button>
              ) : (
                <Link
                  href={`/creator/${creatorId}/purchases`}
                  className="px-5 py-2.5 rounded-full bg-secondary hover:bg-secondary-dark text-white text-xs font-semibold shadow-xs transition-colors inline-block"
                >
                  Choose Subscription Package
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {websites.map((w) => (
              <div
                key={w.id}
                className="rounded-2xl bg-white border border-slate-200 p-6 flex flex-col justify-between space-y-5 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                        w.is_published
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {w.is_published ? '● Live' : 'Draft'}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {w.storage_used_mb || 12} MB used
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-slate-700 transition-colors">
                      {w.name}
                    </h3>
                    <div className="mt-1 flex items-center gap-1.5 text-xs font-mono text-slate-600">
                      <span>{w.subdomain}.saasplatform.com</span>
                    </div>
                  </div>

                  {w.custom_domain && (
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-[11px] flex justify-between items-center text-slate-700">
                      <span className="text-slate-500">Custom Domain:</span>
                      <span className="font-mono text-slate-900 font-semibold">{w.custom_domain}</span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <a
                    href={`/sites/${w.subdomain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 px-3 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Live Site</span>
                    <BiLinkExternal className="text-sm text-secondary" />
                  </a>

                  <Link
                    href={`/builder/${w.id}`}
                    className="flex-1 py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <BiPalette className="text-sm" />
                    <span>Canvas Studio</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Two Column Section: Recent Billing & Product Updates */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Billing Activity (2 Cols) */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BiCreditCard className="text-slate-700 text-lg" />
              <span>Recent Subscription Billing</span>
            </h3>
            <Link
              href={`/creator/${creatorId}/payments`}
              className="text-xs text-secondary hover:underline font-semibold"
            >
              All Invoices →
            </Link>
          </div>

          {payments.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">No payment transactions found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-500 text-[11px] font-semibold uppercase">
                    <th className="pb-3">Transaction</th>
                    <th className="pb-3">Package</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3">Method</th>
                    <th className="pb-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {payments.slice(0, 5).map((pay) => (
                    <tr key={pay.id} className="hover:bg-slate-50">
                      <td className="py-3 font-mono text-slate-900 text-[11px]">{pay.transaction_id}</td>
                      <td className="py-3 font-semibold text-slate-900">{pay.package_name || 'Creator Plan'}</td>
                      <td className="py-3 text-slate-900 font-bold font-mono">
                        ${(Number(pay.amount_in_cents || 0) / 100).toFixed(2)} {pay.currency}
                      </td>
                      <td className="py-3 text-slate-500">{pay.payment_method}</td>
                      <td className="py-3 text-right">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {pay.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Product Announcements Ticker (1 Col) */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BiBell className="text-slate-700 text-lg" />
                <span>Product Updates</span>
              </h3>
              <Link
                href={`/creator/${creatorId}/updates`}
                className="text-xs text-secondary hover:underline font-semibold"
              >
                Changelog →
              </Link>
            </div>

            <div className="space-y-3">
              {updates.slice(0, 3).map((up) => (
                <div key={up.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-secondary uppercase tracking-wider">
                    Release Note
                  </span>
                  <h4 className="text-xs font-bold text-slate-900">{up.title}</h4>
                  <div
                    className="text-[11px] text-slate-500 line-clamp-2"
                    dangerouslySetInnerHTML={{
                      __html: (up.description || '').replace(/<[^>]*>/g, ' '),
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <Link
              href={`/creator/${creatorId}/tickets`}
              className="w-full py-2 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Need Assistance? Contact Support</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
