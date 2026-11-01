'use client';
import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Context } from '@/components/helper/Context';
import { 
  BiBookBookmark, 
  BiPlus, 
  BiTrash, 
  BiEdit, 
  BiLoaderAlt, 
  BiTransfer, 
  BiUser, 
  BiPhone, 
  BiDollarCircle, 
  BiX
} from 'react-icons/bi';

export default function TaliKhataControlPage() {
  const params = useParams();
  const domain = params?.domain || '';
  const basePath = domain ? `/${domain}/panel/control` : '/panel/control';

  const { dashSidebar } = useContext(Context);

  const [activeTab, setActiveTab] = useState('parties');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('party'); // 'party' or 'txn'
  const [selectedParty, setSelectedParty] = useState(null);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/tali-khata?tab=${activeTab}`);
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Fetch tali khata error:', err);
      toast.error('Failed to load ledger data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [activeTab]);

  const openNewPartyModal = () => {
    setModalType('party');
    setSelectedParty(null);
    setFormData({ name: '', phone: '', email: '', address: '', party_type: 'customer', opening_balance: 0 });
    setIsModalOpen(true);
  };

  const openNewTxnModal = (party) => {
    setModalType('txn');
    setSelectedParty(party);
    setFormData({ party_id: party.id, transaction_type: 'give', amount: '', note: '' });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...formData, type: modalType === 'txn' ? 'transaction' : 'party' };
      await axios.post('/api/tali-khata', payload);
      toast.success(modalType === 'txn' ? 'Transaction recorded' : 'Party created successfully');
      setIsModalOpen(false);
      fetchItems();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Action failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteParty = async (id) => {
    if (!confirm('Are you sure you want to delete this party and all ledger entries?')) return;
    try {
      await axios.delete(`/api/tali-khata/${id}`);
      toast.success('Party deleted');
      setItems(items.filter(it => it.id !== id));
    } catch (err) {
      toast.error('Failed to delete party');
    }
  };

  return (
    <div className={`w-full min-h-screen bg-slate-50 pt-20 pb-12 px-4 md:px-8 transition-all duration-300 ${dashSidebar ? 'lg:pl-64' : 'lg:pl-8'}`}>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-600 text-white flex items-center justify-center text-2xl font-bold shadow-md shadow-amber-600/20">
              <BiBookBookmark />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Tali Khata & Digital Ledger</h1>
              <p className="text-xs text-slate-500 mt-0.5">Track customer/supplier dues (baki/khoroch), digital credit ledgers, and payment entries</p>
            </div>
          </div>

          <button
            onClick={openNewPartyModal}
            className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm shadow-amber-600/30"
          >
            <BiPlus className="text-base" /> New Party Account
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-white px-4 rounded-t-xl gap-6 overflow-x-auto">
          {[
            { id: 'parties', label: 'Parties & Accounts', icon: BiUser },
            { id: 'transactions', label: 'All Ledger Entries', icon: BiTransfer },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3.5 px-2 text-xs font-bold border-b-2 transition whitespace-nowrap flex items-center gap-2 ${
                  isActive
                    ? 'border-amber-600 text-amber-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="text-base" /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center bg-white rounded-b-xl border border-t-0 border-slate-200">
            <BiLoaderAlt className="animate-spin text-3xl text-amber-600 mb-2" />
            <span className="text-xs font-semibold text-slate-500">Loading ledger records...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="p-16 text-center bg-white rounded-b-xl border border-t-0 border-slate-200">
            <BiBookBookmark className="text-4xl text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-700">No parties registered</h3>
            <p className="text-xs text-slate-400 mt-1">Add your customers or suppliers to track dues and payments</p>
          </div>
        ) : (
          <div className="bg-white rounded-b-xl border border-t-0 border-slate-200 p-6">
            
            {activeTab === 'parties' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map(p => {
                  const balance = parseFloat(p.current_balance || 0);
                  const isDue = balance > 0;
                  return (
                    <div key={p.id} className="border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-slate-800 text-sm">{p.name}</h4>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-600">
                            {p.party_type}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-1 flex items-center gap-1 font-mono">
                          <BiPhone /> {p.phone || 'No phone'}
                        </div>

                        <div className="mt-4 p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-500">Current Balance:</span>
                          <span className={`text-sm font-black ${isDue ? 'text-rose-600' : balance < 0 ? 'text-emerald-600' : 'text-slate-700'}`}>
                            ৳{Math.abs(balance).toLocaleString()} {isDue ? '(Taka Pabo)' : balance < 0 ? '(Taka Dibo)' : '(Nil)'}
                          </span>
                        </div>
                      </div>

                      <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <button
                          onClick={() => openNewTxnModal(p)}
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1"
                        >
                          <BiPlus /> Add Entry
                        </button>
                        <button onClick={() => handleDeleteParty(p.id)} className="p-1.5 text-slate-400 hover:text-rose-600">
                          <BiTrash className="text-base" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {activeTab === 'transactions' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Party</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Balance After</th>
                      <th className="p-3">Note</th>
                      <th className="p-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {items.map(t => (
                      <tr key={t.id} className="hover:bg-slate-50/50">
                        <td className="p-3">
                          <div className="font-bold text-slate-800">{t.party_name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{t.party_phone}</div>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${t.transaction_type === 'give' ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>
                            {t.transaction_type === 'give' ? 'Dilam (Credit)' : 'Pelam (Debit)'}
                          </span>
                        </td>
                        <td className="p-3 font-bold text-slate-900">৳{Number(t.amount || 0).toLocaleString()}</td>
                        <td className="p-3 font-mono font-semibold">৳{Number(t.balance_after || 0).toLocaleString()}</td>
                        <td className="p-3 text-slate-500">{t.note || '-'}</td>
                        <td className="p-3 text-slate-400">{new Date(t.created_at).toLocaleString('en-GB')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          </div>
        )}

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full p-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-800">
                  {modalType === 'txn' ? `New Entry for ${selectedParty?.name}` : 'New Party Ledger'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <BiX className="text-xl" />
                </button>
              </div>

              <form onSubmit={handleSave} className="mt-4 space-y-4">
                {modalType === 'party' && (
                  <>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Party Name</label>
                      <input
                        type="text"
                        required
                        value={formData.name || ''}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Phone Number</label>
                      <input
                        type="tel"
                        required
                        value={formData.phone || ''}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Party Type</label>
                        <select
                          value={formData.party_type || 'customer'}
                          onChange={e => setFormData({ ...formData, party_type: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white"
                        >
                          <option value="customer">Customer</option>
                          <option value="supplier">Supplier</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Opening Due (৳)</label>
                        <input
                          type="number"
                          value={formData.opening_balance || 0}
                          onChange={e => setFormData({ ...formData, opening_balance: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                        />
                      </div>
                    </div>
                  </>
                )}

                {modalType === 'txn' && (
                  <>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Transaction Type</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, transaction_type: 'give' })}
                          className={`py-2 rounded-xl text-xs font-bold border transition ${
                            formData.transaction_type === 'give' ? 'bg-rose-50 border-rose-500 text-rose-700' : 'border-slate-200 text-slate-600'
                          }`}
                        >
                          Dilam / Baki (+ Due)
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, transaction_type: 'receive' })}
                          className={`py-2 rounded-xl text-xs font-bold border transition ${
                            formData.transaction_type === 'receive' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'border-slate-200 text-slate-600'
                          }`}
                        >
                          Pelam / Cash (- Due)
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Amount (৳)</label>
                      <input
                        type="number"
                        required
                        value={formData.amount || ''}
                        onChange={e => setFormData({ ...formData, amount: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Note / Description</label>
                      <input
                        type="text"
                        value={formData.note || ''}
                        onChange={e => setFormData({ ...formData, note: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                        placeholder="Item details, invoice number, etc."
                      />
                    </div>
                  </>
                )}

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold"
                  >
                    {saving ? 'Saving...' : 'Save Entry'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

