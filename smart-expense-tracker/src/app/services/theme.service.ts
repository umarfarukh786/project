import { Injectable, signal } from '@angular/core';

/**
 * ThemeService manages dark/light mode toggle.
 * Persists user preference to localStorage.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly STORAGE_KEY = 'theme_preference';
  private readonly _isDark = signal<boolean>(this.loadPreference());
  readonly isDark = this._isDark.asReadonly();

  constructor() {
    // Apply theme on initialization
    this.applyTheme(this._isDark());
  }

  /**
   * Toggle between dark and light mode.
   */
  toggle(): void {
    const newValue = !this._isDark();
    this._isDark.set(newValue);
    this.applyTheme(newValue);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(newValue));
  }

  /**
   * Apply theme class to the document body.
   */
  private applyTheme(isDark: boolean): void {
    if (isDark) {
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
    } else {
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
    }
  }

  /**
   * Load saved theme preference from localStorage.
   * Defaults to dark theme.
   */
  private loadPreference(): boolean {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored !== null) {
      try {
        return JSON.parse(stored);
      } catch {
        return true; // default dark
      }
    }
    return true; // default dark
  }
}
