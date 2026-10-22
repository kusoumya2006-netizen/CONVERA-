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
          <label className="block text-xs font-semibold text-[#A0A7B2]">
            {label} <span className="text-[#F16D75]">*</span>
          </label>
        </div>
      )}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#737D8B]">
          <Lock className="w-4 h-4" />
        </div>
        <input
          {...props}
          type={showPassword ? 'text' : 'password'}
          disabled={disabled}
          className={`w-full pl-9 pr-10 py-2.5 text-xs bg-[#0B0D10] border rounded-md transition-colors placeholder:text-[#737D8B] text-[#E8EAED] focus:outline-none focus:border-[#A3B86C] ${
            error
              ? 'border-[#F16D75]/80 focus:border-[#F16D75]'
              : 'border-[#272D35] hover:border-[#38414D]'
          } ${disabled ? 'bg-[#111419] cursor-not-allowed text-[#737D8B]' : ''} ${className}`}
        />
        <button
          type="button"
          onClick={() => setShowPassword(prev => !prev)}
          disabled={disabled}
          tabIndex={-1}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#737D8B] hover:text-[#E8EAED] transition-colors focus:outline-none"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {error && <p className="text-[11px] text-[#F16D75] font-medium">{error}</p>}
    </div>
  );
};
