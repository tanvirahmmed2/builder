'use client';

import { use, useEffect, useState } from 'react';
import {
  BiGroup,
  BiSearch,
  BiShield,
  BiPlus,
  BiLoaderAlt,
  BiUserCheck,
  BiCheck,
} from 'react-icons/bi';

export default function UsersPage({ params }) {
  const unwrappedParams = use(params);
  const slug = unwrappedParams.slug;

  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [selectedRoleIds, setSelectedRoleIds] = useState([]);
  const [saving, setSaving] = useState(false);

  const fetchUsersAndRoles = async () => {
    try {
      const res = await fetch(`/api/webites/${slug}/roles`);
      const data = await res.json();
      if (data.success) {
        setUsers(data.users || []);
        setRoles(data.roles || []);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersAndRoles();
  }, [slug]);

  const openRoleEditor = (user) => {
    setEditingUser(user);
    const existingIds = (user.roles || []).map((r) => r.id);
    setSelectedRoleIds(existingIds);
  };

  const toggleRoleSelection = (roleId) => {
    setSelectedRoleIds((prev) =>
      prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId]
    );
  };

  const handleSaveUserRoles = async () => {
    if (!editingUser) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/webites/${slug}/roles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'assign_roles',
          userId: editingUser.id,
          roleIds: selectedRoleIds,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setEditingUser(null);
        fetchUsersAndRoles();
      } else {
        alert(data.error || 'Failed to update user roles');
      }
    } catch (err) {
      alert('Error updating roles');
    } finally {
      setSaving(false);
    }
  };

  const filtered = users.filter((u) =>
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            Team Members & User Access
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Assign multiple roles (Owner, Admin, Editor, Staff, Custom) to your team members.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <BiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100"
          />
        </div>
        <div className="text-xs text-slate-500 self-end sm:self-center font-medium">
          Showing <span className="font-bold text-slate-800 dark:text-slate-200">{filtered.length}</span> members
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
          <BiLoaderAlt className="animate-spin text-3xl text-indigo-600" />
          <p className="text-xs font-medium">Loading team members...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-8">
          <BiGroup className="mx-auto text-4xl text-slate-300 mb-2" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No users found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Team members with access to this website will be listed here.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Assigned Roles</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center shrink-0">
                        {u.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">{u.name}</div>
                        <div className="text-[11px] text-slate-400">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1.5">
                      {u.roles?.length > 0 ? (
                        u.roles.map((r) => (
                          <span
                            key={r.id || r.name}
                            className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40"
                          >
                            {r.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">No roles assigned</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => openRoleEditor(u)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs transition-colors cursor-pointer"
                    >
                      Manage Roles
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Role Assignment Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Assign Roles: {editingUser.name}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Select one or more roles to grant to this user. Each role provides specific module permissions.
              </p>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {roles.map((role) => {
                const isSelected = selectedRoleIds.includes(role.id);
                return (
                  <div
                    key={role.id}
                    onClick={() => toggleRoleSelection(role.id)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <BiShield className="text-indigo-500" /> {role.name}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{role.description}</div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                        isSelected
                          ? 'bg-indigo-600 border-indigo-600 text-white'
                          : 'border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      {isSelected && <BiCheck className="text-base" />}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={handleSaveUserRoles}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white shadow-xs transition-colors"
              >
                {saving ? 'Saving...' : 'Save Roles'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
