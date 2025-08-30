export interface SavingGoal {
  id: string;
  name: string;
  description: string;
  base_currency: string;
  target_amount: string;
  current_amount: string;
  priority: 'high' | 'medium' | 'low';
  due_date: string | null;
  color: string;
  category: 'travel' | 'health' | 'emergency' | 'work' | 'education' | 'home' | 'other';
  created_at: string;
  updated_at: string;
}

export interface SavingGoalFormData {
  name: string;
  description: string;
  base_currency: string;
  target_amount: string;
  priority: 'high' | 'medium' | 'low';
  due_date: string;
  color: string;
  category: 'travel' | 'health' | 'emergency' | 'work' | 'education' | 'home' | 'other';
}

export interface Movement {
  id: string;
  type: 'saving_contribution' | 'saving_withdrawal' | 'expense' | 'income' | 'transfer';
  date: string;
  amount: string;
  currency: string;
  from_account?: string;
  to_account?: string;
  to_goal?: string;
  from_goal?: string;
  description: string;
  created_at: string;
}

export interface SurplusAllocation {
  goal_id: string;
  goal_name: string;
  amount_ars: number;
  amount_in_base: number;
  base_currency: string;
  score: number;
}

export interface AllocationSuggestion {
  total_surplus_ars: number;
  allocations: SurplusAllocation[];
  remaining_ars: number;
}