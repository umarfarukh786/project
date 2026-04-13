import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoanService } from '../../services/loan.service';
import { ToastService } from '../../services/toast.service';
import { Loan } from '../../models/loan.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-borrow-lend',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './borrow-lend.component.html',
  styleUrl: './borrow-lend.component.scss'
})
export class BorrowLendComponent implements OnInit {
  private loanService = inject(LoanService);
  private toastService = inject(ToastService);

  loans$: Observable<Loan[]> = this.loanService.loans$;

  // Form State
  personName = '';
  amount: number | null = null;
  type: 'borrowed' | 'lent' = 'lent';
  repaymentDate = new Date().toISOString().substring(0, 10);
  
  personNameTouched = false;
  amountTouched = false;
  isSubmitting = false;

  get personError(): string {
    if (!this.personNameTouched) return '';
    if (!this.personName.trim()) return 'Name is required';
    return '';
  }

  get amountError(): string {
    if (!this.amountTouched) return '';
    if (this.amount === null || this.amount <= 0) return 'Valid amount is required';
    return '';
  }

  get formValid(): boolean {
    return !!this.personName.trim() && this.amount !== null && this.amount > 0 && !!this.repaymentDate;
  }

  ngOnInit(): void {
    // Optionally trigger checkReminders here as well
    this.loanService.checkReminders();
  }

  onSubmit(): void {
    this.personNameTouched = true;
    this.amountTouched = true;

    if (!this.formValid) return;

    this.isSubmitting = true;

    setTimeout(() => {
      this.loanService.addLoan({
        personName: this.personName.trim(),
        amount: Number(this.amount),
        type: this.type,
        repaymentDate: this.repaymentDate,
        status: 'pending'
      });

      this.toastService.show(`${this.type === 'borrowed' ? 'Borrowed' : 'Lent'} record added!`, 'success');
      
      // Reset Form
      this.personName = '';
      this.amount = null;
      this.personNameTouched = false;
      this.amountTouched = false;
      this.isSubmitting = false;
    }, 400);
  }

  toggleStatus(id: string, currentStatus: string) {
    const newStatus = currentStatus === 'pending' ? 'completed' : 'pending';
    this.loanService.updateLoanStatus(id, newStatus);
    if (newStatus === 'completed') {
      this.toastService.show('Marked as completed! 🎉', 'success');
    }
  }

  deleteLoan(id: string) {
    this.loanService.deleteLoan(id);
    this.toastService.show('Record deleted', 'info');
  }
}
