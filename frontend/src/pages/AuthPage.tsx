import React, { useState } from 'react';
import { Mail, Lock, User, Phone, LogIn, UserPlus, AlertCircle, ShieldCheck, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface AuthPageProps {
  onNavigate: (page: string, roomId?: string) => void;
  initialTab?: 'login' | 'register';
}

export const AuthPage: React.FC<AuthPageProps> = ({ onNavigate, initialTab = 'login' }) => {
  const { login, register, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialTab);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // If already authenticated, redirect to profile page
  React.useEffect(() => {
    if (isAuthenticated) {
      onNavigate('profile');
    }
  }, [isAuthenticated, onNavigate]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setLoading(true);
    const res = await login(email, password);
    setLoading(false);

    if (!res.success) {
      setErrorMessage(res.message || 'Login failed.');
    } else {
      onNavigate('profile');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // 1. Basic required fields check
    if (!regName.trim()) {
      setErrorMessage('Full name is required.');
      return;
    }

    if (!regEmail.trim()) {
      setErrorMessage('Email address is required.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(regEmail.trim())) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    // 2. Phone validation: exactly 11 numeric digits (0-9)
    const cleanPhone = regPhone.trim();
    if (!cleanPhone) {
      setErrorMessage('Phone number is required and must contain exactly 11 digits (0–9).');
      return;
    }
    if (!/^\d+$/.test(cleanPhone)) {
      setErrorMessage('Phone number must contain only numeric digits (0–9). No letters, spaces, or symbols.');
      return;
    }
    if (cleanPhone.length !== 11) {
      setErrorMessage(`Phone number must contain exactly 11 digits (currently ${cleanPhone.length} digits).`);
      return;
    }

    // 3. Password validation:
    // - At least 12 characters
    // - At least 1 uppercase letter (A-Z)
    // - At least 1 lowercase letter (a-z)
    // - At least 1 number (0-9)
    // - At least 1 special character/symbol
    if (regPassword.length < 12) {
      setErrorMessage('Password must be at least 12 characters long.');
      return;
    }
    if (!/[A-Z]/.test(regPassword)) {
      setErrorMessage('Password must contain at least 1 uppercase letter (A–Z).');
      return;
    }
    if (!/[a-z]/.test(regPassword)) {
      setErrorMessage('Password must contain at least 1 lowercase letter (a–z).');
      return;
    }
    if (!/[0-9]/.test(regPassword)) {
      setErrorMessage('Password must contain at least 1 number (0–9).');
      return;
    }
    if (!/[^A-Za-z0-9]/.test(regPassword)) {
      setErrorMessage('Password must contain at least 1 symbol/special character (e.g. @, #, $, !).');
      return;
    }

    // 4. Confirm password match
    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setLoading(true);
    const res = await register(regName, regEmail, regPassword, cleanPhone);
    setLoading(false);

    if (!res.success) {
      setErrorMessage(res.message || 'Registration failed.');
    } else {
      setSuccessMessage('Account created successfully! Redirecting to your profile...');
      setTimeout(() => {
        onNavigate('profile');
      }, 1200);
    }
  };

  // Password requirement check helper flags
  const hasMinLength = regPassword.length >= 12;
  const hasUpperCase = /[A-Z]/.test(regPassword);
  const hasLowerCase = /[a-z]/.test(regPassword);
  const hasNumber = /[0-9]/.test(regPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(regPassword);
  const hasValidPhone = /^\d{11}$/.test(regPhone);

  return (
    <div className="min-h-screen pt-28 pb-16 bg-[#FAF9F6] text-[#1A1A1A] flex items-center justify-center px-4">
      <div className="w-full max-w-lg bg-white border border-[#E5E5E5] shadow-xl rounded-2xl overflow-hidden my-6">

        {/* Page Header */}
        <div className="p-8 text-center border-b border-stone-200 bg-[#F8F5EB]">
          <span className="font-serif text-3xl tracking-[0.25em] text-[#1A1A1A] font-light uppercase block">
            ELYSIA
          </span>
          <span className="inline-block mt-2 px-3 py-0.5 bg-[#C5B358]/20 text-[#8C7A28] border border-[#C5B358]/40 text-[10px] uppercase tracking-[0.2em] font-extrabold rounded-full">
            Luxury Guest Portal
          </span>
          <p className="text-xs text-stone-600 mt-2 font-serif font-light max-w-xs mx-auto">
            {activeTab === 'login'
              ? 'Welcome back. Sign in to view your profile and manage reservations.'
              : 'Create an account to track your room bookings and luxury experiences.'}
          </p>
        </div>

        {/* Light Theme Tab Switcher */}
        <div className="flex border-b border-stone-200 bg-white">
          <button
            onClick={() => { setActiveTab('login'); setErrorMessage(null); setSuccessMessage(null); }}
            className={`flex-1 py-3.5 text-xs font-semibold uppercase tracking-[0.15em] flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'login'
                ? 'text-[#C5B358] border-b-2 border-[#C5B358] bg-[#FAF9F6]'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <LogIn className="w-4 h-4" /> Sign In
          </button>
          <button
            onClick={() => { setActiveTab('register'); setErrorMessage(null); setSuccessMessage(null); }}
            className={`flex-1 py-3.5 text-xs font-semibold uppercase tracking-[0.15em] flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'register'
                ? 'text-[#C5B358] border-b-2 border-[#C5B358] bg-[#FAF9F6]'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <UserPlus className="w-4 h-4" /> Register
          </button>
        </div>

        {/* Feedback Alerts */}
        {errorMessage && (
          <div className="mx-6 mt-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-3 rounded-xl">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mx-6 mt-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-3 rounded-xl">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="font-medium">{successMessage}</span>
          </div>
        )}

        {/* Tab 1: Sign In Form */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="p-8 space-y-5">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-stone-600 mb-1.5 font-bold">
                Email Address *
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="guest@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-[#FAF9F6] border border-stone-300 rounded-xl text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#C5B358] focus:border-[#C5B358] transition"
                />
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-stone-600 mb-1.5 font-bold">
                Password *
              </label>
              <div className="relative">
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-3 bg-[#FAF9F6] border border-stone-300 rounded-xl text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#C5B358] focus:border-[#C5B358] transition"
                />
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  aria-label={showLoginPassword ? "Hide password" : "Show password"}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 transition p-1 cursor-pointer"
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 py-3.5 bg-[#C5B358] text-[#1A1A1A] font-bold text-xs uppercase tracking-[0.2em] hover:bg-[#b09e46] transition-colors rounded-xl disabled:opacity-50 flex items-center justify-center gap-2 shadow-md cursor-pointer"
            >
              {loading ? 'Authenticating...' : 'Sign In to Account'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Tab 2: Register Form */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="p-8 space-y-4">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-stone-600 mb-1.5 font-bold">
                Full Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Lord / Lady Sterling"
                  className="w-full pl-10 pr-4 py-3 bg-[#FAF9F6] border border-stone-300 rounded-xl text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#C5B358] focus:border-[#C5B358] transition"
                />
                <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-stone-600 mb-1.5 font-bold">
                Email Address *
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="guest@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-[#FAF9F6] border border-stone-300 rounded-xl text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#C5B358] focus:border-[#C5B358] transition"
                />
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-[11px] uppercase tracking-wider text-stone-600 font-bold">
                  Phone Number *
                </label>
                <span className={`text-[10px] font-mono font-medium ${regPhone.length === 11 ? 'text-emerald-600' : 'text-stone-400'}`}>
                  {regPhone.length}/11 digits
                </span>
              </div>
              <div className="relative">
                <input
                  type="tel"
                  required
                  value={regPhone}
                  onChange={(e) => {
                    // Restrict input to numeric digits (0-9) only and max 11 digits
                    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 11);
                    setRegPhone(digitsOnly);
                  }}
                  placeholder="03001234567"
                  maxLength={11}
                  className={`w-full pl-10 pr-4 py-3 bg-[#FAF9F6] border rounded-xl text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 transition ${
                    regPhone && regPhone.length !== 11
                      ? 'border-amber-400 focus:ring-amber-400'
                      : regPhone.length === 11
                      ? 'border-emerald-400 focus:ring-emerald-400'
                      : 'border-stone-300 focus:ring-[#C5B358] focus:border-[#C5B358]'
                  }`}
                />
                <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
              <p className="text-[10px] text-stone-500 mt-1">
                Must contain exactly 11 numeric digits (0–9). No letters or symbols.
              </p>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-stone-600 mb-1.5 font-bold">
                Password * (Min 12 chars)
              </label>
              <div className="relative">
                <input
                  type={showRegPassword ? 'text' : 'password'}
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-3 bg-[#FAF9F6] border border-stone-300 rounded-xl text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#C5B358] focus:border-[#C5B358] transition"
                />
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowRegPassword(!showRegPassword)}
                  aria-label={showRegPassword ? "Hide password" : "Show password"}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 transition p-1 cursor-pointer"
                >
                  {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Real-time Password Requirements Checklist */}
              {regPassword.length > 0 && (
                <div className="mt-2.5 p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-1.5 text-[11px]">
                  <div className="font-semibold text-stone-700 mb-1">Password Requirements:</div>
                  <div className={`flex items-center gap-2 transition-colors ${hasMinLength ? 'text-emerald-700 font-medium' : 'text-stone-500'}`}>
                    <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold ${hasMinLength ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-200 text-stone-600'}`}>
                      {hasMinLength ? '✓' : '•'}
                    </span>
                    At least 12 characters long
                  </div>
                  <div className={`flex items-center gap-2 transition-colors ${hasUpperCase ? 'text-emerald-700 font-medium' : 'text-stone-500'}`}>
                    <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold ${hasUpperCase ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-200 text-stone-600'}`}>
                      {hasUpperCase ? '✓' : '•'}
                    </span>
                    At least 1 uppercase letter (A–Z)
                  </div>
                  <div className={`flex items-center gap-2 transition-colors ${hasLowerCase ? 'text-emerald-700 font-medium' : 'text-stone-500'}`}>
                    <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold ${hasLowerCase ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-200 text-stone-600'}`}>
                      {hasLowerCase ? '✓' : '•'}
                    </span>
                    At least 1 lowercase letter (a–z)
                  </div>
                  <div className={`flex items-center gap-2 transition-colors ${hasNumber ? 'text-emerald-700 font-medium' : 'text-stone-500'}`}>
                    <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold ${hasNumber ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-200 text-stone-600'}`}>
                      {hasNumber ? '✓' : '•'}
                    </span>
                    At least 1 number (0–9)
                  </div>
                  <div className={`flex items-center gap-2 transition-colors ${hasSpecial ? 'text-emerald-700 font-medium' : 'text-stone-500'}`}>
                    <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold ${hasSpecial ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-200 text-stone-600'}`}>
                      {hasSpecial ? '✓' : '•'}
                    </span>
                    At least 1 symbol/special character (@, #, $, !, etc.)
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-stone-600 mb-1.5 font-bold">
                Confirm Password *
              </label>
              <div className="relative">
                <input
                  type={showRegConfirmPassword ? 'text' : 'password'}
                  required
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-3 bg-[#FAF9F6] border border-stone-300 rounded-xl text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#C5B358] focus:border-[#C5B358] transition"
                />
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                  aria-label={showRegConfirmPassword ? "Hide password" : "Show password"}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 transition p-1 cursor-pointer"
                >
                  {showRegConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {regConfirmPassword && regPassword !== regConfirmPassword && (
                <p className="text-[10px] text-rose-500 mt-1">Passwords do not match.</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 py-3.5 bg-[#C5B358] text-[#1A1A1A] font-bold text-xs uppercase tracking-[0.2em] hover:bg-[#b09e46] transition-colors rounded-xl disabled:opacity-50 flex items-center justify-center gap-2 shadow-md cursor-pointer"
            >
              {loading ? 'Creating Account...' : 'Complete Registration'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

      </div>
    </div>
  );
};

