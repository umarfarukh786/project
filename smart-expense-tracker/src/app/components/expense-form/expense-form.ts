import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ExpenseService } from '../../services/expense.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-expense-form',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './expense-form.html',
  styleUrl: './expense-form.scss'
})
export class ExpenseFormComponent {
  title = '';
  amount: number | null = null;
  type: 'income' | 'expense' = 'expense';
  date = new Date().toISOString().substring(0, 10); // Default to today

  // Validation
  titleTouched = false;
  amountTouched = false;
  isSubmitting = false;

  constructor(
    private expenseService: ExpenseService,
    private toastService: ToastService,
    private router: Router
  ) {}

  get titleError(): string {
    if (!this.titleTouched) return '';
    if (!this.title.trim()) return 'Title is required';
    if (this.title.trim().length < 2) return 'Title must be at least 2 characters';
    return '';
  }

  get amountError(): string {
    if (!this.amountTouched) return '';
    if (this.amount === null || this.amount === undefined) return 'Amount is required';
    if (this.amount <= 0) return 'Amount must be greater than 0';
    return '';
  }

  get formValid(): boolean {
    return this.title.trim().length >= 2 &&
           this.amount !== null &&
           this.amount > 0 &&
           !!this.date;
  }

  onSubmit(): void {
    this.titleTouched = true;
    this.amountTouched = true;

    if (!this.formValid) return;

    this.isSubmitting = true;

    setTimeout(() => {
      this.expenseService.addTransaction({
        title: this.title.trim(),
        amount: Number(this.amount),
        type: this.type,
        date: this.date
      });

      if (this.type === 'income') {
        this.toastService.show('Salary Added Successfully 🎉', 'success');
      } else {
        this.toastService.show('Expense added successfully! 💸', 'success');
      }

      this.isSubmitting = false;
      this.router.navigate(['/dashboard']);
    }, 500);
  }
}
