import type { Account } from '../types/accounts';

export async function getAccounts(): Promise<Account[]> {
  const response = await fetch('/mocks/accounts.json');
  if (!response.ok) throw new Error('Failed to fetch accounts');
  const data = await response.json();
  return data.accounts;
}

export async function createAccount(account: Omit<Account, 'id' | 'created_at' | 'updated_at'>): Promise<Account> {
  // Mock implementation - in real app this would call API
  const newAccount: Account = {
    ...account,
    id: `acc_${Date.now()}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return newAccount;
}

export async function updateAccount(id: string, updates: Partial<Account>): Promise<Account> {
  // Mock implementation
  const updatedAccount: Account = {
    id,
    name: 'Updated Account',
    type: 'bank',
    country: 'AR',
    supported_currencies: ['ARS'],
    initial_balances: { ARS: '0.00' },
    color: '#3b82f6',
    liquidity_tier: 'operational',
    allow_auto_suggest: true,
    notes: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...updates,
  };
  
  await new Promise(resolve => setTimeout(resolve, 500));
  return updatedAccount;
}

export async function deleteAccount(id: string): Promise<void> {
  // Mock implementation
  await new Promise(resolve => setTimeout(resolve, 300));
}