import React, { useState, useEffect } from 'react';
import { NewTransactionModal } from './NewTransactionModal';
import { ArrowUpCircle, ArrowDownCircle, Search } from 'lucide-react';
import { parseISO, format } from 'date-fns';

interface Props {
  transactions: Transaction[];
  onTransactionClick: (transaction: Transaction) => void;
  onTransactionUpdate: (updated: Transaction) => void;
  onTransactionDelete: (id: number) => void;
}

export const TransactionList: React.FC<Props> = ({
  transactions,
  onTransactionClick,
  onTransactionUpdate,
  onTransactionDelete,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [list, setList] = useState<Transaction[]>([]);

  useEffect(() => {
    const sorted = [...transactions].sort(
      (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()
    );
    setList(sorted);
  }, [transactions]);

  const handleAddTransaction = (newTransaction: Transaction) => {
    const updatedList = [newTransaction, ...list].sort(
      (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()
    );
    setList(updatedList);
  };

  function capitalizeFirst(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function removeAccents(str: string) {
    return str.normalize('NFD').replace(/\p{Diacritic}/gu, '');
  }

  const filteredList = list.filter((transaction) => {
    const search = removeAccents(searchTerm.toLowerCase());
    const descricao = removeAccents(transaction.descricao.toLowerCase());
    const categoria = removeAccents(transaction.categoria.toLowerCase());
    const dataFormatada = removeAccents(format(parseISO(transaction.data), 'dd/MM/yyyy'));

    return (
      descricao.includes(search) ||
      categoria.includes(search) ||
      dataFormatada.includes(search)
    );
  });

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Transações</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-400 text-white px-3 py-1 rounded-full hover:bg-blue-600"
        >
          +
        </button>
      </div>

      <NewTransactionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onAdd={handleAddTransaction}
      />

      <div className="relative mb-4">
        <Search className="absolute left-3 top-2.5 text-gray-400" />
        <input
          type="text"
          placeholder="Pesquisar por nome, data ou categoria..."
          className="w-full pl-10 pr-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredList.length === 0 ? (
        <p className="text-center text-gray-500">Nenhuma transação encontrada.</p>
      ) : (
        <div className="space-y-4">
          {filteredList.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => onTransactionClick(transaction)}
            >
              <div className="flex items-center space-x-4">
                {transaction.tipo === 'receita' ? (
                  <ArrowUpCircle className="w-6 h-6 text-green-500" />
                ) : (
                  <ArrowDownCircle className="w-6 h-6 text-red-500" />
                )}
                <div>
                  <p className="font-medium">{capitalizeFirst(transaction.descricao)}</p>
                  <p className="text-sm text-gray-500">
                    {format(parseISO(transaction.data), 'dd/MM/yyyy')} • {transaction.categoria}
                  </p>
                </div>
              </div>
              <span
                className={`font-semibold ${
                  transaction.tipo === 'receita' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {transaction.tipo === 'receita' ? '+' : '-'} R$ {Number(transaction.valor).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
