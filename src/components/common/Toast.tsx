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

  const styles = {
    success: 'bg-emerald-900 text-white border-emerald-700',
    info: 'bg-slate-900 text-white border-slate-700',
    warning: 'bg-amber-950 text-amber-100 border-amber-800'
  };

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-sky-400 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-md shadow-2xl transition-all duration-200 animate-in slide-in-from-bottom-3">
      <div className={`flex items-start gap-3 px-4 py-3 rounded-lg border text-sm font-medium ${styles[message.type]}`}>
        {icons[message.type]}
        <div className="flex-1 pr-1">{message.text}</div>
      </div>
    </div>
  );
};
