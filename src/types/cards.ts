export interface Card {
  id: string;
  name: string;
  brand: 'Visa' | 'Mastercard' | 'Amex' | 'Other';
  type: 'credit' | 'debit';
  country: string;
  multimoneda: boolean;
  currencies: string[];
  limit_by_currency?: Record<string, string>;
  cutoff_day?: number;
  payment_day?: number;
  business_day_policy: 'next_business_day';
  color: string;
  last4?: string;
  fx_settlement_policy: 'at_payment';
  created_at: string;
  updated_at: string;
}

export interface CardFormData {
  name: string;
  brand: 'Visa' | 'Mastercard' | 'Amex' | 'Other';
  type: 'credit' | 'debit';
  country: string;
  multimoneda: boolean;
  currencies: string[];
  limit_by_currency: Record<string, string>;
  cutoff_day: number;
  payment_day: number;
  color: string;
  last4: string;
  notes: string;
}

export interface CardCycle {
  current_cutoff: string;
  current_payment: string;
  next_cutoff: string;
  next_payment: string;
  cycle_consumption: Record<string, string>;
  future_installments: Record<string, string>;
}

export interface InstallmentPreview {
  installment_number: number;
  due_date: string;
  amount: string;
  is_weekend_adjusted: boolean;
}