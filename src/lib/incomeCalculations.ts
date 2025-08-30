import type { 
  PlannedIncome, 
  ObservedIncome, 
  ExpandedPlannedIncome, 
  IncomeMonthlyAgg, 
  IncomeKpis, 
  IncomeForecast,
  IncomeComparison 
} from '../types/incomes';

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
    // If weekend, move to next Monday
    if (result.getDay() === 6) { // Saturday
      result.setDate(result.getDate() + 2);
    } else if (result.getDay() === 0) { // Sunday
      result.setDate(result.getDate() + 1);
    }
  } else {
    // If weekend, move to previous Friday
    if (result.getDay() === 6) { // Saturday
      result.setDate(result.getDate() - 1);
    } else if (result.getDay() === 0) { // Sunday
      result.setDate(result.getDate() - 2);
    }
  }
  
  return result;
}

function getLastBusinessDayOfMonth(year: number, month: number): Date {
  // Get last day of month
  const lastDay = new Date(year, month, 0);
  return getBusinessDay(lastDay, 'previous');
}

function expandMonthly(
  planned: PlannedIncome, 
  fromDate: Date, 
  toDate: Date
): ExpandedPlannedIncome[] {
  if (!planned.recurrence || planned.recurrence.type !== 'monthly') {
    return [];
  }

  const expanded: ExpandedPlannedIncome[] = [];
  const current = new Date(fromDate);
  current.setDate(1); // Start from first day of month

  while (current <= toDate) {
    let targetDate: Date;
    
    switch (planned.recurrence.day_rule) {
      case 'last_business_day':
        targetDate = getLastBusinessDayOfMonth(current.getFullYear(), current.getMonth() + 1);
        break;
      case 'next_business_day':
        targetDate = new Date(current.getFullYear(), current.getMonth(), planned.recurrence.anchor_day || 1);
        targetDate = getBusinessDay(targetDate, 'next');
        break;
      case 'fixed_day':
        targetDate = new Date(current.getFullYear(), current.getMonth(), planned.recurrence.anchor_day || 1);
        break;
      default:
        targetDate = new Date(current.getFullYear(), current.getMonth(), 1);
    }

    if (targetDate >= fromDate && targetDate <= toDate) {
      // Generate scenarios if variable band exists
      if (planned.variable_band) {
        const min = parseFloat(planned.variable_band.min);
        const max = parseFloat(planned.variable_band.max);
        const avg = (min + max) / 2;

        ['conservative', 'base', 'optimistic'].forEach(scenario => {
          const amount = scenario === 'conservative' ? min : scenario === 'optimistic' ? max : avg;
          
          expanded.push({
            planned_id: planned.id,
            source: planned.source,
            category: planned.category,
            currency: planned.currency,
            date: targetDate.toISOString().split('T')[0],
            amount_ars: toARS(amount, planned.currency),
            amount_original: amount,
            confidence: planned.confidence,
            scenario: scenario as any,
            is_pending: targetDate < new Date() // Past due
          });
        });
      } else if (planned.amount) {
        const amount = parseFloat(planned.amount);
        
        expanded.push({
          planned_id: planned.id,
          source: planned.source,
          category: planned.category,
          currency: planned.currency,
          date: targetDate.toISOString().split('T')[0],
          amount_ars: toARS(amount, planned.currency),
          amount_original: amount,
          confidence: planned.confidence,
          scenario: 'base',
          is_pending: targetDate < new Date()
        });
      }
    }

    // Move to next month
    current.setMonth(current.getMonth() + 1);
  }

  return expanded;
}

export function expandPlanned(
  planned: PlannedIncome[], 
  fromISO: string, 
  toISO: string
): ExpandedPlannedIncome[] {
  const fromDate = new Date(fromISO);
  const toDate = new Date(toISO);
  
  return planned
    .filter(p => p.is_active)
    .flatMap(p => expandMonthly(p, fromDate, toDate));
}

export function monthlyAggregate(
  observed: ObservedIncome[], 
  plannedExpanded: ExpandedPlannedIncome[]
): IncomeMonthlyAgg[] {
  const months = new Map<string, IncomeMonthlyAgg>();

  // Process observed incomes
  observed.forEach(obs => {
    const month = obs.date.substring(0, 7); // YYYY-MM
    const amountARS = toARS(parseFloat(obs.amount), obs.currency);
    
    if (!months.has(month)) {
      months.set(month, {
        month,
        planned_ars: 0,
        observed_ars: 0,
        variance_ars: 0,
        variance_pct: 0,
        by_category: []
      });
    }
    
    const monthData = months.get(month)!;
    monthData.observed_ars += amountARS;
  });

  // Process planned incomes (base scenario only for comparison)
  plannedExpanded
    .filter(p => p.scenario === 'base')
    .forEach(planned => {
      const month = planned.date.substring(0, 7);
      
      if (!months.has(month)) {
        months.set(month, {
          month,
          planned_ars: 0,
          observed_ars: 0,
          variance_ars: 0,
          variance_pct: 0,
          by_category: []
        });
      }
      
      const monthData = months.get(month)!;
      monthData.planned_ars += planned.amount_ars;
    });

  // Calculate variances
  months.forEach(monthData => {
    monthData.variance_ars = monthData.observed_ars - monthData.planned_ars;
    monthData.variance_pct = monthData.planned_ars > 0 
      ? (monthData.variance_ars / monthData.planned_ars) * 100 
      : 0;
  });

  return Array.from(months.values()).sort((a, b) => a.month.localeCompare(b.month));
}

