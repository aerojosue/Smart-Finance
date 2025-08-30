export interface Account {
  id: string;
  name: string;
  type: 'cash' | 'bank' | 'ewallet' | 'crypto';
  country: string;
  supported_currencies: string[];
  initial_balances: Record<string, string>;
  color: string;
  liquidity_tier: 'operational' | 'buffer' | 'savings' | 'untouchable';
  allow_auto_suggest: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface AccountFormData {
  name: string;
  type: 'cash' | 'bank' | 'ewallet' | 'crypto';
  country: string;
  supported_currencies: string[];
  initial_balances: Record<string, string>;
  color: string;
  liquidity_tier: 'operational' | 'buffer' | 'savings' | 'untouchable';
  allow_auto_suggest: boolean;
  notes: string;
}