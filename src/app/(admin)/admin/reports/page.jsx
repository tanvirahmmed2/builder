'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AlertCircleIcon } from '@/components/ui/Icons';

export default function ReportsManagementPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // Resolution modal state
  const [selectedReport, setSelectedReport] = useState(null);
  const [adminResponse, setAdminResponse] = useState('');
  const [status, setStatus] = useState('RESOLVED');

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin');
      const data = await res.json();
      if (data.success) {
        setReports(data.reports || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleRespond = async (e) => {
    e.preventDefault();
    if (!selectedReport) return;
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'respond_report',
          reportId: selectedReport.id,
          adminResponse,
          status,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSelectedReport(null);
        fetchReports();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Link href="/admin" className="text-xs text-indigo-400 hover:underline">← Admin Overview</Link>
          <span className="text-slate-600">/</span>
          <span className="text-xs text-slate-400">Support Desk</span>
        </div>
        <h1 className="text-2xl font-bold text-white mt-1">Reports & Incident Helpdesk</h1>
        <p className="text-xs text-slate-400">
          Review issues, inquiries, and technical reports submitted by Creators and End Users; write official Admin responses.
        </p>
      </div>

      <div className="space-y-4">
        {reports.map((rep) => (
          <div
            key={rep.id}
            className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg"
          >
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                  {rep.priority}
                </span>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-white/10 text-slate-300 uppercase">
                  {rep.category}
                </span>
                <span className="text-xs text-slate-400">
                  By <strong>{rep.reporterName}</strong> ({rep.reporterEmail})
                </span>
              </div>

              <h3 className="text-base font-bold text-white">{rep.subject}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{rep.description}</p>

              {rep.adminResponse && (
                <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 space-y-1 mt-2">
                  <div className="font-bold">Official Admin Response:</div>
                  <div>{rep.adminResponse}</div>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  rep.status === 'RESOLVED'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}
              >
                {rep.status}
              </span>

              <button
                onClick={() => {
                  setSelectedReport(rep);
                  setAdminResponse(rep.adminResponse || '');
                  setStatus(rep.status);
                }}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all"
              >
                Respond / Update
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* RESOLUTION MODAL */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-white text-base">Respond to Report</h3>
              <button onClick={() => setSelectedReport(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl text-xs space-y-1 border border-white/5">
              <div className="text-slate-400">Subject: <strong className="text-white">{selectedReport.subject}</strong></div>
              <div className="text-slate-400">Reporter: {selectedReport.reporterName}</div>
            </div>

            <form onSubmit={handleRespond} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Update Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="OPEN">OPEN</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="RESOLVED">RESOLVED</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Official Response</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Provide detailed explanation or action taken..."
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setSelectedReport(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow"
                >
                  Send Admin Response
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
