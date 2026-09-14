'use client';

import { useState, useEffect } from 'react';
import AdminTableLayout from '@/components/admin/AdminTableLayout';
import ReportForm from '@/components/admin/forms/ReportForm';

export default function AdminReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin?table=reports');
      const data = await res.json();
      if (data.success) {
        setReports(data.records || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <AdminTableLayout
      title="Platform Reports & Moderation"
      subtitle="Resolve content moderation tickets, DMCA notices, and terms of service inquiries."
      badgeText="Report"
      badgeColor="primary"
      tableName="reports"
      records={reports}
      loading={loading}
      onRefresh={fetchReports}
      FormComponent={ReportForm}
      searchPlaceholder="Search reports by subject, reporter, or category..."
      filterPredicate={(r, q) =>
        r.subject?.toLowerCase().includes(q) ||
        r.reporter_name?.toLowerCase().includes(q) ||
        r.reporter_email?.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q)
      }
      columns={['ID', 'Reporter', 'Subject', 'Category', 'Priority', 'Status', 'Filed Date']}
      renderRow={(r) => (
        <>
          <td className="px-4 py-3 font-mono font-bold text-slate-500">#{r.id}</td>
          <td className="px-4 py-3">
            <div className="font-semibold text-slate-800">{r.reporter_name}</div>
            <div className="font-mono text-[11px] text-slate-400">{r.reporter_email}</div>
          </td>
          <td className="px-4 py-3 max-w-xs">
            <div className="font-semibold text-slate-800 truncate">{r.subject}</div>
            <div className="text-[11px] text-slate-400 truncate">{r.description}</div>
          </td>
          <td className="px-4 py-3">
            <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
              {r.category}
            </span>
          </td>
          <td className="px-4 py-3">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                r.priority === 'HIGH' || r.priority === 'URGENT'
                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                  : r.priority === 'MEDIUM'
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              {r.priority}
            </span>
          </td>
          <td className="px-4 py-3">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                r.status === 'OPEN'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : r.status === 'RESOLVED'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              {r.status}
            </span>
          </td>
          <td className="px-4 py-3 text-slate-500 text-[11px]">
            {r.created_at ? new Date(r.created_at).toLocaleDateString() : '—'}
          </td>
        </>
      )}
    />
  );
}
