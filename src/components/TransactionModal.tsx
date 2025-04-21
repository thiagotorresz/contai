import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Transaction } from '../lib/mockData';

interface TransactionModalProps {
  transaction: Transaction;
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Transaction) => void;
  onDelete: (id: number) => void;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  transaction,
  isOpen,
  onClose,
  onSave,
  onDelete,
}) => {
  const [editedTransaction, setEditedTransaction] = useState(transaction);
  const [formattedValor, setFormattedValor] = useState('');
  const [loading, setLoading] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  useEffect(() => {
    const centavos = Math.round(editedTransaction.valor * 100);
    setFormattedValor(formatCurrencyFromCents(centavos));
  }, [editedTransaction.valor]);

  if (!isOpen) return null;

  const formatCurrencyFromCents = (value: number) => {
    return 'R$ ' + (value / 100).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const onlyDigits = e.target.value.replace(/\D/g, '');
    const cents = parseInt(onlyDigits || '0', 10);
    setFormattedValor(formatCurrencyFromCents(cents));
    setEditedTransaction({ ...editedTransaction, valor: cents / 100 });
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`http://localhost:4000/api/transactions/${transaction.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editedTransaction),
      });

      if (!res.ok) throw new Error('Erro ao atualizar transação');

      const updated = await res.json();
      onSave(updated);
      onClose();
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar a transação');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirmed = async () => {
    const token = localStorage.getItem('token');
    setLoading(true);

    try {
      const res = await fetch(`http://localhost:4000/api/transactions/${transaction.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Erro ao excluir transação');

      onDelete(transaction.id);
      setShowConfirmDelete(false);
      onClose();
    } catch (error) {
      console.error(error);
      alert('Erro ao excluir a transação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className={`rounded-lg p-6 w-full max-w-md relative ${
          editedTransaction.tipo === 'receita' ? 'bg-green-100' : 'bg-red-100'
        }`}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-semibold mb-4">Editar Transação</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={editedTransaction.descricao}
            onChange={(e) => setEditedTransaction({ ...editedTransaction, descricao: e.target.value })}
            placeholder="Descrição"
            className="w-full border rounded px-3 py-2"
          />
          <input
            type="text"
            inputMode="numeric"
            value={formattedValor}
            onChange={handleValorChange}
            placeholder="Valor"
            className="w-full border rounded px-3 py-2"
          />
          <input
            type="text"
            value={editedTransaction.categoria}
            onChange={(e) => setEditedTransaction({ ...editedTransaction, categoria: e.target.value })}
            placeholder="Categoria"
            className="w-full border rounded px-3 py-2"
          />
          <input
            type="date"
            value={editedTransaction.data.split('T')[0]}
            onChange={(e) => setEditedTransaction({ ...editedTransaction, data: e.target.value })}
            className="w-full border rounded px-3 py-2"
          />
          <div className="flex justify-between mb-4">
            <button
              type="button"
              className={`w-1/2 px-4 py-2 rounded ${
                editedTransaction.tipo === 'receita' ? 'bg-green-500 text-white' : 'bg-gray-200'
              }`}
              onClick={() => setEditedTransaction({ ...editedTransaction, tipo: 'receita' })}
            >
              Receita
            </button>
            <button
              type="button"
              className={`w-1/2 px-4 py-2 rounded ${
                editedTransaction.tipo === 'despesa' ? 'bg-red-500 text-white' : 'bg-gray-200'
              }`}
              onClick={() => setEditedTransaction({ ...editedTransaction, tipo: 'despesa' })}
            >
              Despesa
            </button>
          </div>

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={() => setShowConfirmDelete(true)}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50"
              disabled={loading}
            >
              Excluir
            </button>
            <div className="space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </form>

        {/* Modal de confirmação de exclusão */}
        {showConfirmDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 shadow-lg w-full max-w-sm">
              <h3 className="text-lg font-medium mb-4">Tem certeza que deseja excluir?</h3>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowConfirmDelete(false)}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteConfirmed}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
