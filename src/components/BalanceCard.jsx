import { Wallet, TrendingUp, TrendingDown } from 'lucide-react';

export function BalanceCard({ transactions }) {
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const balance = totalIncome - totalExpense;

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md p-6 text-white">
        <div className="flex items-center justify-between mb-2">
          <span className="text-blue-100 text-sm font-medium">Current Balance</span>
          <Wallet className="w-5 h-5 text-blue-100" />
        </div>
        <p className="text-3xl font-bold">{formatAmount(balance)}</p>
      </div>

      <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-md p-6 text-white">
        <div className="flex items-center justify-between mb-2">
          <span className="text-green-100 text-sm font-medium">Total Income</span>
          <TrendingUp className="w-5 h-5 text-green-100" />
        </div>
        <p className="text-3xl font-bold">{formatAmount(totalIncome)}</p>
      </div>

      <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-md p-6 text-white">
        <div className="flex items-center justify-between mb-2">
          <span className="text-red-100 text-sm font-medium">Total Expenses</span>
          <TrendingDown className="w-5 h-5 text-red-100" />
        </div>
        <p className="text-3xl font-bold">{formatAmount(totalExpense)}</p>
      </div>
    </div>
  );
}
