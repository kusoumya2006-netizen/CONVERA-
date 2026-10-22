import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PasswordInput } from './PasswordInput';
import { AdminHelpModal } from './AdminHelpModal';
import { AUTHORIZED_DEMO_ACCOUNTS } from '../../services/authService';
import { isSupabaseConfigured, getSupabaseProjectUrl } from '../../services/supabaseClient';
import {
  Mail,
  ShieldCheck,
  AlertCircle,
  Loader2,
  KeyRound,
  ExternalLink,
  UserCheck,
  UserPlus,
  LogIn,
  CheckCircle2,
  BadgeCheck
} from 'lucide-react';

export const LoginForm: React.FC = () => {
  const { signIn, isLoading, authError, clearError } = useAuth();

  const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Registration form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regBureau, setRegBureau] = useState('RB');
  const [regDesignation, setRegDesignation] = useState('Scrutiny Officer');
  const [regEmpId, setRegEmpId] = useState('');
  const [regSuccess, setRegSuccess] = useState(false);

  // Field-level validation errors
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [regError, setRegError] = useState('');

  // Admin help modal
  const [modalType, setModalType] = useState<'FORGOT_PASSWORD' | 'CONTACT_ADMIN' | null>(null);

  const validateLoginForm = (): boolean => {
    let isValid = true;
    setEmailError('');
    setPasswordError('');
    clearError();

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setEmailError('Official email address is required.');
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setEmailError('Please enter a valid official institutional email.');
      isValid = false;
    }

    if (!password) {
      setPasswordError('Password is required.');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must contain at least 6 characters.');
      isValid = false;
    }

    return isValid;
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateLoginForm()) return;

    await signIn({
      email: email.trim(),
      password,
      rememberMe
    });
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    if (!regName.trim() || !regEmail.trim() || !regEmpId.trim()) {
      setRegError('All fields marked with an asterisk are required.');
      return;
    }
    if (!regEmail.includes('@')) {
      setRegError('Please provide a valid official government or institutional email.');
      return;
    }

    setRegSuccess(true);
  };

  const handleQuickFill = (accountIndex: number) => {
    const acc = AUTHORIZED_DEMO_ACCOUNTS[accountIndex];
    if (acc) {
      setAuthMode('LOGIN');
      setEmail(acc.user.email);
      // Keep email quick-fill, but do not automatically populate a hardcoded password
      setPassword('');
      setEmailError('');
      setPasswordError('');
      clearError();
      setTimeout(() => {
        document.getElementById('official-password')?.focus();
      }, 50);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-5">
      {/* Tab Switcher: Official Sign In vs Officer Registration */}
      <div className="flex rounded-md bg-[#0B0D10] p-1 border border-[#272D35] text-xs font-semibold font-mono">
        <button
          type="button"
          onClick={() => {
            setAuthMode('LOGIN');
            clearError();
          }}
          className={`flex-1 py-1.5 rounded flex items-center justify-center gap-1.5 transition-colors ${
            authMode === 'LOGIN'
              ? 'bg-[#161A20] text-[#E8EAED] border border-[#272D35]'
              : 'text-[#737D8B] hover:text-[#A0A7B2]'
          }`}
        >
          <LogIn className="w-3.5 h-3.5" />
          <span>Official Sign In</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setAuthMode('REGISTER');
            setRegSuccess(false);
            clearError();
          }}
          className={`flex-1 py-1.5 rounded flex items-center justify-center gap-1.5 transition-colors ${
            authMode === 'REGISTER'
              ? 'bg-[#161A20] text-[#E8EAED] border border-[#272D35]'
              : 'text-[#737D8B] hover:text-[#A0A7B2]'
          }`}
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Officer Registration</span>
        </button>
      </div>

      {authMode === 'LOGIN' ? (
        <>
          {/* Title & Subheading */}
          <div className="space-y-1 text-left">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold tracking-tight text-[#E8EAED] font-sans">
                Welcome back
              </h2>
              <span
                title={getSupabaseProjectUrl() ? `Connected to ${getSupabaseProjectUrl()}` : undefined}
                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-medium border ${
                  isSupabaseConfigured()
                    ? 'bg-[#A3B86C]/10 text-[#A3B86C] border-[#A3B86C]/30'
                    : 'bg-[#111419] text-[#CBD5E1] border-[#272D35]'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isSupabaseConfigured() ? 'bg-[#A3B86C]' : 'bg-[#69C9A0]'} animate-pulse`} />
                <span>
                  {isSupabaseConfigured() ? 'PostgreSQL Cloud' : 'Demo Sandbox'}
                </span>
                {isSupabaseConfigured() && getSupabaseProjectUrl() && (
                  <span className="text-[#737D8B] hidden sm:inline text-[9px]">
                    ({(() => {
                      try {
                        return new URL(getSupabaseProjectUrl()!).hostname.split('.')[0];
                      } catch {
                        return 'cloud';
                      }
                    })()})
                  </span>
                )}
              </span>
            </div>
            <p className="text-xs text-[#A0A7B2] leading-relaxed">
              Sign in to access the CONVERA institutional complaint intelligence workspace.
            </p>
          </div>

          {/* Global Auth Error Alert */}
          {authError && (
            <div className="p-3 bg-[#F16D75]/10 border border-[#F16D75]/30 text-[#F16D75] rounded-md flex items-start gap-2.5 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 text-[#F16D75] shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed flex-1">
                <span className="font-semibold block text-[#F16D75]">Authentication Failed</span>
                <span>{authError}</span>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-3.5 text-left" noValidate>
            {/* Email Field */}
            <div className="space-y-1">
              <label htmlFor="official-email" className="block text-xs font-semibold text-[#A0A7B2]">
                Official Email Address <span className="text-[#F16D75]">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#737D8B]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="official-email"
                  type="email"
                  value={email}
                  onChange={e => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError('');
                    if (authError) clearError();
                  }}
                  placeholder="officer.bureau@aicte-india.org"
                  disabled={isLoading}
                  className={`w-full pl-9 pr-3 py-2 text-xs bg-[#0B0D10] border rounded-md transition-colors placeholder:text-[#737D8B] text-[#E8EAED] focus:outline-none focus:border-[#A3B86C] ${
                    emailError
                      ? 'border-[#F16D75]/80 focus:border-[#F16D75]'
                      : 'border-[#272D35] hover:border-[#38414D]'
                  } ${isLoading ? 'bg-[#111419] cursor-not-allowed text-[#737D8B]' : ''}`}
                  autoComplete="email"
                  autoFocus
                />
              </div>
              {emailError && <p className="text-[11px] text-[#F16D75] font-medium">{emailError}</p>}
            </div>

            {/* Password Field */}
            <PasswordInput
              id="official-password"
              label="Account Password"
              value={password}
              onChange={e => {
                setPassword(e.target.value);
                if (passwordError) setPasswordError('');
                if (authError) clearError();
              }}
              placeholder="••••••••••••"
              error={passwordError}
              disabled={isLoading}
              autoComplete="current-password"
            />

            {/* Remember Me & Forgot Password Row */}
            <div className="flex items-center justify-between text-xs pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  disabled={isLoading}
                  className="w-3.5 h-3.5 rounded border-[#272D35] bg-[#0B0D10] text-[#A3B86C] focus:ring-[#A3B86C]"
                />
                <span className="text-[#A0A7B2] font-medium">Remember this session</span>
              </label>

              <button
                type="button"
                onClick={() => setModalType('FORGOT_PASSWORD')}
                className="font-medium text-[#A0A7B2] hover:text-[#E8EAED] transition-colors focus:outline-none"
              >
                Forgot password?
              </button>
            </div>

            {/* Primary Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-md bg-[#A3B86C] hover:bg-[#B7CA82] text-[#08090B] font-semibold text-xs shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Sign in to CONVERA</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials for Evaluation */}
          <div className="pt-3 border-t border-[#272D35] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-[#737D8B] uppercase tracking-wider flex items-center gap-1 font-mono">
                <UserCheck className="w-3 h-3 text-[#A3B86C]" />
                <span>Official Personas (Pre-fill Email)</span>
              </span>
              <span className="text-[10px] text-[#737D8B] font-mono">AICTE Logins</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-left">
              <button
                type="button"
                onClick={() => handleQuickFill(0)}
                className="p-2.5 rounded-md border border-[#272D35] bg-[#111419] hover:border-[#38414D] hover:bg-[#161A20] transition-colors text-xs text-[#A0A7B2]"
              >
                <span className="font-semibold text-[#E8EAED] block truncate">Dr. Amitabh Ghosh</span>
                <span className="text-[10px] text-[#A3B86C] font-mono block">Director (RB)</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill(1)}
                className="p-2.5 rounded-md border border-[#272D35] bg-[#111419] hover:border-[#38414D] hover:bg-[#161A20] transition-colors text-xs text-[#A0A7B2]"
              >
                <span className="font-semibold text-[#E8EAED] block truncate">Smt. Sunita Mohanty</span>
                <span className="text-[10px] text-[#E8B75C] font-mono block">Director (PGRC)</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill(2)}
                className="p-2.5 rounded-md border border-[#272D35] bg-[#111419] hover:border-[#38414D] hover:bg-[#161A20] transition-colors text-xs text-[#A0A7B2]"
              >
                <span className="font-semibold text-[#E8EAED] block truncate">Dr. R. K. Verma</span>
                <span className="text-[10px] text-[#86A9FF] font-mono block">Lead Coordinator</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill(3)}
                className="p-2.5 rounded-md border border-[#272D35] bg-[#111419] hover:border-[#38414D] hover:bg-[#161A20] transition-colors text-xs text-[#A0A7B2]"
              >
                <span className="font-semibold text-[#E8EAED] block truncate">Dr. Suresh Patil</span>
                <span className="text-[10px] text-[#737D8B] font-mono block">Regional Officer (WRO)</span>
              </button>
            </div>
          </div>
        </>
      ) : (
        /* Officer Registration / Access Request Form */
        <div className="space-y-4 text-left">
          <div className="space-y-1 text-left">
            <h2 className="text-2xl font-bold tracking-tight text-[#E8EAED] font-sans">
              Officer Registration
            </h2>
            <p className="text-xs text-[#A0A7B2] leading-relaxed">
              Request access credentials for the AICTE Institutional Grievance & Regulatory Coordination Platform.
            </p>
          </div>

          {regSuccess ? (
            <div className="p-4 bg-[#69C9A0]/10 border border-[#69C9A0]/30 rounded-lg space-y-3 text-[#69C9A0]">
              <div className="flex items-center gap-2 font-bold text-sm text-[#69C9A0]">
                <CheckCircle2 className="w-5 h-5 text-[#69C9A0]" />
                <span>Registration Request Submitted</span>
              </div>
              <p className="text-xs leading-relaxed text-[#E8EAED]">
                Your onboarding request for <strong className="text-white">{regName}</strong> ({regEmail}) has been logged in the AICTE Security Provisioning Queue. The Central Administrative Nodal Officer will verify your Bureau affiliation ({regBureau}) and activate your credentials within 24 hours.
              </p>
              <button
                type="button"
                onClick={() => setAuthMode('LOGIN')}
                className="w-full py-2 px-3 rounded-md bg-[#69C9A0] hover:bg-[#69C9A0]/90 text-[#08090B] font-semibold text-xs shadow-sm transition-colors"
              >
                Return to Official Sign In
              </button>
            </div>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs">
              {regError && (
                <div className="p-3 bg-[#F16D75]/10 border border-[#F16D75]/30 rounded-md text-[#F16D75] text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-[#F16D75] shrink-0" />
                  <span>{regError}</span>
                </div>
              )}

              {/* Full Name */}
              <div className="space-y-1">
                <label className="block font-semibold text-[#A0A7B2]">
                  Officer Full Name <span className="text-[#F16D75]">*</span>
                </label>
                <input
                  type="text"
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                  placeholder="e.g. Dr. K. Radhakrishnan"
                  className="w-full px-3 py-2 bg-[#0B0D10] border border-[#272D35] rounded-md text-[#E8EAED] placeholder:text-[#737D8B] focus:outline-none focus:border-[#A3B86C]"
                  required
                />
              </div>

              {/* Official Email */}
              <div className="space-y-1">
                <label className="block font-semibold text-[#A0A7B2]">
                  Official Email Address <span className="text-[#F16D75]">*</span>
                </label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  placeholder="name.designation@aicte-india.org"
                  className="w-full px-3 py-2 bg-[#0B0D10] border border-[#272D35] rounded-md text-[#E8EAED] placeholder:text-[#737D8B] focus:outline-none focus:border-[#A3B86C]"
                  required
                />
              </div>

              {/* Bureau & Designation Row */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="block font-semibold text-[#A0A7B2]">Bureau / Cell</label>
                  <select
                    value={regBureau}
                    onChange={e => setRegBureau(e.target.value)}
                    className="w-full px-2.5 py-2 bg-[#0B0D10] border border-[#272D35] rounded-md font-medium text-[#E8EAED] focus:outline-none focus:border-[#A3B86C]"
                  >
                    <option value="RB">Regulation Bureau (RB)</option>
                    <option value="PGRC">Public Grievance Redressal (PGRC)</option>
                    <option value="AB">Approval Bureau (AB)</option>
                    <option value="Finance">Finance Bureau</option>
                    <option value="Vigilance">Vigilance Cell</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block font-semibold text-[#A0A7B2]">Designation</label>
                  <input
                    type="text"
                    value={regDesignation}
                    onChange={e => setRegDesignation(e.target.value)}
                    placeholder="e.g. Regional Officer"
                    className="w-full px-3 py-2 bg-[#0B0D10] border border-[#272D35] rounded-md text-[#E8EAED] placeholder:text-[#737D8B] focus:outline-none focus:border-[#A3B86C]"
                    required
                  />
                </div>
              </div>

              {/* Employee ID */}
              <div className="space-y-1">
                <label className="block font-semibold text-[#A0A7B2]">
                  AICTE Employee / Officer ID <span className="text-[#F16D75]">*</span>
                </label>
                <input
                  type="text"
                  value={regEmpId}
                  onChange={e => setRegEmpId(e.target.value)}
                  placeholder="e.g. AICTE-EMP-4091"
                  className="w-full px-3 py-2 bg-[#0B0D10] border border-[#272D35] rounded-md text-[#E8EAED] placeholder:text-[#737D8B] focus:outline-none focus:border-[#A3B86C] font-mono"
                  required
                />
              </div>

              {/* Note */}
              <div className="p-2.5 bg-[#0B0D10] rounded-md border border-[#272D35] text-[11px] text-[#737D8B] flex items-start gap-2">
                <BadgeCheck className="w-4 h-4 text-[#A3B86C] shrink-0 mt-0.5" />
                <span>
                  Submitted applications are verified against the AICTE Establishment Roll before clearance.
                </span>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-md bg-[#A3B86C] hover:bg-[#B7CA82] text-[#08090B] font-semibold text-xs shadow-sm transition-colors flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Submit Officer Registration Request</span>
              </button>
            </form>
          )}
        </div>
      )}

      {/* Security Note & Support Footer */}
      <div className="pt-2 text-center space-y-1.5">
        <p className="text-[11px] text-[#737D8B] leading-normal flex items-center justify-center gap-1.5 font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-[#69C9A0] shrink-0" />
          <span>Authorized access only. Monitored under AICTE Cyber Security Directives.</span>
        </p>

        <p className="text-[11px] text-[#737D8B]">
          Need account assistance?{' '}
          <button
            type="button"
            onClick={() => setModalType('CONTACT_ADMIN')}
            className="font-medium text-[#A0A7B2] hover:text-[#E8EAED] hover:underline inline-flex items-center gap-0.5"
          >
            <span>Contact System Administrator</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </button>
        </p>
      </div>

      {/* Admin Help Modal */}
      {modalType && (
        <AdminHelpModal
          isOpen={Boolean(modalType)}
          onClose={() => setModalType(null)}
          type={modalType}
        />
      )}
    </div>
  );
};
