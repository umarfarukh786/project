/**
 * Represents a single financial transaction (income or expense).
 */
export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  date: string; // ISO date string (YYYY-MM-DD)
}
