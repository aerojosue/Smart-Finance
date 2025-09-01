import React, { useState, useEffect } from 'react';
import { X, ShoppingCart, CreditCard, Wallet, Calendar, Info } from 'lucide-react';
import { getCards } from '../../lib/cardsApi';
import { CategorySelector } from '../categories/CategorySelector';
import type { PlannedExpense, ExpenseFormData } from '../../types/expenses';
import type { Card } from '../../types/cards';

type Props = {
  open: boolean;
  initial?: PlannedExpense | null;
  onSubmit: (data: ExpenseFormData) => void;
  onClose: () => void;
};

const kindOptions = [
  { value: 'debit', label: 'Débito', description: 'Pago inmediato' },
  { value: 'credit', label: 'Crédito', description: 'Pago en cuotas' },
];

const availableCurrencies = ['ARS', 'BRL', 'USD', 'USDT', 'EUR'];

// Mock exchange rates to ARS
const MOCK_RATES_TO_ARS = {
  ARS: 1,
  USD: 1000,
  BRL: 200,
  USDT: 1000,
  EUR: 1100,
};

export const ExpenseFormModal: React.FC<Props> = ({ open, initial, onSubmit, onClose }) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [formData, setFormData] = useState<ExpenseFormData>({
    kind: 'debit',
    card_id: '',
    category: '',
    currency: 'ARS',
    amount: '',
    concept: '',
    date: new Date().toISOString().split('T')[0],
    n_installments: 1,
    is_active: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [preview, setPreview] = useState<{
    amount_equiv_ars: number;
    fx_rate: number;
    installment_amount: number;
  } | null>(null);

  useEffect(() => {
    if (open) {
      loadCards();
    }
  }, [open]);

  useEffect(() => {
    if (initial) {
      setFormData({
        kind: initial.kind,
        card_id: initial.card_id || '',
        category: initial.category,
        currency: initial.currency,
        amount: initial.amount,
        concept: initial.concept || '',
        date: initial.date,
        n_installments: initial.n_installments || 1,
        is_active: initial.is_active,
      });
    } else {
      setFormData({
        kind: 'debit',
        card_id: '',
        category: '',
        currency: 'ARS',
        amount: '',
        concept: '',
        date: new Date().toISOString().split('T')[0],
        n_installments: 1,
        is_active: true,
      });
    }
    setErrors({});
  }, [initial, open]);

  useEffect(() => {
    // Calculate preview when amount or currency changes
    if (formData.amount && parseFloat(formData.amount) > 0) {
      const amount = parseFloat(formData.amount);
      const rate = MOCK_RATES_TO_ARS[formData.currency as keyof typeof MOCK_RATES_TO_ARS] || 1;
      const amountARS = amount * rate;
      const installmentAmount = formData.kind === 'credit' ? amount / formData.n_installments : amount;
      
      setPreview({
        amount_equiv_ars: amountARS,
        fx_rate: rate,
        installment_amount
      });
    } else {
      setPreview(null);
    }
  }, [formData.amount, formData.currency, formData.n_installments, formData.kind]);

  const loadCards = async () => {
    try {
      const data = await getCards();
      setCards(data);
      if (data.length > 0 && formData.kind === 'credit' && !formData.card_id) {
        setFormData(prev => ({ ...prev, card_id: data[0].id }));
      }
    } catch (error) {
      console.error('Error loading cards:', error);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.category) {
      newErrors.category = 'Selecciona una categoría';
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'El monto debe ser mayor a 0';
    }

    if (formData.kind === 'credit') {
      if (!formData.card_id) {
        newErrors.card_id = 'Selecciona una tarjeta de crédito';
      }
      if (!formData.n_installments || formData.n_installments < 1 || formData.n_installments > 24) {
        newErrors.n_installments = 'Las cuotas deben estar entre 1 y 24';
      }
    }

    if (!formData.date) {
      newErrors.date = 'La fecha es obligatoria';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleKindChange = (kind: 'debit' | 'credit') => {
    setFormData(prev => ({
      ...prev,
      kind,
      card_id: kind === 'credit' ? (cards[0]?.id || '') : '',
      n_installments: kind === 'credit' ? prev.n_installments : 1
    }));
  };

  const availableCards = cards.filter(card => {
    // Solo tarjetas de crédito que soporten la moneda seleccionada
    return card.type === 'credit' && card.currencies.includes(formData.currency);
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            {initial ? 'Editar gasto planificado' : 'Nuevo gasto planificado'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Tipo de pago */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tipo de pago
            </label>
            <div className="grid grid-cols-2 gap-2">
              {kindOptions.map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleKindChange(option.value as any)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    formData.kind === option.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {option.value === 'debit' ? <Wallet className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />}
                    <span className="font-medium">{option.label}</span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{option.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Tarjeta (solo para crédito) */}
          {formData.kind === 'credit' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tarjeta de crédito *
              </label>
              <select
                value={formData.card_id}
                onChange={(e) => setFormData(prev => ({ ...prev, card_id: e.target.value }))}
                className={`select-field w-full ${errors.card_id ? 'border-red-500' : ''}`}
              >
                <option value="">Seleccionar tarjeta...</option>
                {availableCards.map(card => (
                  <option key={card.id} value={card.id}>
                    {card.name} ({card.currencies.join(', ')})
                  </option>
                ))}
              </select>
              {errors.card_id && <p className="text-red-500 text-xs mt-1">{errors.card_id}</p>}
              {formData.currency && availableCards.length === 0 && (
                <p className="text-amber-600 text-xs mt-1">
                  No hay tarjetas de crédito disponibles para {formData.currency}
                </p>
              )}
            </div>
          )}

          {/* Información del gasto */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Categoría
              </label>
              <CategorySelector
                type="expense"
                value={formData.category}
                onChange={(categoryId) => setFormData(prev => ({ ...prev, category: categoryId }))}
                placeholder="Seleccionar categoría..."
              />
              {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Moneda
              </label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                className="select-field w-full"
              >
                {availableCurrencies.map(currency => (
                  <option key={currency} value={currency}>{currency}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Monto total *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                className={`input-field w-full ${errors.amount ? 'border-red-500' : ''}`}
                placeholder="0.00"
              />
              {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Fecha
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className={`input-field w-full ${errors.date ? 'border-red-500' : ''}`}
              />
              {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
            </div>
          </div>

          {/* Cuotas (solo para crédito) */}
          {formData.kind === 'credit' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Número de cuotas *
              </label>
              <input
                type="number"
                min="1"
                max="24"
                value={formData.n_installments}
                onChange={(e) => setFormData(prev => ({ ...prev, n_installments: parseInt(e.target.value) || 1 }))}
                className={`input-field w-full ${errors.n_installments ? 'border-red-500' : ''}`}
                placeholder="1"
              />
              {errors.n_installments && <p className="text-red-500 text-xs mt-1">{errors.n_installments}</p>}
            </div>
          )}

          {/* Concepto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Concepto (opcional)
            </label>
            <input
              type="text"
              value={formData.concept}
              onChange={(e) => setFormData(prev => ({ ...prev, concept: e.target.value }))}
              className="input-field w-full"
              placeholder="Descripción del gasto..."
            />
          </div>

          {/* Estado */}
          <div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Activo
                </span>
              </label>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Los gastos inactivos no aparecen en proyecciones
            </p>
          </div>

          {/* Vista previa */}
          {preview && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Vista previa</h3>
              <div className="space-y-2 text-sm">
                {formData.currency !== 'ARS' && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Equivalente ARS:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      ARS {new Intl.NumberFormat('es-AR').format(Math.round(preview.amount_equiv_ars))}
                    </span>
                  </div>
                )}
                {formData.kind === 'credit' && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Monto por cuota:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {formData.currency} {new Intl.NumberFormat('es-AR').format(preview.installment_amount)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Información adicional */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <div className="font-medium mb-1">Configuración automática:</div>
                <ul className="space-y-1 text-xs">
                  <li>• Las fechas de vencimiento se ajustarán a días hábiles</li>
                  <li>• Los montos se convertirán a ARS para KPIs</li>
                  <li>• Para crédito: se generará cronograma de cuotas automáticamente</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary flex-1"
            >
              {initial ? 'Actualizar gasto' : 'Crear gasto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};