import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthUser, AuthCredentials } from '../types/auth';
import { AuthService } from '../services/authService';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: string | null;
  signIn: (credentials: AuthCredentials) => Promise<boolean>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      return AuthService.getPersistedSession();
    } catch (e) {
      console.warn('Error reading initial auth session:', e);
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setAuthError(null);
  }, []);

  const signIn = async (credentials: AuthCredentials): Promise<boolean> => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const authUser = await AuthService.signIn(credentials);
      setUser(authUser);
      return true;
    } catch (err: any) {
      const msg = err?.message || 'Authentication failed. Please check your credentials.';
      setAuthError(msg);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await AuthService.signOut();
      setUser(null);
      setAuthError(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        authError,
        signIn,
        signOut,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
