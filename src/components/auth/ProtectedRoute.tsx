import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LoginPage } from './LoginPage';
import { Loader2, ShieldCheck } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 text-slate-100">
        <div className="p-8 rounded-2xl bg-slate-800/80 border border-slate-700 shadow-2xl text-center space-y-4 max-w-sm w-full">
          <div className="w-12 h-12 rounded-xl bg-gov-olive/30 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">SYNCHRA Authentication Gateway</h3>
            <p className="text-xs text-slate-400 mt-1">Verifying administrative security credentials...</p>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs text-amber-400 pt-2 font-mono">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Establishing Secure Session</span>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <>{children}</>;
};
