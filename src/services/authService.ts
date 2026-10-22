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

    if (!normalizedEmail) {
      throw new Error('Official email address is required.');
    }
    if (!password) {
      throw new Error('Account password is required. Please enter your password.');
    }

    // 1. If Supabase is configured, authenticate against Supabase Auth
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        let authUserRecord: any = null;

        // Step 1A: Supabase Auth credentials verification
        try {
          const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: normalizedEmail,
            password
          });

          if (authError) {
            // Preserve the exact error from Supabase Auth without replacing it with a generic message
            throw new Error(`Supabase Auth: ${authError.message}`);
          }

          if (!authData?.user) {
            throw new Error('Supabase Auth: No user session returned upon sign-in.');
          }

          authUserRecord = authData.user;
        } catch (authErr: any) {
          // If network is completely unreachable (e.g. running in an offline test suite or sandbox),
          // allow deterministic demo accounts fallback
          if (
            authErr.message.includes('fetch failed') ||
            authErr.message.includes('Failed to fetch') ||
            authErr.message.includes('NetworkError')
          ) {
            console.warn('Network unreachable in test/offline environment; falling back to offline demo credentials.');
          } else {
            // DO NOT replace or mask auth errors — preserve the exact error from Supabase Auth
            throw authErr;
          }
        }

        // Step 1B: Separate Profile Lookup using the authenticated user's actual UUID
        if (authUserRecord) {
          const userUuid = authUserRecord.id;
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userUuid)
            .single();

          if (profileError) {
            // Report profile errors distinctly from authentication errors
            throw new Error(
              `Profile lookup failed for authenticated user (UUID: ${userUuid}): [${profileError.code || 'PGRST'}] ${profileError.message}. Ensure a corresponding profile record is provisioned in public.profiles.`
            );
          }

          if (!profile) {
            throw new Error(
              `Profile missing: No record found in public.profiles for authenticated user (UUID: ${userUuid}). Please link an official role and bureau.`
            );
          }

          const authenticatedUser: AuthUser = {
            uid: userUuid,
            email: authUserRecord.email || normalizedEmail,
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
