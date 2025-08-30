import React, { useState, useEffect } from 'react';
import { Plus, CreditCard, TrendingUp } from 'lucide-react';
import { CardList } from './CardList';
import { CardFormModal } from './CardFormModal';
import { CardCycleModal } from './CardCycleModal';
import { getCards, createCard, updateCard, deleteCard } from '../../lib/cardsApi';
import type { Card, CardFormData } from '../../types/cards';

export const CardsModule: React.FC = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [cycleModalOpen, setCycleModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    try {
      setLoading(true);
      const data = await getCards();
      setCards(data);
    } catch (error) {
      showToast('Error al cargar las tarjetas', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCreateCard = async (data: CardFormData) => {
    try {
      const cardData = {
        name: data.name,
        brand: data.brand,
        type: data.type,
        country: data.country,
        multimoneda: data.multimoneda,
        currencies: data.currencies,
        limit_by_currency: data.type === 'credit' ? data.limit_by_currency : undefined,
        cutoff_day: data.type === 'credit' ? data.cutoff_day : undefined,
        payment_day: data.type === 'credit' ? data.payment_day : undefined,
        color: data.color,
        last4: data.last4 || undefined,
      };

      const newCard = await createCard(cardData);
      setCards(prev => [...prev, newCard]);
      setModalOpen(false);
      showToast('Tarjeta creada exitosamente', 'success');
    } catch (error) {
      showToast('Error al crear la tarjeta', 'error');
    }
  };

  const handleUpdateCard = async (data: CardFormData) => {
    if (!editingCard) return;
    
    try {
      const cardData = {
        name: data.name,
        brand: data.brand,
        type: data.type,
        country: data.country,
        multimoneda: data.multimoneda,
        currencies: data.currencies,
        limit_by_currency: data.type === 'credit' ? data.limit_by_currency : undefined,
        cutoff_day: data.type === 'credit' ? data.cutoff_day : undefined,
        payment_day: data.type === 'credit' ? data.payment_day : undefined,
        color: data.color,
        last4: data.last4 || undefined,
      };

      const updatedCard = await updateCard(editingCard.id, cardData);
      setCards(prev => prev.map(card => 
        card.id === editingCard.id ? updatedCard : card
      ));
      setModalOpen(false);
      setEditingCard(null);
      showToast('Tarjeta actualizada exitosamente', 'success');
    } catch (error) {
      showToast('Error al actualizar la tarjeta', 'error');
    }
  };

  const handleDeleteCard = async (id: string) => {
    const card = cards.find(c => c.id === id);
    if (!card) return;

    const confirmed = window.confirm(
      `¿Estás seguro de que quieres eliminar la tarjeta "${card.name}"? Esta acción no se puede deshacer.`
    );

    if (confirmed) {
      try {
        await deleteCard(id);
        setCards(prev => prev.filter(c => c.id !== id));
        showToast('Tarjeta eliminada exitosamente', 'success');
      } catch (error) {
        showToast('Error al eliminar la tarjeta', 'error');
      }
    }
  };

  const handleEditCard = (card: Card) => {
    setEditingCard(card);
    setModalOpen(true);
  };

  const handleViewCycle = (card: Card) => {
    setSelectedCard(card);
    setCycleModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingCard(null);
  };

  const handleCloseCycleModal = () => {
    setCycleModalOpen(false);
    setSelectedCard(null);
  };

  // Calcular estadísticas
  const totalCreditLimit = cards
    .filter(card => card.type === 'credit')
    .reduce((total, card) => {
      if (card.limit_by_currency) {
        Object.entries(card.limit_by_currency).forEach(([currency, limit]) => {
          if (!total[currency]) total[currency] = 0;
          total[currency] += parseFloat(limit);
        });
      }
      return total;
    }, {} as Record<string, number>);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">Cargando tarjetas...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <CreditCard className="w-6 h-6" />
            Tarjetas
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gestiona tus tarjetas de crédito y débito
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nueva tarjeta
        </button>
      </div>

      {/* Resumen de límites de crédito */}
      {Object.keys(totalCreditLimit).length > 0 && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Límites de crédito totales
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(totalCreditLimit).map(([currency, limit]) => (
              <div key={currency} className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {new Intl.NumberFormat('es-AR').format(limit)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{currency}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lista de tarjetas */}
      <CardList
        cards={cards}
        onEdit={handleEditCard}
        onDelete={handleDeleteCard}
        onViewCycle={handleViewCycle}
      />

      {/* Modales */}
      <CardFormModal
        open={modalOpen}
        initial={editingCard}
        onSubmit={editingCard ? handleUpdateCard : handleCreateCard}
        onClose={handleCloseModal}
      />

      <CardCycleModal
        open={cycleModalOpen}
        card={selectedCard}
        onClose={handleCloseCycleModal}
      />

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
          toast.type === 'success' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          {toast.message}
        </div>
      )}
    </div>
  );
};