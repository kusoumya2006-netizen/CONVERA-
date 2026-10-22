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
});
