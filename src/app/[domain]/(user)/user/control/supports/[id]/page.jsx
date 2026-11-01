'use client';
import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { BiArrowBack, BiSupport } from 'react-icons/bi';

export default function TicketDetailPage() {
  const params = useParams();
  const domain = params?.domain || '';
  const id = params?.id || '';
  const basePrefix = domain ? `/${domain}` : '';

  return (
    <div className="space-y-6">
      <Link
        href={`${basePrefix}/user/control/supports`}
        className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white"
      >
        <BiArrowBack />
        <span>Back to Tickets</span>
      </Link>

      <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-6 space-y-4">
        <h2 className="text-xl font-bold text-white">Ticket #{id}</h2>
        <p className="text-xs text-slate-400">Status: In Progress &bull; Department: Customer Care</p>
      </div>
    </div>
  );
}

