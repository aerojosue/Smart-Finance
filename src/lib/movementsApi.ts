import type { Movement } from '../types/savings';

// In-memory cache for demo purposes
let movementsCache: Movement[] | null = null;

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
  
  await new Promise(resolve => setTimeout(resolve, 500));
  return newMovement;
}

export async function transferToGoal(
  fromAccountId: string,
  toGoalId: string,
  amount: string,
  currency: string,
  description: string
): Promise<Movement> {
  const movement = await createMovement({
    type: 'saving_contribution',
    date: new Date().toISOString().split('T')[0],
    amount,
    currency,
    from_account: fromAccountId,
    to_goal: toGoalId,
    description
  });
  
  return movement;
}