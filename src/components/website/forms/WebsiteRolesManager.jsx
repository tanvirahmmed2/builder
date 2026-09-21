'use client';

import { useState, useEffect } from 'react';
import {
  BiCheck,
  BiCheckCircle,
  BiLoaderAlt,
  BiPlus,
  BiShield,
  BiTrash,
  BiUserCheck,
  BiUserPlus,
  BiX,
} from 'react-icons/bi';

export default function WebsiteRolesManager({ websiteId, slug, primaryColor = '#6366f1' }) {
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState([]);
  const [modules, setModules] = useState([]);
  const [users, setUsers] = useState([]);
  const [permissions, setPermissions] = useState([]);

  // Modals & form state
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [roleName, setRoleName] = useState('');
  const [roleSlug, setRoleSlug] = useState('');
  const [roleDesc, setRoleDesc] = useState('');
  const [selectedPermIds, setSelectedPermIds] = useState([]);

  const [showUserModal, setShowUserModal] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [selectedUserRoleIds, setSelectedUserRoleIds] = useState([]);

  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [statusErr, setStatusErr] = useState('');

  const fetchRolesData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/webites/${slug}/roles`);
      const data = await res.json();
      if (data.success) {
        setRoles(data.roles || []);
        setModules(data.modules || []);
        setUsers(data.users || []);
        setPermissions(data.permissions || []);
      }
    } catch (err) {
      console.error('Error loading roles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRolesData();
  }, [slug]);

  const handleTogglePerm = (permId) => {
    if (selectedPermIds.includes(permId)) {
      setSelectedPermIds(selectedPermIds.filter((id) => id !== permId));
    } else {
      setSelectedPermIds([...selectedPermIds, permId]);
    }
  };

  const handleToggleUserRole = (roleId) => {
    if (selectedUserRoleIds.includes(roleId)) {
      setSelectedUserRoleIds(selectedUserRoleIds.filter((id) => id !== roleId));
    } else {
      setSelectedUserRoleIds([...selectedUserRoleIds, roleId]);
    }
  };

  const handleCreateRole = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg('');
    setStatusErr('');

    try {
      const res = await fetch(`/api/webites/${slug}/roles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_role',
          name: roleName,
          slug: roleSlug || roleName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          description: roleDesc,
          permissionIds: selectedPermIds,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg('Custom role created with assigned module permissions!');
        setShowRoleModal(false);
        setRoleName('');
        setRoleSlug('');
        setRoleDesc('');
        setSelectedPermIds([]);
        await fetchRolesData();
      } else {
        setStatusErr(data.error || 'Failed to create role.');
      }
    } catch (err) {
      setStatusErr('Network error creating custom role.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRole = async (roleId, roleName) => {
    if (!confirm(`Delete role "${roleName}"? All users assigned to this role will lose its permissions.`)) return;
    try {
      const res = await fetch(`/api/webites/${slug}/roles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete_role',
          roleId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchRolesData();
      } else {
        alert(data.error || 'Failed to delete role.');
      }
    } catch (err) {
      alert('Network error deleting role.');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg('');
    setStatusErr('');

    try {
      const res = await fetch(`/api/webites/${slug}/roles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_user',
          name: userName,
          email: userEmail,
          password: userPassword,
          roleIds: selectedUserRoleIds,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg('Team user created and roles assigned!');
        setShowUserModal(false);
        setUserName('');
        setUserEmail('');
        setUserPassword('');
        setSelectedUserRoleIds([]);
        await fetchRolesData();
      } else {
        setStatusErr(data.error || 'Failed to create team user.');
      }
    } catch (err) {
      setStatusErr('Network error creating team user.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
        <BiLoaderAlt className="animate-spin text-3xl" />
        <span className="text-xs">Loading roles and permissions matrix...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BiShield className="text-xl" style={{ color: primaryColor }} />
            <span>Multiple Roles & Custom Module Permissions</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Create custom roles for your team and customize fine-grained access permissions across each feature module.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowRoleModal(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs transition-transform hover:scale-102 flex items-center gap-1.5 cursor-pointer"
            style={{ backgroundColor: primaryColor }}
          >
            <BiPlus className="text-base" />
            <span>Add Custom Role</span>
          </button>

          <button
            type="button"
            onClick={() => setShowUserModal(true)}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-transform hover:scale-102 flex items-center gap-1.5 cursor-pointer"
          >
            <BiUserPlus className="text-base" />
            <span>Add Team Member</span>
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold flex items-center gap-2">
          <BiCheckCircle className="text-lg" />
          <span>{statusMsg}</span>
        </div>
      )}

      {statusErr && (
        <div className="p-3.5 rounded-2xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold">
          {statusErr}
        </div>
      )}

      {/* Roles Grid */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
          Configured Website Roles ({roles.length})
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles.map((role) => (
            <div
              key={role.id}
              className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-slate-900 dark:text-white text-sm">
                    {role.name}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      role.is_system
                        ? 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {role.is_system ? 'System' : 'Custom'}
                  </span>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                  {role.description || 'Custom role configured by the website owner.'}
                </p>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-700 text-[11px] text-slate-500 flex items-center justify-between">
                  <span>Granted Permissions:</span>
                  <strong className="text-slate-900 dark:text-white font-semibold">
                    {role.permissions_count || role.permissions?.length || 0}
                  </strong>
                </div>
              </div>

              {!role.is_system && (
                <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleDeleteRole(role.id, role.name)}
                    className="text-rose-600 hover:text-rose-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <BiTrash className="text-sm" />
                    <span>Delete Role</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Team Users (Multiple Roles) */}
      <div className="space-y-3 pt-6 border-t border-slate-200 dark:border-slate-800">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
          Team Members & Multiple Role Assignments ({users.length})
        </h3>

        {users.length > 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700 text-slate-500 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3.5">User</th>
                    <th className="p-3.5">Email</th>
                    <th className="p-3.5">Assigned Roles (Multiple Supported)</th>
                    <th className="p-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {users.map((u) => {
                    const assignedRoles = Array.isArray(u.roles) ? u.roles : [];

                    return (
                      <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-750">
                        <td className="p-3.5 font-semibold text-slate-900 dark:text-white">
                          {u.name}
                        </td>
                        <td className="p-3.5 text-slate-500 font-mono text-[11px]">
                          {u.email}
                        </td>
                        <td className="p-3.5">
                          <div className="flex flex-wrap gap-1">
                            {assignedRoles.length > 0 ? (
                              assignedRoles.map((r, rIdx) => (
                                <span
                                  key={rIdx}
                                  className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-[10px] font-semibold flex items-center gap-1"
                                >
                                  <BiShield className="text-slate-400" />
                                  <span>{r.name || r}</span>
                                </span>
                              ))
                            ) : (
                              <span className="text-slate-400 italic text-[11px]">No roles assigned</span>
                            )}
                          </div>
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                            Active
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700 text-xs text-slate-500">
            No team members added yet. Click &quot;Add Team Member&quot; to invite users and assign multiple roles.
          </div>
        )}
      </div>

      {/* Modal: Create Custom Role with Module Permissions */}
      {showRoleModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Create Custom Role
                </h3>
                <p className="text-xs text-slate-500">
                  Select which module permissions this custom role will possess.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowRoleModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <BiX className="text-2xl" />
              </button>
            </div>

            <form onSubmit={handleCreateRole} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Role Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Store Operations Lead"
                    value={roleName}
                    onChange={(e) => {
                      setRoleName(e.target.value);
                      setRoleSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'));
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Role Slug
                  </label>
                  <input
                    type="text"
                    placeholder="store-ops"
                    value={roleSlug}
                    onChange={(e) => setRoleSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="Responsible for managing orders, products, and customer support tickets."
                  value={roleDesc}
                  onChange={(e) => setRoleDesc(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              {/* Module Permissions Matrix */}
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Module Permissions Checklist
                </label>

                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {modules.map((mod) => {
                    const modPerms = permissions.filter((p) => p.module_id === mod.id || p.slug.startsWith(`${mod.slug}.`));

                    return (
                      <div
                        key={mod.id}
                        className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <strong className="text-xs font-bold text-slate-900 dark:text-white">
                            {mod.name}
                          </strong>
                          <button
                            type="button"
                            onClick={() => {
                              const pIds = modPerms.map((p) => p.id);
                              const allChecked = pIds.every((id) => selectedPermIds.includes(id));
                              if (allChecked) {
                                setSelectedPermIds(selectedPermIds.filter((id) => !pIds.includes(id)));
                              } else {
                                setSelectedPermIds([...new Set([...selectedPermIds, ...pIds])]);
                              }
                            }}
                            className="text-[10px] text-slate-500 hover:text-slate-900 dark:hover:text-white font-medium cursor-pointer"
                          >
                            Toggle All
                          </button>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {modPerms.map((p) => {
                            const isChecked = selectedPermIds.includes(p.id);

                            return (
                              <label
                                key={p.id}
                                className={`flex items-center gap-2 p-2 rounded-xl border text-[11px] cursor-pointer transition-colors ${
                                  isChecked
                                    ? 'bg-white dark:bg-slate-900 border-slate-900 dark:border-slate-400 font-bold text-slate-900 dark:text-white'
                                    : 'bg-white/50 dark:bg-slate-850 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleTogglePerm(p.id)}
                                  className="accent-slate-900 cursor-pointer"
                                />
                                <span className="capitalize">{p.action || p.name}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowRoleModal(false)}
                  className="px-4 py-2 rounded-full border border-slate-200 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-full text-xs font-bold text-white shadow-xs cursor-pointer flex items-center gap-1.5"
                  style={{ backgroundColor: primaryColor }}
                >
                  {saving ? <BiLoaderAlt className="animate-spin" /> : <BiCheck />}
                  <span>Save Role</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Team User with Multiple Roles */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Add Team User
                </h3>
                <p className="text-xs text-slate-500">
                  Assign one or multiple roles to this user account.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowUserModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <BiX className="text-2xl" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Taylor Swift"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="taylor@example.com"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Initial Password *
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={userPassword}
                  onChange={(e) => setUserPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              {/* Multiple Roles Checkbox Selector */}
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Select Assigned Roles (Multiple allowed) *
                </label>

                <div className="grid grid-cols-2 gap-2">
                  {roles.map((r) => {
                    const isChecked = selectedUserRoleIds.includes(r.id);

                    return (
                      <label
                        key={r.id}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                          isChecked
                            ? 'bg-slate-100 dark:bg-slate-800 border-slate-900 dark:border-slate-400 font-bold text-slate-900 dark:text-white'
                            : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleUserRole(r.id)}
                          className="accent-slate-900 cursor-pointer"
                        />
                        <span>{r.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="px-4 py-2 rounded-full border border-slate-200 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-full text-xs font-bold text-white shadow-xs cursor-pointer flex items-center gap-1.5"
                  style={{ backgroundColor: primaryColor }}
                >
                  {saving ? <BiLoaderAlt className="animate-spin" /> : <BiUserCheck />}
                  <span>Create User</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
