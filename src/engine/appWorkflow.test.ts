import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import App from '../App';
import { AuthService, AUTHORIZED_DEMO_ACCOUNTS } from '../services/authService';

// Storage mock for Vitest environment
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

describe('CONVERA — End-to-End Authentication & Dashboard Workflow Verification', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('1. Initial Unauthenticated State renders LoginPage and blocks dashboard routes', () => {
    // When no officer is logged in
    expect(AuthService.getPersistedSession()).toBeNull();

    const html = renderToString(React.createElement(App));

    // Verify Login Page is rendered
    expect(html).toContain('CONVERA');
    expect(html).toContain('Official Sign In');
    expect(html).toContain('Officer Registration');
    expect(html).toContain('Account Password');
    expect(html).toContain('Sri Venkateswara College of Engineering (SVCE)');
    expect(html).toContain('1-4328901');

    // Verify Protected Dashboard components are NOT exposed to unauthenticated users
    expect(html).not.toContain('Integrated Institution Complaint Registry');
    expect(html).not.toContain('Chronological Regulatory Action History');
  });

  it('2. Authenticated Session renders Main Dashboard with officer identity and credentials', async () => {
    const directorRB = AUTHORIZED_DEMO_ACCOUNTS[0];

    // Officer signs in
    const user = await AuthService.signIn({
      email: directorRB.user.email,
      password: directorRB.passwordHash,
      rememberMe: true
    });

    expect(user.displayName).toBe('Dr. Amitabh Ghosh');

    // Rendering App in authenticated state
    const html = renderToString(React.createElement(App));

    // Verify officer credentials appear in Header
    expect(html).toContain('Dr. Amitabh Ghosh');
    expect(html).toContain('Director (Regulation Bureau)');
    expect(html).toContain('Sign Out');

    // Verify Core Dashboard is rendered with CONVERA branding
    expect(html).toContain('CONVERA');
    expect(html).toContain('Total Cases');
    expect(html).toContain('Regulatory Action Stream');

    // Verify Login page is NOT displayed
    expect(html).not.toContain('Sign in to access the CONVERA institutional complaint intelligence');
  });

  it('3. Sign Out workflow clears authenticated session and immediately restores LoginPage', async () => {
    const pgrcDirector = AUTHORIZED_DEMO_ACCOUNTS[1];

    // Sign in
    await AuthService.signIn({
      email: pgrcDirector.user.email,
      password: pgrcDirector.passwordHash,
      rememberMe: false
    });
    expect(AuthService.getPersistedSession()).not.toBeNull();

    // Verify authenticated state
    let html = renderToString(React.createElement(App));
    expect(html).toContain('Smt. Sunita Mohanty');

    // Execute Sign Out
    await AuthService.signOut();
    expect(AuthService.getPersistedSession()).toBeNull();

    // Re-render after sign out
    html = renderToString(React.createElement(App));
    expect(html).toContain('Official Sign In');
    expect(html).toContain('Welcome back');
    expect(html).not.toContain('Sign Out');
    expect(html).not.toContain('AICTE National Complaint Monitoring');
  });
});
