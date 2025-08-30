import React, { useState, useEffect } from 'react';
import { X, Calendar, DollarSign, CreditCard, Calculator } from 'lucide-react';
import { getCardCycle, previewInstallments } from '../../lib/cardsApi';
import type { Card, CardCycle, InstallmentPreview } from '../../types/cards';

type Props = {
  open: boolean;
  card: Card | null;
  onClose: () => void;
};

export const CardCycleModal: React.FC<Props> = ({ open, card, onClose }) => {
  const [cycle, setCycle] = useState<CardCycle | null>(null);
  const [preview, setPreview] = useState<InstallmentPreview[]>([]);
  const [previewAmount, setPreviewAmount] = useState('1000.00');
  const [previewInstallments, setPreviewInstallments] = useState(3);
  const [previewCurrency, setPreviewCurrency] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && card) {
      setPreviewCurrency(card.currencies[0]);
      loadCycle();
    }
  }, [open, card]);

  const loadCycle = async () => {
    if (!card) return;
    
    try {
      setLoading(true);
      const cycleData = await getCardCycle(card.id);
      setCycle(cycleData);
    } catch (error) {
      console.error('Error loading cycle:', error);
    } finally {
      setLoading(false);
    }
  };

  const generatePreview = async () => {
    if (!card || !previewAmount || !previewInstallments) return;
    
    try {
      const previews = await previewInstallments(
        card.id, 
        previewAmount, 
        previewInstallments, 
        previewCurrency
      );
      setPreview(previews);
    } catch (error) {
      console.error('Error generating preview:', error);
    }
  };

  const formatCurrency = (amount: string, currency: string) => {
    return `${currency} ${new Intl.NumberFormat('es-AR').format(parseFloat(amount))}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (!open || !card) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            {card.name} - Ciclo y Cronograma
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="text-gray-500 dark:text-gray-400">Cargando información del ciclo...</div>
            </div>
          ) : (
            <>
              {/* Información del ciclo actual */}
              {cycle && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="card p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Ciclo actual
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Corte actual:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{formatDate(cycle.current_cutoff)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Pago actual:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{formatDate(cycle.current_payment)}</span>
                      </div>
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Próximo corte:</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">{formatDate(cycle.next_cutoff)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Próximo pago:</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">{formatDate(cycle.next_payment)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="card p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Consumo del ciclo
                    </h3>
                    <div className="space-y-3">
                      {Object.entries(cycle.cycle_consumption).map(([currency, amount]) => (
                        <div key={currency} className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Consumido {currency}:</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {formatCurrency(amount, currency)}
                          </span>
                        </div>
                      ))}
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                        {Object.entries(cycle.future_installments).map(([currency, amount]) => (
                          <div key={currency} className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Cuotas futuras {currency}:</span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                              {formatCurrency(amount, currency)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Simulador de cuotas */}
              <div className="card p-6">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                  <Calculator className="w-4 h-4" />
                  Simulador de cuotas
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Monto
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={previewAmount}
                      onChange={(e) => setPreviewAmount(e.target.value)}
                      className="input-field w-full"
                      placeholder="1000.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Cuotas
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="24"
                      value={previewInstallments}
                      onChange={(e) => setPreviewInstallments(parseInt(e.target.value) || 1)}
                      className="input-field w-full"
                      placeholder="3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Moneda
                    </label>
                    <select
                      value={previewCurrency}
                      onChange={(e) => setPreviewCurrency(e.target.value)}
                      className="select-field w-full"
                    >
                      {card.currencies.map(currency => (
                        <option key={currency} value={currency}>{currency}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={generatePreview}
                      className="btn-primary w-full"
                    >
                      Simular
                    </button>
                  </div>
                </div>

                {/* Cronograma de cuotas */}
                {preview.length > 0 && (
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 dark:bg-gray-700 px-4 py-2 border-b border-gray-200 dark:border-gray-600">
                      <div className="grid grid-cols-4 gap-4 text-xs font-medium text-gray-700 dark:text-gray-300">
                        <span>Cuota</span>
                        <span>Fecha de vencimiento</span>
                        <span>Monto</span>
                        <span>Ajuste</span>
                      </div>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {preview.map((installment) => (
                        <div key={installment.installment_number} className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                          <div className="grid grid-cols-4 gap-4 text-sm">
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                              {installment.installment_number}/{preview.length}
                            </span>
                            <span className="text-gray-700 dark:text-gray-300">
                              {formatDate(installment.due_date)}
                            </span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                              {formatCurrency(installment.amount, previewCurrency)}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              installment.is_weekend_adjusted 
                                ? 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200' 
                                : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                            }`}>
                              {installment.is_weekend_adjusted ? 'Ajustado' : 'Original'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};