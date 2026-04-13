import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ExpenseService } from '../../services/expense.service';
import { ToastService } from '../../services/toast.service';
import { Transaction } from '../../models/transaction.model';
import { CurrencyPipe, DatePipe, AsyncPipe } from '@angular/common';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, DatePipe, AsyncPipe],
  templateUrl: './transaction-list.html',
  styleUrl: './transaction-list.scss'
})
export class TransactionListComponent {
  public expenseService = inject(ExpenseService);
  private toastService = inject(ToastService);

  searchQuery$ = new BehaviorSubject<string>('');
  filterType$ = new BehaviorSubject<'all' | 'income' | 'expense'>('all');

  filteredTransactions$: Observable<Transaction[]> = combineLatest([
    this.expenseService.transactions$,
    this.searchQuery$,
    this.filterType$
  ]).pipe(
    map(([transactions, query, type]) => {
      let filtered = transactions;

      // Filter by type
      if (type !== 'all') {
        filtered = filtered.filter(t => t.type === type);
      }

      // Filter by search query
      const q = query?.toLowerCase().trim();
      if (q) {
        filtered = filtered.filter(t => t.title.toLowerCase().includes(q));
      }

      return filtered;
    })
  );

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery$.next(input.value);
  }

  setFilter(type: 'all' | 'income' | 'expense'): void {
    this.filterType$.next(type);
  }

  deleteTransaction(id: string): void {
    this.expenseService.deleteTransaction(id);
    this.toastService.show('Transaction deleted', 'info');
  }
}
