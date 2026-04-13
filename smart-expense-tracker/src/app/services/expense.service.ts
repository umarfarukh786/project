import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Transaction } from '../models/transaction.model';

/**
 * ExpenseService manages all transaction data.
 * Persists to localStorage and broadcasts data using BehaviorSubject.
 */
@Injectable({ providedIn: 'root' })
export class ExpenseService {
  private readonly STORAGE_KEY = 'expense_transactions';

  private readonly _transactions = new BehaviorSubject<Transaction[]>(this.loadFromStorage());
  readonly transactions$: Observable<Transaction[]> = this._transactions.asObservable();

  readonly totalIncome$: Observable<number> = this.transactions$.pipe(
    map(transactions => transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0))
  );

  readonly totalExpense$: Observable<number> = this.transactions$.pipe(
    map(transactions => transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0))
  );

  readonly balance$: Observable<number> = this.transactions$.pipe(
    map(transactions => {
      const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
      const expense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);
      return income - expense;
    })
  );

  addTransaction(transaction: Omit<Transaction, 'id'>): Transaction {
    const newTransaction: Transaction = {
      ...transaction,
      id: this.generateId()
    };
    const updated = [newTransaction, ...this._transactions.getValue()];
    this._transactions.next(updated);
    this.saveToStorage(updated);
    return newTransaction;
  }

  deleteTransaction(id: string): void {
    const updated = this._transactions.getValue().filter(t => t.id !== id);
    this._transactions.next(updated);
    this.saveToStorage(updated);
  }

  searchTransactions(query: string): Transaction[] {
    const transactions = this._transactions.getValue();
    if (!query.trim()) return transactions;
    const lowerQuery = query.toLowerCase();
    return transactions.filter(t => t.title.toLowerCase().includes(lowerQuery));
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
  }

  private loadFromStorage(): Transaction[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored) as Transaction[];
      } catch {
        return [];
      }
    }
    return [];
  }

  private saveToStorage(transactions: Transaction[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(transactions));
  }
}
