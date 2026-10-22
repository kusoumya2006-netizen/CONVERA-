import { Bureau } from './index';

export type UserRole = 
  | 'SUPER_ADMIN'
  | 'RB_DIRECTOR'
  | 'PGRC_DIRECTOR'
  | 'REGIONAL_OFFICER'
  | 'CASE_SCRUTINY_OFFICER';

export interface AuthUser {
  uid: string;
  email: string;
  displayName: string;
  designation: string;
  role: UserRole;
  bureau: Bureau | 'ALL';
  department: string;
  lastLogin?: string;
}

export interface AuthCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
