import React, { useState, useEffect } from 'react';
import { X, Target, Calendar, AlertTriangle } from 'lucide-react';
import { CategorySelector } from '../categories/CategorySelector';
import type { SavingGoal, SavingGoalFormData } from '../../types/savings';

type Props = {
  open: boolean;
  initial?: SavingGoal | null;
  onSubmit: (data: SavingGoalFormData) => void;
  onClose: () => void;
};

const priorities = [
  { value: 'high', label: 'Alta', description: 'Urgente o muy importante' },
  { value: 'medium', label: 'Media', description: 'Importante pero no urgente' },
  { value: 'low', label: 'Baja', description: 'Deseable a largo plazo' },
];

const availableCurrencies = ['ARS', 'BRL', 'USD', 'USDT', 'EUR'];
const predefinedColors = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', 
  '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'
];

export const SavingGoalFormModal: React.FC<Props> = ({ open, initial, onSubmit, onClose }) => {
  const [formData, setFormData] = useState<SavingGoalFormData>({
    name: '',
    description: '',
    base_currency: 'USD',
    target_amount: '',
    priority: 'medium',
    due_date: '',
    color: '#3b82f6',
    category: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initial) {
      setFormData({
        name: initial.name,
        description: initial.description,
        base_currency: initial.base_currency,
        target_amount: initial.target_amount,
        priority: initial.priority,
        due_date: initial.due_date || '',
        color: initial.color,
        category: initial.category,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        base_currency: 'USD',
        target_amount: '',
        priority: 'medium',
        due_date: '',
        color: '#3b82f6',
       category: '',
      });
    }
    setErrors({});
  }, [initial, open]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.category) {
      newErrors.category = 'Selecciona una categoría';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    }

    if (!formData.target_amount || parseFloat(formData.target_amount) <= 0) {
      newErrors.target_amount = 'El monto objetivo debe ser mayor a 0';
    }

    if (formData.due_date) {
      const dueDate = new Date(formData.due_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (dueDate <= today) {
        newErrors.due_date = 'La fecha objetivo debe ser futura';
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
            <Target className="w-5 h-5" />
            {initial ? 'Editar meta' : 'Nueva meta de ahorro'}
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
                Nombre de la meta *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className={`input-field w-full ${errors.name ? 'border-red-500' : ''}`}
                placeholder="Ej: Viaje a Brasil"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Descripción
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="input-field w-full h-20 resize-none"
                placeholder="Describe tu meta de ahorro..."
              />
            </div>
          </div>

          {/* Objetivo financiero */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Moneda *
              </label>
              <select
                value={formData.base_currency}
                onChange={(e) => setFormData(prev => ({ ...prev, base_currency: e.target.value }))}
                className="select-field w-full"
              >
                {availableCurrencies.map(currency => (
                  <option key={currency} value={currency}>{currency}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Monto objetivo *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={formData.target_amount}
                onChange={(e) => setFormData(prev => ({ ...prev, target_amount: e.target.value }))}
                className={`input-field w-full ${errors.target_amount ? 'border-red-500' : ''}`}
                placeholder="0.00"
              />
              {errors.target_amount && <p className="text-red-500 text-xs mt-1">{errors.target_amount}</p>}
            </div>
          </div>

          {/* Configuración */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Prioridad
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                className="select-field w-full"
              >
                {priorities.map(priority => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label} - {priority.description}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Fecha objetivo (opcional)
              </label>
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                className={`input-field w-full ${errors.due_date ? 'border-red-500' : ''}`}
                min={new Date().toISOString().split('T')[0]}
              />
              {errors.due_date && <p className="text-red-500 text-xs mt-1">{errors.due_date}</p>}
            </div>
          </div>

          {/* Categoría y color */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Categoría
              </label>
              <CategorySelector
                type="saving"
                value={formData.category}
                onChange={(categoryId) => setFormData(prev => ({ ...prev, category: categoryId }))}
                placeholder="Seleccionar categoría..."
              />
              {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Color identificador
              </label>
              <div className="grid grid-cols-4 gap-2">
                {predefinedColors.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, color }))}
                    className={`w-12 h-12 rounded-lg border-2 transition-all ${
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

          {/* Vista previa */}
          {formData.name && formData.target_amount && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Vista previa</h3>
              <div className="flex items-center gap-3">
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                  style={{ backgroundColor: formData.color }}
                >
                  {categories.find(c => c.value === formData.category)?.icon}
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">{formData.name}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Meta: {formData.base_currency} {new Intl.NumberFormat('es-AR').format(parseFloat(formData.target_amount || '0'))}
                  </div>
                </div>
              </div>
            </div>
          )}

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
              {initial ? 'Actualizar meta' : 'Crear meta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};