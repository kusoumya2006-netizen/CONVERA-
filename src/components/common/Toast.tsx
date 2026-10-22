import React from 'react';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface ToastProps {
  message: {
    text: string;
    type: 'success' | 'info' | 'warning';
  } | null;
}

export const Toast: React.FC<ToastProps> = ({ message }) => {
  if (!message) return null;

  const borderStyles = {
    success: 'border-l-4 border-l-[#69C9A0]',
    info: 'border-l-4 border-l-[#86A9FF]',
    warning: 'border-l-4 border-l-[#E8B75C]'
  };

  const icons = {
    success: <CheckCircle className="w-4 h-4 text-[#69C9A0] shrink-0 mt-0.5" />,
    info: <Info className="w-4 h-4 text-[#86A9FF] shrink-0 mt-0.5" />,
    warning: <AlertTriangle className="w-4 h-4 text-[#E8B75C] shrink-0 mt-0.5" />
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-md shadow-2xl transition-all duration-200 animate-in slide-in-from-bottom-3">
      <div className={`flex items-start gap-3 px-4 py-3 rounded-lg bg-[#161A20] text-[#E8EAED] border border-[#272D35] text-xs font-medium ${borderStyles[message.type]}`}>
        {icons[message.type]}
        <div className="flex-1 pr-1 leading-relaxed">{message.text}</div>
      </div>
    </div>
  );
};
