import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { ExpenseService } from '../../services/expense.service';
import { LoanService } from '../../services/loan.service';
import { ToastService } from '../../services/toast.service';
import { Transaction } from '../../models/transaction.model';
import { CurrencyPipe, DatePipe, AsyncPipe } from '@angular/common';
import { Subscription, combineLatest, BehaviorSubject, Observable } from 'rxjs';
import { map, pairwise } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, BaseChartDirective, CurrencyPipe, DatePipe, AsyncPipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardComponent implements OnInit, OnDestroy {
  public expenseService = inject(ExpenseService);
  private loanService = inject(LoanService);
  private toastService = inject(ToastService);

  private subscriptions: Subscription = new Subscription();

  // Animation flags
  pulseBalance = false;
  pulseIncome = false;
  pulseExpense = false;

  // Search
  searchQuery$ = new BehaviorSubject<string>('');

  // Expose Observables to template
  totalIncome$: Observable<number> = this.expenseService.totalIncome$;
  totalExpense$: Observable<number> = this.expenseService.totalExpense$;
  balance$: Observable<number> = this.expenseService.balance$;

  filteredTransactions$: Observable<Transaction[]> = combineLatest([
    this.expenseService.transactions$,
    this.searchQuery$
  ]).pipe(
    map(([transactions, query]) => {
      const q = query || '';
      if (!q.trim()) {
        return transactions.slice(0, 5); // recent 5
      }
      return transactions.filter(t => t.title.toLowerCase().includes(q.toLowerCase())).slice(0, 5);
    })
  );

  // Chart configuration
  chartData: ChartData<'doughnut'> = {
    labels: ['Income', 'Expense'],
    datasets: [{
      data: [0, 0],
      backgroundColor: ['rgba(16, 185, 129, 0.85)', 'rgba(239, 68, 68, 0.85)'],
      hoverBackgroundColor: ['rgba(16, 185, 129, 1)', 'rgba(239, 68, 68, 1)'],
      borderWidth: 0,
      borderRadius: 4
    }]
  };

  chartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '72%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyleWidth: 12,
          font: {
            family: 'Inter',
            size: 13,
            weight: 'normal'
          },
          color: '#94a3b8'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleFont: { family: 'Inter', weight: 'bold' },
        bodyFont: { family: 'Inter' },
        padding: 12,
        cornerRadius: 10,
        displayColors: true,
        callbacks: {
          label: (context) => {
            const value = context.parsed;
            if (value !== null && value !== undefined) {
              return ` ₹${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
            }
            return '';
          }
        }
      }
    }
  };

  ngOnInit(): void {
    // Check for daily loan reminders
    this.loanService.checkReminders();

    // Subscription for chart updates only
    this.subscriptions.add(
      combineLatest([
        this.totalIncome$,
        this.totalExpense$
      ]).subscribe(([income, expense]) => {
        const inc = income || 0;
        const exp = expense || 0;
        
        // Re-assign chart data to trigger change detection in ng2-charts
        this.chartData = {
          ...this.chartData,
          datasets: [{
            ...this.chartData.datasets[0],
            data: [inc, exp]
          }]
        };
      })
    );

    // Pulse animations for updates
    this.subscriptions.add(
      this.balance$.pipe(pairwise()).subscribe(([prev, curr]) => {
        if (prev !== curr) {
          this.pulseBalance = true;
          setTimeout(() => this.pulseBalance = false, 600);
        }
      })
    );
    this.subscriptions.add(
      this.totalIncome$.pipe(pairwise()).subscribe(([prev, curr]) => {
        if (prev !== curr) {
          this.pulseIncome = true;
          setTimeout(() => this.pulseIncome = false, 600);
        }
      })
    );
    this.subscriptions.add(
      this.totalExpense$.pipe(pairwise()).subscribe(([prev, curr]) => {
        if (prev !== curr) {
          this.pulseExpense = true;
          setTimeout(() => this.pulseExpense = false, 600);
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  deleteTransaction(id: string): void {
    this.expenseService.deleteTransaction(id);
    this.toastService.show('Transaction deleted', 'info');
  }

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery$.next(input.value);
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
