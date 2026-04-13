export interface Loan {
  id: string;
  personName: string;
  amount: number;
  type: 'borrowed' | 'lent';
  repaymentDate: string; // ISO date string
  status: 'pending' | 'completed';
}
