'use client';
import React from 'react';
import { BiCreditCard } from 'react-icons/bi';

export default function CustomerPaymentsPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-white/10 pb-4">
        <h1 className="text-2xl font-bold text-white">Payment Methods & Invoices</h1>
        <p className="text-xs text-slate-400 mt-1">Review your saved cards, transaction receipts, and payment status.</p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-slate-900/30 p-16 text-center text-slate-500">
        <BiCreditCard className="mx-auto text-4xl mb-2 text-slate-600" />
        <p>No saved cards. All recent receipts are available in your order details.</p>
      </div>
    </div>
  );
}

