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
      <div className="min-h-screen bg-[#08090B] flex flex-col items-center justify-center p-4 text-[#E8EAED]">
        <div className="p-8 rounded-xl bg-[#161A20] border border-[#272D35] shadow-2xl text-center space-y-4 max-w-sm w-full">
          <div className="w-12 h-12 rounded-xl bg-[#111419] border border-[#272D35] text-[#A3B86C] mx-auto flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 animate-pulse text-[#A3B86C]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#E8EAED] tracking-wide">CONVERA Authentication Gateway</h3>
            <p className="text-xs text-[#A0A7B2] mt-1">Verifying administrative security credentials...</p>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs text-[#E8B75C] pt-2 font-mono">
            <Loader2 className="w-4 h-4 animate-spin text-[#E8B75C]" />
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
