import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Edit2,
  Trash2,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Mail,
  Phone,
  User as UserIcon,
  Filter,
  Lock,
  Eye,
  EyeOff,
  Key,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { useHotel } from '../../context/HotelContext';
import { User, Role, UserStatus } from '../../types';
import { Modal } from '../common/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { PasswordRequirements } from '../common/PasswordRequirements';
import { validateErpPassword, generateCompliantPassword } from '../../utils/passwordPolicy';

export const UserManagementModule: React.FC = () => {
  const { users, addUser, updateUser, deleteUser, showToast } = useHotel();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const UNCHANGED_PASSWORD_SENTINEL = '__unchanged__';

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    username: '',
    password: '',
    role: 'Staff' as Role,
    status: 'Active' as UserStatus
  });

  const handleGeneratePassword = () => {
    const newPass = generateCompliantPassword();
    setFormData((prev) => ({ ...prev, password: newPass }));
    setShowPassword(true);
    setFormError(null);
  };

  const handleOpenAddModal = () => {
    setEditingUser(null);
    setShowPassword(true);
    setFormError(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      username: '',
      password: generateCompliantPassword(),
      role: 'Receptionist',
      status: 'Active'
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user: User) => {
    setEditingUser(user);
    setShowPassword(false);
    setFormError(null);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      username: user.username,
      password: UNCHANGED_PASSWORD_SENTINEL,
      role: user.role,
      status: user.status
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanName = formData.name.trim();
    const cleanEmail = formData.email.trim().toLowerCase();
    const cleanUsername = formData.username ? formData.username.trim() : cleanEmail.split('@')[0];
    const cleanPhone = formData.phone ? formData.phone.trim() : '';

    if (!cleanName || !cleanEmail) {
      setFormError('Full Name and Email Address are required.');
      showToast('Validation Error', 'Full Name and Email Address are required.', 'error');
      return;
    }

    // If creating user or password was modified from UNCHANGED_PASSWORD_SENTINEL
    const isNewPasswordProvided = !editingUser || (formData.password && formData.password !== UNCHANGED_PASSWORD_SENTINEL);

    if (isNewPasswordProvided) {
      const validation = validateErpPassword(formData.password);
      if (!validation.isValid) {
        setFormError(validation.message);
        showToast('Password Policy Error', validation.message, 'error');
        return;
      }
    }

    setIsSaving(true);

    try {
      if (editingUser) {
        const updatePayload: Partial<User> & { password?: string } = {
          name: cleanName,
          email: cleanEmail,
          phone: cleanPhone,
          username: cleanUsername,
          role: formData.role,
          status: formData.status
        };

        if (formData.password && formData.password !== UNCHANGED_PASSWORD_SENTINEL) {
          updatePayload.password = formData.password.trim();
        }

        const res = await updateUser(editingUser.id, updatePayload);
        if (res.success) {
          setIsModalOpen(false);
        } else {
          setFormError(res.message || 'Failed to update user.');
        }
      } else {
        const res = await addUser({
          name: cleanName,
          email: cleanEmail,
          phone: cleanPhone,
          username: cleanUsername,
          role: formData.role,
          status: formData.status,
          password: formData.password.trim(),
          avatar: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 1000)}?w=150`
        });

        if (res.success) {
          setIsModalOpen(false);
        } else {
          setFormError(res.message || 'Failed to create user.');
        }
      }
    } catch (err: any) {
      setFormError(err.message || 'Database operation failed.');
    } finally {
      setIsSaving(false);
    }
  };

  // Filtered users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase());

    const matchesRole = roleFilter === 'All' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'All' || u.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const activeUsersCount = users.filter((u) => u.status === 'Active').length;
  const adminManagerCount = users.filter((u) => u.role === 'Admin' || u.role === 'Manager').length;

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Staff & Employee HR Roster ({users.length})</h3>
            <p className="text-xs text-slate-500 mt-0.5">Manage hotel personnel credentials, department access roles, and operational status</p>
          </div>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl transition-all shadow-xs cursor-pointer"
        >
          <UserPlus className="w-4 h-4" /> Add Staff Member
        </button>
      </div>

      {/* Staff Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Employees</span>
            <span className="text-xl font-black text-slate-900 mt-0.5 block">{users.length} Members</span>
          </div>
          <div className="p-2 bg-slate-100 text-slate-700 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Status</span>
            <span className="text-xl font-black text-emerald-600 mt-0.5 block">{activeUsersCount} Active</span>
          </div>
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Admin / Leadership</span>
            <span className="text-xl font-black text-indigo-600 mt-0.5 block">{adminManagerCount} Managers</span>
          </div>
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search name, email, username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-medium text-slate-700 cursor-pointer"
          >
            <option value="All">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="Manager">Manager</option>
            <option value="Receptionist">Receptionist</option>
            <option value="Accountant">Accountant</option>
            <option value="Staff">Staff</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-medium text-slate-700 cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-100 font-semibold">
              <tr>
                <th className="px-5 py-3 whitespace-nowrap">User</th>
                <th className="px-5 py-3 whitespace-nowrap">Contact & Phone</th>
                <th className="px-5 py-3 whitespace-nowrap">Username</th>
                <th className="px-5 py-3 whitespace-nowrap">Role</th>
                <th className="px-5 py-3 whitespace-nowrap">Status</th>
                <th className="px-5 py-3 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-slate-400 whitespace-nowrap">
                    No matching users found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                          alt={u.name}
                          className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-200 shrink-0"
                        />
                        <div>
                          <h4 className="font-bold text-slate-900 whitespace-nowrap">{u.name}</h4>
                          <p className="text-slate-500 text-[11px] flex items-center gap-1 mt-0.5 whitespace-nowrap">
                            <Mail className="w-3 h-3 text-slate-400" /> {u.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 whitespace-nowrap">
                      <span className="flex items-center gap-1.5 font-mono whitespace-nowrap">
                        <Phone className="w-3 h-3 text-slate-400" /> {u.phone || 'N/A'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate-700 font-medium whitespace-nowrap">@{u.username}</td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 inline-block whitespace-nowrap">
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap ${
                          u.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}
                      >
                        {u.status === 'Active' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {u.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(u)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                          title="Edit User"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTargetId(u.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit User Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? 'Edit User' : 'Add New User'}
        subtitle="Enter user account information"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{formError}</div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1 whitespace-nowrap">Full Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  setFormError(null);
                }}
                placeholder="Full Name"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1 whitespace-nowrap">Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  setFormError(null);
                }}
                placeholder="user@hotel.com"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1 whitespace-nowrap">Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 000-0000"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1 whitespace-nowrap">Username</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="Username (optional)"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/30 font-mono"
              />
            </div>
          </div>

          {/* Password Section */}
          <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="block text-slate-700 font-semibold">
                {editingUser ? 'Update Password (leave unchanged or set new)' : 'Account Password *'}
              </label>
              <button
                type="button"
                onClick={handleGeneratePassword}
                className="text-[10px] text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" /> Auto-Generate
              </button>
            </div>
            <div className="relative">
              <Key className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password === UNCHANGED_PASSWORD_SENTINEL ? '' : formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value });
                  setFormError(null);
                }}
                placeholder={editingUser ? '•••••••• (Enter new password to change)' : 'Set password (min 12 chars)'}
                className="w-full pl-9 pr-10 py-2 bg-white border border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 font-mono text-xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>

            {(!editingUser || (formData.password && formData.password !== UNCHANGED_PASSWORD_SENTINEL)) && (
              <PasswordRequirements password={formData.password} />
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1 whitespace-nowrap">Role *</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/30 font-medium"
              >
                <option value="Admin">Admin</option>
                <option value="Manager">Manager</option>
                <option value="Receptionist">Receptionist</option>
                <option value="Accountant">Accountant</option>
                <option value="Staff">Staff</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1 whitespace-nowrap">Status *</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as UserStatus })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/30 font-medium"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 mt-5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 font-medium whitespace-nowrap cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs whitespace-nowrap cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : editingUser ? 'Save Changes' : 'Save User'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={() => {
          if (deleteTargetId) deleteUser(deleteTargetId);
        }}
        title="Delete System User"
        message="Are you sure you want to delete this user? Their login credentials and profile will be permanently removed."
      />
    </div>
  );
};
