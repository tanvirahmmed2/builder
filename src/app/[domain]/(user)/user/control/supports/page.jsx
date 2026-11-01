'use client';
import React, { useState } from 'react';
import { BiSupport, BiPlus } from 'react-icons/bi';

export default function CustomerSupportsPage() {
  const [openModal, setOpenModal] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Support & Helpdesk</h1>
          <p className="text-xs text-slate-400 mt-1">Get assistance directly from the store and support staff.</p>
        </div>
        <button
          onClick={() => setOpenModal(true)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 shadow-md shadow-blue-600/30 transition-all"
        >
          <BiPlus className="text-base" />
          <span>New Ticket</span>
        </button>
      </div>

      <div className="rounded-2xl border border-white/10 bg-slate-900/30 p-16 text-center text-slate-500">
        <BiSupport className="mx-auto text-4xl mb-2 text-slate-600" />
        <p>No active tickets. Everything is running smoothly!</p>
      </div>
    </div>
  );
}

