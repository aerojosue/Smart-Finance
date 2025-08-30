import React, { useState, useEffect } from 'react';
import { X, TrendingUp, Calendar, AlertTriangle, Info } from 'lucide-react';
import type { PlannedIncome, PlannedIncomeFormData } from '../../types/incomes';

type Props = {
  open: boolean;
  initial?: PlannedIncome | null;
  onSubmit: (data: PlannedIncomeFormData) => void;
  onClose: () => void;
};

const categories = [
  { value: 'salary', label: 'Salario', icon: '💼' },
  { value: 'freelance', label: 'Freelance', icon: '💻' },
  { value: 'rental', label: 'Alquiler', icon: '🏠' },
  { value: 'investment', label: 'Inversión', icon: '📈' },
  { value: 'bonus', label: 'Bonus', icon: '🎁' },
  { value: 'other', label: 'Otro', icon: '💰' },
];

const confidenceLevels = [
  { value: 'high', label: 'Alta', description: 'Muy probable (>90%)' },
  { value: 'medium', label: 'Media', description: 'Probable (70-90%)' },
  { value: 'low', label: 'Baja', description: 'Posible (<70%)' },
];

const recurrenceTypes = [
  { value: 'one_time', label: 'Una vez' },
  { value: 'monthly', label: 'Mensual' },
];

const dayRules = [
  { value: 'fixed_day', label: 'Día fijo del mes' },
  { value: 'last_business_day', label: 'Último día hábil' },
  { value: 'next_business_day', label: 'Próximo día hábil' },
];

const availableCurrencies = ['ARS', 'BRL', 'USD', 'USDT', 'EUR'];

