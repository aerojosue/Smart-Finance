import type { Card, CardCycle, InstallmentPreview } from '../types/cards';

export async function getCards(): Promise<Card[]> {
  const response = await fetch('/mocks/cards.json');
  if (!response.ok) throw new Error('Failed to fetch cards');
  const data = await response.json();
  return data.cards;
}

export async function createCard(card: Omit<Card, 'id' | 'created_at' | 'updated_at' | 'business_day_policy' | 'fx_settlement_policy'>): Promise<Card> {
  // Mock implementation - in real app this would call API
  const newCard: Card = {
    ...card,
    id: `card_${Date.now()}`,
    business_day_policy: 'next_business_day',
    fx_settlement_policy: 'at_payment',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return newCard;
}

export async function updateCard(id: string, updates: Partial<Card>): Promise<Card> {
  // Mock implementation
  const updatedCard: Card = {
    id,
    name: 'Updated Card',
    brand: 'Visa',
    type: 'credit',
    country: 'AR',
    multimoneda: false,
    currencies: ['ARS'],
    color: '#3b82f6',
    business_day_policy: 'next_business_day',
    fx_settlement_policy: 'at_payment',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...updates,
  };
  
  await new Promise(resolve => setTimeout(resolve, 500));
  return updatedCard;
}

export async function deleteCard(id: string): Promise<void> {
  // Mock implementation
  await new Promise(resolve => setTimeout(resolve, 300));
}

export async function getCardCycle(cardId: string): Promise<CardCycle> {
  // Mock implementation - calculate current cycle dates
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  // Mock cycle data
  return {
    current_cutoff: '2025-09-20',
    current_payment: '2025-09-29',
    next_cutoff: '2025-10-20',
    next_payment: '2025-10-29',
    cycle_consumption: { BRL: '1200.00' },
    future_installments: { BRL: '600.00' }
  };
}

export async function previewInstallments(
  cardId: string, 
  amount: string, 
  installments: number, 
  currency: string
): Promise<InstallmentPreview[]> {
  // Mock implementation - calculate installment dates
  const card = await getCards().then(cards => cards.find(c => c.id === cardId));
  if (!card || card.type !== 'credit') return [];
  
  const installmentAmount = parseFloat(amount) / installments;
  const previews: InstallmentPreview[] = [];
  
  // Start from next payment date
  let baseDate = new Date('2025-09-29');
  
  for (let i = 1; i <= installments; i++) {
    // Add months for each installment
    const dueDate = new Date(baseDate);
    dueDate.setMonth(dueDate.getMonth() + (i - 1));
    
    // Adjust for weekends (simple logic: if Saturday, move to Monday)
    let isAdjusted = false;
    if (dueDate.getDay() === 6) { // Saturday
      dueDate.setDate(dueDate.getDate() + 2);
      isAdjusted = true;
    } else if (dueDate.getDay() === 0) { // Sunday
      dueDate.setDate(dueDate.getDate() + 1);
      isAdjusted = true;
    }
    
    previews.push({
      installment_number: i,
      due_date: dueDate.toISOString().split('T')[0],
      amount: installmentAmount.toFixed(2),
      is_weekend_adjusted: isAdjusted
    });
  }
  
  return previews;
}