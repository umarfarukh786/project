import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

/**
 * AuthService handles dummy authentication.
 * Validates email format and password length (≥6 chars).
 * Stores login state in localStorage.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  /** Reactive signal for logged-in state */
  private readonly _isLoggedIn = signal<boolean>(this.checkStoredAuth());

  /** Public read-only signal */
  readonly isLoggedIn = this._isLoggedIn.asReadonly();

  constructor(private router: Router) {}

  /**
   * Attempt login with email and password.
   * Accepts any valid email format + password ≥ 6 characters.
   */
  login(email: string, password: string): { success: boolean; message: string } {
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { success: false, message: 'Please enter a valid email address.' };
    }

    // Password length check
    if (password.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters.' };
    }

    // Dummy auth — accept any valid credentials
    localStorage.setItem('auth_user', JSON.stringify({ email, loggedInAt: new Date().toISOString() }));
    this._isLoggedIn.set(true);
    return { success: true, message: 'Login successful!' };
  }

  /**
   * Attempt registration with email and password.
   * Accepts any valid email format + password ≥ 6 characters.
   */
  register(email: string, password: string): { success: boolean; message: string } {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { success: false, message: 'Please enter a valid email address.' };
    }

    if (password.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters.' };
    }

    localStorage.setItem('auth_user', JSON.stringify({ email, loggedInAt: new Date().toISOString() }));
    this._isLoggedIn.set(true);
    return { success: true, message: 'Registration successful! Welcome.' };
  }

  /**
   * Clear session and redirect to login page.
   */
  logout(): void {
    localStorage.removeItem('auth_user');
    this._isLoggedIn.set(false);
    this.router.navigate(['/login']);
  }

  /**
   * Get the currently logged-in user's email.
   */
  getUserEmail(): string {
    const stored = localStorage.getItem('auth_user');
    if (stored) {
      try {
        return JSON.parse(stored).email || '';
      } catch {
        return '';
      }
    }
    return '';
  }

  /**
   * Check localStorage for existing auth session.
   */
  private checkStoredAuth(): boolean {
    return !!localStorage.getItem('auth_user');
  }
}
