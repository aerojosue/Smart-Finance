import type { SavingGoal, SurplusAllocation, AllocationSuggestion } from '../types/savings';

// Mock exchange rates for conversion to ARS
const MOCK_RATES_TO_ARS = {
  ARS: 1,
  USD: 1000, // 1 USD = 1000 ARS
  BRL: 200,  // 1 BRL = 200 ARS
  USDT: 1000, // 1 USDT = 1000 ARS
};

interface AllocationOptions {
  priorityWeights?: { high: number; medium: number; low: number };
  roundToMultiple?: number;
  maxAllocationPerGoal?: number;
}

export function calculateSurplusAllocation(
  surplusARS: number,
  goals: SavingGoal[],
  opts: AllocationOptions = {}
): AllocationSuggestion {
  const {
    priorityWeights = { high: 1, medium: 0.6, low: 0.3 },
    roundToMultiple = 100,
    maxAllocationPerGoal = 0.7 // Max 70% of surplus to one goal
  } = opts;

  // Filter active goals (not completed)
  const activeGoals = goals.filter(goal => {
    const current = parseFloat(goal.current_amount);
    const target = parseFloat(goal.target_amount);
    return current < target;
  });

  if (activeGoals.length === 0) {
    return {
      total_surplus_ars: surplusARS,
      allocations: [],
      remaining_ars: surplusARS
    };
  }

  // Calculate scores for each goal
  const scoredGoals = activeGoals.map(goal => {
    const current = parseFloat(goal.current_amount);
    const target = parseFloat(goal.target_amount);
    const rate = MOCK_RATES_TO_ARS[goal.base_currency as keyof typeof MOCK_RATES_TO_ARS] || 1;
    
    // Convert target and current to ARS for comparison
    const targetARS = target * rate;
    const currentARS = current * rate;
    const shortfallARS = targetARS - currentARS;
    
    // Priority weight
    const priorityWeight = priorityWeights[goal.priority];
    
    // Urgency based on due date
    let urgency = 0.5; // Default for goals without due date
    if (goal.due_date) {
      const today = new Date();
      const dueDate = new Date(goal.due_date);
      const daysUntilDue = Math.max(0, Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
      
      if (daysUntilDue <= 30) urgency = 1.0;
      else if (daysUntilDue <= 90) urgency = 0.8;
      else if (daysUntilDue <= 180) urgency = 0.6;
      else urgency = 0.3;
    }
    
    // Shortfall relative (how much is missing relative to target)
    const shortfallRel = Math.min(1, shortfallARS / targetARS);
    
    // Combined score
    const score = 0.4 * priorityWeight + 0.35 * urgency + 0.25 * shortfallRel;
    
    return {
      goal,
      score,
      shortfallARS,
      rate
    };
  });

  // Sort by score (highest first)
  scoredGoals.sort((a, b) => b.score - a.score);

  // Distribute surplus proportionally to scores
  const totalScore = scoredGoals.reduce((sum, g) => sum + g.score, 0);
  let remainingSurplus = surplusARS;
  const allocations: SurplusAllocation[] = [];

  for (const { goal, score, shortfallARS, rate } of scoredGoals) {
    if (remainingSurplus <= 0) break;
    
    // Calculate proportional allocation
    const proportionalAmount = (score / totalScore) * surplusARS;
    
    // Limit by shortfall and max allocation per goal
    const maxForThisGoal = Math.min(
      shortfallARS,
      surplusARS * maxAllocationPerGoal,
      proportionalAmount
    );
    
    // Round to multiple
    const roundedAmount = Math.floor(maxForThisGoal / roundToMultiple) * roundToMultiple;
    
    if (roundedAmount > 0 && roundedAmount <= remainingSurplus) {
      const amountInBase = roundedAmount / rate;
      
      allocations.push({
        goal_id: goal.id,
        goal_name: goal.name,
        amount_ars: roundedAmount,
        amount_in_base: parseFloat(amountInBase.toFixed(2)),
        base_currency: goal.base_currency,
        score: parseFloat(score.toFixed(3))
      });
      
      remainingSurplus -= roundedAmount;
    }
  }

  return {
    total_surplus_ars: surplusARS,
    allocations,
    remaining_ars: remainingSurplus
  };
}