import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PasswordInput } from './PasswordInput';
import { AdminHelpModal } from './AdminHelpModal';
import { AUTHORIZED_DEMO_ACCOUNTS } from '../../services/authService';
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
  Building2,
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

  // Validation function for login
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
      setPassword(acc.passwordHash);
      setEmailError('');
      setPasswordError('');
      clearError();
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-5">
      {/* Tab Switcher: Official Sign In vs Officer Registration */}
      <div className="flex rounded-lg bg-slate-200/80 p-1 text-xs font-semibold">
        <button
          type="button"
          onClick={() => {
            setAuthMode('LOGIN');
            clearError();
          }}
          className={`flex-1 py-2 rounded-md flex items-center justify-center gap-1.5 transition-all ${
            authMode === 'LOGIN'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
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
          className={`flex-1 py-2 rounded-md flex items-center justify-center gap-1.5 transition-all ${
            authMode === 'REGISTER'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
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
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Welcome back
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Sign in to access the institutional grievance intelligence & case monitoring workspace.
            </p>
          </div>

          {/* Global Auth Error Alert */}
          {authError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2.5 text-rose-800 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed flex-1">
                <span className="font-semibold block">Authentication Failed</span>
                <span>{authError}</span>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4 text-left" noValidate>
            {/* Email Field */}
            <div className="space-y-1.5">
              <label htmlFor="official-email" className="block text-xs font-semibold text-slate-700">
                Official Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
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
                  className={`w-full pl-9 pr-3 py-2.5 text-xs bg-white border rounded-lg transition-colors placeholder:text-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-gov-olive/20 focus:border-gov-olive ${
                    emailError
                      ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100'
                      : 'border-slate-300 hover:border-slate-400'
                  } ${isLoading ? 'bg-slate-100 cursor-not-allowed text-slate-500' : ''}`}
                  autoComplete="email"
                  autoFocus
                />
              </div>
              {emailError && <p className="text-[11px] text-rose-600 font-medium">{emailError}</p>}
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
                  className="w-3.5 h-3.5 rounded border-slate-300 text-gov-olive focus:ring-gov-olive/20"
                />
                <span className="text-slate-600 font-medium">Remember this session</span>
              </label>

              <button
                type="button"
                onClick={() => setModalType('FORGOT_PASSWORD')}
                className="font-medium text-gov-olive hover:text-gov-olive-light hover:underline transition-colors focus:outline-none"
              >
                Forgot password?
              </button>
            </div>

            {/* Primary Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-lg bg-gov-olive hover:bg-gov-olive-light active:bg-gov-olive text-white font-semibold text-xs shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gov-olive"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Administrative Credentials...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Sign in to SYNCHRA</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials for Evaluation */}
          <div className="pt-3 border-t border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <UserCheck className="w-3 h-3 text-gov-olive" />
                <span>Prototype Demo Accounts (Click to Pre-fill)</span>
              </span>
              <span className="text-[10px] text-slate-400">SIH 2026 Test Suite</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-left">
              <button
                type="button"
                onClick={() => handleQuickFill(0)}
                className="p-2 rounded-lg border border-slate-200 bg-white hover:border-gov-olive hover:bg-slate-50/80 transition-all text-xs text-slate-700"
              >
                <span className="font-semibold text-slate-900 block truncate">Dr. Amitabh Ghosh</span>
                <span className="text-[10px] text-gov-olive font-medium block">Director (RB)</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill(1)}
                className="p-2 rounded-lg border border-slate-200 bg-white hover:border-gov-olive hover:bg-slate-50/80 transition-all text-xs text-slate-700"
              >
                <span className="font-semibold text-slate-900 block truncate">Smt. Sunita Mohanty</span>
                <span className="text-[10px] text-amber-700 font-medium block">Director (PGRC)</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill(2)}
                className="p-2 rounded-lg border border-slate-200 bg-white hover:border-gov-olive hover:bg-slate-50/80 transition-all text-xs text-slate-700"
              >
                <span className="font-semibold text-slate-900 block truncate">Dr. R. K. Verma</span>
                <span className="text-[10px] text-blue-700 font-medium block">Lead Coordinator</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill(3)}
                className="p-2 rounded-lg border border-slate-200 bg-white hover:border-gov-olive hover:bg-slate-50/80 transition-all text-xs text-slate-700"
              >
                <span className="font-semibold text-slate-900 block truncate">Dr. Suresh Patil</span>
                <span className="text-[10px] text-slate-600 font-medium block">Regional Officer (WRO)</span>
              </button>
            </div>
          </div>
        </>
      ) : (
        /* Officer Registration / Access Request Form */
        <div className="space-y-4 text-left">
          <div className="space-y-1 text-left">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Officer Registration
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Request access credentials for the AICTE Institutional Grievance & Regulatory Coordination Platform.
            </p>
          </div>

          {regSuccess ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3 text-emerald-950">
              <div className="flex items-center gap-2 font-bold text-sm text-emerald-800">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Registration Request Submitted</span>
              </div>
              <p className="text-xs leading-relaxed text-emerald-800">
                Your onboarding request for <strong>{regName}</strong> ({regEmail}) has been logged in the AICTE Security Provisioning Queue. The Central Administrative Nodal Officer will verify your Bureau affiliation ({regBureau}) and activate your credentials within 24 hours.
              </p>
              <button
                type="button"
                onClick={() => setAuthMode('LOGIN')}
                className="w-full py-2 px-3 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs shadow-sm transition-colors"
              >
                Return to Official Sign In
              </button>
            </div>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs">
              {regError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{regError}</span>
                </div>
              )}

              {/* Full Name */}
              <div className="space-y-1">
                <label className="block font-semibold text-slate-700">
                  Officer Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                  placeholder="e.g. Dr. K. Radhakrishnan"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-gov-olive"
                  required
                />
              </div>

              {/* Official Email */}
              <div className="space-y-1">
                <label className="block font-semibold text-slate-700">
                  Official Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  placeholder="name.designation@aicte-india.org"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-gov-olive"
                  required
                />
              </div>

              {/* Bureau & Designation Row */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="block font-semibold text-slate-700">Bureau / Cell</label>
                  <select
                    value={regBureau}
                    onChange={e => setRegBureau(e.target.value)}
                    className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-lg font-medium text-slate-800 focus:outline-none focus:border-gov-olive"
                  >
                    <option value="RB">Regulation Bureau (RB)</option>
                    <option value="PGRC">Public Grievance Redressal Cell (PGRC)</option>
                    <option value="AB">Approval Bureau (AB)</option>
                    <option value="Finance">Finance Bureau</option>
                    <option value="Vigilance">Vigilance Cell</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block font-semibold text-slate-700">Designation</label>
                  <input
                    type="text"
                    value={regDesignation}
                    onChange={e => setRegDesignation(e.target.value)}
                    placeholder="e.g. Regional Officer"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-gov-olive"
                    required
                  />
                </div>
              </div>

              {/* Employee ID */}
              <div className="space-y-1">
                <label className="block font-semibold text-slate-700">
                  AICTE Employee / Officer ID <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={regEmpId}
                  onChange={e => setRegEmpId(e.target.value)}
                  placeholder="e.g. AICTE-EMP-4091"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-gov-olive"
                  required
                />
              </div>

              {/* Note */}
              <div className="p-2.5 bg-slate-100 rounded-lg border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2">
                <BadgeCheck className="w-4 h-4 text-gov-olive shrink-0 mt-0.5" />
                <span>
                  Submitted applications are verified against the AICTE Establishment Roll before clearance.
                </span>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-lg bg-gov-olive hover:bg-gov-olive-light text-white font-semibold text-xs shadow-sm transition-colors flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Submit Officer Registration Request</span>
              </button>
            </form>
          )}
        </div>
      )}

      {/* Security Note & Support Footer */}
      <div className="pt-2 text-center space-y-2">
        <p className="text-[11px] text-slate-500 leading-normal flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-gov-olive shrink-0" />
          <span>Authorized access only. Monitored under AICTE Cyber Security Directives.</span>
        </p>

        <p className="text-[11px] text-slate-500">
          Need account assistance?{' '}
          <button
            type="button"
            onClick={() => setModalType('CONTACT_ADMIN')}
            className="font-semibold text-gov-olive hover:underline inline-flex items-center gap-0.5"
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
