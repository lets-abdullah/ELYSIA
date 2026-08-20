import React from 'react';
import { CheckCircle2, Circle, AlertCircle, ShieldCheck, ShieldAlert } from 'lucide-react';
import { validateErpPassword } from '../../utils/passwordPolicy';

interface PasswordRequirementsProps {
  password: string;
  showErrorBanner?: boolean;
  errorMessage?: string | null;
  className?: string;
}

export const PasswordRequirements: React.FC<PasswordRequirementsProps> = ({
  password,
  showErrorBanner = false,
  errorMessage = null,
  className = ''
}) => {
  const result = validateErpPassword(password);
  const metCount = result.requirements.filter((r) => r.met).length;
  const totalCount = result.requirements.length;
  const percentage = Math.round((metCount / totalCount) * 100);

  const getStrengthColor = () => {
    if (percentage === 100) return 'bg-emerald-500 text-emerald-700';
    if (percentage >= 60) return 'bg-amber-500 text-amber-700';
    return 'bg-rose-500 text-rose-700';
  };

  const getStrengthLabel = () => {
    if (percentage === 100) return 'Compliant & Strong';
    if (percentage >= 60) return 'Moderate Strength';
    return 'Weak / Incomplete';
  };

  return (
    <div className={`space-y-2.5 bg-slate-50 border border-slate-200 rounded-xl p-3.5 ${className}`}>
      {/* Header & Progress */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
          {result.isValid ? (
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          ) : (
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
          )}
          ERP Password Requirements
        </span>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
          result.isValid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
        }`}>
          {getStrengthLabel()} ({metCount}/{totalCount})
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${
            percentage === 100 ? 'bg-emerald-500' : percentage >= 60 ? 'bg-amber-500' : 'bg-rose-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Checklist items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
        {result.requirements.map((req) => (
          <div
            key={req.id}
            className={`flex items-center gap-1.5 text-[11px] transition-colors ${
              req.met ? 'text-emerald-700 font-semibold' : 'text-slate-500'
            }`}
          >
            {req.met ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            ) : (
              <Circle className="w-3.5 h-3.5 text-slate-300 shrink-0" />
            )}
            <span>{req.label}</span>
          </div>
        ))}
      </div>

      {/* Optional Explicit Error Banner */}
      {showErrorBanner && !result.isValid && (
        <div className="mt-2 p-2 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-[11px] flex items-start gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
          <span>{errorMessage || result.message}</span>
        </div>
      )}
    </div>
  );
};
