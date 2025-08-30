import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, AlertTriangle } from 'lucide-react';
import type { Account, AccountFormData } from '../../types/accounts';

type Props = {
  open: boolean;
  initial?: Account | null;
  onSubmit: (data: AccountFormData) => void;
  onClose: () => void;
};

const accountTypes = [
  { value: 'cash', label: 'Efectivo' },
  { value: 'bank', label: 'Banco' },
  { value: 'ewallet', label: 'E-wallet' },
  { value: 'crypto', label: 'Crypto' },
];

const liquidityTiers = [
  { value: 'operational', label: 'Operacional', description: 'Para gastos diarios' },
  { value: 'buffer', label: 'Buffer', description: 'Para emergencias menores' },
  { value: 'savings', label: 'Ahorros', description: 'Para objetivos a mediano plazo' },
  { value: 'untouchable', label: 'Intocable', description: 'Fondo de emergencia' },
];

const availableCurrencies = ['ARS', 'BRL', 'USD', 'USDT', 'EUR'];
const predefinedColors = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', 
  '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'
];

export const AccountFormModal: React.FC<Props> = ({ open, initial, onSubmit, onClose }) => {
  const [formData, setFormData] = useState<AccountFormData>({
    name: '',
    type: 'bank',
    country: 'AR',
    supported_currencies: ['ARS'],
    initial_balances: { ARS: '0.00' },
    color: '#3b82f6',
    liquidity_tier: 'operational',
    allow_auto_suggest: true,
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initial) {
      setFormData({
        name: initial.name,
        type: initial.type,
        country: initial.country,
        supported_currencies: [...initial.supported_currencies],
        initial_balances: { ...initial.initial_balances },
        color: initial.color,
        liquidity_tier: initial.liquidity_tier,
        allow_auto_suggest: initial.allow_auto_suggest,
        notes: initial.notes || '',
      });
    } else {
      setFormData({
        name: '',
        type: 'bank',
        country: 'AR',
        supported_currencies: ['ARS'],
        initial_balances: { ARS: '0.00' },
        color: '#3b82f6',
        liquidity_tier: 'operational',
        allow_auto_suggest: true,
        notes: '',
      });
    }
    setErrors({});
  }, [initial, open]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    }

    if (formData.supported_currencies.length === 0) {
      newErrors.currencies = 'Debe seleccionar al menos una moneda';
    }

    // Validar que todas las monedas en initial_balances estén en supported_currencies
    const balanceCurrencies = Object.keys(formData.initial_balances);
    const unsupportedBalances = balanceCurrencies.filter(
      currency => !formData.supported_currencies.includes(currency)
    );
    
    if (unsupportedBalances.length > 0) {
      newErrors.balances = `Las monedas ${unsupportedBalances.join(', ')} no están en las monedas soportadas`;
    }

    // Validar que los montos sean números válidos
    for (const [currency, amount] of Object.entries(formData.initial_balances)) {
      if (isNaN(parseFloat(amount)) || parseFloat(amount) < 0) {
        newErrors[`balance_${currency}`] = 'Monto inválido';
      }
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

  const addCurrency = (currency: string) => {
    if (!formData.supported_currencies.includes(currency)) {
      setFormData(prev => ({
        ...prev,
        supported_currencies: [...prev.supported_currencies, currency],
        initial_balances: { ...prev.initial_balances, [currency]: '0.00' }
      }));
    }
  };

  const removeCurrency = (currency: string) => {
    if (formData.supported_currencies.length > 1) {
      const newBalances = { ...formData.initial_balances };
      delete newBalances[currency];
      
      setFormData(prev => ({
        ...prev,
        supported_currencies: prev.supported_currencies.filter(c => c !== currency),
        initial_balances: newBalances
      }));
    }
  };

  const updateBalance = (currency: string, amount: string) => {
    setFormData(prev => ({
      ...prev,
      initial_balances: { ...prev.initial_balances, [currency]: amount }
    }));
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {initial ? 'Editar cuenta' : 'Nueva cuenta'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nombre *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className={`input-field w-full ${errors.name ? 'border-red-500' : ''}`}
                placeholder="Ej: Banco Galicia ARS"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tipo
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                className="select-field w-full"
              >
                {accountTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                País
              </label>
              <select
                value={formData.country}
                onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                className="select-field w-full"
              >
                <option value="AR">Argentina</option>
                <option value="BR">Brasil</option>
                <option value="US">Estados Unidos</option>
                <option value="UY">Uruguay</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Color
              </label>
              <div className="flex gap-2">
                {predefinedColors.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, color }))}
                    className={`w-8 h-8 rounded-lg border-2 transition-all ${
                      formData.color === color 
                        ? 'border-gray-400 scale-110' 
                        : 'border-gray-200 dark:border-gray-600'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Monedas soportadas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Monedas soportadas *
            </label>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {formData.supported_currencies.map(currency => (
                  <div key={currency} className="flex items-center gap-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full">
                    <span className="text-sm">{currency}</span>
                    {formData.supported_currencies.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeCurrency(currency)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="flex flex-wrap gap-2">
                {availableCurrencies
                  .filter(currency => !formData.supported_currencies.includes(currency))
                  .map(currency => (
                    <button
                      key={currency}
                      type="button"
                      onClick={() => addCurrency(currency)}
                      className="flex items-center gap-1 text-sm px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      {currency}
                    </button>
                  ))}
              </div>
            </div>
            {errors.currencies && <p className="text-red-500 text-xs mt-1">{errors.currencies}</p>}
          </div>

          {/* Saldos iniciales */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Saldos iniciales
            </label>
            <div className="space-y-2">
              {formData.supported_currencies.map(currency => (
                <div key={currency} className="flex items-center gap-3">
                  <span className="w-12 text-sm font-medium text-gray-700 dark:text-gray-300">
                    {currency}
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.initial_balances[currency] || '0.00'}
                    onChange={(e) => updateBalance(currency, e.target.value)}
                    className={`input-field flex-1 ${errors[`balance_${currency}`] ? 'border-red-500' : ''}`}
                    placeholder="0.00"
                  />
                  {errors[`balance_${currency}`] && (
                    <p className="text-red-500 text-xs">{errors[`balance_${currency}`]}</p>
                  )}
                </div>
              ))}
            </div>
            {errors.balances && <p className="text-red-500 text-xs mt-1">{errors.balances}</p>}
          </div>

          {/* Configuración de liquidez */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nivel de liquidez
              </label>
              <select
                value={formData.liquidity_tier}
                onChange={(e) => setFormData(prev => ({ ...prev, liquidity_tier: e.target.value as any }))}
                className="select-field w-full"
              >
                {liquidityTiers.map(tier => (
                  <option key={tier.value} value={tier.value}>
                    {tier.label} - {tier.description}
                  </option>
                ))}
              </select>
              {formData.liquidity_tier === 'untouchable' && (
                <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 mt-2">
                  <AlertTriangle className="w-3 h-3" />
                  Esta cuenta no se sugerirá para cobertura de déficits
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Auto-sugerencia
              </label>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.allow_auto_suggest}
                    onChange={(e) => setFormData(prev => ({ ...prev, allow_auto_suggest: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Permitir sugerencias automáticas
                  </span>
                </label>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Si está habilitado, esta cuenta aparecerá en sugerencias de cobertura
              </p>
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notas (opcional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="input-field w-full h-20 resize-none"
              placeholder="Información adicional sobre esta cuenta..."
            />
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
              {initial ? 'Actualizar cuenta' : 'Crear cuenta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};