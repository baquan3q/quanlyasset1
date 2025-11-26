export type TransactionType = 'INCOME' | 'EXPENSE';

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  category: string;
  description: string;
  type: TransactionType;
}

export interface SummaryData {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export interface CategoryData {
  name: string;
  value: number;
  color: string;
}

export interface AIAnalysisResult {
  summary: string;
  tips: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
}
