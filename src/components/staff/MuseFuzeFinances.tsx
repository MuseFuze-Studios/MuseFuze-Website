import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, PieChart, Plus, Calendar, Receipt, AlertTriangle, Target, CreditCard } from 'lucide-react';

interface Transaction {
  id: number;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  responsible_staff: string;
  justification: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface Budget {
  id: number;
  category: string;
  allocated: number;
  spent: number;
  period: 'monthly' | 'quarterly' | 'yearly';
  last_updated: string;
}

interface Forecast {
  month: string;
  estimated: number;
  actual: number;
}

const MuseFuzeFinances: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [forecasts, setForecasts] = useState<Forecast[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [transactionForm, setTransactionForm] = useState({
    type: 'expense' as const,
    category: '',
    amount: 0,
    description: '',
    justification: ''
  });
  const [budgetForm, setBudgetForm] = useState({
    category: '',
    allocated: 0,
    period: 'monthly' as const
  });

  useEffect(() => {
    fetchFinancialData();
  }, []);

  const fetchFinancialData = async () => {
    try {
      // Mock data for demonstration
      const mockTransactions: Transaction[] = [
        {
          id: 1,
          type: 'expense',
          category: 'Software Licenses',
          amount: 299.99,
          description: 'Unity Pro subscription renewal',
          responsible_staff: 'John Doe',
          justification: 'Required for advanced rendering features in upcoming build',
          date: new Date(Date.now() - 86400000).toISOString(),
          status: 'approved'
        },
        {
          id: 2,
          type: 'expense',
          category: 'Marketing',
          amount: 150.00,
          description: 'Social media advertising campaign',
          responsible_staff: 'Sarah Wilson',
          justification: 'Promote alpha build to increase tester recruitment',
          date: new Date(Date.now() - 172800000).toISOString(),
          status: 'approved'
        },
        {
          id: 3,
          type: 'income',
          category: 'Funding',
          amount: 5000.00,
          description: 'Angel investor contribution',
          responsible_staff: 'Mike Johnson',
          justification: 'Series A funding round - development milestone reached',
          date: new Date(Date.now() - 259200000).toISOString(),
          status: 'approved'
        },
        {
          id: 4,
          type: 'expense',
          category: 'Hardware',
          amount: 1200.00,
          description: 'Development workstation upgrade',
          responsible_staff: 'Alice Brown',
          justification: 'Current hardware insufficient for performance testing',
          date: new Date(Date.now() - 345600000).toISOString(),
          status: 'pending'
        },
        {
          id: 5,
          type: 'expense',
          category: 'Services',
          amount: 89.99,
          description: 'Cloud storage and backup services',
          responsible_staff: 'David Lee',
          justification: 'Secure backup solution for source code and assets',
          date: new Date(Date.now() - 432000000).toISOString(),
          status: 'approved'
        }
      ];

      const mockBudgets: Budget[] = [
        {
          id: 1,
          category: 'Software Licenses',
          allocated: 500.00,
          spent: 299.99,
          period: 'monthly',
          last_updated: new Date().toISOString()
        },
        {
          id: 2,
          category: 'Marketing',
          allocated: 300.00,
          spent: 150.00,
          period: 'monthly',
          last_updated: new Date().toISOString()
        },
        {
          id: 3,
          category: 'Hardware',
          allocated: 2000.00,
          spent: 1200.00,
          period: 'quarterly',
          last_updated: new Date().toISOString()
        },
        {
          id: 4,
          category: 'Services',
          allocated: 200.00,
          spent: 89.99,
          period: 'monthly',
          last_updated: new Date().toISOString()
        },
        {
          id: 5,
          category: 'Development',
          allocated: 1500.00,
          spent: 0,
          period: 'monthly',
          last_updated: new Date().toISOString()
        }
      ];

      const mockForecasts: Forecast[] = [
        { month: 'Jan 2025', estimated: 3000, actual: 2850 },
        { month: 'Feb 2025', estimated: 3200, actual: 3100 },
        { month: 'Mar 2025', estimated: 2800, actual: 2950 },
        { month: 'Apr 2025', estimated: 3500, actual: 0 }, // Future month
        { month: 'May 2025', estimated: 3300, actual: 0 }, // Future month
        { month: 'Jun 2025', estimated: 3600, actual: 0 }  // Future month
      ];

      setTransactions(mockTransactions);
      setBudgets(mockBudgets);
      setForecasts(mockForecasts);
    } catch (error) {
      console.error('Failed to fetch financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTransactionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Implementation would submit transaction
    setShowTransactionForm(false);
    setTransactionForm({
      type: 'expense',
      category: '',
      amount: 0,
      description: '',
      justification: ''
    });
  };

  const handleBudgetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Implementation would submit budget
    setShowBudgetForm(false);
    setBudgetForm({
      category: '',
      allocated: 0,
      period: 'monthly'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-400 bg-green-900/30';
      case 'pending': return 'text-yellow-400 bg-yellow-900/30';
      case 'rejected': return 'text-red-400 bg-red-900/30';
      default: return 'text-gray-400 bg-gray-900/30';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Software Licenses': 'text-blue-400 bg-blue-900/30',
      'Marketing': 'text-purple-400 bg-purple-900/30',
      'Hardware': 'text-orange-400 bg-orange-900/30',
      'Services': 'text-green-400 bg-green-900/30',
      'Development': 'text-violet-400 bg-violet-900/30',
      'Funding': 'text-emerald-400 bg-emerald-900/30'
    };
    return colors[category as keyof typeof colors] || 'text-gray-400 bg-gray-900/30';
  };

  const getBudgetUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-400 bg-red-900/30';
    if (percentage >= 75) return 'text-yellow-400 bg-yellow-900/30';
    return 'text-green-400 bg-green-900/30';
  };

  // Calculate totals
  const totalIncome = transactions.filter(t => t.type === 'income' && t.status === 'approved').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'expense' && t.status === 'approved').reduce((sum, t) => sum + t.amount, 0);
  const netIncome = totalIncome - totalExpenses;
  const totalBudgetAllocated = budgets.reduce((sum, b) => sum + b.allocated, 0);
  const totalBudgetSpent = budgets.reduce((sum, b) => sum + b.spent, 0);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-400"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2 flex items-center">
            <DollarSign className="h-6 w-6 mr-2" />
            MuseFuze Finances
          </h2>
          <p className="text-gray-400">Internal financial tracking and budget management</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowBudgetForm(true)}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-blue-500/25"
          >
            <Target className="h-4 w-4" />
            <span>Set Budget</span>
          </button>
          <button
            onClick={() => setShowTransactionForm(true)}
            className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-violet-500/25"
          >
            <Plus className="h-4 w-4" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-green-900/30 to-green-800/30 rounded-xl p-6 border border-green-500/30">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="h-8 w-8 text-green-400" />
            <span className="text-2xl font-bold text-white">${totalIncome.toLocaleString()}</span>
          </div>
          <h3 className="text-green-300 font-medium mb-2">Total Income</h3>
          <div className="text-sm text-gray-400">This period</div>
        </div>

