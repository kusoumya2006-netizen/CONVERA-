import React, { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  label = 'Password',
  error,
  className = '',
  disabled,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-1.5">
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-slate-300">
            {label} <span className="text-rose-500">*</span>
          </label>
        </div>
      )}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
          <Lock className="w-4 h-4" />
        </div>
        <input
          {...props}
          type={showPassword ? 'text' : 'password'}
          disabled={disabled}
          className={`w-full pl-9 pr-10 py-2.5 text-xs bg-obsidian-950 border rounded-lg transition-colors placeholder:text-slate-500 text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400 ${
            error
              ? 'border-rose-500/80 focus:border-rose-500 focus:ring-rose-950'
              : 'border-slate-700/80 hover:border-slate-600'
          } ${disabled ? 'bg-slate-900 cursor-not-allowed text-slate-500' : ''} ${className}`}
        />
        <button
          type="button"
          onClick={() => setShowPassword(prev => !prev)}
          disabled={disabled}
          tabIndex={-1}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 transition-colors focus:outline-none"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {error && <p className="text-[11px] text-rose-400 font-medium">{error}</p>}
    </div>
  );
};
