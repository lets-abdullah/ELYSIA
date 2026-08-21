import React, { useState } from 'react';
import { AlertTriangle, ShieldAlert, X, Check, Ban, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const SecurityWarningModal: React.FC = () => {
  const { user, isWarningModalOpen, closeWarningModal, dismissWarning } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isWarningModalOpen || !user || !user.warning_message) {
    return null;
  }

  const handleAcknowledge = async () => {
    setIsSubmitting(true);
    try {
      await dismissWarning();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border-2 border-amber-500 overflow-hidden transform transition-all">
        
        {/* Top Crimson/Amber Header Banner */}
        <div className="bg-gradient-to-r from-red-700 via-amber-600 to-red-800 p-6 text-white text-center relative">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-white/20 shadow-inner">
            <ShieldAlert className="w-9 h-9 text-amber-300 animate-pulse" />
          </div>
          <h3 className="font-serif text-2xl font-bold tracking-tight text-white">
            Security & Spam Notice
          </h3>
          <p className="text-amber-100 text-xs mt-1 font-medium tracking-wide uppercase">
            Official System Security Enforcement
          </p>

          <button
            onClick={closeWarningModal}
            className="absolute top-4 right-4 text-white/70 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-red-900">Spam or Fake Activity Detected</h4>
                <p className="text-xs text-red-800 mt-1 leading-relaxed font-medium">
                  {user.warning_message}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h5 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
              <Ban className="w-4 h-4 text-amber-600" /> Platform Security Rules:
            </h5>
            <ul className="text-xs text-stone-600 space-y-2 bg-stone-50 p-4 rounded-2xl border border-stone-200">
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold">•</span>
                <span><strong>No Fake / Duplicate Bookings:</strong> You are strictly allowed only <strong>1 active room reservation</strong> at a time.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold">•</span>
                <span><strong>Authoritative Pricing:</strong> Tampered rates or unpaid duplicate submissions are automatically cancelled within 1 hour.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold">•</span>
                <span><strong>Account Protection:</strong> Continued spam attempts will result in permanent IP & account suspension.</span>
              </li>
            </ul>
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <button
              onClick={handleAcknowledge}
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-bold text-xs uppercase tracking-widest rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Updating Profile...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>I Understand & Agree to Comply</span>
                </>
              )}
            </button>
            <p className="text-[11px] text-stone-400 text-center mt-2">
              By confirming, you acknowledge that duplicate and manipulated bookings will be automatically purged.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
