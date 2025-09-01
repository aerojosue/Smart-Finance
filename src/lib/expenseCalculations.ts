import type { 
  PlannedExpense, 
  ObservedExpense, 
  ExpenseInstallment,
  ExpenseKpis,
  ExpenseComparison 
} from '../types/expenses';
import type { Card } from '../types/cards';

// Mock exchange rates to ARS
const MOCK_RATES_TO_ARS = {
  ARS: 1,
  USD: 1000, // 1 USD = 1000 ARS
  BRL: 200,  // 1 BRL = 200 ARS
  USDT: 1000, // 1 USDT = 1000 ARS
  EUR: 1100, // 1 EUR = 1100 ARS
};

function toARS(amount: number, currency: string): number {
  const rate = MOCK_RATES_TO_ARS[currency as keyof typeof MOCK_RATES_TO_ARS] || 1;
  return amount * rate;
}

function getBusinessDay(date: Date, rule: 'next' | 'previous'): Date {
  const result = new Date(date);
  
  if (rule === 'next') {
    if (result.getDay() === 6) { // Saturday
      result.setDate(result.getDate() + 2);
    } else if (result.getDay() === 0) { // Sunday
      result.setDate(result.getDate() + 1);
    }
  } else {
    if (result.getDay() === 6) { // Saturday
      result.setDate(result.getDate() - 1);
    } else if (result.getDay() === 0) { // Sunday
      result.setDate(result.getDate() - 2);
    }
  }
  
  return result;
}

export function generateInstallments(
  plannedExpense: PlannedExpense,
  card?: Card
): ExpenseInstallment[] {
  if (plannedExpense.kind !== 'credit' || !plannedExpense.n_installments) {
    return [];
  }

  const installments: ExpenseInstallment[] = [];
  const totalAmount = parseFloat(plannedExpense.amount);
  const installmentAmount = totalAmount / plannedExpense.n_installments;
  
  // Use card payment day or default to 10th
  const paymentDay = card?.payment_day || 10;
  
  // Start from expense date, then calculate payment dates
  const baseDate = new Date(plannedExpense.date);
  
  for (let i = 1; i <= plannedExpense.n_installments; i++) {
    // Calculate due date for this installment
    const dueDate = new Date(baseDate);
    dueDate.setMonth(dueDate.getMonth() + i);
    dueDate.setDate(paymentDay);
    
    // Adjust for business days
    const adjustedDueDate = getBusinessDay(dueDate, 'next');
    
    // Calculate status based on due date
    const today = new Date();
    const daysUntilDue = Math.ceil((adjustedDueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    let status: ExpenseInstallment['status'] = 'upcoming';
    if (daysUntilDue <= 0) status = 'due';
    else if (daysUntilDue <= 3) status = 'urgent';
    else if (daysUntilDue <= 7) status = 'warning';
    
    // Mock deficit calculation (in real app would check liquidity)
    const hasDeficit = Math.random() > 0.7; // 30% chance of deficit
    const deficitAmount = hasDeficit ? (installmentAmount * 0.2).toFixed(2) : null;
    
    installments.push({
      id: `inst_${plannedExpense.id}_${i}`,
      planned_expense_id: plannedExpense.id,
      installment_number: i,
      total_installments: plannedExpense.n_installments,
      due_date: adjustedDueDate.toISOString().split('T')[0],
      status,
      currency: plannedExpense.currency,
      amount_base: installmentAmount.toFixed(2),
      amount_equiv_est_ars: plannedExpense.amount_equiv_est_ars 
        ? (parseFloat(plannedExpense.amount_equiv_est_ars) / plannedExpense.n_installments).toFixed(2)
        : undefined,
      deficit: deficitAmount ? {
        currency: plannedExpense.currency,
        amount: deficitAmount
      } : undefined,
      suggestions: deficitAmount ? [
        {
          from_currency: 'USDT',
          amount_from_est: (parseFloat(deficitAmount) / 5.2).toFixed(2),
          est_rate: 'USDT→' + plannedExpense.currency + ' 5.20',
          est_spread_pct: '-0.22',
          platform_suggested: 'Binance P2P'
        },
        {
          from_currency: 'ARS',
          amount_from_est: (parseFloat(deficitAmount) * 200).toFixed(2),
          est_rate: 'ARS→' + plannedExpense.currency + ' 0.005',
          platform_suggested: 'Manual'
        }
      ] : undefined
    });
  }
  
  return installments;
}

export function computeExpenseKpis(
  observed: ObservedExpense[]
): ExpenseKpis {
  const currentMonth = new Date().toISOString().substring(0, 7);
  const previousMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 7);
  
  const currentMonthExpenses = observed.filter(e => e.date.startsWith(currentMonth));
  const previousMonthExpenses = observed.filter(e => e.date.startsWith(previousMonth));
  
  const currentMonthARS = currentMonthExpenses.reduce((sum, e) => sum + parseFloat(e.amount_ars), 0);
  const previousMonthARS = previousMonthExpenses.reduce((sum, e) => sum + parseFloat(e.amount_ars), 0);
  
  const momPct = previousMonthARS > 0 
    ? ((currentMonthARS - previousMonthARS) / previousMonthARS) * 100 
    : 0;

  // Calculate top categories
  const categoryTotals = currentMonthExpenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + parseFloat(expense.amount_ars);
    return acc;
  }, {} as Record<string, number>);

  const topCategories = Object.entries(categoryTotals)
    .map(([category, amount]) => ({
      category,
      amount_ars: amount,
      percentage: currentMonthARS > 0 ? (amount / currentMonthARS) * 100 : 0
    }))
    .sort((a, b) => b.amount_ars - a.amount_ars)
    .slice(0, 3);

  // Mock credit vs debit calculation
  const creditPct = 65; // Mock: 65% credit, 35% debit
  const debitPct = 35;

  return {
    current_month_ars: currentMonthARS,
    previous_month_ars: previousMonthARS,
    mom_pct: momPct,
    top_categories: topCategories,
    credit_vs_debit: {
      credit_pct: creditPct,
      debit_pct: debitPct
    }
  };
}

