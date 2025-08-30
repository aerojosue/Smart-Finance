export interface KPI {
  income_month: string;
  expense_month: string;
  credit_available: { card: string; currency: string; available: string }[];
  balances_by_currency: { currency: string; amount: string }[];
}

export interface DeficitSuggestion {
  from_currency: string;
  amount_from_est: string;
  est_rate: string;
  est_spread_pct?: string;
  platform_suggested?: string;
}

export interface Deficit {
  date: string;
  currency: string;
  amount: string;
  label: string;
  status: string;
  suggestions: DeficitSuggestion[];
}

export interface DashboardMock {
  range: { from: string; to: string };
  kpis: KPI;
  deficits: Deficit[];
}