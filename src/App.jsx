import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { TransactionForm } from './components/TransactionForm';
import { TransactionList } from './components/TransactionList';
import { BalanceCard } from './components/BalanceCard';
import { FilterBar } from './components/FilterBar';
import { Statistics } from './components/Statistics';
import { PieChart, List } from 'lucide-react';

function App() {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [activeView, setActiveView] = useState('transactions');
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    let storedUserId = localStorage.getItem('finance_user_id');
    if (!storedUserId) {
      storedUserId = 'user_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('finance_user_id', storedUserId);
    }
    setUserId(storedUserId);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (userId) {
      fetchTransactions();
    }
  }, [userId]);

  useEffect(() => {
    filterTransactions();
  }, [transactions, filterPeriod]);

  const fetchTransactions = async () => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('transaction_date', { ascending: false });

    if (!error && data) {
      setTransactions(data);
    }
  };

  const filterTransactions = () => {
    const now = new Date();
    let filtered = [...transactions];

    switch (filterPeriod) {
      case 'daily': {
        const today = now.toISOString().split('T')[0];
        filtered = transactions.filter(t => t.transaction_date === today);
        break;
      }
      case 'weekly': {
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        filtered = transactions.filter(t => new Date(t.transaction_date) >= weekAgo);
        break;
      }
      case 'monthly': {
        const monthAgo = new Date(now);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        filtered = transactions.filter(t => new Date(t.transaction_date) >= monthAgo);
        break;
      }
      case 'yearly': {
        const yearAgo = new Date(now);
        yearAgo.setFullYear(yearAgo.getFullYear() - 1);
        filtered = transactions.filter(t => new Date(t.transaction_date) >= yearAgo);
        break;
      }
      case 'all':
      default:
        filtered = transactions;
    }

    setFilteredTransactions(filtered);
  };

  const handleTransactionAdded = () => {
    fetchTransactions();
    setEditingTransaction(null);
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setActiveView('transactions');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (!error) {
        fetchTransactions();
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">Personal Finance Tracker</h1>
            <p className="text-gray-600 mt-1">Manage your income and expenses</p>
          </div>
        </div>

        <BalanceCard transactions={filteredTransactions} />

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveView('transactions')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
              activeView === 'transactions'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <List className="w-4 h-4" />
            Transactions
          </button>
          <button
            onClick={() => setActiveView('statistics')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
              activeView === 'statistics'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <PieChart className="w-4 h-4" />
            Statistics
          </button>
        </div>

        {activeView === 'transactions' ? (
          <>
            <TransactionForm
              onTransactionAdded={handleTransactionAdded}
              editTransaction={editingTransaction}
              onCancelEdit={() => setEditingTransaction(null)}
              userId={userId}
            />

            <FilterBar
              selectedPeriod={filterPeriod}
              onPeriodChange={setFilterPeriod}
            />

            <TransactionList
              transactions={filteredTransactions}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </>
        ) : (
          <>
            <FilterBar
              selectedPeriod={filterPeriod}
              onPeriodChange={setFilterPeriod}
            />
            <Statistics transactions={filteredTransactions} filterPeriod={filterPeriod} />
          </>
        )}
      </div>
    </div>
  );
}

export default App;
