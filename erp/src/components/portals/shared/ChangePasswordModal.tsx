import React, { useState } from 'react';
import { Modal } from '../../common/Modal';
import { PasswordRequirements } from '../../common/PasswordRequirements';
import { validateErpPassword, generateCompliantPassword } from '../../../utils/passwordPolicy';
import { apiFetch } from '../../../services/api';
import { useHotel } from '../../../context/HotelContext';
import {
  Key,
  Lock,
  Eye,
  EyeOff,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose
}) => {
  const { currentUser, showToast } = useHotel();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGenerate = () => {
    const generated = generateCompliantPassword();
    setNewPassword(generated);
    setConfirmPassword(generated);
    setShowNew(true);
    setShowConfirm(true);
    setErrorMsg(null);
  };

  const handleReset = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setErrorMsg(null);
    setShowCurrent(false);
    setShowNew(false);
    setShowConfirm(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!currentPassword.trim()) {
      setErrorMsg('Current password is required.');
      return;
    }

    const validation = validateErpPassword(newPassword);
    if (!validation.isValid) {
      setErrorMsg(validation.message);
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('New password and confirmation password do not match.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await apiFetch('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({
          currentPassword: currentPassword.trim(),
          password: newPassword.trim(),
          name: currentUser.name,
          phone: currentUser.phone
        })
      });

      if (res && res.success) {
        showToast(
          'Password Changed',
          'Your account password was updated successfully. Previous login sessions have been invalidated.',
          'success'
        );
        handleClose();
      } else {
        const msg = res?.message || 'Failed to update password.';
        setErrorMsg(msg);
        showToast('Password Update Failed', msg, 'error');
      }
    } catch (err: any) {
      const msg = err.message || 'Server error while updating password.';
      setErrorMsg(msg);
      showToast('Password Update Failed', msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Change Account Password"
      subtitle={`Update login security credentials for ${currentUser.name} (${currentUser.role})`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{errorMsg}</div>
          </div>
        )}

        {/* Current Password */}
        <div>
          <label className="block text-slate-700 font-semibold mb-1">
            Current Password <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type={showCurrent ? 'text' : 'password'}
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter your current password"
              className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 font-mono text-xs"
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              {showCurrent ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-slate-700 font-semibold">
              New Password (Min 12 Chars) <span className="text-rose-500">*</span>
            </label>
            <button
              type="button"
              onClick={handleGenerate}
              className="text-[10px] text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" /> Auto-Generate Compliant
            </button>
          </div>
          <div className="relative">
            <Key className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type={showNew ? 'text' : 'password'}
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new strong password"
              className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 font-mono text-xs"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              {showNew ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Live Password Policy Requirements Checklist */}
        <PasswordRequirements password={newPassword} />

        {/* Confirm Password */}
        <div>
          <label className="block text-slate-700 font-semibold mb-1">
            Confirm New Password <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type={showConfirm ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 font-mono text-xs"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              {showConfirm ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
          {newPassword && confirmPassword && newPassword === confirmPassword && (
            <p className="text-[11px] text-emerald-600 flex items-center gap-1 mt-1 font-medium">
              <CheckCircle2 className="w-3 h-3" /> Passwords match
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 font-medium cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm shadow-indigo-200 cursor-pointer flex items-center gap-2 disabled:opacity-50"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{isSubmitting ? 'Saving...' : 'Update Password'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
