import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  confirmVariant?: 'danger' | 'warning' | 'primary';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Delete Record',
  confirmVariant = 'danger'
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="md">
      <div className="flex items-start gap-4 py-2">
        <div
          className={`p-3 rounded-2xl shrink-0 ${
            confirmVariant === 'danger'
              ? 'bg-rose-100 text-rose-600'
              : confirmVariant === 'warning'
              ? 'bg-amber-100 text-amber-600'
              : 'bg-indigo-100 text-indigo-600'
          }`}
        >
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-slate-600 leading-relaxed">{message}</p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-xl text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className={`px-4 py-2 rounded-xl text-sm font-medium text-white transition-colors ${
            confirmVariant === 'danger'
              ? 'bg-rose-600 hover:bg-rose-700 shadow-sm shadow-rose-200'
              : confirmVariant === 'warning'
              ? 'bg-amber-600 hover:bg-amber-700 shadow-sm shadow-amber-200'
              : 'bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-200'
          }`}
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  );
};
