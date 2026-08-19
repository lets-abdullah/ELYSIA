import React, { useState } from 'react';
import { useHotel } from '../../context/HotelContext';
import { PortalType, User, Role } from '../../types';
import Lightfall from "../../component/Lightfall";
import { apiFetch, setAuthToken } from '../../services/api';
import {
  Building2, Lock, Mail, ArrowRight, Eye, EyeOff, ShieldAlert, KeyRound
} from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { setActivePortal, setCurrentUser, users, showToast, refreshDataFromBackend } = useHotel();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // General login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const performLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setErrorMessage('Email and password are required.');
      showToast('Login Failed', 'Email and password are required.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: cleanEmail, password: cleanPassword })
      });

      if (res.success && res.token && res.user) {
        setAuthToken(res.token);
        localStorage.setItem('elysia_user_role', res.user.role || '');

        let userRole: Role = 'Admin';
        let targetPortal: Exclude<PortalType, 'login' | 'website'> = 'admin';
        const rawRole = (res.user.role || '').toLowerCase();

        if (rawRole === 'manager') {
          userRole = 'Manager';
          targetPortal = 'manager';
        } else if (rawRole === 'receptionist') {
          userRole = 'Receptionist';
          targetPortal = 'receptionist';
        } else {
          userRole = 'Admin';
          targetPortal = 'admin';
        }

        const loggedInUser: User = {
          id: res.user.id,
          name: res.user.name,
          email: res.user.email,
          phone: res.user.phone || '',
          username: res.user.email.split('@')[0],
          role: userRole,
          status: 'Active',
          avatar: res.user.avatar
        };

        setCurrentUser(loggedInUser);
        setActivePortal(targetPortal);
        showToast('Authentication Success', `Welcome back, ${loggedInUser.name}!`, 'success');
        refreshDataFromBackend();
        return;
      } else {
        const msg = res.message || 'Invalid credentials.';
        setErrorMessage(msg);
        showToast('Login Failed', msg, 'error');
        setIsSubmitting(false);
        return;
      }
    } catch (err: any) {
      if (err.status || err.message?.includes('credentials') || err.message?.includes('inactive') || err.message?.includes('required')) {
        const msg = err.message || 'Invalid email or password.';
        setErrorMessage(msg);
        showToast('Login Failed', msg, 'error');
        setIsSubmitting(false);
        return;
      }

      // Offline mode fallback: Allow login if BOTH email AND password match known credentials
      const DEMO_PASSWORDS: Record<string, string[]> = {
        'a.wright@grandluxe.com': ['admin123', 'Admin@GrandLuxe2026!'],
        'e.rostova@grandluxe.com': ['manager123', 'Manager@GrandLuxe2026!'],
        'm.sterling@grandluxe.com': ['reception123', 'Reception@GrandLuxe2026!']
      };

      const matchedUser = users.find((u) => u.email.toLowerCase() === cleanEmail);
      const allowedPasses = DEMO_PASSWORDS[cleanEmail] || ['admin123', 'Admin@GrandLuxe2026!'];

      if (!matchedUser || !allowedPasses.includes(cleanPassword)) {
        setErrorMessage('Invalid credentials. Email and password do not match.');
        showToast('Login Failed', 'Invalid email or password.', 'error');
        setIsSubmitting(false);
        return;
      }

      let targetPortal: Exclude<PortalType, 'login' | 'website'> = 'admin';
      if (matchedUser.role === 'Manager') targetPortal = 'manager';
      else if (matchedUser.role === 'Receptionist') targetPortal = 'receptionist';

      setCurrentUser(matchedUser);
      setActivePortal(targetPortal);
      showToast('Authentication Success', `Welcome back, ${matchedUser.name}! (Offline)`, 'success');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 font-sans antialiased text-slate-100 bg-slate-950 overflow-x-hidden overflow-y-auto">

      {/* Animated Lightfall Background - UNTOUCHED */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <Lightfall
          color="#6366f1"
          intensity={1.2}
          speed={0.6}
          className="w-full h-full"
        />
      </div>

      <div className="fixed inset-0 z-0 bg-slate-950/40 pointer-events-none" />

      {/* Main Container */}
      <main className="relative z-10 w-full max-w-md mx-auto flex flex-col justify-center items-center my-auto py-6 px-3">
        
        {/* Logo Section */}
        <div className="mb-6 flex flex-col items-center text-center shrink-0">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white p-2 shadow-2xl shadow-indigo-500/30 border border-white/20 flex flex-col items-center justify-center transform hover:scale-105 transition-transform mb-2">
            <div className="w-full h-full rounded-xl bg-linear-to-br from-indigo-600 via-purple-600 to-amber-500 p-0.5">
              <div className="w-full h-full bg-slate-900 rounded-[10px] flex flex-col items-center justify-center text-white">
                <Building2 className="w-6 h-6 sm:w-8 sm:h-8 text-amber-400" />
              </div>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wider uppercase">
            ELYSIA
          </h1>
          <p className="text-[10px] sm:text-xs text-indigo-300 font-bold tracking-widest uppercase mt-0.5">
            Centralized Login Portal
          </p>
        </div>

        {/* Error Notification Banner */}
        {errorMessage && (
          <div className="w-full mb-4 bg-rose-950/90 border border-rose-500/50 text-rose-200 p-3 rounded-xl text-xs flex items-center gap-3 backdrop-blur-md shadow-2xl">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-rose-300 text-[11px] sm:text-xs">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* GENERAL SINGLE LOGIN BOX */}
        <div className="bg-slate-900/70 border border-slate-700/60 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl w-full flex flex-col gap-6 transition-all relative overflow-hidden">
          
          {/* Subtle Top Accent Glow */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-indigo-500 via-purple-500 to-amber-500" />

          {/* Header Inside Card */}
          <div className="flex flex-col items-center text-center gap-1">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-1">
              <KeyRound className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">Sign In to Your Account</h2>
            <p className="text-xs text-slate-400">Enter your credentials to access your portal</p>
          </div>

          {/* Login Form */}
          <form onSubmit={performLogin} className="flex flex-col gap-4">
            
            {/* Email / Username Field */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Username / Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-white placeholder:text-slate-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all"
                  placeholder="Enter email address"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-9 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-white placeholder:text-slate-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all"
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3 px-4 bg-linear-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:via-purple-500 hover:to-indigo-600 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

        </div>
      </main>
    </div>
  );
};