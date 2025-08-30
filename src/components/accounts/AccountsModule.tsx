import React, { useState, useEffect } from 'react';
import { Plus, Wallet } from 'lucide-react';
import { AccountList } from './AccountList';
import { AccountFormModal } from './AccountFormModal';
import { getAccounts, createAccount, updateAccount, deleteAccount } from '../../lib/accountsApi';
import type { Account, AccountFormData } from '../../types/accounts';

export const AccountsModule: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const data = await getAccounts();
      setAccounts(data);
    } catch (error) {
      showToast('Error al cargar las cuentas', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCreateAccount = async (data: AccountFormData) => {
    try {
      const newAccount = await createAccount(data);
      setAccounts(prev => [...prev, newAccount]);
      setModalOpen(false);
      showToast('Cuenta creada exitosamente', 'success');
    } catch (error) {
      showToast('Error al crear la cuenta', 'error');
    }
  };

  const handleUpdateAccount = async (data: AccountFormData) => {
    if (!editingAccount) return;
    
    try {
      const updatedAccount = await updateAccount(editingAccount.id, data);
      setAccounts(prev => prev.map(acc => 
        acc.id === editingAccount.id ? updatedAccount : acc
      ));
      setModalOpen(false);
      setEditingAccount(null);
      showToast('Cuenta actualizada exitosamente', 'success');
    } catch (error) {
      showToast('Error al actualizar la cuenta', 'error');
    }
  };

  const handleDeleteAccount = async (id: string) => {
    const account = accounts.find(acc => acc.id === id);
    if (!account) return;

    const confirmed = window.confirm(
      `¿Estás seguro de que quieres eliminar la cuenta "${account.name}"? Esta acción no se puede deshacer.`
    );

    if (confirmed) {
      try {
        await deleteAccount(id);
        setAccounts(prev => prev.filter(acc => acc.id !== id));
        showToast('Cuenta eliminada exitosamente', 'success');
      } catch (error) {
        showToast('Error al eliminar la cuenta', 'error');
      }
    }
  };

  const handleEditAccount = (account: Account) => {
    setEditingAccount(account);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingAccount(null);
  };

  const totalBalance = accounts.reduce((total, account) => {
    Object.entries(account.initial_balances).forEach(([currency, amount]) => {
      if (!total[currency]) total[currency] = 0;
      total[currency] += parseFloat(amount);
    });
    return total;
  }, {} as Record<string, number>);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">Cargando cuentas...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Wallet className="w-6 h-6" />
            Cuentas
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gestiona tus cuentas bancarias, efectivo y billeteras digitales
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nueva cuenta
        </button>
      </div>

      {/* Resumen de saldos */}
      {Object.keys(totalBalance).length > 0 && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Resumen de saldos
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(totalBalance).map(([currency, amount]) => (
              <div key={currency} className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {new Intl.NumberFormat('es-AR').format(amount)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{currency}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lista de cuentas */}
      <AccountList
        accounts={accounts}
        onEdit={handleEditAccount}
        onDelete={handleDeleteAccount}
      />

      {/* Modal */}
      <AccountFormModal
        open={modalOpen}
        initial={editingAccount}
        onSubmit={editingAccount ? handleUpdateAccount : handleCreateAccount}
        onClose={handleCloseModal}
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