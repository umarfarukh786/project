import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Loan } from '../models/loan.model';
import { ToastService } from './toast.service';

/**
 * LoanService manages all borrowed/lent tracking data.
 * Persists to localStorage.
 */
@Injectable({ providedIn: 'root' })
export class LoanService {
  private toastService = inject(ToastService);
  private readonly STORAGE_KEY = 'money_loans';

  private readonly _loans = new BehaviorSubject<Loan[]>(this.loadFromStorage());
  readonly loans$: Observable<Loan[]> = this._loans.asObservable();

  private reminderTriggered = false;

  addLoan(loan: Omit<Loan, 'id'>): Loan {
    const newLoan: Loan = {
      ...loan,
      id: this.generateId()
    };
    const updated = [newLoan, ...this._loans.getValue()];
    this._loans.next(updated);
    this.saveToStorage(updated);
    return newLoan;
  }

  updateLoanStatus(id: string, status: 'pending' | 'completed'): void {
    const loans = this._loans.getValue();
    const index = loans.findIndex(l => l.id === id);
    if (index !== -1) {
      loans[index] = { ...loans[index], status };
      this._loans.next([...loans]);
      this.saveToStorage(loans);
    }
  }

  deleteLoan(id: string): void {
    const updated = this._loans.getValue().filter(l => l.id !== id);
    this._loans.next(updated);
    this.saveToStorage(updated);
  }

  /**
   * Checks for reminders based on the repaymentDate matching today.
   */
  checkReminders(): void {
    if (this.reminderTriggered) return;
    
    const today = new Date().toISOString().substring(0, 10);
    const pendingLoans = this._loans.getValue().filter(l => l.status === 'pending');
    
    const duesToday = pendingLoans.filter(l => l.repaymentDate === today);
    
    if (duesToday.length > 0) {
      this.reminderTriggered = true;
      
      // Try Browser Notification
      if ('Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification('Loan Reminder!', {
            body: `Today is the last day to settle ${duesToday.length} pending loan(s)!`
          });
        } else if (Notification.permission !== 'denied') {
          Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
              new Notification('Loan Reminder!', {
                body: `Today is the last day to settle ${duesToday.length} pending loan(s)!`
              });
            }
          });
        }
      }

      // App Toast
      this.toastService.show(
        `Reminder: Today is the last day to settle money with ${duesToday[0].personName}!`,
        'error', // using error style to act as a red warning
        8000 // display longer
      );

      this.playNotificationSound();
    }
  }

  private playNotificationSound(): void {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // Standard A5 beep
      osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.1); 

      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.warn('Audio feedback failed or blocked by browser interaction policies', e);
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
  }

  private loadFromStorage(): Loan[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  private saveToStorage(loans: Loan[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(loans));
  }
}
