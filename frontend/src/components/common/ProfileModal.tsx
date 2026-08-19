import React, { useState } from 'react';
import {
  X, User, Mail, Phone, Calendar, ShieldCheck, KeyRound,
  Bed, CheckCircle2, Clock, DollarSign, LogOut, RefreshCw, AlertCircle, BookmarkCheck,
  Check, Lock, Eye, EyeOff
} from 'lucide-react';
import { useAuth, UserReservation } from '../../contexts/AuthContext';

export const ProfileModal: React.FC = () => {
  const {
    user,
    isProfileModalOpen,
    closeProfileModal,
    userReservations,
    loadingReservations,
    fetchMyReservations,
    updateProfile,
    logout
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'reservations' | 'personal'>('reservations');

  // Edit profile states
  const [editName, setEditName] = useState(user?.name || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [currentPass, setCurrentPass] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [editPass, setEditPass] = useState('');
  const [showEditPass, setShowEditPass] = useState(false);
  const [confirmPass, setConfirmPass] = useState('');
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const hasMinLength = editPass.length >= 12;
  const hasUpperCase = /[A-Z]/.test(editPass);
  const hasLowerCase = /[a-z]/.test(editPass);
  const hasNumber = /[0-9]/.test(editPass);
  const hasSpecial = /[^A-Za-z0-9]/.test(editPass);

  React.useEffect(() => {
    if (user) {
      setEditName(user.name);
      setEditPhone(user.phone || '');
    }
  }, [user]);

  if (!isProfileModalOpen || !user) return null;

  const handleUpdateProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    if (editPass.trim() !== '') {
      if (!currentPass.trim()) {
        setStatusMsg({ type: 'error', text: 'Current password is required to update your password.' });
        return;
      }

      const missing: string[] = [];
      if (!hasMinLength) missing.push('min 12 characters');
      if (!hasUpperCase) missing.push('uppercase letter');
      if (!hasLowerCase) missing.push('lowercase letter');
      if (!hasNumber) missing.push('number');
      if (!hasSpecial) missing.push('symbol/special character');

      if (missing.length > 0) {
        setStatusMsg({ type: 'error', text: `Password requirements missing: ${missing.join(', ')}.` });
        return;
      }

      if (editPass !== confirmPass) {
        setStatusMsg({ type: 'error', text: 'New password and confirm password do not match.' });
        return;
      }
    }

    setSaving(true);
    const res = await updateProfile(editName, editPhone, editPass || undefined, currentPass || undefined);
    setSaving(false);

    if (res.success) {
      setStatusMsg({ type: 'success', text: 'Profile details saved successfully.' });
      setCurrentPass('');
      setEditPass('');
      setConfirmPass('');
    } else {
      setStatusMsg({ type: 'error', text: res.message || 'Failed to update profile.' });
    }
  };

  const getStatusBadge = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s === 'pending') {
      return (
        <span
          className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/50 text-[10px] uppercase tracking-wider font-extrabold flex items-center gap-1.5 shadow-xs"
          title="Awaiting receptionist / manager approval"
        >
          <Clock className="w-3 h-3 text-amber-400 animate-pulse" /> Pending Approval
        </span>
      );
    }
    if (s === 'confirmed') {
      return (
        <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] uppercase tracking-wider font-extrabold flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Confirmed
        </span>
      );
    }
    if (s === 'checked_in' || s === 'checked in') {
      return (
        <span className="px-2.5 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[10px] uppercase tracking-wider font-extrabold flex items-center gap-1">
          <Clock className="w-3 h-3 text-blue-400" /> Checked In
        </span>
      );
    }
    if (s === 'completed' || s === 'checked_out') {
      return (
        <span className="px-2.5 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] uppercase tracking-wider font-extrabold flex items-center gap-1">
          <BookmarkCheck className="w-3 h-3 text-purple-400" /> Completed
        </span>
      );
    }
    if (s === 'cancelled') {
      return (
        <span className="px-2.5 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] uppercase tracking-wider font-extrabold flex items-center gap-1">
          <AlertCircle className="w-3 h-3 text-rose-400" /> Cancelled
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] uppercase tracking-wider font-semibold">
        {status}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-[#1A1A1A] text-white border border-[#C5B358]/30 shadow-2xl overflow-hidden rounded-none flex flex-col max-h-[90vh]">

        {/* Modal Header */}
        <div className="p-6 border-b border-[#333333] bg-[#111111] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full border border-[#C5B358] overflow-hidden bg-[#262626] shrink-0 flex items-center justify-center text-[#C5B358] font-bold text-lg">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <h2 className="font-serif text-lg sm:text-xl text-white tracking-wide">{user.name}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-slate-400 font-mono">{user.email}</span>
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 bg-[#C5B358]/20 text-[#C5B358] border border-[#C5B358]/40 font-semibold">
                  {user.role}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={logout}
              className="px-3 py-1.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500 hover:text-white text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Logout</span>
            </button>
            <button
              onClick={closeProfileModal}
              className="text-slate-400 hover:text-white p-1 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#333333] bg-[#151515]">
          <button
            onClick={() => setActiveTab('reservations')}
            className={`flex-1 py-3 text-xs font-semibold uppercase tracking-[0.15em] flex items-center justify-center gap-2 transition-all ${
              activeTab === 'reservations'
                ? 'text-[#C5B358] border-b-2 border-[#C5B358] bg-[#1A1A1A]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bed className="w-4 h-4" /> My Reservations ({userReservations.length})
          </button>
          <button
            onClick={() => setActiveTab('personal')}
            className={`flex-1 py-3 text-xs font-semibold uppercase tracking-[0.15em] flex items-center justify-center gap-2 transition-all ${
              activeTab === 'personal'
                ? 'text-[#C5B358] border-b-2 border-[#C5B358] bg-[#1A1A1A]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <User className="w-4 h-4" /> Personal Information
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          
          {/* TAB 1: RESERVATIONS */}
          {activeTab === 'reservations' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                  Personal Room Booking Records
                </span>
                <button
                  onClick={fetchMyReservations}
                  disabled={loadingReservations}
                  className="text-xs text-[#C5B358] hover:underline flex items-center gap-1"
                >
                  <RefreshCw className={`w-3 h-3 ${loadingReservations ? 'animate-spin' : ''}`} /> Refresh
                </button>
              </div>

              {loadingReservations ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  Loading your room reservation details...
                </div>
              ) : userReservations.length === 0 ? (
                <div className="py-12 border border-dashed border-[#333333] text-center space-y-3 p-6">
                  <Bed className="w-10 h-10 text-slate-600 mx-auto" />
                  <h4 className="text-sm font-semibold text-white">No Room Reservations Found</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    You haven't placed any room bookings yet. Explore our luxury suites and reserve your stay.
                  </p>
                  <button
                    onClick={closeProfileModal}
                    className="mt-2 px-5 py-2 bg-[#C5B358] text-[#1A1A1A] font-bold text-xs uppercase tracking-wider hover:bg-[#b09e46]"
                  >
                    Explore Rooms
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {userReservations.map((res: UserReservation) => (
                    <div
                      key={res.id}
                      className="bg-[#222222] border border-[#333333] p-4 space-y-3 hover:border-[#C5B358]/50 transition-all"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#333333] pb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[#C5B358] bg-[#C5B358]/10 px-2 py-0.5 border border-[#C5B358]/30">
                            {res.bookingCode || res.id}
                          </span>
                          <span className="text-xs text-slate-300 font-semibold">
                            {res.roomName || res.roomType || 'Deluxe Suite'}
                          </span>
                          {res.roomNumber && (
                            <span className="text-xs text-slate-400 font-mono">
                              (Room #{res.roomNumber})
                            </span>
                          )}
                        </div>

                        <div>{getStatusBadge(res.bookingStatus)}</div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase text-slate-400 tracking-wider block">Dates</span>
                          <div className="flex items-center gap-1.5 text-slate-200">
                            <Calendar className="w-3.5 h-3.5 text-[#C5B358]" />
                            <span>{new Date(res.checkInDate).toLocaleDateString()} &rarr; {new Date(res.checkOutDate).toLocaleDateString()}</span>
                          </div>
                          <span className="text-[11px] text-slate-400">{res.nights || 1} Night(s)</span>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] uppercase text-slate-400 tracking-wider block">Guests & Details</span>
                          <div className="text-slate-200">
                            <span>{res.guests} Guest(s)</span>
                          </div>
                          {res.specialRequests && (
                            <p className="text-[11px] text-slate-400 truncate" title={res.specialRequests}>
                              Requests: {res.specialRequests}
                            </p>
                          )}
                        </div>

                        <div className="space-y-1 sm:text-right">
                          <span className="text-[10px] uppercase text-slate-400 tracking-wider block">Total Amount</span>
                          <div className="font-serif text-sm font-bold text-[#C5B358]">
                            ${Number(res.totalAmount || 0).toLocaleString()}
                          </div>
                          <span className="text-[11px] text-slate-400">
                            Paid: ${Number(res.paidAmount || 0).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PERSONAL INFORMATION & EDIT FORM */}
          {activeTab === 'personal' && (
            <form onSubmit={handleUpdateProfileSubmit} className="space-y-4 max-w-xl mx-auto">
              
              {statusMsg && (
                <div
                  className={`p-3 text-xs border flex items-center gap-2 ${
                    statusMsg.type === 'success'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  }`}
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{statusMsg.text}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1 font-semibold">
                    Full Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-[#262626] border border-[#444444] text-xs text-white focus:outline-none focus:border-[#C5B358]"
                    />
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1 font-semibold">
                    Email Address (Read-only)
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      disabled
                      value={user.email}
                      className="w-full pl-9 pr-4 py-2 bg-[#1b1b1b] border border-[#333333] text-xs text-slate-400 cursor-not-allowed"
                    />
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1 font-semibold">
                    Phone Number
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      placeholder="+1 (555) 000-1234"
                      className="w-full pl-9 pr-4 py-2 bg-[#262626] border border-[#444444] text-xs text-white focus:outline-none focus:border-[#C5B358]"
                    />
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1 font-semibold">
                    Account Role
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      disabled
                      value={user.role.toUpperCase()}
                      className="w-full pl-9 pr-4 py-2 bg-[#1b1b1b] border border-[#333333] text-xs text-slate-400 cursor-not-allowed font-mono"
                    />
                    <ShieldCheck className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#333333] space-y-3">
                <p className="text-[11px] uppercase tracking-wider text-[#C5B358] font-bold">
                  Change Password (Leave blank to keep unchanged)
                </p>

                {/* Current Password */}
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1 font-semibold">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPass ? 'text' : 'password'}
                      value={currentPass}
                      onChange={(e) => setCurrentPass(e.target.value)}
                      placeholder="Enter your current password"
                      className="w-full pl-9 pr-10 py-2 bg-[#262626] border border-[#444444] text-xs text-white focus:outline-none focus:border-[#C5B358]"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition p-1 cursor-pointer"
                    >
                      {showCurrentPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1 font-semibold">
                    New Password (Min 12 characters)
                  </label>
                  <div className="relative">
                    <input
                      type={showEditPass ? 'text' : 'password'}
                      value={editPass}
                      onChange={(e) => setEditPass(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-9 pr-10 py-2 bg-[#262626] border border-[#444444] text-xs text-white focus:outline-none focus:border-[#C5B358]"
                    />
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <button
                      type="button"
                      onClick={() => setShowEditPass(!showEditPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition p-1 cursor-pointer"
                    >
                      {showEditPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Requirements Checklist (Shown whenever user types in new password) */}
                {editPass.length > 0 && (
                  <div className="p-3 bg-[#111111] border border-[#333333] rounded space-y-1 text-[10px]">
                    <p className="font-bold text-slate-300 mb-1">Requirements Checklist:</p>
                    <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-400' : 'text-slate-500'}`}>
                      <Check className={`w-3 h-3 ${hasMinLength ? 'text-emerald-400' : 'text-slate-600'}`} />
                      <span>Minimum 12 characters</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${hasUpperCase ? 'text-emerald-400' : 'text-slate-500'}`}>
                      <Check className={`w-3 h-3 ${hasUpperCase ? 'text-emerald-400' : 'text-slate-600'}`} />
                      <span>At least one uppercase letter (A–Z)</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${hasLowerCase ? 'text-emerald-400' : 'text-slate-500'}`}>
                      <Check className={`w-3 h-3 ${hasLowerCase ? 'text-emerald-400' : 'text-slate-600'}`} />
                      <span>At least one lowercase letter (a–z)</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-400' : 'text-slate-500'}`}>
                      <Check className={`w-3 h-3 ${hasNumber ? 'text-emerald-400' : 'text-slate-600'}`} />
                      <span>At least one number (0–9)</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${hasSpecial ? 'text-emerald-400' : 'text-slate-500'}`}>
                      <Check className={`w-3 h-3 ${hasSpecial ? 'text-emerald-400' : 'text-slate-600'}`} />
                      <span>At least one symbol / special character (@, #, $, !)</span>
                    </div>
                  </div>
                )}

                {/* Confirm New Password */}
                {editPass.length > 0 && (
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1 font-semibold">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPass ? 'text' : 'password'}
                        value={confirmPass}
                        onChange={(e) => setConfirmPass(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-9 pr-10 py-2 bg-[#262626] border border-[#444444] text-xs text-white focus:outline-none focus:border-[#C5B358]"
                      />
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPass(!showConfirmPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition p-1 cursor-pointer"
                      >
                        {showConfirmPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-[#C5B358] text-[#1A1A1A] font-bold text-xs uppercase tracking-wider hover:bg-[#b09e46] transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