export const PlannedIncomeFormModal: React.FC<Props> = ({ open, initial, onSubmit, onClose }) => {
  const [formData, setFormData] = useState<PlannedIncomeFormData>({
    source: '',
    category: 'salary',
    currency: 'ARS',
    amount: '',
    confidence: 'high',
    recurrence_type: 'monthly',
    day_rule: 'last_business_day',
    anchor_day: 1,
    use_variable_band: false,
    variable_min: '',
    variable_max: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initial) {
      setFormData({
        source: initial.source,
        category: initial.category,
        currency: initial.currency,
        amount: initial.amount || '',
        confidence: initial.confidence,
        recurrence_type: initial.recurrence?.type || 'one_time',
        day_rule: initial.recurrence?.day_rule || 'fixed_day',
        anchor_day: initial.recurrence?.anchor_day || 1,
        use_variable_band: !!initial.variable_band,
        variable_min: initial.variable_band?.min || '',
        variable_max: initial.variable_band?.max || '',
        notes: initial.notes,
      });
    } else {
      setFormData({
        source: '',
        category: 'salary',
        currency: 'ARS',
        amount: '',
        confidence: 'high',
        recurrence_type: 'monthly',
        day_rule: 'last_business_day',
        anchor_day: 1,
        use_variable_band: false,
        variable_min: '',
        variable_max: '',
        notes: '',
      });
    }
    setErrors({});
  }, [initial, open]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.source.trim()) {
      newErrors.source = 'La fuente es obligatoria';
    }

    if (formData.use_variable_band) {
      if (!formData.variable_min || parseFloat(formData.variable_min) <= 0) {
        newErrors.variable_min = 'El monto mínimo debe ser mayor a 0';
      }
      if (!formData.variable_max || parseFloat(formData.variable_max) <= 0) {
        newErrors.variable_max = 'El monto máximo debe ser mayor a 0';
      }
      if (formData.variable_min && formData.variable_max && 
          parseFloat(formData.variable_min) >= parseFloat(formData.variable_max)) {
        newErrors.variable_max = 'El máximo debe ser mayor al mínimo';
      }
    } else {
      if (!formData.amount || parseFloat(formData.amount) <= 0) {
        newErrors.amount = 'El monto debe ser mayor a 0';
      }
    }

    if (formData.recurrence_type === 'monthly' && 
        (formData.day_rule === 'fixed_day' || formData.day_rule === 'next_business_day')) {
      if (!formData.anchor_day || formData.anchor_day < 1 || formData.anchor_day > 31) {
        newErrors.anchor_day = 'El día debe estar entre 1 y 31';
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

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            {initial ? 'Editar ingreso planificado' : 'Nuevo ingreso planificado'}
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
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Fuente del ingreso *
              </label>
              <input
                type="text"
                value={formData.source}
                onChange={(e) => setFormData(prev => ({ ...prev, source: e.target.value }))}
                className={`input-field w-full ${errors.source ? 'border-red-500' : ''}`}
                placeholder="Ej: Salario principal, Freelance desarrollo"
              />
              {errors.source && <p className="text-red-500 text-xs mt-1">{errors.source}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Categoría
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
                className="select-field w-full"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.icon} {category.label}
                  </option>
                ))}
              </select>
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

          {/* Monto o banda variable */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.use_variable_band}
                  onChange={(e) => setFormData(prev => ({ ...prev, use_variable_band: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Monto variable (banda)
                </span>
              </label>
            </div>

            {formData.use_variable_band ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Monto mínimo *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.variable_min}
                    onChange={(e) => setFormData(prev => ({ ...prev, variable_min: e.target.value }))}
                    className={`input-field w-full ${errors.variable_min ? 'border-red-500' : ''}`}
                    placeholder="0.00"
                  />
                  {errors.variable_min && <p className="text-red-500 text-xs mt-1">{errors.variable_min}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Monto máximo *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.variable_max}
                    onChange={(e) => setFormData(prev => ({ ...prev, variable_max: e.target.value }))}
                    className={`input-field w-full ${errors.variable_max ? 'border-red-500' : ''}`}
                    placeholder="0.00"
                  />
                  {errors.variable_max && <p className="text-red-500 text-xs mt-1">{errors.variable_max}</p>}
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Monto fijo *
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
            )}
          </div>

          {/* Confianza */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nivel de confianza
            </label>
            <div className="grid grid-cols-3 gap-2">
              {confidenceLevels.map(level => (
                <button
                  key={level.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, confidence: level.value as any }))}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    formData.confidence === level.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="font-medium text-sm">{level.label}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{level.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Recurrencia */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tipo de recurrencia
              </label>
              <div className="grid grid-cols-2 gap-2">
                {recurrenceTypes.map(type => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, recurrence_type: type.value as any }))}
                    className={`p-3 rounded-lg border text-center transition-all ${
                      formData.recurrence_type === type.value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="font-medium text-sm">{type.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {formData.recurrence_type === 'monthly' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Regla de día
                  </label>
                  <select
                    value={formData.day_rule}
                    onChange={(e) => setFormData(prev => ({ ...prev, day_rule: e.target.value as any }))}
                    className="select-field w-full"
                  >
                    {dayRules.map(rule => (
                      <option key={rule.value} value={rule.value}>{rule.label}</option>
                    ))}
                  </select>
                </div>

                {(formData.day_rule === 'fixed_day' || formData.day_rule === 'next_business_day') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Día del mes *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={formData.anchor_day}
                      onChange={(e) => setFormData(prev => ({ ...prev, anchor_day: parseInt(e.target.value) || 1 }))}
                      className={`input-field w-full ${errors.anchor_day ? 'border-red-500' : ''}`}
                      placeholder="1"
                    />
                    {errors.anchor_day && <p className="text-red-500 text-xs mt-1">{errors.anchor_day}</p>}
                  </div>
                )}
              </div>
            )}
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
              placeholder="Información adicional sobre este ingreso..."
            />
          </div>

          {/* Información adicional */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <div className="font-medium mb-1">Configuración automática:</div>
                <ul className="space-y-1 text-xs">
                  <li>• Las fechas se ajustarán automáticamente a días hábiles</li>
                  <li>• Los montos se convertirán a ARS para KPIs y comparaciones</li>
                  <li>• Las bandas variables generan escenarios conservador/base/optimista</li>
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
              {initial ? 'Actualizar ingreso' : 'Crear ingreso'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};