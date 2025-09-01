export interface Category {
  id: string;
  name: string;
  icon: string;
  type: 'expense' | 'saving';
  color: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface CategoryFormData {
  name: string;
  icon: string;
  type: 'expense' | 'saving';
  color: string;
}

// Google Material Icons disponibles
export const GOOGLE_ICONS = [
  // Gastos
  { name: 'restaurant', label: 'Restaurante', category: 'food' },
  { name: 'local_grocery_store', label: 'Supermercado', category: 'food' },
  { name: 'fastfood', label: 'Comida rápida', category: 'food' },
  { name: 'coffee', label: 'Café', category: 'food' },
  { name: 'directions_car', label: 'Auto', category: 'transport' },
  { name: 'directions_bus', label: 'Bus', category: 'transport' },
  { name: 'local_gas_station', label: 'Gasolina', category: 'transport' },
  { name: 'flight', label: 'Vuelo', category: 'transport' },
  { name: 'movie', label: 'Cine', category: 'entertainment' },
  { name: 'sports_soccer', label: 'Deportes', category: 'entertainment' },
  { name: 'music_note', label: 'Música', category: 'entertainment' },
  { name: 'gamepad', label: 'Juegos', category: 'entertainment' },
  { name: 'local_hospital', label: 'Hospital', category: 'health' },
  { name: 'medication', label: 'Medicamentos', category: 'health' },
  { name: 'fitness_center', label: 'Gimnasio', category: 'health' },
  { name: 'spa', label: 'Spa', category: 'health' },
  { name: 'shopping_cart', label: 'Compras', category: 'shopping' },
  { name: 'checkroom', label: 'Ropa', category: 'shopping' },
  { name: 'devices', label: 'Electrónicos', category: 'shopping' },
  { name: 'home', label: 'Casa', category: 'shopping' },
  { name: 'receipt', label: 'Facturas', category: 'bills' },
  { name: 'phone', label: 'Teléfono', category: 'bills' },
  { name: 'wifi', label: 'Internet', category: 'bills' },
  { name: 'bolt', label: 'Electricidad', category: 'bills' },
  
  // Ahorros
  { name: 'flight_takeoff', label: 'Viaje', category: 'travel' },
  { name: 'beach_access', label: 'Playa', category: 'travel' },
  { name: 'hotel', label: 'Hotel', category: 'travel' },
  { name: 'camera_alt', label: 'Fotografía', category: 'travel' },
  { name: 'favorite', label: 'Salud', category: 'health' },
  { name: 'psychology', label: 'Bienestar', category: 'health' },
  { name: 'emergency', label: 'Emergencia', category: 'emergency' },
  { name: 'security', label: 'Seguridad', category: 'emergency' },
  { name: 'laptop', label: 'Laptop', category: 'work' },
  { name: 'work', label: 'Trabajo', category: 'work' },
  { name: 'business_center', label: 'Oficina', category: 'work' },
  { name: 'school', label: 'Educación', category: 'education' },
  { name: 'menu_book', label: 'Libros', category: 'education' },
  { name: 'language', label: 'Idiomas', category: 'education' },
  { name: 'house', label: 'Casa', category: 'home' },
  { name: 'chair', label: 'Muebles', category: 'home' },
  { name: 'kitchen', label: 'Cocina', category: 'home' },
  { name: 'savings', label: 'Ahorros', category: 'other' },
  { name: 'account_balance', label: 'Banco', category: 'other' },
  { name: 'trending_up', label: 'Inversión', category: 'other' },
];