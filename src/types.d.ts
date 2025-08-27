export type DeficitSuggestion = {
  from_currency: string;
  amount_from_est: string;
  est_rate: string;
  est_spread_pct?: string;
  platform_suggested?: string;
};

export type DeficitItem = {
  date: string;
  currency: string;
  amount: string;
  label: string;
  status: 'warning'|'urgent'|'due';
  suggestions?: DeficitSuggestion[];
};

export type Installment = {
  id: string;
  n: number;
  due_date: string;
  status: 'upcoming'|'warning'|'urgent'|'due'|'paid';
  currency: string;
  amount_base: string;
  amount_equiv_est?: string;
  amount_equiv_paid?: string;
  fx_quote_rate_est?: string;
  fx_effective_rate_paid?: string;
  card?: { id: string; name: string; payment_day: number; cutoff_day: number };
  deficit?: { currency: string; amount: string };
  suggestions?: DeficitSuggestion[];
};
