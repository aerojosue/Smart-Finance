import type { PlannedExpense, ObservedExpense, ExpenseInstallment } from '../types/expenses';

// In-memory cache for demo purposes
let plannedCache: PlannedExpense[] | null = null;
let observedCache: ObservedExpense[] | null = null;
let installmentsCache: ExpenseInstallment[] | null = null;

export async function getPlannedExpenses(): Promise<PlannedExpense[]> {
  if (plannedCache) return plannedCache;
  
  try {
    const response = await fetch('/mocks/expenses.json');
    if (!response.ok) throw new Error('Failed to fetch planned expenses');
    const data = await response.json();
    plannedCache = data.planned;
    return plannedCache;
  } catch {
    plannedCache = [];
    return plannedCache;
  }
}

export async function getObservedExpenses(): Promise<ObservedExpense[]> {
  if (observedCache) return observedCache;
  
  try {
    const response = await fetch('/mocks/expenses.json');
    if (!response.ok) throw new Error('Failed to fetch observed expenses');
    const data = await response.json();
    observedCache = data.observed;
    return observedCache;
  } catch {
    observedCache = [];
    return observedCache;
  }
}

export async function getExpenseInstallments(plannedExpenseId: string): Promise<ExpenseInstallment[]> {
  if (!installmentsCache) {
    try {
      const response = await fetch('/mocks/expense_installments.json');
      if (!response.ok) throw new Error('Failed to fetch installments');
      const data = await response.json();
      installmentsCache = data.installments;
    } catch {
      installmentsCache = [];
    }
  }
  
  return installmentsCache?.filter(inst => inst.planned_expense_id === plannedExpenseId) || [];
}

export async function createPlannedExpense(expense: Omit<PlannedExpense, 'id' | 'created_at' | 'updated_at'>): Promise<PlannedExpense> {
  const newExpense: PlannedExpense = {
    ...expense,
    id: `exp_${Date.now()}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  
  if (!plannedCache) await getPlannedExpenses();
  plannedCache = [...(plannedCache || []), newExpense];
  
  await new Promise(resolve => setTimeout(resolve, 500));
  return newExpense;
}

export async function updatePlannedExpense(id: string, updates: Partial<PlannedExpense>): Promise<PlannedExpense> {
  if (!plannedCache) await getPlannedExpenses();
  
  const expenseIndex = plannedCache!.findIndex(e => e.id === id);
  if (expenseIndex === -1) throw new Error('Planned expense not found');
  
  const updatedExpense = {
    ...plannedCache![expenseIndex],
    ...updates,
    updated_at: new Date().toISOString(),
  };
  
  plannedCache![expenseIndex] = updatedExpense;
  
  await new Promise(resolve => setTimeout(resolve, 500));
  return updatedExpense;
}

export async function deletePlannedExpense(id: string): Promise<void> {
  if (!plannedCache) await getPlannedExpenses();
  plannedCache = plannedCache!.filter(e => e.id !== id);
  await new Promise(resolve => setTimeout(resolve, 300));
}

export async function markInstallmentPaid(installmentId: string): Promise<void> {
  if (!installmentsCache) return;
  
  const installment = installmentsCache.find(inst => inst.id === installmentId);
  if (installment) {
    installment.status = 'paid';
  }
  
  await new Promise(resolve => setTimeout(resolve, 300));
}