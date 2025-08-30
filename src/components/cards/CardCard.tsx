import React from 'react';
import { 
  CreditCard, 
  Building2, 
  Edit, 
  Trash2, 
  Calendar,
  DollarSign,
  Shield,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import type { Card } from '../../types/cards';

type Props = {
  card: Card;
  onEdit: (card: Card) => void;
  onDelete: (id: string) => void;
  onViewCycle: (card: Card) => void;
};

const brandIcons = {
  Visa: '💳',
  Mastercard: '💳',
  Amex: '💳',
  Other: '💳',
};

const typeLabels = {
  credit: 'Crédito',
  debit: 'Débito',
};

const tierColors = {
  operational: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  buffer: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  savings: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  untouchable: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

export const CardCard: React.FC<Props> = ({ card, onEdit, onDelete, onViewCycle }) => {
  const formatCurrency = (amount: string, currency: string) => {
    return `${currency} ${new Intl.NumberFormat('es-AR').format(parseFloat(amount))}`;
  };

  return (
    <div className="card p-6 hover:shadow-lg transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg"
            style={{ backgroundColor: card.color }}
          >
            {brandIcons[card.brand]}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">{card.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                {typeLabels[card.type]}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{card.brand}</span>
              {card.last4 && (
                <span className="text-xs text-gray-500 dark:text-gray-400">•••• {card.last4}</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-1">
          {card.type === 'credit' && (
            <button
              onClick={() => onViewCycle(card)}
              className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
              title="Ver ciclo"
            >
              <Calendar className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => onEdit(card)}
            className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(card.id)}
            className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Monedas soportadas */}
      <div className="mb-4">
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
          Monedas {card.multimoneda ? '(Multimoneda)' : ''}
        </div>
        <div className="flex flex-wrap gap-1">
          {card.currencies.map(currency => (
            <span 
              key={currency}
              className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full"
            >
              {currency}
            </span>
          ))}
        </div>
      </div>

      {/* Límites (solo para crédito) */}
      {card.type === 'credit' && card.limit_by_currency && (
        <div className="mb-4">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Límites de crédito</div>
          <div className="space-y-1">
            {Object.entries(card.limit_by_currency).map(([currency, limit]) => (
              <div key={currency} className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">{currency}</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {formatCurrency(limit, currency)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fechas de ciclo (solo para crédito) */}
      {card.type === 'credit' && (
        <div className="mb-4">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Ciclo de facturación</div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-3 h-3 text-gray-400" />
              <div>
                <div className="text-gray-600 dark:text-gray-400">Corte</div>
                <div className="font-medium text-gray-900 dark:text-gray-100">Día {card.cutoff_day}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-3 h-3 text-gray-400" />
              <div>
                <div className="text-gray-600 dark:text-gray-400">Pago</div>
                <div className="font-medium text-gray-900 dark:text-gray-100">Día {card.payment_day}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Configuración */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 dark:text-gray-400">País</span>
          <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
            {card.country}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 dark:text-gray-400">Política FX</span>
          <div className="flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-green-500" />
            <span className="text-xs text-gray-600 dark:text-gray-400">
              Al pagar
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 dark:text-gray-400">Días hábiles</span>
          <span className="text-xs text-gray-600 dark:text-gray-400">
            Siguiente día hábil
          </span>
        </div>
      </div>
    </div>
  );
};