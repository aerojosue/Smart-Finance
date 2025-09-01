export interface PlannedExpense {
  id: string;
  kind: 'debit' | 'credit';
  card_id?: string;
  category: 'food' | 'transport' | 'entertainment' | 'health' | 'shopping' | 'bills' | 'other';
  currency: string;
  amount: string;
  amount_equiv_est_ars?: string;
  fx_quote_rate_est?: string;
  concept?: string;
  date: string;
  n_installments?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ExpenseInstallment {
  id: string;
  planned_expense_id: string;
  installment_number: number;
  total_installments: number;
  due_date: string;
  status: 'upcoming' | 'warning' | 'urgent' | 'due' | 'paid';
  currency: string;
  amount_base: string;
  amount_equiv_est_ars?: string;
  deficit?: {
    currency: string;
    amount: string;
  };
  suggestions?: DeficitSuggestion[];
}

export interface DeficitSuggestion {
  from_currency: string;
  amount_from_est: string;
  est_rate: string;
  est_spread_pct?: string;
  platform_suggested?: string;
}

export interface ObservedExpense {
  id: string;
  category: 'food' | 'transport' | 'entertainment' | 'health' | 'shopping' | 'bills' | 'other';
  currency: string;
  amount: string;
  amount_ars: string;
  date: string;
  planned_id?: string;
  created_at: string;
}

export interface ExpenseFormData {
  kind: 'debit' | 'credit';
  card_id: string;
  category: 'food' | 'transport' | 'entertainment' | 'health' | 'shopping' | 'bills' | 'other';
  currency: string;
  amount: string;
  concept: string;
  date: string;
  n_installments: number;
  is_active: boolean;
}

export interface ExpenseKpis {
  current_month_ars: number;
  previous_month_ars: number;
  mom_pct: number;
  top_categories: {
    category: string;
    amount_ars: number;
    percentage: number;
  }[];
  credit_vs_debit: {
    credit_pct: number;
    debit_pct: number;
  };
}

export interface ExpenseComparison {
  category: string;
  planned_ars: number;
  observed_ars: number;
  variance_ars: number;
  variance_pct: number;
  status: 'good' | 'warning' | 'bad';
}