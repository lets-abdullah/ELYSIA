import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'xl'
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 15 }}
            // eslint-disable-next-line security/detect-object-injection -- reviewed, typed internal prop
            className={`relative w-full ${maxWidthClasses[maxWidth] || 'max-w-xl'} bg-[#FAF9F6] border border-[#E5E5E5] rounded-none shadow-xl p-5 sm:p-8 my-auto z-10 text-[#1A1A1A] max-h-[92vh] flex flex-col overflow-hidden`}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 sm:pb-4 mb-4 sm:mb-6 border-b border-[#E5E5E5] shrink-0">
              <div className="pr-4">
                {subtitle && (
                  <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-[#C5B358] font-semibold mb-1">
                    {subtitle}
                  </p>
                )}
                {title && (
                  <h3 className="font-serif text-xl sm:text-3xl font-light text-[#1A1A1A] leading-tight">
                    {title}
                  </h3>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-2 -mr-1 text-stone-500 hover:text-[#1A1A1A] hover:bg-[#F5F5F0] transition-colors rounded-none cursor-pointer shrink-0 min-w-11 min-h-11 flex items-center justify-center border border-transparent hover:border-[#E5E5E5]"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="overflow-y-auto flex-1 pr-1 sm:pr-2 scrollbar-thin">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
