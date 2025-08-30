export interface PlannedIncome {
  id: string;
  source: string;
  category: 'salary' | 'freelance' | 'rental' | 'investment' | 'bonus' | 'other';
  currency: string;
  amount: string | null; // null if variable_band is used
  confidence: 'high' | 'medium' | 'low';
  recurrence: {
    type: 'monthly' | 'one_time';
    day_rule: 'fixed_day' | 'last_business_day' | 'next_business_day';
    anchor_day?: number; // for fixed_day and next_business_day
  } | null;
  variable_band: {
    min: string;
    max: string;
  } | null;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface ObservedIncome {
  id: string;
  source: string;
  category: 'salary' | 'freelance' | 'rental' | 'investment' | 'bonus' | 'other';
  currency: string;
  amount: string;
  date: string;
  account_id: string;
  planned_id?: string; // link to planned income
  created_at: string;
}

export interface PlannedIncomeFormData {
  source: string;
  category: 'salary' | 'freelance' | 'rental' | 'investment' | 'bonus' | 'other';
  currency: string;
  amount: string;
  confidence: 'high' | 'medium' | 'low';
  recurrence_type: 'monthly' | 'one_time';
  day_rule: 'fixed_day' | 'last_business_day' | 'next_business_day';
  anchor_day: number;
  use_variable_band: boolean;
  variable_min: string;
  variable_max: string;
  notes: string;
}

export interface ExpandedPlannedIncome {
  planned_id: string;
  source: string;
  category: string;
  currency: string;
  date: string;
  amount_ars: number;
  amount_original: number;
  confidence: 'high' | 'medium' | 'low';
  scenario: 'conservative' | 'base' | 'optimistic';
  is_pending: boolean; // true if past due without observed
}

export interface IncomeMonthlyAgg {
  month: string; // YYYY-MM
  planned_ars: number;
  observed_ars: number;
  variance_ars: number;
  variance_pct: number;
  by_category: {
    category: string;
    planned_ars: number;
    observed_ars: number;
    variance_ars: number;
    variance_pct: number;
  }[];
}

export interface IncomeKpis {
  current_month_ars: number;
  previous_month_ars: number;
  mom_pct: number;
  ytd_ars: number;
  avg_3m_ars: number;
  avg_6m_ars: number;
  avg_12m_ars: number;
}

export interface IncomeForecast {
  months: {
    month: string;
    conservative_ars: number;
    base_ars: number;
    optimistic_ars: number;
  }[];
}

export interface IncomeComparison {
  category: string;
  source: string;
  planned_ars: number;
  observed_ars: number;
  variance_ars: number;
  variance_pct: number;
  status: 'good' | 'warning' | 'bad'; // >=0%, ±10%, <-10%
}