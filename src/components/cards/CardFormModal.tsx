import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, AlertTriangle, Info } from 'lucide-react';
import type { Card, CardFormData } from '../../types/cards';

type Props = {
  open: boolean;
  initial?: Card | null;
  onSubmit: (data: CardFormData) => void;
  onClose: () => void;
};

const cardBrands = [
  { value: 'Visa', label: 'Visa' },
  { value: 'Mastercard', label: 'Mastercard' },
  { value: 'Amex', label: 'American Express' },
  { value: 'Other', label: 'Otra' },
];

const cardTypes = [
  { value: 'credit', label: 'Crédito' },
  { value: 'debit', label: 'Débito' },
];

const availableCurrencies = ['ARS', 'BRL', 'USD', 'USDT', 'EUR'];
const predefinedColors = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', 
  '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'
];

export const CardFormModal: React.FC<Props> = ({ open, initial, onSubmit, onClose }) => {
  const [formData, setFormData] = useState<CardFormData>({
    name: '',
    brand: 'Visa',
    type: 'credit',
    country: 'AR',
    multimoneda: false,
    currencies: ['ARS'],
    limit_by_currency: { ARS: '0.00' },
    cutoff_day: 20,
    payment_day: 10,
    color: '#3b82f6',
    last4: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initial) {
      setFormData({
        name: initial.name,
        brand: initial.brand,
        type: initial.type,
        country: initial.country,
        multimoneda: initial.multimoneda,
        currencies: [...initial.currencies],
        limit_by_currency: { ...initial.limit_by_currency || {} },
        cutoff_day: initial.cutoff_day || 20,
        payment_day: initial.payment_day || 10,
        color: initial.color,
        last4: initial.last4 || '',
        notes: '',
      });
    } else {
      setFormData({
        name: '',
        brand: 'Visa',
        type: 'credit',
        country: 'AR',
        multimoneda: false,
        currencies: ['ARS'],
        limit_by_currency: { ARS: '0.00' },
        cutoff_day: 20,
        payment_day: 10,
        color: '#3b82f6',
        last4: '',
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

    if (formData.currencies.length === 0) {
      newErrors.currencies = 'Debe seleccionar al menos una moneda';
    }

    if (formData.multimoneda && formData.currencies.length < 2) {
      newErrors.multimoneda = 'Las tarjetas multimoneda deben tener al menos 2 monedas';
    }

    if (formData.type === 'credit') {
      if (!formData.cutoff_day || formData.cutoff_day < 1 || formData.cutoff_day > 31) {
        newErrors.cutoff_day = 'Día de corte debe estar entre 1 y 31';
      }
      if (!formData.payment_day || formData.payment_day < 1 || formData.payment_day > 31) {
        newErrors.payment_day = 'Día de pago debe estar entre 1 y 31';
      }
    }

    // Validar que todas las monedas en limit_by_currency estén en currencies
    const limitCurrencies = Object.keys(formData.limit_by_currency);
    const unsupportedLimits = limitCurrencies.filter(
      currency => !formData.currencies.includes(currency)
    );
    
    if (unsupportedLimits.length > 0) {
      newErrors.limits = `Las monedas ${unsupportedLimits.join(', ')} no están en las monedas soportadas`;
    }

    // Validar que los límites sean números válidos
    for (const [currency, limit] of Object.entries(formData.limit_by_currency)) {
      if (isNaN(parseFloat(limit)) || parseFloat(limit) < 0) {
        newErrors[`limit_${currency}`] = 'Límite inválido';
      }
    }

    // Validar last4
    if (formData.last4 && (formData.last4.length !== 4 || !/^\d{4}$/.test(formData.last4))) {
      newErrors.last4 = 'Deben ser exactamente 4 dígitos';
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
    if (!formData.currencies.includes(currency)) {
      setFormData(prev => ({
        ...prev,
        currencies: [...prev.currencies, currency],
        limit_by_currency: formData.type === 'credit' 
          ? { ...prev.limit_by_currency, [currency]: '0.00' }
          : prev.limit_by_currency
      }));
    }
  };

  const removeCurrency = (currency: string) => {
    if (formData.currencies.length > 1) {
      const newLimits = { ...formData.limit_by_currency };
      delete newLimits[currency];
      
      setFormData(prev => ({
        ...prev,
        currencies: prev.currencies.filter(c => c !== currency),
        limit_by_currency: newLimits
      }));
    }
  };

  const updateLimit = (currency: string, limit: string) => {
    setFormData(prev => ({
      ...prev,
      limit_by_currency: { ...prev.limit_by_currency, [currency]: limit }
    }));
  };

  const handleMultimonedaChange = (multimoneda: boolean) => {
    setFormData(prev => ({
      ...prev,
      multimoneda,
      currencies: multimoneda ? prev.currencies : [prev.currencies[0] || 'ARS']
    }));
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {initial ? 'Editar tarjeta' : 'Nueva tarjeta'}
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
                placeholder="Ej: Visa Galicia"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Marca
              </label>
              <select
                value={formData.brand}
                onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value as any }))}
                className="select-field w-full"
              >
                {cardBrands.map(brand => (
                  <option key={brand.value} value={brand.value}>{brand.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tipo *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                className="select-field w-full"
              >
                {cardTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

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
                Últimos 4 dígitos
              </label>
              <input
                type="text"
                value={formData.last4}
                onChange={(e) => setFormData(prev => ({ ...prev, last4: e.target.value }))}
                className={`input-field w-full ${errors.last4 ? 'border-red-500' : ''}`}
                placeholder="1234"
                maxLength={4}
              />
              {errors.last4 && <p className="text-red-500 text-xs mt-1">{errors.last4}</p>}
            </div>
          </div>

          {/* Configuración multimoneda */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.multimoneda}
                  onChange={(e) => handleMultimonedaChange(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tarjeta multimoneda
                </span>
              </label>
            </div>
            {errors.multimoneda && <p className="text-red-500 text-xs mb-2">{errors.multimoneda}</p>}
          </div>

          {/* Monedas soportadas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Monedas soportadas *
            </label>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {formData.currencies.map(currency => (
                  <div key={currency} className="flex items-center gap-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full">
                    <span className="text-sm">{currency}</span>
                    {formData.currencies.length > 1 && (
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
                  .filter(currency => !formData.currencies.includes(currency))
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

          {/* Límites de crédito (solo para tarjetas de crédito) */}
          {formData.type === 'credit' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Límites de crédito
              </label>
              <div className="space-y-2">
                {formData.currencies.map(currency => (
                  <div key={currency} className="flex items-center gap-3">
                    <span className="w-12 text-sm font-medium text-gray-700 dark:text-gray-300">
                      {currency}
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.limit_by_currency[currency] || '0.00'}
                      onChange={(e) => updateLimit(currency, e.target.value)}
                      className={`input-field flex-1 ${errors[`limit_${currency}`] ? 'border-red-500' : ''}`}
                      placeholder="0.00"
                    />
                    {errors[`limit_${currency}`] && (
                      <p className="text-red-500 text-xs">{errors[`limit_${currency}`]}</p>
                    )}
                  </div>
                ))}
              </div>
              {errors.limits && <p className="text-red-500 text-xs mt-1">{errors.limits}</p>}
            </div>
          )}

          {/* Fechas de ciclo (solo para tarjetas de crédito) */}
          {formData.type === 'credit' && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Ciclo de facturación
                </label>
                <Info className="w-4 h-4 text-gray-400" title="Las fechas se ajustarán automáticamente a días hábiles" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Día de corte *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={formData.cutoff_day}
                    onChange={(e) => setFormData(prev => ({ ...prev, cutoff_day: parseInt(e.target.value) || 1 }))}
                    className={`input-field w-full ${errors.cutoff_day ? 'border-red-500' : ''}`}
                    placeholder="20"
                  />
                  {errors.cutoff_day && <p className="text-red-500 text-xs mt-1">{errors.cutoff_day}</p>}
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Día de pago *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={formData.payment_day}
                    onChange={(e) => setFormData(prev => ({ ...prev, payment_day: parseInt(e.target.value) || 10 }))}
                    className={`input-field w-full ${errors.payment_day ? 'border-red-500' : ''}`}
                    placeholder="10"
                  />
                  {errors.payment_day && <p className="text-red-500 text-xs mt-1">{errors.payment_day}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Color identificador
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

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notas (opcional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="input-field w-full h-20 resize-none"
              placeholder="Información adicional sobre esta tarjeta..."
            />
          </div>

          {/* Información adicional */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <div className="font-medium mb-1">Configuración automática:</div>
                <ul className="space-y-1 text-xs">
                  <li>• Política de días hábiles: Siguiente día hábil</li>
                  <li>• Liquidación FX: Al momento del pago</li>
                  <li>• Las fechas de vencimiento se ajustarán automáticamente</li>
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
              {initial ? 'Actualizar tarjeta' : 'Crear tarjeta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};