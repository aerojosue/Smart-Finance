import type { PlannedIncome, ObservedIncome } from '../types/incomes';

// In-memory cache for demo purposes
let plannedCache: PlannedIncome[] | null = null;
let observedCache: ObservedIncome[] | null = null;

export async function getPlannedIncomes(): Promise<PlannedIncome[]> {
  if (plannedCache) return plannedCache;
  
  const response = await fetch('/mocks/incomes.json');
  if (!response.ok) throw new Error('Failed to fetch planned incomes');
  const data = await response.json();
  plannedCache = data.planned;
  return plannedCache;
}

export async function getObservedIncomes(): Promise<ObservedIncome[]> {
  if (observedCache) return observedCache;
  
  const response = await fetch('/mocks/incomes.json');
  if (!response.ok) throw new Error('Failed to fetch observed incomes');
  const data = await response.json();
  observedCache = data.observed;
  return observedCache;
}

export async function createPlannedIncome(income: Omit<PlannedIncome, 'id' | 'created_at' | 'updated_at'>): Promise<PlannedIncome> {
  const newIncome: PlannedIncome = {
    ...income,
    id: `plan_${Date.now()}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  
  if (!plannedCache) await getPlannedIncomes();
  plannedCache = [...(plannedCache || []), newIncome];
  
  await new Promise(resolve => setTimeout(resolve, 500));
  return newIncome;
}

export async function updatePlannedIncome(id: string, updates: Partial<PlannedIncome>): Promise<PlannedIncome> {
  if (!plannedCache) await getPlannedIncomes();
  
  const incomeIndex = plannedCache!.findIndex(i => i.id === id);
  if (incomeIndex === -1) throw new Error('Planned income not found');
  
  const updatedIncome = {
    ...plannedCache![incomeIndex],
    ...updates,
    updated_at: new Date().toISOString(),
  };
  
  plannedCache![incomeIndex] = updatedIncome;
  
  await new Promise(resolve => setTimeout(resolve, 500));
  return updatedIncome;
}

export async function deletePlannedIncome(id: string): Promise<void> {
  if (!plannedCache) await getPlannedIncomes();
  plannedCache = plannedCache!.filter(i => i.id !== id);
  await new Promise(resolve => setTimeout(resolve, 300));
}