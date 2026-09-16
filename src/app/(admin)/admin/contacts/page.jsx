'use client';

import { useState, useEffect } from 'react';
import AdminTableLayout from '@/components/admin/AdminTableLayout';
import ContactForm from '@/components/admin/forms/ContactForm';

export default function AdminContactsPage() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/contacts');
      const data = await res.json();
      if (data.success) {
        setContacts(data.records || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  return (
    <AdminTableLayout
      title="Public Contact Inquiries"
      subtitle="Manage visitor questions, business partnerships, and inbound contact requests."
      badgeText="Contact"
      badgeColor="secondary"
      tableName="contacts"
      apiEndpoint="/api/admin/contacts"
      records={contacts}
      loading={loading}
      onRefresh={fetchContacts}
      FormComponent={ContactForm}
      searchPlaceholder="Search contacts by name, email, or subject..."
      filterPredicate={(c, q) =>
        c.name?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.subject?.toLowerCase().includes(q) ||
        c.message?.toLowerCase().includes(q)
      }
      columns={['ID', 'Sender Name', 'Email', 'Subject', 'Status', 'Date Received']}
      renderRow={(c) => (
        <>
          <td className="px-4 py-3 font-mono font-bold text-slate-500">#{c.id}</td>
          <td className="px-4 py-3 font-bold text-slate-800">{c.name}</td>
          <td className="px-4 py-3 font-mono text-slate-600">{c.email}</td>
          <td className="px-4 py-3 max-w-xs">
            <div className="font-semibold text-slate-800 truncate">{c.subject}</div>
            <div className="text-slate-400 text-[11px] truncate">{c.message}</div>
          </td>
          <td className="px-4 py-3">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                c.status === 'NEW'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : c.status === 'REPLIED'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              {c.status}
            </span>
          </td>
          <td className="px-4 py-3 text-slate-500 text-[11px]">
            {c.created_at ? new Date(c.created_at).toLocaleDateString() : '—'}
          </td>
        </>
      )}
    />
  );
}
