import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
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
  maxWidth = 'lg'
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#08090B]/85 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150">
      <div 
        className={`w-full ${maxWidthClasses[maxWidth]} bg-[#161A20] text-[#E8EAED] rounded-xl shadow-2xl border border-[#272D35] overflow-hidden my-8`}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between px-6 py-4 bg-[#111419] border-b border-[#272D35]">
          <div>
            <h3 className="text-base font-bold text-[#E8EAED]">{title}</h3>
            {subtitle && <p className="text-xs text-[#A0A7B2] mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-[#737D8B] hover:text-[#E8EAED] hover:bg-[#161A20] border border-transparent hover:border-[#272D35] transition-colors"
            title="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};
