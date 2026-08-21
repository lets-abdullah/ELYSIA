import React, { useState, useEffect } from 'react';
import {
  User, Mail, Phone, Calendar, Clock, CheckCircle2, AlertCircle, LogOut,
  ArrowRight, ShieldCheck, BedDouble, Building2, CreditCard, Bell, HelpCircle,
  Lock, Edit3, Printer, FileText, Send, Sparkles, Check, Key, Crown,
  Briefcase, MessageSquare, Headphones, ChevronDown, ChevronRight, X, Eye, EyeOff,
  ArrowLeft, Home
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../config/api';

interface UserDashboardPageProps {
  onNavigate: (page: string, roomId?: string) => void;
}

export const UserDashboardPage: React.FC<UserDashboardPageProps> = ({ onNavigate }) => {
  const { user, userReservations, logout, isAuthenticated, updateProfile } = useAuth();

  const [activeTab, setActiveTab] = useState<'overview' | 'profile' | 'reservations' | 'payments' | 'notifications' | 'support'>('overview');

  // Profile Update Form State
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);
  const [profileErrMsg, setProfileErrMsg] = useState<string | null>(null);

  // Change Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changingPass, setChangingPass] = useState(false);
  const [passSuccessMsg, setPassSuccessMsg] = useState<string | null>(null);
  const [passErrMsg, setPassErrMsg] = useState<string | null>(null);

  const hasMinLength = newPassword.length >= 12;
  const hasUpperCase = /[A-Z]/.test(newPassword);
  const hasLowerCase = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);

  // Support Form State
  const [supportMessage, setSupportMessage] = useState('');
  const [supportCategory, setSupportCategory] = useState('Room Request');
  const [supportSent, setSupportSent] = useState(false);

  // Printable Receipt Modal State
  const [selectedInvoiceBooking, setSelectedInvoiceBooking] = useState<any | null>(null);

  useEffect(() => {
    if (user) {
      setProfileName(user.name);
      setProfilePhone(user.phone || '');
    }
  }, [user]);

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen pt-32 pb-16 bg-[#FAF9F6] text-[#1A1A1A] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white border border-stone-200 p-8 sm:p-12 text-center rounded-3xl shadow-xl space-y-6">
          <div className="w-16 h-16 bg-[#F8F5EB] border border-[#C5B358]/40 text-[#8C7A28] flex items-center justify-center mx-auto rounded-2xl">
            <User className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="font-serif text-2xl font-light text-[#1A1A1A]">Account Sign In Required</h2>
            <p className="text-xs text-stone-600 font-light leading-relaxed">
              Please sign in to access your guest dashboard, manage profile details, and view room bookings.
            </p>
          </div>
          <button
            onClick={() => onNavigate('auth')}
            className="w-full py-3.5 bg-[#C5B358] text-[#1A1A1A] font-bold text-xs uppercase tracking-[0.2em] hover:bg-[#b09e46] transition-colors rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <span>Sign In to Guest Portal</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  const reservations = userReservations || [];
  const pendingCount = reservations.filter((r) => r.bookingStatus?.toLowerCase() === 'pending').length;
  const confirmedCount = reservations.filter((r) => r.bookingStatus?.toLowerCase() === 'confirmed' || r.bookingStatus?.toLowerCase() === 'checked_in').length;
  const totalSpent = reservations.reduce((sum, r) => sum + (parseFloat(String(r.totalAmount)) || 0), 0);

  // Active / Most recent reservation
  const activeReservation = reservations[0];

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileErrMsg(null);
    setProfileSuccessMsg(null);
    setUpdatingProfile(true);

    const res = await updateProfile(profileName, profilePhone);
    setUpdatingProfile(false);

    if (res.success) {
      setProfileSuccessMsg('Profile details updated successfully!');
    } else {
      setProfileErrMsg(res.message || 'Failed to update profile.');
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassErrMsg(null);
    setPassSuccessMsg(null);

    if (!currentPassword.trim()) {
      setPassErrMsg('Current password is required to update your password.');
      return;
    }

    const missingRequirements: string[] = [];
    if (!hasMinLength) missingRequirements.push('minimum 12 characters');
    if (!hasUpperCase) missingRequirements.push('at least 1 uppercase letter (A–Z)');
    if (!hasLowerCase) missingRequirements.push('at least 1 lowercase letter (a–z)');
    if (!hasNumber) missingRequirements.push('at least 1 number (0–9)');
    if (!hasSpecial) missingRequirements.push('at least 1 symbol/special character');

    if (missingRequirements.length > 0) {
      setPassErrMsg(`Password does not meet requirements: ${missingRequirements.join(', ')}.`);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassErrMsg('New password and confirmation password do not match.');
      return;
    }

    setChangingPass(true);
    const res = await updateProfile(profileName, profilePhone, newPassword, currentPassword);
    setChangingPass(false);

    if (res.success) {
      setPassSuccessMsg('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setPassErrMsg(res.message || 'Failed to change password.');
    }
  };

  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportMessage.trim()) return;
    setSupportSent(true);
    setTimeout(() => {
      setSupportMessage('');
      setSupportSent(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-[#1E293B] font-sans antialiased flex flex-col pt-20">
      {/* Viewport Container: Fixed Height layout below Navbar */}
      <div className="h-[calc(100vh-5rem)] flex w-full max-w-[1600px] mx-auto overflow-hidden">

        {/* ── FIXED LEFT VERTICAL SIDEBAR ── */}
        <aside className="w-64 bg-[#0D1527] text-slate-300 hidden md:flex flex-col justify-between p-6 shrink-0 border-r border-slate-800/80 h-full overflow-y-auto">
          <div className="space-y-8">

            {/* Logo Crest Header */}
            <div className="text-center pt-2 pb-4 border-b border-slate-800">
              <div className="w-14 h-14 mx-auto rounded-full bg-linear-to-b from-[#D4AF37] to-[#997A15] p-0.5 flex items-center justify-center shadow-lg mb-2">
                <div className="w-full h-full rounded-full bg-[#0D1527] flex items-center justify-center">
                  <span className="font-serif text-2xl font-bold text-[#D4AF37]">G</span>
                </div>
              </div>
              <h2 className="font-serif text-lg tracking-[0.2em] font-light text-white uppercase">GRAND LUXE</h2>
              <p className="text-[9px] uppercase tracking-[0.3em] text-[#C5B358] font-bold">HOTEL & RESORT</p>
            </div>

            {/* Sidebar Navigation */}
            <nav className="space-y-1.5">
              {[
                { id: 'overview', label: 'Overview', icon: Building2 },
                { id: 'profile', label: 'My Profile', icon: User },
                { id: 'reservations', label: 'My Bookings', icon: Calendar, badge: reservations.length },
                { id: 'payments', label: 'Payments & Receipts', icon: CreditCard },
                { id: 'support', label: 'Front Desk Support', icon: Headphones }
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`w-full px-4 py-3 rounded-xl text-xs font-medium tracking-wide flex items-center justify-between transition-all cursor-pointer ${isActive
                      ? 'bg-[#B68B40] text-white font-bold shadow-md'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isActive ? 'bg-white/20 text-white' : 'bg-[#B68B40] text-white'
                        }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Sidebar Footer with Back to Home Button */}
          <div className="pt-4 border-t border-slate-800/80">
            <button
              onClick={() => onNavigate('home')}
              className="w-full px-4 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/80 flex items-center justify-center gap-2 transition-colors cursor-pointer border border-slate-800"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </button>
          </div>
        </aside>

        {/* ── SCROLLABLE RIGHT DASHBOARD CONTENT ── */}
        <main className="flex-1 h-full overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">

          {/* Top Bar Greeting Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-3">
              <button
                onClick={() => onNavigate('home')}
                className="md:hidden p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                title="Back to Home"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                  Hello, {user.name} <span className="text-2xl">👋</span>
                </h1>
                <p className="text-xs text-slate-500 font-normal">Welcome back to Grand Luxe Hotel</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => onNavigate('home')}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" /> Back to Home
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className="relative p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white font-bold text-[9px] rounded-full flex items-center justify-center">
                  3
                </span>
              </button>

              <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
                <div className="w-10 h-10 rounded-full bg-[#0D1527] text-[#D4AF37] font-bold text-sm flex items-center justify-center border-2 border-[#B68B40] shadow-xs">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block text-left leading-tight">
                  <p className="text-xs font-bold text-slate-900">{user.name}</p>
                  <p className="text-[10px] text-slate-500 font-mono">Guest Account</p>
                </div>
                <button
                  onClick={() => { logout(); onNavigate('home'); }}
                  className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Tab Select Bar */}
          <div className="md:hidden flex overflow-x-auto gap-2 pb-2">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'profile', label: 'Profile' },
              { id: 'reservations', label: 'Bookings' },
              { id: 'payments', label: 'Payments' },
              { id: 'notifications', label: 'Notifications' },
              { id: 'support', label: 'Support' }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer ${activeTab === t.id ? 'bg-[#0D1527] text-white' : 'bg-white text-slate-700 border border-slate-200'
                  }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Warning Banner if flagged */}
          {user.warning_message && (
            <div className="bg-red-50 border-2 border-red-500 rounded-3xl p-5 sm:p-6 shadow-md flex items-start gap-4 animate-fade-in shrink-0">
              <div className="p-3 bg-red-600 text-white rounded-2xl shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-red-900 text-sm sm:text-base">
                  Security Warning: Spam or Fake Activity Detected
                </h3>
                <p className="text-xs text-red-800 leading-relaxed font-medium">
                  {user.warning_message}
                </p>
              </div>
            </div>
          )}

          {/* ── TAB 1: OVERVIEW ── */}
          {activeTab === 'overview' && (
            <div className="space-y-6">

              {/* 1. Hero Promo Banner */}
              <div className="bg-linear-to-r from-stone-100 via-stone-50 to-[#FDFBF7] border border-stone-200/90 rounded-3xl overflow-hidden shadow-xs grid grid-cols-1 md:grid-cols-12 items-center">
                <div className="md:col-span-6 p-6 sm:p-10 space-y-4">
                  <h2 className="font-serif text-3xl sm:text-4xl font-light text-slate-900 leading-tight">
                    Experience Comfort, Luxury & Elegance
                  </h2>
                  <p className="text-xs text-slate-600 font-light leading-relaxed">
                    We are delighted to have you with us. Enjoy 24/7 concierge service, oceanfront views, and gourmet dining.
                  </p>
                  <button
                    onClick={() => onNavigate('rooms')}
                    className="px-6 py-3 bg-[#B68B40] hover:bg-[#9c7533] text-white font-bold text-xs rounded-xl transition-colors cursor-pointer shadow-md inline-flex items-center gap-2 uppercase tracking-wider"
                  >
                    <span>Explore More</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="md:col-span-6 h-56 md:h-full relative overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80"
                    alt="Luxury Bedroom"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-linear-to-r from-stone-100 via-transparent to-transparent hidden md:block" />
                </div>
              </div>

              {/* 2. 4 Metric Cards Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Card 1 */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-2xl font-bold text-slate-900 font-sans">{confirmedCount || (activeReservation ? 1 : 0)}</span>
                    <p className="text-xs text-slate-500 font-medium">Upcoming Booking</p>
                    <button onClick={() => setActiveTab('reservations')} className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer pt-1">
                      View Details ➔
                    </button>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Briefcase className="w-6 h-6" />
                  </div>
                </div>

                {/* Card 2 */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-2xl font-bold text-slate-900 font-sans">{reservations.length}</span>
                    <p className="text-xs text-slate-500 font-medium">Total Bookings</p>
                    <button onClick={() => setActiveTab('reservations')} className="text-xs font-bold text-emerald-600 hover:text-emerald-800 flex items-center gap-1 cursor-pointer pt-1">
                      View Details ➔
                    </button>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Calendar className="w-6 h-6" />
                  </div>
                </div>

                {/* Card 3 */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-2xl font-bold text-slate-900 font-sans">${totalSpent.toLocaleString()}</span>
                    <p className="text-xs text-slate-500 font-medium">Total Spent</p>
                    <button onClick={() => setActiveTab('payments')} className="text-xs font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1 cursor-pointer pt-1">
                      View Details ➔
                    </button>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                    <CreditCard className="w-6 h-6" />
                  </div>
                </div>

                {/* Card 4 */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-2xl font-bold text-slate-900 font-sans">3</span>
                    <p className="text-xs text-slate-500 font-medium">Unread Notifications</p>
                    <button onClick={() => setActiveTab('notifications')} className="text-xs font-bold text-amber-600 hover:text-amber-800 flex items-center gap-1 cursor-pointer pt-1">
                      View All ➔
                    </button>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <Bell className="w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* 3. Middle 2-Column Section (Upcoming Booking + Recent Payments) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Left Column: Upcoming Booking Card (7 Cols) */}
                <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="font-bold text-slate-900 text-base">Upcoming Booking</h3>
                    <button onClick={() => setActiveTab('reservations')} className="text-xs font-bold text-blue-600 hover:underline cursor-pointer">
                      View All ➔
                    </button>
                  </div>

                  {activeReservation ? (
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row gap-4 items-center bg-slate-50/60 p-3 rounded-2xl border border-slate-200/60">
                        <img
                          src={activeReservation.roomImage || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80'}
                          alt="Room"
                          className="w-full sm:w-36 h-28 object-cover rounded-xl border border-slate-200"
                        />
                        <div className="space-y-1 text-xs w-full">
                          <h4 className="font-bold text-slate-900 text-sm">
                            {activeReservation.roomName || activeReservation.roomType || 'Deluxe Ocean View Room'}
                          </h4>
                          <p className="text-slate-500 flex items-center gap-1">
                            📍 Grand Luxe Hotel
                          </p>
                          <p className="text-slate-600 font-medium">
                            🗓️ {new Date(activeReservation.checkInDate).toLocaleDateString()} – {new Date(activeReservation.checkOutDate).toLocaleDateString()} ({activeReservation.nights || 2} Nights)
                          </p>
                          <p className="text-slate-600 font-medium">
                            👤 {activeReservation.guests || 2} Guests
                          </p>
                          <div className="pt-1">
                            <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-full border border-emerald-200">
                              ✓ {activeReservation.bookingStatus || 'Confirmed'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 text-xs border-t border-slate-100">
                        <span className="font-mono text-slate-500 font-semibold">Booking ID: {activeReservation.bookingCode || 'GLH-78234'}</span>
                        <button
                          onClick={() => setActiveTab('reservations')}
                          className="px-4 py-2 border border-stone-300 text-slate-800 hover:bg-slate-100 font-bold rounded-xl transition-colors cursor-pointer text-xs"
                        >
                          View Booking
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center space-y-3">
                      <BedDouble className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="text-xs text-slate-500">No active upcoming bookings.</p>
                      <button onClick={() => onNavigate('rooms')} className="px-4 py-2 bg-[#B68B40] text-white font-bold text-xs rounded-xl cursor-pointer">
                        Book Room Now
                      </button>
                    </div>
                  )}
                </div>

                {/* Right Column: Recent Payments (5 Cols) */}
                <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="font-bold text-slate-900 text-base">Recent Payments</h3>
                    <button onClick={() => setActiveTab('payments')} className="text-xs font-bold text-blue-600 hover:underline cursor-pointer">
                      View All ➔
                    </button>
                  </div>

                  <div className="space-y-3 text-xs">
                    {reservations.length > 0 ? (
                      reservations.slice(0, 3).map((res) => (
                        <div key={res.id} className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between border border-slate-100">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
                              <CreditCard className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">Booking Payment</p>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {new Date(res.checkInDate).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-slate-900">${parseFloat(String(res.totalAmount)).toLocaleString()}</p>
                            <span className="text-[9px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                              Paid
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center text-slate-400 text-xs italic">
                        No recent transactions.
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setActiveTab('payments')}
                    className="w-full py-2.5 border border-stone-300 text-slate-700 hover:bg-slate-50 font-bold text-xs rounded-xl transition-colors cursor-pointer text-center"
                  >
                    View All Receipts
                  </button>
                </div>

              </div>

              {/* 4. Bottom Need Assistance Bar */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Need Assistance?</h3>
                  <p className="text-xs text-slate-500 font-normal">Our front desk team is available 24/7 to assist you with any queries.</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => setActiveTab('support')}
                    className="px-5 py-2.5 border border-blue-600 text-blue-600 hover:bg-blue-50 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" /> Chat Now
                  </button>
                  <a
                    href="tel:+18005555893"
                    className="px-5 py-2.5 bg-[#0D1527] hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-2"
                  >
                    <Phone className="w-4 h-4 text-[#B68B40]" /> Call Front Desk
                  </a>
                </div>
              </div>

            </div>
          )}

          {/* ── TAB 2: MY PROFILE ── */}
          {activeTab === 'profile' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Profile details form */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <User className="w-5 h-5 text-[#B68B40]" />
                  <h3 className="font-bold text-slate-900 text-lg">My Profile Details</h3>
                </div>

                {profileSuccessMsg && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{profileSuccessMsg}</span>
                  </div>
                )}
                {profileErrMsg && (
                  <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{profileErrMsg}</span>
                  </div>
                )}

                <form onSubmit={handleProfileSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Full Name</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-[#B68B40] focus:outline-none"
                      />
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Email Address (Read Only)</label>
                    <div className="relative">
                      <input
                        type="email"
                        disabled
                        value={user.email}
                        className="w-full pl-10 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-mono cursor-not-allowed"
                      />
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Phone Number</label>
                    <div className="relative">
                      <input
                        type="tel"
                        value={profilePhone}
                        onChange={(e) => setProfilePhone(e.target.value)}
                        placeholder="+1 (555) 000-1234"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-[#B68B40] focus:outline-none"
                      />
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={updatingProfile}
                    className="w-full py-3.5 bg-[#B68B40] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#9c7533] transition-colors rounded-xl disabled:opacity-50 cursor-pointer shadow-xs"
                  >
                    {updatingProfile ? 'Saving Changes...' : 'Save Profile Changes'}
                  </button>
                </form>
              </div>

              {/* Password change form */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <Key className="w-5 h-5 text-[#B68B40]" />
                  <h3 className="font-bold text-slate-900 text-lg">Change Password</h3>
                </div>

                {passSuccessMsg && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{passSuccessMsg}</span>
                  </div>
                )}
                {passErrMsg && (
                  <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{passErrMsg}</span>
                  </div>
                )}

                <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs">
                  {/* Current Password */}
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      Current Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        required
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-[#B68B40] focus:outline-none"
                      />
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        aria-label={showCurrentPassword ? "Hide current password" : "Show current password"}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition p-1 cursor-pointer"
                      >
                        {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      New Password (Min 12 chars) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-[#B68B40] focus:outline-none"
                      />
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        aria-label={showNewPassword ? "Hide new password" : "Show new password"}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition p-1 cursor-pointer"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Complete Password Requirements Checklist (All shown at once) */}
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-[11px]">
                    <p className="font-bold text-slate-700 mb-1">Password Requirements:</p>
                    <div className={`flex items-center gap-2 ${hasMinLength ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
                      <Check className={`w-3.5 h-3.5 ${hasMinLength ? 'text-emerald-600' : 'text-slate-300'}`} />
                      <span>Minimum 12 characters</span>
                    </div>
                    <div className={`flex items-center gap-2 ${hasUpperCase ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
                      <Check className={`w-3.5 h-3.5 ${hasUpperCase ? 'text-emerald-600' : 'text-slate-300'}`} />
                      <span>At least one uppercase letter (A–Z)</span>
                    </div>
                    <div className={`flex items-center gap-2 ${hasLowerCase ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
                      <Check className={`w-3.5 h-3.5 ${hasLowerCase ? 'text-emerald-600' : 'text-slate-300'}`} />
                      <span>At least one lowercase letter (a–z)</span>
                    </div>
                    <div className={`flex items-center gap-2 ${hasNumber ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
                      <Check className={`w-3.5 h-3.5 ${hasNumber ? 'text-emerald-600' : 'text-slate-300'}`} />
                      <span>At least one number (0–9)</span>
                    </div>
                    <div className={`flex items-center gap-2 ${hasSpecial ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
                      <Check className={`w-3.5 h-3.5 ${hasSpecial ? 'text-emerald-600' : 'text-slate-300'}`} />
                      <span>At least one symbol / special character (e.g. @, #, $, !)</span>
                    </div>
                  </div>

                  {/* Confirm New Password */}
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      Confirm New Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-[#B68B40] focus:outline-none"
                      />
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition p-1 cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={changingPass}
                    className="w-full py-3.5 bg-[#0D1527] text-white font-bold text-xs uppercase tracking-wider hover:bg-slate-800 transition-colors rounded-xl disabled:opacity-50 cursor-pointer shadow-xs"
                  >
                    {changingPass ? 'Updating Password...' : 'UPDATE PASSWORD'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ── TAB 3: MY RESERVATIONS ── */}
          {activeTab === 'reservations' && (
            <div className="space-y-6">
              <h3 className="font-bold text-slate-900 text-xl">My Bookings ({reservations.length})</h3>

              {reservations.length === 0 ? (
                <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-4">
                  <BedDouble className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-xs text-slate-500">No room reservations linked to your account.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reservations.map((res) => {
                    const isConfirmed = res.bookingStatus === 'confirmed' || res.bookingStatus === 'Confirmed';
                    const isPending = res.bookingStatus === 'pending' || res.bookingStatus === 'Pending';

                    return (
                      <div
                        key={res.id}
                        className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs grid grid-cols-1 md:grid-cols-12 gap-6 items-center"
                      >
                        <div className="md:col-span-4 h-36 rounded-2xl overflow-hidden relative border border-slate-200">
                          <img
                            src={res.roomImage || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80'}
                            alt="Room"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-3 left-3 bg-[#0D1527]/90 px-3 py-1 text-[10px] font-mono text-[#D4AF37] font-bold rounded-lg border border-[#D4AF37]/40">
                            ID: {res.bookingCode}
                          </div>
                        </div>

                        <div className="md:col-span-8 space-y-3">
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                            <h4 className="font-bold text-slate-900 text-lg">
                              {res.roomName || res.roomType || 'Deluxe Room'}
                            </h4>

                            {isConfirmed ? (
                              <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold rounded-xl">
                                ✓ Confirmed
                              </span>
                            ) : isPending ? (
                              <span className="px-3 py-1 bg-amber-50 text-amber-900 border border-amber-300 text-xs font-extrabold rounded-xl">
                                ⏳ Pending Approval
                              </span>
                            ) : (
                              <span className="px-3 py-1 bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold rounded-xl capitalize">
                                {res.bookingStatus}
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                              <span className="text-[10px] uppercase text-slate-500 block font-semibold">Check-In</span>
                              <span className="font-bold text-slate-900 font-mono">{new Date(res.checkInDate).toLocaleDateString()}</span>
                            </div>
                            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                              <span className="text-[10px] uppercase text-slate-500 block font-semibold">Check-Out</span>
                              <span className="font-bold text-slate-900 font-mono">{new Date(res.checkOutDate).toLocaleDateString()}</span>
                            </div>
                            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                              <span className="text-[10px] uppercase text-slate-500 block font-semibold">Guests</span>
                              <span className="font-semibold text-slate-900">{res.guests || 2} Guests</span>
                            </div>
                            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                              <span className="text-[10px] uppercase text-slate-500 block font-semibold">Total Price</span>
                              <span className="font-bold text-[#B68B40]">${parseFloat(String(res.totalAmount)).toLocaleString()} USD</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── TAB 4: PAYMENTS & RECEIPTS ── */}
          {activeTab === 'payments' && (
            <div className="space-y-6">
              <h3 className="font-bold text-slate-900 text-xl">Payments & Receipts</h3>

              {reservations.length === 0 ? (
                <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center">
                  <p className="text-xs text-slate-500">No payment receipts available.</p>
                </div>
              ) : (
                <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
                      <tr>
                        <th className="p-4">Booking Ref</th>
                        <th className="p-4">Room & Dates</th>
                        <th className="p-4">Amount</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Receipt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {reservations.map((res) => (
                        <tr key={res.id} className="hover:bg-slate-50">
                          <td className="p-4 font-mono font-bold text-slate-900">{res.bookingCode}</td>
                          <td className="p-4">
                            <p className="font-bold text-slate-900">{res.roomType || 'Suite'}</p>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {new Date(res.checkInDate).toLocaleDateString()} ➔ {new Date(res.checkOutDate).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="p-4 font-bold text-slate-900">${parseFloat(String(res.totalAmount)).toLocaleString()} USD</td>
                          <td className="p-4">
                            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-300 text-[11px] font-bold rounded-lg">
                              ✓ Paid
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => setSelectedInvoiceBooking(res)}
                              className="px-3.5 py-1.5 bg-[#B68B40] text-white hover:bg-[#9c7533] font-bold text-[11px] uppercase tracking-wider rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                            >
                              <Printer className="w-3.5 h-3.5" /> Print Receipt
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── TAB 5: NOTIFICATIONS ── */}
          {activeTab === 'notifications' && (
            <div className="space-y-4 max-w-3xl">
              <h3 className="font-bold text-slate-900 text-xl mb-4">Notifications</h3>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Account Active
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Today</span>
                </div>
                <p className="text-xs text-slate-700 font-normal">
                  Your Grand Luxe guest account is verified and ready for reservations.
                </p>
              </div>

              {reservations.map((r) => (
                <div key={r.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#B68B40] uppercase tracking-wider flex items-center gap-1.5">
                      <Bell className="w-4 h-4 text-[#B68B40]" /> Booking Update — ID: {r.bookingCode}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(r.checkInDate).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 font-normal">
                    Your reservation for <strong className="text-slate-900">{r.roomType || 'Deluxe Room'}</strong> is currently <strong className="text-amber-800 font-bold capitalize">{r.bookingStatus}</strong>.
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* ── TAB 6: SUPPORT ── */}
          {activeTab === 'support' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
                <div className="space-y-1 border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-slate-900 text-lg">Contact Reception Desk</h3>
                  <p className="text-xs text-slate-500">24/7 Front desk support line</p>
                </div>

                <div className="space-y-4 text-xs font-normal text-slate-700">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-4">
                    <Phone className="w-6 h-6 text-[#B68B40] shrink-0" />
                    <div>
                      <p className="font-bold text-slate-900">Front Desk Phone</p>
                      <p className="font-mono text-slate-600">+1 (800) 555-LUXE (5893)</p>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-4">
                    <Mail className="w-6 h-6 text-[#B68B40] shrink-0" />
                    <div>
                      <p className="font-bold text-slate-900">Concierge Email</p>
                      <p className="font-mono text-slate-600">concierge@grandluxe.com</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
                <div className="space-y-1 border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-slate-900 text-lg">Submit Special Request</h3>
                  <p className="text-xs text-slate-500">Send an inquiry directly to hotel staff</p>
                </div>

                {supportSent ? (
                  <div className="p-6 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl text-center space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                    <p className="font-bold text-sm">Message Sent to Front Desk!</p>
                  </div>
                ) : (
                  <form onSubmit={handleSupportSubmit} className="space-y-4 text-xs">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Category</label>
                      <select
                        value={supportCategory}
                        onChange={(e) => setSupportCategory(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-[#B68B40] focus:outline-none"
                      >
                        <option value="Room Request">Room Customization & Special Request</option>
                        <option value="Check-In Inquiry">Early Check-In / Late Check-Out Inquiry</option>
                        <option value="Dining Service">Restaurant & Dining Reservation</option>
                        <option value="General Support">General Support Question</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Your Message</label>
                      <textarea
                        rows={4}
                        required
                        value={supportMessage}
                        onChange={(e) => setSupportMessage(e.target.value)}
                        placeholder="Specify any special requests or room preferences..."
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-[#B68B40] focus:outline-none resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 bg-[#B68B40] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#9c7533] transition-colors rounded-xl cursor-pointer shadow-xs flex items-center justify-center gap-2"
                    >
                      <Send className="w-4 h-4" /> Send Request to Front Desk
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ── PRINTABLE INVOICE MODAL ── */}
      {selectedInvoiceBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-3xl max-w-lg w-full p-8 space-y-6 shadow-2xl">
            <div className="text-center border-b border-stone-200 pb-4">
              <h2 className="font-serif text-3xl tracking-widest text-[#0D1527] font-light uppercase">GRAND LUXE</h2>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#B68B40] font-bold mt-1">Official Folio Receipt</p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between border-b border-slate-100 pb-2 font-mono">
                <span className="text-slate-500">Receipt Ref:</span>
                <span className="font-bold text-slate-900">{selectedInvoiceBooking.bookingCode}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Guest Name:</span>
                <span className="font-bold text-slate-900">{user.name}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Room Reserved:</span>
                <span className="font-bold text-slate-900">{selectedInvoiceBooking.roomType || 'Suite'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Check-In / Out:</span>
                <span className="font-mono text-slate-900">
                  {new Date(selectedInvoiceBooking.checkInDate).toLocaleDateString()} ➔ {new Date(selectedInvoiceBooking.checkOutDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Total Charged:</span>
                <span className="font-bold text-lg text-[#B68B40]">${parseFloat(String(selectedInvoiceBooking.totalAmount)).toLocaleString()} USD</span>
              </div>
              <div className="flex justify-between font-bold text-emerald-700">
                <span>Payment Status:</span>
                <span>PAID IN FULL</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-3 bg-[#0D1527] text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Print / Save PDF
              </button>
              <button
                onClick={() => setSelectedInvoiceBooking(null)}
                className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
