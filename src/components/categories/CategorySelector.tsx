import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { CategoryFormModal } from './CategoryFormModal';
import { getCategories, createCategory } from '../../lib/categoriesApi';
import type { Category, CategoryFormData } from '../../types/categories';

type Props = {
  type: 'expense' | 'saving';
  value: string;
  onChange: (categoryId: string) => void;
  placeholder?: string;
};

export const CategorySelector: React.FC<Props> = ({ type, value, onChange, placeholder }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, [type]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await getCategories(type);
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (data: CategoryFormData) => {
    try {
      const newCategory = await createCategory(data);
      setCategories(prev => [...prev, newCategory]);
      onChange(newCategory.id);
      setModalOpen(false);
    } catch (error) {
      console.error('Error creating category:', error);
    }
  };

  const selectedCategory = categories.find(cat => cat.id === value);

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="select-field flex-1"
          disabled={loading}
        >
          <option value="">{placeholder || 'Seleccionar categoría...'}</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="btn-secondary px-3 flex items-center gap-1"
          title="Nueva categoría"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Vista previa de categoría seleccionada */}
      {selectedCategory && (
        <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div 
            className="w-6 h-6 rounded flex items-center justify-center text-white text-sm"
            style={{ backgroundColor: selectedCategory.color }}
          >
            <span className="material-icons text-sm">{selectedCategory.icon}</span>
          </div>
          <span className="text-sm text-gray-700 dark:text-gray-300">{selectedCategory.name}</span>
        </div>
      )}

      <CategoryFormModal
        open={modalOpen}
        type={type}
        onSubmit={handleCreateCategory}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
};