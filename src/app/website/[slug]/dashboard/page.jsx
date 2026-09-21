'use client';

import { use, useEffect, useState } from 'react';
import TenantDashboardNav from '@/components/website/TenantDashboardNav';
import TenantStatsCard from '@/components/website/TenantStatsCard';
import TenantRolesManager from '@/components/website/TenantRolesManager';
import TenantManageModal from '@/components/website/TenantManageModal';
import {
  BiBarChartSquare,
  BiBookOpen,
  BiCalendar,
  BiCheckCircle,
  BiDollarCircle,
  BiEdit,
  BiEnvelope,
  BiGlobe,
  BiImage,
  BiLayer,
  BiLoaderAlt,
  BiMessageSquareDetail,
  BiPackage,
  BiPlus,
  BiShield,
  BiShoppingBag,
  BiTimeFive,
  BiTrash,
  BiUserCheck,
} from 'react-icons/bi';

export default function TenantDashboardPage({ params }) {
  const unwrappedParams = use(params);
  const slug = unwrappedParams.slug;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Modal states
  const [modalType, setModalType] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Settings update state
  const [settingsTitle, setSettingsTitle] = useState('');
  const [settingsTagline, setSettingsTagline] = useState('');
  const [settingsBio, setSettingsBio] = useState('');
  const [settingsPrimaryColor, setSettingsPrimaryColor] = useState('#6366f1');
  const [settingsFontFamily, setSettingsFontFamily] = useState('Inter');
  const [settingsCustomDomain, setSettingsCustomDomain] = useState('');
  const [settingsEmail, setSettingsEmail] = useState('');
  const [updatingSettings, setUpdatingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState('');

  // Reply state for contact messages
  const [replyTextMap, setReplyTextMap] = useState({});

  const fetchDashboardData = async () => {
    try {
      const res = await fetch(`/api/webites/${slug}/dashboard`);
      const resData = await res.json();
      if (resData.success) {
        setData(resData);
        const w = resData.website || {};
        const s = w.settings || {};
        setSettingsTitle(s.site_title || w.name || '');
        setSettingsTagline(s.tagline || '');
        setSettingsBio(s.bio || '');
        setSettingsPrimaryColor(s.primary_color || w.theme_config?.primaryColor || '#6366f1');
        setSettingsFontFamily(s.font_family || w.theme_config?.fontFamily || 'Inter');
        setSettingsCustomDomain(w.custom_domain || '');
        setSettingsEmail(s.contact_email || '');
      }
    } catch (err) {
      console.error('Error fetching dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [slug]);

  const handleOpenModal = (type) => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const handleModalSave = async (payload) => {
    const actionMap = {
      product: 'add_product',
      blog: 'add_blog',
      experience: 'add_experience',
      gallery: 'add_gallery',
    };
    const action = actionMap[payload.type];
    if (!action) return;

    const res = await fetch(`/api/webites/${slug}/manage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...payload }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to save item');
    await fetchDashboardData();
  };

  const handleDeleteItem = async (action, id) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      const res = await fetch(`/api/webites/${slug}/manage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, id }),
      });
      const json = await res.json();
      if (json.success) {
        await fetchDashboardData();
      } else {
        alert(json.error || 'Failed to delete');
      }
    } catch (err) {
      alert('Network error');
    }
  };

  const handleUpdateAppointmentStatus = async (id, status) => {
    try {
      const res = await fetch(`/api/webites/${slug}/manage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_appointment_status', id, status }),
      });
      const json = await res.json();
      if (json.success) {
        await fetchDashboardData();
      }
    } catch (err) {
      alert('Error updating appointment');
    }
  };

  const handleReplyContact = async (id) => {
    const reply = replyTextMap[id];
    if (!reply) return;
    try {
      const res = await fetch(`/api/webites/${slug}/manage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reply_contact', id, reply }),
      });
      const json = await res.json();
      if (json.success) {
        alert('Reply recorded!');
        setReplyTextMap({ ...replyTextMap, [id]: '' });
        await fetchDashboardData();
      }
    } catch (err) {
      alert('Error sending reply');
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setUpdatingSettings(true);
    setSettingsSuccess('');

    try {
      const res = await fetch(`/api/webites/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: settingsTitle,
          custom_domain: settingsCustomDomain || null,
          theme_config: {
            primaryColor: settingsPrimaryColor,
            fontFamily: settingsFontFamily,
          },
          settings: {
            site_title: settingsTitle,
            tagline: settingsTagline,
            bio: settingsBio,
            primary_color: settingsPrimaryColor,
            font_family: settingsFontFamily,
            contact_email: settingsEmail,
          },
        }),
      });
      const json = await res.json();
      if (json.success) {
        setSettingsSuccess('Settings and branding updated successfully!');
        await fetchDashboardData();
        setTimeout(() => setSettingsSuccess(''), 3000);
      } else {
        alert(json.error || 'Failed to update settings');
      }
    } catch (err) {
      alert('Network error saving settings');
    } finally {
      setUpdatingSettings(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-500 gap-3">
        <BiLoaderAlt className="animate-spin text-4xl text-slate-800 dark:text-slate-200" />
        <p className="text-xs font-semibold tracking-wider uppercase">Loading Tenant Dashboard...</p>
      </div>
    );
  }

  const { website, kpis = {}, orders = [], appointments = [], contacts = [], products = [], blogs = [], experiences = [], gallery = [] } = data || {};
  const primaryColor = website?.settings?.primary_color || '#6366f1';

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BiBarChartSquare },
    { id: 'products', label: `Products (${products.length})`, icon: BiPackage },
    { id: 'orders', label: `Orders (${orders.length})`, icon: BiShoppingBag },
    { id: 'appointments', label: `Appointments (${appointments.length})`, icon: BiCalendar },
    { id: 'blogs', label: `Blog (${blogs.length})`, icon: BiBookOpen },
    { id: 'contacts', label: `Inquiries (${contacts.length})`, icon: BiEnvelope },
    { id: 'roles', label: 'Roles & Team', icon: BiShield },
    { id: 'portfolio', label: 'Portfolio & Media', icon: BiImage },
    { id: 'settings', label: 'Settings & Domain', icon: BiGlobe },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <TenantDashboardNav website={website} />

      {/* Main Content Area */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Tab Navigation Pill Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                  isActive
                    ? 'text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                }`}
                style={isActive ? { backgroundColor: primaryColor } : {}}
              >
                <Icon className="text-base" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ==================================================================== */}
        {/* 1. OVERVIEW TAB */}
        {/* ==================================================================== */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in duration-150">
            {/* KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <TenantStatsCard
                title="Gross Revenue"
                value={kpis.totalRevenue || '$0.00'}
                subtext="Total completed payments"
                icon={BiDollarCircle}
                color="#10b981"
              />
              <TenantStatsCard
                title="Total Orders"
                value={kpis.totalOrders || 0}
                subtext="Purchases placed"
                icon={BiShoppingBag}
                color={primaryColor}
              />
              <TenantStatsCard
                title="Pending Bookings"
                value={kpis.pendingAppointments || 0}
                subtext="Requires confirmation"
                icon={BiTimeFive}
                color="#f59e0b"
              />
              <TenantStatsCard
                title="New Inquiries"
                value={kpis.unreadMessages || 0}
                subtext="Unread contact messages"
                icon={BiMessageSquareDetail}
                color="#06b6d4"
              />
            </div>

            {/* Quick Overview Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Orders */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <BiShoppingBag className="text-base" style={{ color: primaryColor }} />
                    <span>Recent Customer Purchases</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-900 cursor-pointer"
                  >
                    View All →
                  </button>
                </div>

                {orders.length > 0 ? (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                    {orders.slice(0, 5).map((ord) => (
                      <div key={ord.id} className="py-3 flex items-center justify-between">
                        <div>
                          <strong className="block text-slate-900 dark:text-white font-semibold">
                            {ord.order_number}
                          </strong>
                          <span className="text-slate-500 text-[11px]">{ord.customer_name} ({ord.customer_email})</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-slate-900 dark:text-white block">
                            ${(Number(ord.total_amount_in_cents || 0) / 100).toFixed(2)}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase">
                            {ord.payment_status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-10 text-center text-xs text-slate-400">No purchases placed yet.</div>
                )}
              </div>

              {/* Recent Appointments */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <BiCalendar className="text-base" style={{ color: primaryColor }} />
                    <span>Upcoming Appointments</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab('appointments')}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-900 cursor-pointer"
                  >
                    View Schedule →
                  </button>
                </div>

                {appointments.length > 0 ? (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                    {appointments.slice(0, 5).map((apt) => (
                      <div key={apt.id} className="py-3 flex items-center justify-between">
                        <div>
                          <strong className="block text-slate-900 dark:text-white font-semibold">
                            {apt.client_name}
                          </strong>
                          <span className="text-slate-500 text-[11px]">{apt.service_name} • {apt.time_slot}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-slate-700 dark:text-slate-300 font-mono text-[11px] block">
                            {apt.appointment_date}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            apt.status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                          }`}>
                            {apt.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-10 text-center text-xs text-slate-400">No appointments scheduled yet.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* 2. PRODUCTS TAB */}
        {/* ==================================================================== */}
        {activeTab === 'products' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Products & Digital Goods</h3>
                <p className="text-xs text-slate-500">Manage catalog pricing, inventory, and instant downloads.</p>
              </div>
              <button
                type="button"
                onClick={() => handleOpenModal('product')}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs cursor-pointer flex items-center gap-1.5"
                style={{ backgroundColor: primaryColor }}
              >
                <BiPlus className="text-base" />
                <span>Add Product</span>
              </button>
            </div>

            {products.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3.5">Product Name</th>
                      <th className="p-3.5">Type</th>
                      <th className="p-3.5">Price</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {products.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="p-3.5 font-semibold text-slate-900 dark:text-white">
                          {p.name}
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-medium">
                            {p.is_digital ? 'Digital' : 'Physical'}
                          </span>
                        </td>
                        <td className="p-3.5 font-bold font-mono">
                          ${(Number(p.price_in_cents || 0) / 100).toFixed(2)}
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                            {p.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteItem('delete_product', p.id)}
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 cursor-pointer"
                          >
                            <BiTrash className="text-base" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-16 text-center text-xs text-slate-400">No products added yet. Click &quot;Add Product&quot; above.</div>
            )}
          </div>
        )}

        {/* ==================================================================== */}
        {/* 3. ORDERS TAB */}
        {/* ==================================================================== */}
        {activeTab === 'orders' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Customer Orders</h3>
              <p className="text-xs text-slate-500">Track paid orders and delivery fulfillment.</p>
            </div>

            {orders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3.5">Order #</th>
                      <th className="p-3.5">Customer</th>
                      <th className="p-3.5">Total Amount</th>
                      <th className="p-3.5">Payment</th>
                      <th className="p-3.5">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {orders.map((o) => (
                      <tr key={o.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="p-3.5 font-bold font-mono text-slate-900 dark:text-white">
                          {o.order_number}
                        </td>
                        <td className="p-3.5">
                          <strong className="block text-slate-900 dark:text-white">{o.customer_name}</strong>
                          <span className="text-slate-400 font-mono text-[11px]">{o.customer_email}</span>
                        </td>
                        <td className="p-3.5 font-bold font-mono">
                          ${(Number(o.total_amount_in_cents || 0) / 100).toFixed(2)}
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase">
                            {o.payment_status}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-500">
                          {new Date(o.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-16 text-center text-xs text-slate-400">No orders recorded yet.</div>
            )}
          </div>
        )}

        {/* ==================================================================== */}
        {/* 4. APPOINTMENTS TAB */}
        {/* ==================================================================== */}
        {activeTab === 'appointments' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Scheduled Appointments</h3>
              <p className="text-xs text-slate-500">Manage client booking requests and consultation schedule.</p>
            </div>

            {appointments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3.5">Client</th>
                      <th className="p-3.5">Service</th>
                      <th className="p-3.5">Date & Time</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Update Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {appointments.map((a) => (
                      <tr key={a.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="p-3.5">
                          <strong className="block text-slate-900 dark:text-white">{a.client_name}</strong>
                          <span className="text-slate-400 text-[11px]">{a.client_email} {a.client_phone ? `• ${a.client_phone}` : ''}</span>
                        </td>
                        <td className="p-3.5 font-semibold text-slate-800 dark:text-slate-200">
                          {a.service_name}
                        </td>
                        <td className="p-3.5 font-mono text-[11px]">
                          {a.appointment_date} ({a.time_slot})
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            a.status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-700' :
                            a.status === 'CANCELLED' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'
                          }`}>
                            {a.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-right space-x-1.5">
                          <button
                            type="button"
                            onClick={() => handleUpdateAppointmentStatus(a.id, 'CONFIRMED')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-semibold cursor-pointer"
                          >
                            Confirm
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateAppointmentStatus(a.id, 'COMPLETED')}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold cursor-pointer"
                          >
                            Complete
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateAppointmentStatus(a.id, 'CANCELLED')}
                            className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-semibold cursor-pointer"
                          >
                            Cancel
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-16 text-center text-xs text-slate-400">No appointments scheduled.</div>
            )}
          </div>
        )}

        {/* ==================================================================== */}
        {/* 5. BLOGS TAB */}
        {/* ==================================================================== */}
        {activeTab === 'blogs' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Blog Articles & Insights</h3>
                <p className="text-xs text-slate-500">Publish articles, updates, and thought leadership.</p>
              </div>
              <button
                type="button"
                onClick={() => handleOpenModal('blog')}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs cursor-pointer flex items-center gap-1.5"
                style={{ backgroundColor: primaryColor }}
              >
                <BiPlus className="text-base" />
                <span>Write Article</span>
              </button>
            </div>

            {blogs.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {blogs.map((b) => (
                  <div key={b.id} className="py-4 flex items-center justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{b.title}</h4>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{b.excerpt}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        Published on {new Date(b.published_at || b.created_at).toLocaleDateString()} • {b.views_count || 1} views
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteItem('delete_blog', b.id)}
                      className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 cursor-pointer shrink-0"
                    >
                      <BiTrash className="text-lg" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center text-xs text-slate-400">No articles published yet. Click &quot;Write Article&quot; above.</div>
            )}
          </div>
        )}

        {/* ==================================================================== */}
        {/* 6. CONTACTS / INQUIRIES TAB */}
        {/* ==================================================================== */}
        {activeTab === 'contacts' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Contact Form Inquiries</h3>
              <p className="text-xs text-slate-500">Review and reply to client inquiries submitted from your website.</p>
            </div>

            {contacts.length > 0 ? (
              <div className="space-y-4">
                {contacts.map((c) => (
                  <div
                    key={c.id}
                    className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <strong className="text-sm font-bold text-slate-900 dark:text-white">{c.name}</strong>
                        <span className="text-slate-500 text-[11px] block">{c.email} • {c.phone || 'No phone'}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        c.status === 'REPLIED' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'
                      }`}>
                        {c.status}
                      </span>
                    </div>

                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300 leading-relaxed">
                      <strong>Subject: {c.subject}</strong>
                      <p className="mt-1">{c.message}</p>
                    </div>

                    {c.reply ? (
                      <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs">
                        <strong>Reply Sent:</strong>
                        <p className="mt-0.5">{c.reply}</p>
                      </div>
                    ) : (
                      <div className="flex gap-2 pt-1">
                        <input
                          type="text"
                          placeholder="Type quick reply to customer..."
                          value={replyTextMap[c.id] || ''}
                          onChange={(e) => setReplyTextMap({ ...replyTextMap, [c.id]: e.target.value })}
                          className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleReplyContact(c.id)}
                          className="px-4 py-1.5 rounded-xl text-xs font-bold text-white shadow-xs cursor-pointer"
                          style={{ backgroundColor: primaryColor }}
                        >
                          Send Reply
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center text-xs text-slate-400">No contact messages received yet.</div>
            )}
          </div>
        )}

        {/* ==================================================================== */}
        {/* 7. ROLES & TEAM TAB (Multiple roles, custom roles & module permissions) */}
        {/* ==================================================================== */}
        {activeTab === 'roles' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs">
            <TenantRolesManager
              websiteId={website.id}
              slug={slug}
              primaryColor={primaryColor}
            />
          </div>
        )}

        {/* ==================================================================== */}
        {/* 8. PORTFOLIO & MEDIA TAB */}
        {/* ==================================================================== */}
        {activeTab === 'portfolio' && (
          <div className="space-y-6">
            {/* Gallery Items */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">Portfolio Gallery Items</h3>
                  <p className="text-xs text-slate-500">Visual showcases, UI screens, and client work.</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenModal('gallery')}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs cursor-pointer flex items-center gap-1.5"
                  style={{ backgroundColor: primaryColor }}
                >
                  <BiPlus className="text-base" />
                  <span>Add Gallery Item</span>
                </button>
              </div>

              {gallery.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {gallery.map((g) => (
                    <div key={g.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                      <div className="aspect-16/9 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-700">
                        {g.image_url ? (
                          <img src={g.image_url} alt={g.title} className="w-full h-full object-cover" />
                        ) : null}
                      </div>
                      <div className="flex items-center justify-between">
                        <strong className="text-xs font-semibold text-slate-900 dark:text-white">{g.title}</strong>
                        <button
                          type="button"
                          onClick={() => handleDeleteItem('delete_gallery', g.id)}
                          className="text-rose-600 hover:text-rose-700 cursor-pointer"
                        >
                          <BiTrash />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-10 text-center text-xs text-slate-400">No gallery items added yet.</div>
              )}
            </div>

            {/* Work Experiences */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">Career & Experience Timeline</h3>
                  <p className="text-xs text-slate-500">Chronological history of roles, companies, and leadership.</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenModal('experience')}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs cursor-pointer flex items-center gap-1.5"
                  style={{ backgroundColor: primaryColor }}
                >
                  <BiPlus className="text-base" />
                  <span>Add Experience</span>
                </button>
              </div>

              {experiences.length > 0 ? (
                <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {experiences.map((exp) => (
                    <div key={exp.id} className="py-3 flex items-center justify-between">
                      <div>
                        <strong className="text-sm font-semibold text-slate-900 dark:text-white">{exp.role_title}</strong>
                        <span className="text-slate-500 text-[11px] block">{exp.organization} • {exp.location || 'Remote'}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteItem('delete_experience', exp.id)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                      >
                        <BiTrash className="text-base" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-10 text-center text-xs text-slate-400">No experience records added yet.</div>
              )}
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* 9. SETTINGS & DOMAIN TAB */}
        {/* ==================================================================== */}
        {activeTab === 'settings' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs max-w-3xl space-y-6">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Website Branding & Custom Domain</h3>
              <p className="text-xs text-slate-500">Configure site identity, typography, primary color, and connect your apex or subdomain.</p>
            </div>

            {settingsSuccess && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold flex items-center gap-2">
                <BiCheckCircle className="text-lg" />
                <span>{settingsSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Website Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={settingsTitle}
                    onChange={(e) => setSettingsTitle(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tagline
                  </label>
                  <input
                    type="text"
                    value={settingsTagline}
                    onChange={(e) => setSettingsTagline(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Bio / Brand Statement
                </label>
                <textarea
                  rows={3}
                  value={settingsBio}
                  onChange={(e) => setSettingsBio(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              {/* Custom Domain Section */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <BiGlobe className="text-base" style={{ color: primaryColor }} />
                    <span>Connect Custom Domain</span>
                  </label>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Current: {website.custom_domain || 'None (Using Subdomain)'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="e.g. www.yourbrand.com or yourbrand.com"
                    value={settingsCustomDomain}
                    onChange={(e) => setSettingsCustomDomain(e.target.value)}
                    className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div className="text-[11px] text-slate-500 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700 space-y-1 font-mono">
                  <strong className="block font-sans text-slate-700 dark:text-slate-300 font-semibold">
                    DNS Configuration Guide:
                  </strong>
                  <div>• CNAME: point <span className="text-slate-900 dark:text-white font-bold">@ or www</span> to <span className="text-emerald-600 font-bold">cname.saasplatform.com</span></div>
                  <div>• A Record: point <span className="text-slate-900 dark:text-white font-bold">@</span> to <span className="text-emerald-600 font-bold">76.76.21.21</span></div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Primary Brand Color
                  </label>
                  <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-1.5 px-3">
                    <input
                      type="color"
                      value={settingsPrimaryColor}
                      onChange={(e) => setSettingsPrimaryColor(e.target.value)}
                      className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                    />
                    <span className="text-xs font-mono text-slate-700 dark:text-slate-300">{settingsPrimaryColor}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Font Family
                  </label>
                  <select
                    value={settingsFontFamily}
                    onChange={(e) => setSettingsFontFamily(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="Inter">Inter (Clean)</option>
                    <option value="Outfit">Outfit (Modern)</option>
                    <option value="Roboto">Roboto (Classic)</option>
                    <option value="Playfair Display">Playfair (Editorial)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={settingsEmail}
                    onChange={(e) => setSettingsEmail(e.target.value)}
                    placeholder="contact@brand.com"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  type="submit"
                  disabled={updatingSettings}
                  className="px-6 py-2.5 rounded-full text-xs font-bold text-white shadow-xs cursor-pointer flex items-center gap-1.5"
                  style={{ backgroundColor: primaryColor }}
                >
                  {updatingSettings ? <BiLoaderAlt className="animate-spin" /> : null}
                  <span>Save All Settings</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Modal for Adding Items */}
      <TenantManageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        type={modalType}
        onSave={handleModalSave}
        primaryColor={primaryColor}
      />
    </div>
  );
}