export function generateExpenseComparison(
  planned: PlannedExpense[],
  observed: ObservedExpense[],
  month: string
): ExpenseComparison[] {
  const monthPlanned = planned.filter(p => p.date.startsWith(month) && p.is_active);
  const monthObserved = observed.filter(o => o.date.startsWith(month));

  // Group by category
  const categories = new Map<string, {
    planned_ars: number;
    observed_ars: number;
  }>();

  monthPlanned.forEach(p => {
    const category = p.category;
    const amountARS = p.amount_equiv_est_ars 
      ? parseFloat(p.amount_equiv_est_ars)
      : toARS(parseFloat(p.amount), p.currency);
    
    if (!categories.has(category)) {
      categories.set(category, { planned_ars: 0, observed_ars: 0 });
    }
    categories.get(category)!.planned_ars += amountARS;
  });

  monthObserved.forEach(o => {
    const category = o.category;
    const amountARS = parseFloat(o.amount_ars);
    
    if (!categories.has(category)) {
      categories.set(category, { planned_ars: 0, observed_ars: 0 });
    }
    categories.get(category)!.observed_ars += amountARS;
  });

  return Array.from(categories.entries()).map(([category, data]) => {
    const variance_ars = data.observed_ars - data.planned_ars;
    const variance_pct = data.planned_ars > 0 
      ? (variance_ars / data.planned_ars) * 100 
      : 0;

    let status: 'good' | 'warning' | 'bad' = 'good';
    if (variance_pct > 10) status = 'bad'; // Spending more than planned
    else if (Math.abs(variance_pct) > 10) status = 'warning';

    return {
      category,
      planned_ars: data.planned_ars,
      observed_ars: data.observed_ars,
      variance_ars,
      variance_pct,
      status,
    };
  });
}