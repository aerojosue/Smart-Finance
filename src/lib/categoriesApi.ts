import type { Category } from '../types/categories';

// In-memory cache for demo purposes
let categoriesCache: Category[] | null = null;

export async function getCategories(type?: 'expense' | 'saving'): Promise<Category[]> {
  if (!categoriesCache) {
    try {
      const response = await fetch('/mocks/categories.json');
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      categoriesCache = data.categories;
    } catch {
      // Initialize with default categories if file doesn't exist
      categoriesCache = [
        // Default expense categories
        { id: 'cat_food', name: 'Comida', icon: 'restaurant', type: 'expense', color: '#10b981', is_default: true, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
        { id: 'cat_transport', name: 'Transporte', icon: 'directions_car', type: 'expense', color: '#3b82f6', is_default: true, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
        { id: 'cat_entertainment', name: 'Entretenimiento', icon: 'movie', type: 'expense', color: '#8b5cf6', is_default: true, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
        { id: 'cat_health', name: 'Salud', icon: 'local_hospital', type: 'expense', color: '#ef4444', is_default: true, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
        { id: 'cat_shopping', name: 'Compras', icon: 'shopping_cart', type: 'expense', color: '#f59e0b', is_default: true, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
        { id: 'cat_bills', name: 'Servicios', icon: 'receipt', type: 'expense', color: '#06b6d4', is_default: true, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
        { id: 'cat_other_exp', name: 'Otros', icon: 'more_horiz', type: 'expense', color: '#6b7280', is_default: true, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
        
        // Default saving categories
        { id: 'cat_travel', name: 'Viajes', icon: 'flight_takeoff', type: 'saving', color: '#10b981', is_default: true, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
        { id: 'cat_health_sav', name: 'Salud', icon: 'favorite', type: 'saving', color: '#ef4444', is_default: true, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
        { id: 'cat_emergency', name: 'Emergencia', icon: 'emergency', type: 'saving', color: '#f59e0b', is_default: true, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
        { id: 'cat_work', name: 'Trabajo', icon: 'laptop', type: 'saving', color: '#8b5cf6', is_default: true, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
        { id: 'cat_education', name: 'Educación', icon: 'school', type: 'saving', color: '#3b82f6', is_default: true, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
        { id: 'cat_home', name: 'Hogar', icon: 'house', type: 'saving', color: '#06b6d4', is_default: true, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
        { id: 'cat_other_sav', name: 'Otros', icon: 'savings', type: 'saving', color: '#6b7280', is_default: true, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
      ];
    }
  }
  
  return type ? categoriesCache.filter(cat => cat.type === type) : categoriesCache;
}

export async function createCategory(category: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<Category> {
  const newCategory: Category = {
    ...category,
    id: `cat_${Date.now()}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  
  if (!categoriesCache) await getCategories();
  categoriesCache = [...(categoriesCache || []), newCategory];
  
  await new Promise(resolve => setTimeout(resolve, 500));
  return newCategory;
}

export async function updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
  if (!categoriesCache) await getCategories();
  
  const categoryIndex = categoriesCache!.findIndex(c => c.id === id);
  if (categoryIndex === -1) throw new Error('Category not found');
  
  const updatedCategory = {
    ...categoriesCache![categoryIndex],
    ...updates,
    updated_at: new Date().toISOString(),
  };
  
  categoriesCache![categoryIndex] = updatedCategory;
  
  await new Promise(resolve => setTimeout(resolve, 500));
  return updatedCategory;
}

export async function deleteCategory(id: string): Promise<void> {
  if (!categoriesCache) await getCategories();
  
  const category = categoriesCache!.find(c => c.id === id);
  if (category?.is_default) {
    throw new Error('Cannot delete default categories');
  }
  
  categoriesCache = categoriesCache!.filter(c => c.id !== id);
  await new Promise(resolve => setTimeout(resolve, 300));
}