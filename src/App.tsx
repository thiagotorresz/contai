import React, { useEffect, useState } from 'react';
import supabase from './lib/supabaseClient';  // Importe o cliente Supabase
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
import { WeeklyCalendarML } from './components/WeeklyCalendarML';
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
    const fetchTransactions = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        // Supondo que você armazena o userid no localStorage (ou outro local)
        const userid = localStorage.getItem('userid');
        if (!userid) {
          navigate('/login');
          return;
        }

        // Buscando as transações do usuário
        const { data, error } = await supabase
          .from('transacoes')
          .select('*')
          .eq('userid', userid); // Filtrando pelas transações do usuário

        if (error) {
          console.error('Erro ao buscar transações:', error.message);
          return;
        }

        console.log('Transações carregadas:', data);

        setTransactions(data); // Atualizando o estado das transações
        calculateBalance(data); // Calculando o saldo
        calculateMonthlyBalance(data); // Calculando o saldo mensal
      } catch (err) {
        console.error('Erro ao buscar transações:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []); // Apenas executa uma vez após o componente ser montado  

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
    const monthTransactions = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.data);
      return (
        transactionDate.getMonth() === currentMonth.getMonth() &&
        transactionDate.getFullYear() === currentMonth.getFullYear()
      );
    });
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
        <div className="flex flex-col items-center md:grid md:grid-cols-3 md:items-center mb-8 gap-4 md:gap-12">

          <div className="absolute md:hidden top-4 right-4 z-10">
            <AccountMenu />
          </div>

          {/* Logo - centro no desktop, abaixo dos totalizadores no mobile */}
          <div className="w-full flex justify-center">
            <img
              src="./img/contai-logo.png"
              alt="Logo"
              className="h-24 md:h-20 object-contain"
            />
          </div>

          {/* Totalizadores - topo no mobile, esquerda no desktop */}
          <div className="w-full flex justify-center">
            <div className="flex flex-col items-center bg-white p-4 rounded-2xl shadow w-full max-w-2xl text-center">
              <div className="flex items-center justify-center space-x-2 mb-1">
                <Wallet className="w-9 h-9 text-blue-500" />
                <div className="flex flex-row items-center space-x-1 md:space-x-2">
                  <p className="text-lg sm:text-lg font-semibold text-gray-700">Saldo Total:</p>
                  <p className={`text-xl sm:text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                </div>
              </div>
              <p className="text-base sm:text-base text-gray-500">
                Saldo mensal:{" "}
                <span className="font-medium">
                  {monthlyBalance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </p>
            </div>
          </div>


          {/* Menu - abaixo da logo no mobile, direita no desktop */}
          <div className="w-full justify-center md:justify-end hidden md:flex">
            <AccountMenu />
          </div>
        </div>

        <div className="hidden md:block">
          <WeeklyCalendar
            days={weekDays}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
        </div>

        <div className="block md:hidden">
          <WeeklyCalendarML
            days={weekDays}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
        </div>

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
              transactions={getMonthTransactions()}
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
