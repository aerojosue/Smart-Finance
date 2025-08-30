import type { SavingGoal, Movement } from '../types/savings';

// In-memory cache for demo purposes
let goalsCache: SavingGoal[] | null = null;
let movementsCache: Movement[] | null = null;

export async function getSavingGoals(): Promise<SavingGoal[]> {
  if (goalsCache) return goalsCache;
  
  const response = await fetch('/mocks/savings.json');
  if (!response.ok) throw new Error('Failed to fetch saving goals');
  const data = await response.json();
  goalsCache = data.goals;
  return goalsCache;
}

export async function createSavingGoal(goal: Omit<SavingGoal, 'id' | 'current_amount' | 'created_at' | 'updated_at'>): Promise<SavingGoal> {
  const newGoal: SavingGoal = {
    ...goal,
    id: `goal_${Date.now()}`,
    current_amount: '0.00',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  
  if (!goalsCache) await getSavingGoals();
  goalsCache = [...(goalsCache || []), newGoal];
  
  await new Promise(resolve => setTimeout(resolve, 500));
  return newGoal;
}

export async function updateSavingGoal(id: string, updates: Partial<SavingGoal>): Promise<SavingGoal> {
  if (!goalsCache) await getSavingGoals();
  
  const goalIndex = goalsCache!.findIndex(g => g.id === id);
  if (goalIndex === -1) throw new Error('Goal not found');
  
  const updatedGoal = {
    ...goalsCache![goalIndex],
    ...updates,
    updated_at: new Date().toISOString(),
  };
  
  goalsCache![goalIndex] = updatedGoal;
  
  await new Promise(resolve => setTimeout(resolve, 500));
  return updatedGoal;
}

export async function deleteSavingGoal(id: string): Promise<void> {
  if (!goalsCache) await getSavingGoals();
  goalsCache = goalsCache!.filter(g => g.id !== id);
  await new Promise(resolve => setTimeout(resolve, 300));
}

export async function getMovements(): Promise<Movement[]> {
  if (movementsCache) return movementsCache;
  
  try {
    const response = await fetch('/mocks/movements.json');
    if (!response.ok) throw new Error('Failed to fetch movements');
    const data = await response.json();
    movementsCache = data.movements;
    return movementsCache;
  } catch {
    movementsCache = [];
    return movementsCache;
  }
}

export async function createMovement(movement: Omit<Movement, 'id' | 'created_at'>): Promise<Movement> {
  const newMovement: Movement = {
    ...movement,
    id: `mov_${Date.now()}`,
    created_at: new Date().toISOString(),
  };
  
  if (!movementsCache) await getMovements();
  movementsCache = [...(movementsCache || []), newMovement];
  
  // Update goal balance if it's a saving contribution
  if (movement.type === 'saving_contribution' && movement.to_goal) {
    if (!goalsCache) await getSavingGoals();
    const goalIndex = goalsCache!.findIndex(g => g.id === movement.to_goal);
    if (goalIndex !== -1) {
      const currentAmount = parseFloat(goalsCache![goalIndex].current_amount);
      const contributionAmount = parseFloat(movement.amount);
      goalsCache![goalIndex].current_amount = (currentAmount + contributionAmount).toFixed(2);
      goalsCache![goalIndex].updated_at = new Date().toISOString();
    }
  }
  
  await new Promise(resolve => setTimeout(resolve, 500));
  return newMovement;
}