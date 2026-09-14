'use client';

import { useState, useEffect } from 'react';
import AdminTableLayout from '@/components/admin/AdminTableLayout';
import SupportTicketForm from '@/components/admin/forms/SupportTicketForm';

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin?table=support');
      const data = await res.json();
      if (data.success) {
        setTickets(data.records || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  return (
    <AdminTableLayout
      title="Customer Support Tickets"
      subtitle="Troubleshooting inquiries, platform issues, and creator assistance requests."
      badgeText="Support"
      badgeColor="primary"
      tableName="support"
      records={tickets}
      loading={loading}
      onRefresh={fetchTickets}
      FormComponent={SupportTicketForm}
      searchPlaceholder="Search tickets by number, requester, or subject..."
      filterPredicate={(t, q) =>
        t.ticket_number?.toLowerCase().includes(q) ||
        t.requester_name?.toLowerCase().includes(q) ||
        t.requester_email?.toLowerCase().includes(q) ||
        t.subject?.toLowerCase().includes(q)
      }
      columns={['Ticket #', 'Requester', 'Subject', 'Category', 'Priority', 'Status', 'Opened Date']}
      renderRow={(t) => (
        <>
          <td className="px-4 py-3 font-mono font-bold text-slate-800">{t.ticket_number}</td>
          <td className="px-4 py-3">
            <div className="font-semibold text-slate-800">{t.requester_name}</div>
            <div className="font-mono text-[11px] text-slate-400">{t.requester_email}</div>
          </td>
          <td className="px-4 py-3 max-w-xs font-medium text-slate-700 truncate">{t.subject}</td>
          <td className="px-4 py-3">
            <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
              {t.category}
            </span>
          </td>
          <td className="px-4 py-3">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                t.priority === 'HIGH' || t.priority === 'URGENT'
                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                  : t.priority === 'MEDIUM'
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              {t.priority}
            </span>
          </td>
          <td className="px-4 py-3">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                t.status === 'OPEN'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : t.status === 'RESOLVED'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              {t.status}
            </span>
          </td>
          <td className="px-4 py-3 text-slate-500 text-[11px]">
            {t.created_at ? new Date(t.created_at).toLocaleDateString() : '—'}
          </td>
        </>
      )}
    />
  );
}
