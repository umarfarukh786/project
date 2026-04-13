import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

/**
 * Simple toast notification service.
 * Manages a stack of toast messages with auto-dismiss.
 */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 0;
  private readonly _toasts = signal<Toast[]>([]);
  readonly toasts = this._toasts.asReadonly();

  /**
   * Show a toast notification.
   * @param message The message to display
   * @param type The toast type (success, error, info)
   * @param duration Auto-dismiss duration in ms (default 3000)
   */
  show(message: string, type: 'success' | 'error' | 'info' = 'info', duration = 3000): void {
    const id = this.nextId++;
    const toast: Toast = { id, message, type };
    this._toasts.update(current => [...current, toast]);

    // Auto-dismiss after duration
    setTimeout(() => this.dismiss(id), duration);
  }

  /**
   * Manually dismiss a toast by ID.
   */
  dismiss(id: number): void {
    this._toasts.update(current => current.filter(t => t.id !== id));
  }
}