export function computeKpis(aggregates: IncomeMonthlyAgg[]): IncomeKpis {
  const currentMonth = new Date().toISOString().substring(0, 7);
  const previousMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 7);
  
  const current = aggregates.find(a => a.month === currentMonth);
  const previous = aggregates.find(a => a.month === previousMonth);
  
  const currentMonthARS = current?.observed_ars || 0;
  const previousMonthARS = previous?.observed_ars || 0;
  
  const momPct = previousMonthARS > 0 
    ? ((currentMonthARS - previousMonthARS) / previousMonthARS) * 100 
    : 0;

  // Calculate YTD (year to date)
  const currentYear = new Date().getFullYear().toString();
  const ytdARS = aggregates
    .filter(a => a.month.startsWith(currentYear))
    .reduce((sum, a) => sum + a.observed_ars, 0);

  // Calculate averages
  const recent12 = aggregates.slice(-12);
  const recent6 = aggregates.slice(-6);
  const recent3 = aggregates.slice(-3);

  const avg12m = recent12.length > 0 
    ? recent12.reduce((sum, a) => sum + a.observed_ars, 0) / recent12.length 
    : 0;
  const avg6m = recent6.length > 0 
    ? recent6.reduce((sum, a) => sum + a.observed_ars, 0) / recent6.length 
    : 0;
  const avg3m = recent3.length > 0 
    ? recent3.reduce((sum, a) => sum + a.observed_ars, 0) / recent3.length 
    : 0;

  return {
    current_month_ars: currentMonthARS,
    previous_month_ars: previousMonthARS,
    mom_pct: momPct,
    ytd_ars: ytdARS,
    avg_3m_ars: avg3m,
    avg_6m_ars: avg6m,
    avg_12m_ars: avg12m,
  };
}

export function forecastSimple(aggregates: IncomeMonthlyAgg[], months: number = 3): IncomeForecast {
  // Calculate moving averages for base forecast
  const recent6 = aggregates.slice(-6);
  const recent3 = aggregates.slice(-3);
  
  const base6m = recent6.length > 0 
    ? recent6.reduce((sum, a) => sum + a.observed_ars, 0) / recent6.length 
    : 0;
  const base3m = recent3.length > 0 
    ? recent3.reduce((sum, a) => sum + a.observed_ars, 0) / recent3.length 
    : 0;

  // Use average of 3m and 6m for base
  const baseMonthly = (base3m + base6m) / 2;
  
  const forecastMonths = [];
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() + 1); // Start from next month
  
  for (let i = 0; i < months; i++) {
    const month = new Date(startDate);
    month.setMonth(month.getMonth() + i);
    
    forecastMonths.push({
      month: month.toISOString().substring(0, 7),
      conservative_ars: baseMonthly * 0.85, // -15%
      base_ars: baseMonthly,
      optimistic_ars: baseMonthly * 1.15, // +15%
    });
  }

  return { months: forecastMonths };
}

export function generateComparison(
  observed: ObservedIncome[], 
  plannedExpanded: ExpandedPlannedIncome[],
  month: string
): IncomeComparison[] {
  const monthObserved = observed.filter(o => o.date.startsWith(month));
  const monthPlanned = plannedExpanded.filter(p => 
    p.date.startsWith(month) && p.scenario === 'base'
  );

  // Group by category and source
  const groups = new Map<string, {
    category: string;
    source: string;
    planned_ars: number;
    observed_ars: number;
  }>();

  monthPlanned.forEach(p => {
    const key = `${p.category}_${p.source}`;
    if (!groups.has(key)) {
      groups.set(key, {
        category: p.category,
        source: p.source,
        planned_ars: 0,
        observed_ars: 0,
      });
    }
    groups.get(key)!.planned_ars += p.amount_ars;
  });

  monthObserved.forEach(o => {
    const key = `${o.category}_${o.source}`;
    if (!groups.has(key)) {
      groups.set(key, {
        category: o.category,
        source: o.source,
        planned_ars: 0,
        observed_ars: 0,
      });
    }
    groups.get(key)!.observed_ars += toARS(parseFloat(o.amount), o.currency);
  });

  return Array.from(groups.values()).map(group => {
    const variance_ars = group.observed_ars - group.planned_ars;
    const variance_pct = group.planned_ars > 0 
      ? (variance_ars / group.planned_ars) * 100 
      : 0;

    let status: 'good' | 'warning' | 'bad' = 'good';
    if (variance_pct < -10) status = 'bad';
    else if (Math.abs(variance_pct) > 10) status = 'warning';

    return {
      category: group.category,
      source: group.source,
      planned_ars: group.planned_ars,
      observed_ars: group.observed_ars,
      variance_ars,
      variance_pct,
      status,
    };
  });
}