import React, { useState } from 'react';
import {
  UserCog,
  UserPlus,
  Search,
  Edit2,
  Trash2,
  Mail,
  Phone,
  Building2,
  Calendar,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Clock,
  Filter,
  Lock,
  Eye,
  EyeOff,
  Shield,
  Key,
  RefreshCw,
  ShieldCheck
} from 'lucide-react';
import { useHotel } from '../../context/HotelContext';
import { Staff, Department, StaffStatus, Role } from '../../types';
import { Modal } from '../common/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { PasswordRequirements } from '../common/PasswordRequirements';
import { validateErpPassword, generateCompliantPassword } from '../../utils/passwordPolicy';

export const StaffManagementModule: React.FC = () => {
  const { staff, addStaff, updateStaff, deleteStaff, users, showToast } = useHotel();

  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('All');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'Receptionist' as Role
  });

  const handleGeneratePassword = () => {
    const newPass = generateCompliantPassword();
    setFormData((prev) => ({ ...prev, password: newPass }));
    setShowPassword(true);
    setFormError(null);
  };

  const handleOpenAddModal = () => {
    setEditingStaff(null);
    setShowPassword(true);
    setFormError(null);
    setFormData({
      email: '',
      password: generateCompliantPassword(),
      role: 'Receptionist'
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (stf: Staff) => {
    setEditingStaff(stf);
    setShowPassword(false);
    setFormError(null);
    
    // Find matching user from system users to get stored password & role
    const matchedUser = users.find(u => u.email.toLowerCase() === stf.email.toLowerCase());

    setFormData({
      email: stf.email,
      password: stf.password || matchedUser?.password || '',
      role: (stf.role || matchedUser?.role || 'Staff') as Role
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanEmail = formData.email.trim().toLowerCase();
    const cleanPassword = formData.password.trim();

    if (!cleanEmail) {
      setFormError('Email address is required.');
      showToast('Validation Error', 'Email address is required.', 'error');
      return;
    }

    if (!cleanPassword) {
      setFormError('Account password is required.');
      showToast('Validation Error', 'Account password is required.', 'error');
      return;
    }

    // Validate password policy
    const validation = validateErpPassword(cleanPassword);
    if (!validation.isValid) {
      setFormError(validation.message);
      showToast('Password Policy Error', validation.message, 'error');
      return;
    }

    const emailPrefix = cleanEmail.split('@')[0] || 'Staff';
    const derivedName = editingStaff?.name || emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);

    const mappedDept: Department = 
      formData.role === 'Admin' ? 'Accounts' :
      formData.role === 'Manager' ? 'Security' : 'Reception';

    const mappedPos = 
      formData.role === 'Admin' ? 'Administrator' :
      formData.role === 'Manager' ? 'Manager' :
      formData.role === 'Receptionist' ? 'Receptionist' : 'Staff Member';

    setIsSaving(true);

    try {
      if (editingStaff) {
        const res = await updateStaff(editingStaff.id, {
          name: derivedName,
          phone: editingStaff.phone || '',
          email: cleanEmail,
          password: cleanPassword,
          role: formData.role,
          department: editingStaff.department || mappedDept,
          position: editingStaff.position || mappedPos,
          joiningDate: editingStaff.joiningDate || new Date().toISOString().split('T')[0],
          status: editingStaff.status || 'Active',
          salary: editingStaff.salary || 0,
          shift: editingStaff.shift || 'Morning'
        });

        if (res.success) {
          setIsModalOpen(false);
        } else {
          setFormError(res.message || 'Failed to update staff credentials.');
        }
      } else {
        const res = await addStaff({
          name: derivedName,
          phone: '',
          email: cleanEmail,
          password: cleanPassword,
          role: formData.role,
          department: mappedDept,
          position: mappedPos,
          joiningDate: new Date().toISOString().split('T')[0],
          status: 'Active',
          salary: 0,
          shift: 'Morning'
        });

        if (res.success) {
          setIsModalOpen(false);
        } else {
          setFormError(res.message || 'Failed to create staff account.');
        }
      }
    } catch (err: any) {
      setFormError(err.message || 'Database update failed.');
    } finally {
      setIsSaving(false);
    }
  };

  // Filtered staff
  const filteredStaff = staff.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.position.toLowerCase().includes(search.toLowerCase());

    const matchesDept = departmentFilter === 'All' || s.department === departmentFilter;

    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Action Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <UserCog className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Staff Accounts ({filteredStaff.length})</h3>
            <p className="text-xs text-slate-500">System user accounts, login credentials, and ERP portal access permissions</p>
          </div>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl transition-colors shadow-sm shadow-indigo-200 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" /> Add Staff Member
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search staff email, name, role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          />
        </div>
      </div>

      {/* Staff Roster Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-100 font-semibold">
              <tr>
                <th className="px-6 py-3.5">Staff Email & User</th>
                <th className="px-6 py-3.5">System ERP Role</th>
                <th className="px-6 py-3.5">Account Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                    No staff records found matching search.
                  </td>
                </tr>
              ) : (
                filteredStaff.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-900 text-amber-400 font-bold flex items-center justify-center shrink-0 shadow-sm">
                          {s.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900">{s.name}</h4>
                          <p className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5 font-mono">
                            <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{s.email}</span>
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="inline-flex items-center gap-1 text-[10px] text-indigo-700 bg-indigo-50 font-semibold px-2 py-0.5 rounded-full border border-indigo-200/60">
                              <Lock className="w-2.5 h-2.5 text-indigo-600" /> Password Protected
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">
                        {s.role || 'Staff'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          s.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(s)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTargetId(s.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
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

      {/* Add / Edit Staff Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingStaff ? 'Edit Staff Account' : 'Add Staff Member'}
        subtitle="Set login email, account password, and system ERP role access level"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{formError}</div>
            </div>
          )}
          
          <div className="bg-indigo-50/70 border border-indigo-100 p-4 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-bold text-indigo-900 flex items-center gap-1.5 text-xs">
                <Lock className="w-4 h-4 text-indigo-600" /> System Login Credentials & Access
              </span>
              <span className="text-[10px] bg-indigo-200/80 text-indigo-800 font-semibold px-2 py-0.5 rounded-full">
                Portal Access Enabled
              </span>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Login Email Address *</label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    setFormError(null);
                  }}
                  placeholder="e.g. staff@grandluxe.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-slate-700 font-semibold">Account Password *</label>
                <button
                  type="button"
                  onClick={handleGeneratePassword}
                  className="text-[10px] text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" /> Auto-Generate Compliant
                </button>
              </div>
              <div className="relative">
                <Key className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value });
                    setFormError(null);
                  }}
                  placeholder="Set account password (min 12 chars)"
                  className="w-full pl-9 pr-10 py-2.5 bg-white border border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 font-mono font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Live Password Policy Checklist */}
            <PasswordRequirements password={formData.password} />

            <div>
              <label className="block text-slate-700 font-semibold mb-1">System ERP Role *</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
                className="w-full px-3 py-2.5 bg-white border border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 font-medium cursor-pointer"
              >
                <option value="Admin">Administrator (Full Access)</option>
                <option value="Manager">Manager (Operations Access)</option>
                <option value="Receptionist">Receptionist (Front Desk Access)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm shadow-indigo-200 cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : editingStaff ? 'Update Staff Credentials' : 'Add Staff Member'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={() => {
          if (deleteTargetId) deleteStaff(deleteTargetId);
        }}
        title="Remove Staff Account"
        message="Are you sure you want to delete this staff account from the system?"
      />
    </div>
  );
};
