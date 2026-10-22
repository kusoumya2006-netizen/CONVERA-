import { AuthUser, AuthCredentials } from '../types/auth';
import { getSupabaseClient, isSupabaseConfigured } from './supabaseClient';

const AUTH_STORAGE_KEY = 'synchra_auth_session_v1';
const REMEMBER_STORAGE_KEY = 'synchra_remember_me_v1';

/**
 * Pre-authorized AICTE administrative officials for demonstration and testing.
 * In production, identity is validated against Supabase Auth & public.profiles.
 */
export const AUTHORIZED_DEMO_ACCOUNTS: { user: AuthUser; passwordHash: string }[] = [
  {
    user: {
      uid: 'USR-AICTE-RB-01',
      email: 'director.rb@aicte-india.org',
      displayName: 'Dr. Amitabh Ghosh',
      designation: 'Director (Regulation Bureau)',
      role: 'RB_DIRECTOR',
      bureau: 'RB',
      department: 'Regulation Bureau, AICTE New Delhi'
    },
    passwordHash: 'Regulation@2026'
  },
  {
    user: {
      uid: 'USR-AICTE-PGRC-01',
      email: 'director.pgrc@aicte-india.org',
      displayName: 'Smt. Sunita Mohanty',
      designation: 'Director (Public Grievance Redressal Cell)',
      role: 'PGRC_DIRECTOR',
      bureau: 'PGRC',
      department: 'Grievance Redressal Cell, AICTE New Delhi'
    },
    passwordHash: 'Grievance@2026'
  },
  {
    user: {
      uid: 'USR-AICTE-COORD-01',
      email: 'coordinator@aicte-india.org',
      displayName: 'Dr. R. K. Verma',
      designation: 'Advisor & Redressal Coordinator',
      role: 'SUPER_ADMIN',
      bureau: 'ALL',
      department: 'Central Monitoring & Inter-Bureau Coordination'
    },
    passwordHash: 'Synchra@2026'
  },
  {
    user: {
      uid: 'USR-AICTE-WRO-01',
      email: 'officer.western@aicte-india.org',
      displayName: 'Dr. Suresh N. Patil',
      designation: 'Regional Officer (Western Region)',
      role: 'REGIONAL_OFFICER',
      bureau: 'RB',
      department: 'AICTE Western Regional Office, Mumbai'
    },
    passwordHash: 'Western@2026'
  }
];

export class AuthService {
  /**
   * Retrieves the current persisted session from Supabase or localStorage/sessionStorage fallback.
   */
  static getPersistedSession(): AuthUser | null {
    try {
      const isRemembered = localStorage.getItem(REMEMBER_STORAGE_KEY) === 'true';
      const storage = isRemembered ? localStorage : sessionStorage;
      const rawUser = storage.getItem(AUTH_STORAGE_KEY);
      if (rawUser) {
        return JSON.parse(rawUser) as AuthUser;
      }
    } catch (e) {
      console.warn('Failed to parse persisted session:', e);
    }
    return null;
  }

  /**
   * Signs in an official via Supabase Auth when configured, or pre-authorized demo accounts.
   */
  static async signIn(credentials: AuthCredentials): Promise<AuthUser> {
    const { email, password, rememberMe } = credentials;
    const normalizedEmail = email.trim().toLowerCase();

    // 1. If Supabase is configured, authenticate against Supabase Auth
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: normalizedEmail,
            password
          });

          if (authError) {
            throw new Error(authError.message);
          }

          if (authData.user) {
            // Fetch trusted role and designation from public.profiles
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', authData.user.id)
              .single();

            if (profileError || !profile) {
              throw new Error(
                'Official profile record not found in public.profiles. An administrator must assign your role and bureau in the database.'
              );
            }

            const authenticatedUser: AuthUser = {
              uid: authData.user.id,
              email: authData.user.email || normalizedEmail,
              displayName: profile.display_name || 'AICTE Official',
              designation: profile.designation || 'Regulatory Officer',
              role: profile.role,
              bureau: profile.bureau,
              department: profile.department || 'AICTE Headquarters, New Delhi',
              lastLogin: new Date().toISOString()
            };

            this.persistSession(authenticatedUser, rememberMe);
            return authenticatedUser;
          }
        } catch (supabaseErr: any) {
          console.warn('Supabase Auth response:', supabaseErr.message);

          // If offline or network fetch failed (e.g. running in an offline sandbox/test suite),
          // allow deterministic demo accounts fallback
          if (
            supabaseErr.message.includes('fetch failed') ||
            supabaseErr.message.includes('Failed to fetch') ||
            supabaseErr.message.includes('NetworkError')
          ) {
            console.warn('Network unreachable; falling back to offline demo credentials.');
          } else if (supabaseErr.message.includes('Invalid login credentials')) {
            throw new Error(
              'Authentication failed: Invalid official credentials. In Supabase Cloud mode, please verify your password or ensure this official persona is provisioned in Supabase Authentication and public.profiles.'
            );
          } else if (supabaseErr.message.includes('Email not confirmed')) {
            throw new Error(
              'Official email is not confirmed in Supabase Auth. Please confirm your email address or enable auto-confirm in the Supabase Dashboard.'
            );
          } else {
            throw supabaseErr;
          }
        }
      }
    }

    // 2. Fallback to pre-authorized demo accounts (deterministic offline simulation)
    // Simulate network latency (350ms)
    await new Promise(resolve => setTimeout(resolve, 350));

    const match = AUTHORIZED_DEMO_ACCOUNTS.find(
      acc => acc.user.email.toLowerCase() === normalizedEmail
    );

    if (!match) {
      if (!normalizedEmail.includes('@')) {
        throw new Error('Please enter a valid official institutional email address.');
      }
      throw new Error(
        'Account not found. Access is restricted to authorized AICTE bureau officers and cell administrators.'
      );
    }

    if (match.passwordHash !== password) {
      throw new Error('Invalid credentials. Please verify your password or contact the system administrator.');
    }

    const authenticatedUser: AuthUser = {
      ...match.user,
      lastLogin: new Date().toISOString()
    };

    this.persistSession(authenticatedUser, rememberMe);
    return authenticatedUser;
  }

  private static persistSession(user: AuthUser, rememberMe?: boolean) {
    try {
      if (rememberMe) {
        localStorage.setItem(REMEMBER_STORAGE_KEY, 'true');
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(REMEMBER_STORAGE_KEY);
        sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      }
    } catch (err) {
      console.error('Session persistence error:', err);
    }
  }

  /**
   * Clears the active authentication session.
   */
  static async signOut(): Promise<void> {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          await supabase.auth.signOut();
        } catch (err) {
          console.warn('Supabase signOut error:', err);
        }
      }
    }

    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (err) {
      console.error('Sign out error:', err);
    }
  }
}
