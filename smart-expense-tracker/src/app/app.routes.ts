import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./components/login/login').then(m => m.LoginComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'add-expense',
    loadComponent: () => import('./components/expense-form/expense-form').then(m => m.ExpenseFormComponent),
    canActivate: [authGuard]
  },
  {
    path: 'transactions',
    loadComponent: () => import('./components/transaction-list/transaction-list').then(m => m.TransactionListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'borrow-lend',
    loadComponent: () => import('./components/borrow-lend/borrow-lend.component').then(m => m.BorrowLendComponent),
    canActivate: [authGuard]
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];
