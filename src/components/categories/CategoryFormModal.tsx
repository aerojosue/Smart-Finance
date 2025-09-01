import React, { useState, useEffect } from 'react';
import { X, Plus, Search } from 'lucide-react';
import { GOOGLE_ICONS } from '../../types/categories';
import type { Category, CategoryFormData } from '../../types/categories';

type Props = {
  open: boolean;
  type: 'expense' | 'saving';
  initial?: Category | null;
  onSubmit: (data: CategoryFormData) => void;
  onClose: () => void;
};

const predefinedColors = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', 
  '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'
];

export const CategoryFormModal: React.FC<Props> = ({ open, type, initial, onSubmit, onClose }) => {
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    icon: 'category',
    type,
    color: '#3b82f6',
  });
  const [iconSearch, setIconSearch] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initial) {
      setFormData({
        name: initial.name,
        icon: initial.icon,
        type: initial.type,
        color: initial.color,
      });
    } else {
      setFormData({
        name: '',
        icon: 'category',
        type,
        color: '#3b82f6',
      });
    }
    setErrors({});
    setIconSearch('');
  }, [initial, open, type]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    }

    if (!formData.icon) {
      newErrors.icon = 'Selecciona un icono';
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

  // Filter icons based on search and type
  const filteredIcons = GOOGLE_ICONS.filter(icon => {
    const matchesSearch = icon.label.toLowerCase().includes(iconSearch.toLowerCase()) ||
                         icon.name.toLowerCase().includes(iconSearch.toLowerCase());
    const matchesType = type === 'expense' 
      ? ['food', 'transport', 'entertainment', 'health', 'shopping', 'bills', 'other'].includes(icon.category)
      : ['travel', 'health', 'emergency', 'work', 'education', 'home', 'other'].includes(icon.category);
    
    return matchesSearch && matchesType;
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {initial ? 'Editar categoría' : `Nueva categoría de ${type === 'expense' ? 'gastos' : 'ahorros'}`}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nombre de la categoría *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className={`input-field w-full ${errors.name ? 'border-red-500' : ''}`}
              placeholder="Ej: Comida delivery"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Selección de icono */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Icono *
            </label>
            
            {/* Búsqueda de iconos */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar iconos..."
                value={iconSearch}
                onChange={(e) => setIconSearch(e.target.value)}
                className="input-field pl-10 w-full"
              />
            </div>

            {/* Vista previa del icono seleccionado */}
            <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Icono seleccionado:</div>
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                  style={{ backgroundColor: formData.color }}
                >
                  <span className="material-icons text-lg">{formData.icon}</span>
                </div>
                <span className="font-medium text-gray-900 dark:text-gray-100">{formData.name || 'Nueva categoría'}</span>
              </div>
            </div>

            {/* Grid de iconos */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 max-h-60 overflow-y-auto">
              <div className="grid grid-cols-6 gap-2">
                {filteredIcons.map(icon => (
                  <button
                    key={icon.name}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, icon: icon.name }))}
                    className={`p-3 rounded-lg border transition-all hover:scale-105 ${
                      formData.icon === icon.name
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                    title={icon.label}
                  >
                    <span className="material-icons text-lg text-gray-700 dark:text-gray-300">
                      {icon.name}
                    </span>
                  </button>
                ))}
              </div>
              {filteredIcons.length === 0 && (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                  No se encontraron iconos
                </div>
              )}
            </div>
            {errors.icon && <p className="text-red-500 text-xs mt-1">{errors.icon}</p>}
          </div>

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
              {initial ? 'Actualizar categoría' : 'Crear categoría'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};