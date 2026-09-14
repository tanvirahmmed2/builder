'use client';

import { useState } from 'react';
import { BiSearch, BiPlus, BiMinus, BiTrash, BiRefresh } from 'react-icons/bi';

export default function AdminTableLayout({
  title,
  subtitle,
  badgeText,
  badgeColor = 'secondary',
  tableName,
  records = [],
  loading = false,
  onRefresh,
  FormComponent,
  formProps = {},
  columns = [],
  renderRow,
  searchPlaceholder = 'Search records...',
  filterPredicate,
}) {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const filteredRecords = records.filter((rec) => {
    if (!searchTerm.trim()) return true;
    if (filterPredicate) return filterPredicate(rec, searchTerm.toLowerCase());
    return JSON.stringify(rec).toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this record?')) return;
    setDeletingId(id);
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_record', table: tableName, id }),
      });
      const data = await res.json();
      if (data.success && onRefresh) {
        onRefresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>
            {badgeText && (
              <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                badgeColor === 'primary'
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'bg-secondary/10 text-secondary border border-secondary/20'
              }`}>
                {badgeText}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>

        <div className="flex items-center gap-2">
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
              title="Refresh table data"
            >
              <BiRefresh className="text-lg" />
            </button>
          )}

          {FormComponent && (
            <button
              type="button"
              onClick={() => setShowForm(!showForm)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
                showForm
                  ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  : 'bg-secondary hover:bg-secondary-dark text-white'
              }`}
            >
              {showForm ? <BiMinus className="text-base" /> : <BiPlus className="text-base" />}
              <span>{showForm ? 'Hide Form' : `Add ${badgeText || 'Record'}`}</span>
            </button>
          )}
        </div>
      </div>

      {/* Embedded Form Component (NO MODALS - IN PAGE) */}
      {showForm && FormComponent && (
        <FormComponent
          {...formProps}
          onSuccess={() => {
            setShowForm(false);
            if (onRefresh) onRefresh();
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Table Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        {/* Search & Counter Bar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50">
          <div className="relative w-full sm:w-72">
            <BiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all"
            />
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Showing <span className="font-bold text-slate-800">{filteredRecords.length}</span> of {records.length} records
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                {columns.map((col, idx) => (
                  <th key={idx} className="px-4 py-3 whitespace-nowrap">
                    {col}
                  </th>
                ))}
                <th className="px-4 py-3 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={columns.length + 1} className="py-12 text-center text-slate-400">
                    Loading {title.toLowerCase()}...
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 1} className="py-12 text-center text-slate-400">
                    No records found in this table. Click &quot;Add {badgeText || 'Record'}&quot; above to add one.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec, idx) => (
                  <tr key={rec.id || idx} className="hover:bg-slate-50/60 transition-colors">
                    {renderRow(rec, idx)}
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        type="button"
                        disabled={deletingId === rec.id}
                        onClick={() => handleDelete(rec.id)}
                        className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete record"
                      >
                        <BiTrash className="text-base" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
