import { AuthUser, AuthCredentials } from '../types/auth';

const AUTH_STORAGE_KEY = 'synchra_auth_session_v1';
const REMEMBER_STORAGE_KEY = 'synchra_remember_me_v1';

/**
 * Pre-authorized AICTE administrative officials for demonstration and testing.
 * In production, identity is validated against the AICTE LDAP/Single-Sign-On or Firebase Auth.
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
   * Retrieves the current persisted session from localStorage or sessionStorage.
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
   * Signs in an authorized official.
   * Simulates realistic network authentication latency and verifies credentials.
   */
  static async signIn(credentials: AuthCredentials): Promise<AuthUser> {
    const { email, password, rememberMe } = credentials;

    // Simulate network latency (350ms)
    await new Promise(resolve => setTimeout(resolve, 350));

    const normalizedEmail = email.trim().toLowerCase();

    // Check pre-authorized demo accounts
    const match = AUTHORIZED_DEMO_ACCOUNTS.find(
      acc => acc.user.email.toLowerCase() === normalizedEmail
    );

    if (!match) {
      // Validate domain for government/AICTE institutional addresses
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

    // Store session
    try {
      if (rememberMe) {
        localStorage.setItem(REMEMBER_STORAGE_KEY, 'true');
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authenticatedUser));
      } else {
        localStorage.removeItem(REMEMBER_STORAGE_KEY);
        sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authenticatedUser));
      }
    } catch (err) {
      console.error('Session persistence error:', err);
    }

    return authenticatedUser;
  }

  /**
   * Clears the active authentication session.
   */
  static async signOut(): Promise<void> {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (err) {
      console.error('Sign out error:', err);
    }
  }
}
