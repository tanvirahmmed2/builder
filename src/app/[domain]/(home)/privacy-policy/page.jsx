'use client';
import React, { useContext } from 'react';
import { WebsiteContext } from '@/components/website/context/WebsiteContext';

export default function StorePrivacyPolicyPage() {
  const { website } = useContext(WebsiteContext) || {};
  const siteName = website?.settings?.site_name || website?.name || 'Our Website';

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 space-y-8 text-slate-300">
      <div className="space-y-2 border-b border-white/10 pb-6">
        <h1 className="text-3xl font-extrabold text-white">Privacy Policy & Terms of Service</h1>
        <p className="text-xs text-slate-500">Last updated: {new Date().toLocaleDateString()}</p>
      </div>

      <div className="space-y-6 text-sm leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">1. Information We Collect</h2>
          <p>
            When you browse or interact with {siteName}, we may collect personal details such as your name,
            email address, shipping location, and phone number when you place an order, create an account,
            or contact us.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">2. How We Use Information</h2>
          <p>
            We use collected data solely to process orders, facilitate seamless communication, deliver customer
            support, and improve our platform experience. We never sell your personal data to third-party brokers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">3. Data Security & Cookies</h2>
          <p>
            We deploy modern encryption standards, secure HTTP-only cookies, and robust multi-tenant database
            isolation to protect your session and transactions.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">4. Contact & Compliance</h2>
          <p>
            For privacy inquiries, GDPR data export, or deletion requests, please contact our privacy compliance
            officer via the contact page.
          </p>
        </section>
      </div>
    </div>
  );
}

