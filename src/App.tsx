import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, parseISO, addDays, subDays } from 'date-fns';
import { Wallet } from 'lucide-react';
import { TransactionList } from './components/TransactionList';
import { ExpenseChart } from './components/ExpenseChart';
import { RevenueVsExpenseChart } from './components/RevenueVsExpenseChart';
import { LoadingSpinner } from './components/LoadingSpinner';
import { Transaction } from './lib/mockData';
import { TransactionModal } from './components/TransactionModal';
import { AccountMenu } from './components/AccountMenu';
import { WeeklyCalendar } from './components/WeeklyCalendar';
import { MonthSelector } from './components/MonthSelector';

function App() {
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState<number>(0);
  const [monthlyBalance, setMonthlyBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [modalOpen, setModalOpen] = useState(false);

  const weekDays = [
    subDays(new Date(), 3),
    subDays(new Date(), 2),
    subDays(new Date(), 1),
    new Date(),
    addDays(new Date(), 1),
    addDays(new Date(), 2),
    addDays(new Date(), 3),
  ];

  const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setModalOpen(true);
  };

  const handleTransactionUpdate = (updated: Transaction) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === updated.id ? updated : t))
    );
  };

  const handleTransactionDelete = (id: number) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, []);

  useEffect(() => {
    const fetchTransactions = async () => {
      const token = localStorage.getItem('token');

      try {
        const res = await fetch('http://localhost:4000/api/transactions', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 401) {
          navigate('/login');
          return;
        }

        const data = await res.json();
        console.log('Transações carregadas:', data);

        setTransactions(data);
        calculateBalance(data);
        calculateMonthlyBalance(data);
      } catch (err) {
        console.error('Erro ao buscar transações:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  useEffect(() => {
    calculateMonthlyBalance(transactions);
  }, [currentMonth, transactions]);

  const calculateBalance = (transactions: Transaction[]) => {
    const total = transactions.reduce((acc, transaction) => {
      const valor = Number(transaction.valor);
      return acc + (transaction.tipo === 'receita' ? valor : -valor);
    }, 0);

    setBalance(total);
  };

  const calculateMonthlyBalance = (transactions: Transaction[]) => {
    const monthTransactions = getMonthTransactions();
    const total = monthTransactions.reduce((acc, transaction) => {
      const valor = Number(transaction.valor);
      return acc + (transaction.tipo === 'receita' ? valor : -valor);
    }, 0);

    setMonthlyBalance(total);
  };

  const getMonthTransactions = () => {
    return transactions.filter(transaction => {
      try {
        const transactionDate = parseISO(transaction.data);
        return (
          transactionDate.getMonth() === currentMonth.getMonth() &&
          transactionDate.getFullYear() === currentMonth.getFullYear()
        );
      } catch (e) {
        console.warn('Data inválida em transação:', transaction);
        return false;
      }
    });
  };

  const getMonthlyTotals = () => {
    const monthTransactions = getMonthTransactions();
    const receitas = monthTransactions
      .filter(t => t.tipo === 'receita')
      .reduce((sum, t) => sum + Number(t.valor), 0);

    const despesas = monthTransactions
      .filter(t => t.tipo === 'despesa')
      .reduce((sum, t) => sum + Number(t.valor), 0);

    return { receitas, despesas };
  };

  const getExpensesByCategory = () => {
    const monthTransactions = getMonthTransactions();
    const expenses = monthTransactions
      .filter(t => t.tipo === 'despesa')
      .reduce((acc, transaction) => {
        const { categoria, valor } = transaction;
        const valorNumerico = Number(valor);
        if (!acc[categoria]) {
          acc[categoria] = 0;
        }
        acc[categoria] += valorNumerico;
        return acc;
      }, {} as Record<string, number>);

    return Object.entries(expenses).map(([categoria, valor]) => ({
      categoria,
      valor,
    }));
  };


  const { receitas: receita, despesas: despesa } = getMonthlyTotals();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Contaí</h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-white p-4 rounded-lg shadow">
              <Wallet className="w-6 h-6 text-blue-500" />
              <div>
                <p className="text-sm text-gray-500">Saldo Total</p>
                <p className={`text-xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
                <p className="text-xs text-gray-400">
                  Saldo mensal: {monthlyBalance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>
            </div>
            <AccountMenu />
          </div>
        </div>

        <WeeklyCalendar
          days={weekDays}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />

        <MonthSelector
          currentDate={currentMonth}
          onMonthChange={setCurrentMonth}
        />

        <div className="mb-8">
          <RevenueVsExpenseChart receita={receita} despesa={despesa} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <TransactionList
              transactions={transactions}
              onTransactionClick={handleTransactionClick}
              onTransactionUpdate={handleTransactionUpdate}
              onTransactionDelete={handleTransactionDelete}
            />
          </div>
          <div>
            <ExpenseChart expenses={getExpensesByCategory()} />
          </div>
        </div>

        {selectedTransaction && (
          <TransactionModal
            transaction={selectedTransaction}
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            onSave={(updated) => {
              handleTransactionUpdate(updated);
            }}
            onDelete={(id) => {
              handleTransactionDelete(id);
            }}
          />
        )}
      </div>
    </div>
  );
}

export default App;
