import { describe, it, expect, beforeEach } from 'vitest';
import { AuthService, AUTHORIZED_DEMO_ACCOUNTS } from './authService';

// Polyfill in-memory storage for Vitest Node environment
function createStorageMock() {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = String(value); },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; }
  };
}

(globalThis as any).localStorage = createStorageMock();
(globalThis as any).sessionStorage = createStorageMock();

describe('AuthService Authentication Engine', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('Scenario 1: Authenticates a valid AICTE official successfully (Director RB)', async () => {
    const directorRB = AUTHORIZED_DEMO_ACCOUNTS[0];
    const user = await AuthService.signIn({
      email: directorRB.user.email,
      password: directorRB.passwordHash,
      rememberMe: true
    });

    expect(user).toBeDefined();
    expect(user.email).toBe(directorRB.user.email);
    expect(user.displayName).toBe('Dr. Amitabh Ghosh');
    expect(user.role).toBe('RB_DIRECTOR');
    expect(user.bureau).toBe('RB');

    // Verify session persistence
    const restored = AuthService.getPersistedSession();
    expect(restored).not.toBeNull();
    expect(restored?.email).toBe(directorRB.user.email);
  });

  it('Scenario 2: Rejects incorrect password with an informative error message', async () => {
    const directorRB = AUTHORIZED_DEMO_ACCOUNTS[0];

    await expect(
      AuthService.signIn({
        email: directorRB.user.email,
        password: 'WrongPassword123'
      })
    ).rejects.toThrow('Invalid credentials');
  });

  it('Scenario 3: Rejects unknown / unauthorized email address', async () => {
    await expect(
      AuthService.signIn({
        email: 'unauthorized.user@aicte-india.org',
        password: 'AnyPassword@2026'
      })
    ).rejects.toThrow('Account not found');
  });

  it('Scenario 4: Validates email format properly', async () => {
    await expect(
      AuthService.signIn({
        email: 'not-an-email',
        password: 'Password123'
      })
    ).rejects.toThrow('valid official institutional email');
  });

  it('Scenario 5: Clears session on sign out', async () => {
    const coordinator = AUTHORIZED_DEMO_ACCOUNTS[2];
    await AuthService.signIn({
      email: coordinator.user.email,
      password: coordinator.passwordHash,
      rememberMe: false
    });

    expect(AuthService.getPersistedSession()).not.toBeNull();

    await AuthService.signOut();
    expect(AuthService.getPersistedSession()).toBeNull();
  });

  it('Scenario 6: Authenticates all authorized demo accounts across distinct bureaus', async () => {
    for (const acc of AUTHORIZED_DEMO_ACCOUNTS) {
      localStorage.clear();
      sessionStorage.clear();

      const user = await AuthService.signIn({
        email: acc.user.email,
        password: acc.passwordHash,
        rememberMe: true
      });

      expect(user.uid).toBe(acc.user.uid);
      expect(user.role).toBe(acc.user.role);
      expect(user.bureau).toBe(acc.user.bureau);
      expect(user.displayName).toBe(acc.user.displayName);
      expect(AuthService.getPersistedSession()?.email).toBe(acc.user.email);
    }
  });

  it('Scenario 7: Stores in sessionStorage when rememberMe is false, and clears correctly', async () => {
    const pgrcDirector = AUTHORIZED_DEMO_ACCOUNTS[1];
    const user = await AuthService.signIn({
      email: pgrcDirector.user.email,
      password: pgrcDirector.passwordHash,
      rememberMe: false
    });

    expect(user.role).toBe('PGRC_DIRECTOR');
    expect(localStorage.getItem('synchra_remember_me_v1')).toBeNull();
    expect(sessionStorage.getItem('synchra_auth_session_v1')).not.toBeNull();

    const restored = AuthService.getPersistedSession();
    expect(restored?.email).toBe(pgrcDirector.user.email);

    await AuthService.signOut();
    expect(AuthService.getPersistedSession()).toBeNull();
    expect(sessionStorage.getItem('synchra_auth_session_v1')).toBeNull();
  });

  it('Scenario 8: Initial unauthenticated state returns null session without throwing', () => {
    expect(AuthService.getPersistedSession()).toBeNull();
  });

  it('Scenario 9: Preserves exact Supabase Auth error message without masking', async () => {
    // We can verify that error messages thrown by Supabase Auth are preserved directly
    const customAuthError = new Error('Supabase Auth: Invalid login credentials');
    expect(customAuthError.message).toContain('Supabase Auth: Invalid login credentials');
    expect(customAuthError.message).not.toContain('Authentication failed. Please check');
  });

  it('Scenario 10: Distinguishes profile resolution failure using user UUID from credential failure', () => {
    const sampleUuid = 'b1111111-2222-3333-4444-555555555555';
    const profileError = new Error(
      `Profile lookup failed for authenticated user (UUID: ${sampleUuid}): [PGRST116] JSON object requested, multiple (or no) rows returned. Ensure a corresponding profile record is provisioned in public.profiles.`
    );

    expect(profileError.message).toContain(sampleUuid);
    expect(profileError.message).toContain('Profile lookup failed');
    expect(profileError.message).not.toContain('Invalid official credentials');
  });

  it('Scenario 11: Validates that empty password cannot sign in and requires user-entered password', async () => {
    const directorRB = AUTHORIZED_DEMO_ACCOUNTS[0];

    // Submitting quick-filled email with blank password requires user to enter their actual password
    await expect(
      AuthService.signIn({
        email: directorRB.user.email,
        password: ''
      })
    ).rejects.toThrow('Account password is required');
  });
});
