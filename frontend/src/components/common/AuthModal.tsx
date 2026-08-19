import React, { useState } from 'react';
import { X, Mail, Lock, User, Phone, LogIn, UserPlus, AlertCircle, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, authModalTab, login, register } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(authModalTab);

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

  React.useEffect(() => {
    setActiveTab(authModalTab);
    setErrorMessage(null);
    setSuccessMessage(null);
  }, [authModalTab, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

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
      setSuccessMessage('Account created successfully!');
    }
  };

  // Password requirement check helper flags
  const hasMinLength = regPassword.length >= 12;
  const hasUpperCase = /[A-Z]/.test(regPassword);
  const hasLowerCase = /[a-z]/.test(regPassword);
  const hasNumber = /[0-9]/.test(regPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(regPassword);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#1A1A1A] text-white border border-[#C5B358]/30 shadow-2xl overflow-hidden rounded-none">

        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors p-1 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="p-6 text-center border-b border-[#333333] bg-[#141414]">
          <span className="font-serif text-2xl tracking-[0.25em] text-white uppercase block">ELYSIA</span>
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#C5B358] block mt-1">Luxury Guest Portal</span>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#333333] bg-[#111111]">
          <button
            onClick={() => { setActiveTab('login'); setErrorMessage(null); }}
            className={`flex-1 py-3 text-xs font-semibold uppercase tracking-[0.15em] flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'login'
                ? 'text-[#C5B358] border-b-2 border-[#C5B358] bg-[#1A1A1A]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" /> Sign In
          </button>
          <button
            onClick={() => { setActiveTab('register'); setErrorMessage(null); }}
            className={`flex-1 py-3 text-xs font-semibold uppercase tracking-[0.15em] flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'register'
                ? 'text-[#C5B358] border-b-2 border-[#C5B358] bg-[#1A1A1A]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" /> Register
          </button>
        </div>

        {/* Error / Success Notifications */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mx-6 mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Tab 1: Sign In */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1 font-semibold">
                Email Address *
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="guest@example.com"
                  className="w-full pl-9 pr-4 py-2.5 bg-[#262626] border border-[#444444] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#C5B358]"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1 font-semibold">
                Password *
              </label>
              <div className="relative">
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-9 py-2.5 bg-[#262626] border border-[#444444] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#C5B358]"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  aria-label={showLoginPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition p-0.5 cursor-pointer"
                >
                  {showLoginPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 bg-[#C5B358] text-[#1A1A1A] font-bold text-xs uppercase tracking-[0.2em] hover:bg-[#b09e46] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? 'Authenticating...' : 'Sign In to Account'}
            </button>
          </form>
        )}

        {/* Tab 2: Register */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="p-6 space-y-3">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1 font-semibold">
                Full Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Lord / Lady Sterling"
                  className="w-full pl-9 pr-4 py-2 bg-[#262626] border border-[#444444] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#C5B358]"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1 font-semibold">
                Email Address *
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="guest@example.com"
                  className="w-full pl-9 pr-4 py-2 bg-[#262626] border border-[#444444] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#C5B358]"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                  Phone Number *
                </label>
                <span className={`text-[9px] font-mono ${regPhone.length === 11 ? 'text-[#C5B358]' : 'text-slate-500'}`}>
                  {regPhone.length}/11 digits
                </span>
              </div>
              <div className="relative">
                <input
                  type="tel"
                  required
                  value={regPhone}
                  onChange={(e) => {
                    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 11);
                    setRegPhone(digitsOnly);
                  }}
                  placeholder="03001234567"
                  maxLength={11}
                  className="w-full pl-9 pr-4 py-2 bg-[#262626] border border-[#444444] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#C5B358]"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              <p className="text-[9px] text-slate-500 mt-1">
                Must contain exactly 11 numeric digits (0–9).
              </p>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1 font-semibold">
                Password * (Min 12 chars)
              </label>
              <div className="relative">
                <input
                  type={showRegPassword ? 'text' : 'password'}
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-9 py-2 bg-[#262626] border border-[#444444] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#C5B358]"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowRegPassword(!showRegPassword)}
                  aria-label={showRegPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition p-0.5 cursor-pointer"
                >
                  {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Real-time Password Requirements Checklist */}
              {regPassword.length > 0 && (
                <div className="mt-2 p-2.5 bg-[#141414] border border-[#333333] space-y-1 text-[10px]">
                  <div className="font-semibold text-slate-300 mb-0.5">Password Requirements:</div>
                  <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-[#C5B358]' : 'text-slate-500'}`}>
                    <span>{hasMinLength ? '✓' : '•'}</span> At least 12 characters
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasUpperCase ? 'text-[#C5B358]' : 'text-slate-500'}`}>
                    <span>{hasUpperCase ? '✓' : '•'}</span> 1 uppercase letter (A–Z)
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasLowerCase ? 'text-[#C5B358]' : 'text-slate-500'}`}>
                    <span>{hasLowerCase ? '✓' : '•'}</span> 1 lowercase letter (a–z)
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-[#C5B358]' : 'text-slate-500'}`}>
                    <span>{hasNumber ? '✓' : '•'}</span> 1 number (0–9)
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasSpecial ? 'text-[#C5B358]' : 'text-slate-500'}`}>
                    <span>{hasSpecial ? '✓' : '•'}</span> 1 symbol/special character (@, #, $, !, etc.)
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-slate-400 mb-1 font-semibold">
                Confirm Password *
              </label>
              <div className="relative">
                <input
                  type={showRegConfirmPassword ? 'text' : 'password'}
                  required
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-9 py-2 bg-[#262626] border border-[#444444] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#C5B358]"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                  aria-label={showRegConfirmPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition p-0.5 cursor-pointer"
                >
                  {showRegConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              {regConfirmPassword && regPassword !== regConfirmPassword && (
                <p className="text-[10px] text-rose-400 mt-1">Passwords do not match.</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 bg-[#C5B358] text-[#1A1A1A] font-bold text-xs uppercase tracking-[0.2em] hover:bg-[#b09e46] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? 'Creating Account...' : 'Complete Registration'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
