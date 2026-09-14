'use client';

import { useState, useEffect } from 'react';
import AdminTableLayout from '@/components/admin/AdminTableLayout';
import LeadForm from '@/components/admin/forms/LeadForm';

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin?table=leads');
      const data = await res.json();
      if (data.success) {
        setLeads(data.records || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  return (
    <AdminTableLayout
      title="Sales & Growth Leads"
      subtitle="Inbound prospect inquiries, enterprise evaluations, and high-value sales opportunities."
      badgeText="Lead"
      badgeColor="secondary"
      tableName="leads"
      records={leads}
      loading={loading}
      onRefresh={fetchLeads}
      FormComponent={LeadForm}
      searchPlaceholder="Search leads by name, email, or company..."
      filterPredicate={(l, q) =>
        l.name?.toLowerCase().includes(q) ||
        l.email?.toLowerCase().includes(q) ||
        l.company?.toLowerCase().includes(q) ||
        l.notes?.toLowerCase().includes(q)
      }
      columns={['ID', 'Prospect Name', 'Contact Info', 'Company', 'Source', 'Status', 'Captured Date']}
      renderRow={(l) => (
        <>
          <td className="px-4 py-3 font-mono font-bold text-slate-500">#{l.id}</td>
          <td className="px-4 py-3 font-bold text-slate-800">{l.name}</td>
          <td className="px-4 py-3">
            <div className="font-mono text-slate-700">{l.email}</div>
            <div className="text-[11px] text-slate-400">{l.phone || '—'}</div>
          </td>
          <td className="px-4 py-3 font-semibold text-slate-700">{l.company || '—'}</td>
          <td className="px-4 py-3 text-slate-500 text-[11px]">{l.source || 'WEBSITE'}</td>
          <td className="px-4 py-3">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                l.status === 'QUALIFIED'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : l.status === 'CONTACTED'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : l.status === 'NEW'
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              {l.status}
            </span>
          </td>
          <td className="px-4 py-3 text-slate-500 text-[11px]">
            {l.created_at ? new Date(l.created_at).toLocaleDateString() : '—'}
          </td>
        </>
      )}
    />
  );
}
