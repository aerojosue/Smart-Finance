import React, { useState } from 'react';
import { Search, Filter, CreditCard } from 'lucide-react';
import { CardCard } from './CardCard';
import type { Card } from '../../types/cards';

type Props = {
  cards: Card[];
  onEdit: (card: Card) => void;
  onDelete: (id: string) => void;
  onViewCycle: (card: Card) => void;
};

export const CardList: React.FC<Props> = ({ cards, onEdit, onDelete, onViewCycle }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [currencyFilter, setCurrencyFilter] = useState<string>('all');

  const filteredCards = cards.filter(card => {
    const matchesSearch = card.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || card.type === typeFilter;
    const matchesCurrency = currencyFilter === 'all' || card.currencies.includes(currencyFilter);
    
    return matchesSearch && matchesType && matchesCurrency;
  });

  const allCurrencies = [...new Set(cards.flatMap(card => card.currencies))].sort();

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar tarjetas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10 w-full"
          />
        </div>
        
        <div className="flex gap-2">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="select-field pl-10 pr-8"
            >
              <option value="all">Todos los tipos</option>
              <option value="credit">Crédito</option>
              <option value="debit">Débito</option>
            </select>
          </div>
          
          <select
            value={currencyFilter}
            onChange={(e) => setCurrencyFilter(e.target.value)}
            className="select-field"
          >
            <option value="all">Todas las monedas</option>
            {allCurrencies.map(currency => (
              <option key={currency} value={currency}>{currency}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Resumen */}
      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
        <span>
          {filteredCards.length} de {cards.length} tarjetas
          {searchTerm && ` · Filtrado por "${searchTerm}"`}
        </span>
        <span>
          {cards.filter(c => c.type === 'credit').length} crédito · {cards.filter(c => c.type === 'debit').length} débito
        </span>
      </div>

      {/* Grid de tarjetas */}
      {filteredCards.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCards.map(card => (
            <CardCard
              key={card.id}
              card={card}
              onEdit={onEdit}
              onDelete={onDelete}
              onViewCycle={onViewCycle}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <CreditCard className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            {searchTerm ? 'No se encontraron tarjetas' : 'No hay tarjetas registradas'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm 
              ? 'Intenta con otros términos de búsqueda'
              : 'Comienza agregando tu primera tarjeta'
            }
          </p>
        </div>
      )}
    </div>
  );
};