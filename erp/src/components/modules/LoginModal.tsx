import React from 'react';
import { ShieldCheck, Building2, User, KeyRound, CheckCircle2 } from 'lucide-react';
import { useHotel } from '../../context/HotelContext';
import { Modal } from '../common/Modal';
import { User as UserType } from '../../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { users, currentUser, setCurrentUser, showToast } = useHotel();

  const handleSelectUser = (u: UserType) => {
    setCurrentUser(u);
    showToast('Role Switched', `Active ERP session switched to ${u.name} (${u.role}).`, 'success');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Hotel ERP Authorization Portal" maxWidth="lg">
      <div className="space-y-4 text-xs">
        <div className="p-4 bg-slate-900 text-white rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-white">Grand Luxe Hotel ERP Portal</h4>
            <p className="text-[11px] text-slate-400">Select an employee account below to test role views</p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-slate-700 font-bold uppercase tracking-wider text-[10px]">
            Available Employee Accounts ({users.length})
          </label>

          <div className="grid grid-cols-1 gap-2 max-h-72 overflow-y-auto pr-1">
            {users.map((u) => {
              const isSelected = u.id === currentUser.id;
              return (
                <div
                  key={u.id}
                  onClick={() => handleSelectUser(u)}
                  className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-indigo-50 border-indigo-400 ring-2 ring-indigo-500/30'
                      : 'bg-white border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                      alt={u.name}
                      className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-200"
                    />
                    <div>
                      <h5 className="font-bold text-slate-900 text-xs">{u.name}</h5>
                      <span className="text-[10px] text-slate-500">@{u.username}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                      {u.role}
                    </span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-end pt-3 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
          >
            Close Portal
          </button>
        </div>
      </div>
    </Modal>
  );
};