        <div className="bg-gradient-to-br from-red-900/30 to-red-800/30 rounded-xl p-6 border border-red-500/30">
          <div className="flex items-center justify-between mb-4">
            <TrendingDown className="h-8 w-8 text-red-400" />
            <span className="text-2xl font-bold text-white">${totalExpenses.toLocaleString()}</span>
          </div>
          <h3 className="text-red-300 font-medium mb-2">Total Expenses</h3>
          <div className="text-sm text-gray-400">This period</div>
        </div>

        <div className={`bg-gradient-to-br rounded-xl p-6 border ${
          netIncome >= 0 
            ? 'from-blue-900/30 to-blue-800/30 border-blue-500/30' 
            : 'from-orange-900/30 to-orange-800/30 border-orange-500/30'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <DollarSign className={`h-8 w-8 ${netIncome >= 0 ? 'text-blue-400' : 'text-orange-400'}`} />
            <span className="text-2xl font-bold text-white">${netIncome.toLocaleString()}</span>
          </div>
          <h3 className={`font-medium mb-2 ${netIncome >= 0 ? 'text-blue-300' : 'text-orange-300'}`}>Net Income</h3>
          <div className="text-sm text-gray-400">Income - Expenses</div>
        </div>

        <div className="bg-gradient-to-br from-violet-900/30 to-violet-800/30 rounded-xl p-6 border border-violet-500/30">
          <div className="flex items-center justify-between mb-4">
            <Target className="h-8 w-8 text-violet-400" />
            <span className="text-2xl font-bold text-white">{Math.round((totalBudgetSpent / totalBudgetAllocated) * 100)}%</span>
          </div>
          <h3 className="text-violet-300 font-medium mb-2">Budget Used</h3>
          <div className="text-sm text-gray-400">${totalBudgetSpent.toLocaleString()} / ${totalBudgetAllocated.toLocaleString()}</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        {/* Budget Tracker */}
        <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-white flex items-center">
              <Target className="h-5 w-5 mr-2 text-violet-400" />
              Budget Tracker
            </h3>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
          
          <div className="space-y-4">
            {budgets.filter(b => b.period === selectedPeriod).map((budget) => {
              const percentage = (budget.spent / budget.allocated) * 100;
              return (
                <div key={budget.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className={`px-2 py-1 rounded text-sm font-medium ${getCategoryColor(budget.category)}`}>
                      {budget.category}
                    </span>
                    <div className="text-right">
                      <div className="text-white font-medium">${budget.spent.toLocaleString()} / ${budget.allocated.toLocaleString()}</div>
                      <div className={`text-sm font-medium ${getBudgetUsageColor(percentage).split(' ')[0]}`}>
                        {percentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        percentage >= 90 ? 'bg-red-500' :
                        percentage >= 75 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Forecast Chart */}
        <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center">
            <PieChart className="h-5 w-5 mr-2 text-blue-400" />
            Expense Forecast
          </h3>
          
          <div className="space-y-4">
            {forecasts.map((forecast, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-gray-300">{forecast.month}</span>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-blue-400 text-sm">Est: ${forecast.estimated.toLocaleString()}</div>
                    {forecast.actual > 0 && (
                      <div className="text-white text-sm">Act: ${forecast.actual.toLocaleString()}</div>
                    )}
                  </div>
                  <div className="w-24 bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${forecast.actual > 0 ? (forecast.actual / forecast.estimated) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Transaction Log */}
      <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center">
          <Receipt className="h-5 w-5 mr-2 text-amber-400" />
          Recent Transactions
        </h3>
        
        <div className="space-y-4">
          {transactions.slice(0, 5).map((transaction) => (
            <div key={transaction.id} className="flex justify-between items-center p-4 bg-gray-700/30 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <span className={`px-2 py-1 rounded text-sm font-medium ${getCategoryColor(transaction.category)}`}>
                    {transaction.category}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                    {transaction.status.toUpperCase()}
                  </span>
                </div>
                <h4 className="text-white font-medium">{transaction.description}</h4>
                <p className="text-gray-400 text-sm">{transaction.justification}</p>
                <div className="text-xs text-gray-500 mt-1">
                  By {transaction.responsible_staff} • {new Date(transaction.date).toLocaleDateString()}
                </div>
              </div>
              <div className="text-right">
                <div className={`text-lg font-bold ${
                  transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transaction Form Modal */}
      {showTransactionForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
            <h3 className="text-2xl font-bold text-white mb-6">Add Transaction</h3>
            
            <form onSubmit={handleTransactionSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Type *
                  </label>
                  <select
                    value={transactionForm.type}
                    onChange={(e) => setTransactionForm({ ...transactionForm, type: e.target.value as 'income' | 'expense' })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Category *
                  </label>
                  <select
                    value={transactionForm.category}
                    onChange={(e) => setTransactionForm({ ...transactionForm, category: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="">Select category</option>
                    <option value="Software Licenses">Software Licenses</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Hardware">Hardware</option>
                    <option value="Services">Services</option>
                    <option value="Development">Development</option>
                    <option value="Funding">Funding</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Amount ($) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={transactionForm.amount}
                  onChange={(e) => setTransactionForm({ ...transactionForm, amount: parseFloat(e.target.value) })}
                  required
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description *
                </label>
                <input
                  type="text"
                  value={transactionForm.description}
                  onChange={(e) => setTransactionForm({ ...transactionForm, description: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                  placeholder="Brief description of the transaction"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Justification *
                </label>
                <textarea
                  value={transactionForm.justification}
                  onChange={(e) => setTransactionForm({ ...transactionForm, justification: e.target.value })}
                  required
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                  placeholder="Explain why this transaction is necessary for the business"
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowTransactionForm(false)}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-lg transition-all shadow-lg hover:shadow-violet-500/25"
                >
                  Add Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Budget Form Modal */}
      {showBudgetForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-8 max-w-lg w-full border border-gray-700">
            <h3 className="text-2xl font-bold text-white mb-6">Set Budget</h3>
            
            <form onSubmit={handleBudgetSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Category *
                </label>
                <select
                  value={budgetForm.category}
                  onChange={(e) => setBudgetForm({ ...budgetForm, category: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value="">Select category</option>
                  <option value="Software Licenses">Software Licenses</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Hardware">Hardware</option>
                  <option value="Services">Services</option>
                  <option value="Development">Development</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Allocated Amount ($) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={budgetForm.allocated}
                  onChange={(e) => setBudgetForm({ ...budgetForm, allocated: parseFloat(e.target.value) })}
                  required
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Period *
                </label>
                <select
                  value={budgetForm.period}
                  onChange={(e) => setBudgetForm({ ...budgetForm, period: e.target.value as 'monthly' | 'quarterly' | 'yearly' })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowBudgetForm(false)}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg transition-all shadow-lg hover:shadow-blue-500/25"
                >
                  Set Budget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MuseFuzeFinances;