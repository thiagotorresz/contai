import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Transaction } from '../lib/mockData';
import supabase from '../lib/supabaseClient';

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

  useEffect(() => {
    setEditedTransaction(transaction);
  }, [transaction]);  

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

    try {
      const { error } = await supabase
        .from('transacoes')
        .update({
          tipo: editedTransaction.tipo,
          descricao: editedTransaction.descricao,
          valor: editedTransaction.valor,
          data: editedTransaction.data,
          categoria: editedTransaction.categoria,
        })
        .eq('id', transaction.id)
        .eq('userid', editedTransaction.userid); // garante que o usuário só atualize suas próprias transações

      if (error) throw error;

      onSave(editedTransaction);
      onClose();
      window.location.reload(); // Recarrega a página após salvar
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar a transação');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirmed = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('transacoes')
        .delete()
        .eq('id', transaction.id)
        .eq('userid', transaction.userid);

      if (error) throw error;

      onDelete(transaction.id);
      setShowConfirmDelete(false);
      onClose();
      window.location.reload(); // Recarrega a página após excluir
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
        className={`rounded-lg p-6 w-full max-w-md relative ${editedTransaction.tipo === 'receita' ? 'bg-green-100' : 'bg-red-100'
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
              className={`w-1/2 px-4 py-2 rounded ${editedTransaction.tipo === 'receita' ? 'bg-green-500 text-white' : 'bg-gray-200'
                }`}
              onClick={() => setEditedTransaction({ ...editedTransaction, tipo: 'receita' })}
            >
              Receita
            </button>
            <button
              type="button"
              className={`w-1/2 px-4 py-2 rounded ${editedTransaction.tipo === 'despesa' ? 'bg-red-500 text-white' : 'bg-gray-200'
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
