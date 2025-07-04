import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, PieChart, Plus, Receipt, Target, FileText, Download } from 'lucide-react';
import { staffAPI } from '../../services/api';

interface Transaction {
  id: number;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  currency: string;
  vat_rate: number;
  vat_amount: number;
  description: string;
  responsible_staff: string;
  justification: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  hmrc_category?: string;
}

interface Budget {
  id: number;
  category: string;
  allocated: number;
  spent: number;
  currency: string;
  period: 'monthly' | 'quarterly' | 'yearly';
  fiscal_year: number;
  last_updated: string;
}

interface Forecast {
  month: string;
  estimated: number;
  actual: number;
  currency: string;
}

const MuseFuzeFinances: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [forecasts, setForecasts] = useState<Forecast[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [transactionForm, setTransactionForm] = useState({
    type: 'expense' as 'income' | 'expense',
    category: '',
    amount: 0,
    description: '',
    justification: '',
    vat_rate: 20
  });
  const [budgetForm, setBudgetForm] = useState({
    category: '',
    allocated: 0,
    period: 'monthly' as 'monthly' | 'quarterly' | 'yearly'
  });
  const [fundsForm, setFundsForm] = useState({
    amount: 0,
    source: '',
    description: ''
  });

  useEffect(() => {
    fetchFinancialData();
  }, []);

  const fetchFinancialData = async () => {
    try {
      const [transactionsRes, budgetsRes, forecastsRes] = await Promise.all([
        staffAPI.getTransactions(),
        staffAPI.getBudgets(),
        staffAPI.getForecasts()
      ]);
      
      setTransactions(transactionsRes.data);
      setBudgets(budgetsRes.data);
      setForecasts(forecastsRes.data);
    } catch (error) {
      console.error('Failed to fetch financial data:', error);
      setTransactions([]);
      setBudgets([]);
      setForecasts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTransactionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await staffAPI.createTransaction({
        ...transactionForm,
        vat_rate: transactionForm.vat_rate
      });
      fetchFinancialData();
      setShowTransactionForm(false);
      setTransactionForm({
        type: 'expense' as 'income' | 'expense',
        category: '',
        amount: 0,
        description: '',
        justification: '',
        vat_rate: 20
      });
    } catch (error) {
      console.error('Failed to create transaction:', error);
      alert('Failed to create transaction. Please try again.');
    }
  };

  const handleBudgetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await staffAPI.createBudget(budgetForm);
      fetchFinancialData();
      setShowBudgetForm(false);
      setBudgetForm({
        category: '',
        allocated: 0,
        period: 'monthly' as 'monthly' | 'quarterly' | 'yearly'
      });
    } catch (error) {
      console.error('Failed to create budget:', error);
      alert('Failed to create budget. Please try again.');
    }
  };

  const handleAddFunds = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await staffAPI.createTransaction({
        type: 'income',
        category: 'Funding',
        amount: fundsForm.amount,
        description: `Funds added: ${fundsForm.source}`,
        justification: fundsForm.description
      });
      fetchFinancialData();
      setShowAddFunds(false);
      setFundsForm({
        amount: 0,
        source: '',
        description: ''
      });
    } catch (error) {
      console.error('Failed to add funds:', error);
      alert('Failed to add funds. Please try again.');
    }
  };

  const generateTaxReport = async () => {
    try {
      // Calculate totals for current fiscal year
      const currentYear = new Date().getFullYear();
      const yearTransactions = transactions.filter(t => 
        new Date(t.date).getFullYear() === currentYear && t.status === 'approved'
      );
      
      const totalIncome = yearTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const totalExpenses = yearTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const totalVAT = yearTransactions
        .reduce((sum, t) => sum + (t.vat_amount || 0), 0);
      
      const netProfit = totalIncome - totalExpenses;
      
      const reportData = {
        fiscal_year: currentYear,
        period_start: `${currentYear}-04-06`, // UK tax year starts April 6th
        period_end: `${currentYear + 1}-04-05`,
        total_income: totalIncome,
        total_expenses: totalExpenses,
        total_vat: totalVAT,
        net_profit: netProfit,
        transactions: yearTransactions,
        generated_date: new Date().toISOString()
      };
      
      // Create downloadable report
      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `HMRC-Tax-Report-${currentYear}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      alert('HMRC tax report generated and downloaded successfully!');
    } catch (error) {
      console.error('Failed to generate tax report:', error);
      alert('Failed to generate tax report. Please try again.');
    }
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

  // Calculate totals in GBP
  const totalIncome = transactions.filter(t => t.type === 'income' && t.status === 'approved').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'expense' && t.status === 'approved').reduce((sum, t) => sum + t.amount, 0);
  const netIncome = totalIncome - totalExpenses;
  const totalBudgetAllocated = budgets.reduce((sum, b) => sum + b.allocated, 0);
  const totalBudgetSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const totalVAT = transactions.reduce((sum, t) => sum + (t.vat_amount || 0), 0);

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
            MuseFuze Finances (UK)
          </h2>
          <p className="text-gray-400">Financial tracking and HMRC compliance for UK operations</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowAddFunds(true)}
            className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-emerald-500/25"
          >
            <Plus className="h-4 w-4" />
            <span>Add Funds</span>
          </button>
          <button
            onClick={generateTaxReport}
            className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-indigo-500/25"
          >
            <FileText className="h-4 w-4" />
            <span>HMRC Report</span>
          </button>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-gradient-to-br from-green-900/30 to-green-800/30 rounded-xl p-6 border border-green-500/30">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="h-8 w-8 text-green-400" />
            <span className="text-2xl font-bold text-white">£{totalIncome.toLocaleString()}</span>
          </div>
          <h3 className="text-green-300 font-medium mb-2">Total Income</h3>
          <div className="text-sm text-gray-400">This period</div>
        </div>

        <div className="bg-gradient-to-br from-red-900/30 to-red-800/30 rounded-xl p-6 border border-red-500/30">
          <div className="flex items-center justify-between mb-4">
            <TrendingDown className="h-8 w-8 text-red-400" />
            <span className="text-2xl font-bold text-white">£{totalExpenses.toLocaleString()}</span>
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
            <span className="text-2xl font-bold text-white">£{netIncome.toLocaleString()}</span>
          </div>
          <h3 className={`font-medium mb-2 ${netIncome >= 0 ? 'text-blue-300' : 'text-orange-300'}`}>Net Profit</h3>
          <div className="text-sm text-gray-400">Income - Expenses</div>
        </div>

        <div className="bg-gradient-to-br from-yellow-900/30 to-yellow-800/30 rounded-xl p-6 border border-yellow-500/30">
          <div className="flex items-center justify-between mb-4">
            <Receipt className="h-8 w-8 text-yellow-400" />
            <span className="text-2xl font-bold text-white">£{totalVAT.toLocaleString()}</span>
          </div>
          <h3 className="text-yellow-300 font-medium mb-2">Total VAT</h3>
          <div className="text-sm text-gray-400">Collected/Paid</div>
        </div>

        <div className="bg-gradient-to-br from-violet-900/30 to-violet-800/30 rounded-xl p-6 border border-violet-500/30">
          <div className="flex items-center justify-between mb-4">
            <Target className="h-8 w-8 text-violet-400" />
            <span className="text-2xl font-bold text-white">{totalBudgetAllocated > 0 ? Math.round((totalBudgetSpent / totalBudgetAllocated) * 100) : 0}%</span>
          </div>
          <h3 className="text-violet-300 font-medium mb-2">Budget Used</h3>
          <div className="text-sm text-gray-400">£{totalBudgetSpent.toLocaleString()} / £{totalBudgetAllocated.toLocaleString()}</div>
        </div>
      </div>

      {/* Add Funds Modal */}
      {showAddFunds && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-8 max-w-lg w-full border border-gray-700">
            <h3 className="text-2xl font-bold text-white mb-6">Add Funds</h3>
            
            <form onSubmit={handleAddFunds} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Amount (£) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={fundsForm.amount}
                  onChange={(e) => setFundsForm({ ...fundsForm, amount: parseFloat(e.target.value) || 0 })}
                  required
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Source *
                </label>
                <select
                  value={fundsForm.source}
                  onChange={(e) => setFundsForm({ ...fundsForm, source: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Select funding source</option>
                  <option value="Personal Investment">Personal Investment</option>
                  <option value="Angel Investor">Angel Investor</option>
                  <option value="Grant">Grant</option>
                  <option value="Revenue">Revenue</option>
                  <option value="Loan">Loan</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  value={fundsForm.description}
                  onChange={(e) => setFundsForm({ ...fundsForm, description: e.target.value })}
                  required
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Describe the funding source and purpose"
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowAddFunds(false)}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-lg transition-all shadow-lg hover:shadow-emerald-500/25"
                >
                  Add Funds
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                    VAT Rate (%) *
                  </label>
                  <select
                    value={transactionForm.vat_rate}
                    onChange={(e) => setTransactionForm({ ...transactionForm, vat_rate: parseFloat(e.target.value) })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    <option value={0}>0% (Zero-rated)</option>
                    <option value={5}>5% (Reduced rate)</option>
                    <option value={20}>20% (Standard rate)</option>
                  </select>
                </div>
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
                  <option value="Office Expenses">Office Expenses</option>
                  <option value="Travel">Travel</option>
                  <option value="Legal & Professional">Legal & Professional</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Amount (£) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={transactionForm.amount}
                  onChange={(e) => setTransactionForm({ ...transactionForm, amount: parseFloat(e.target.value) || 0 })}
                  required
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                  placeholder="0.00"
                />
                {transactionForm.amount > 0 && transactionForm.vat_rate > 0 && (
                  <p className="text-sm text-gray-400 mt-1">
                    VAT: £{((transactionForm.amount * transactionForm.vat_rate) / 100).toFixed(2)}
                  </p>
                )}
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
                  Business Justification *
                </label>
                <textarea
                  value={transactionForm.justification}
                  onChange={(e) => setTransactionForm({ ...transactionForm, justification: e.target.value })}
                  required
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                  placeholder="Explain why this transaction is necessary for the business (required for HMRC compliance)"
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
                  <option value="Office Expenses">Office Expenses</option>
                  <option value="Travel">Travel</option>
                  <option value="Legal & Professional">Legal & Professional</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Allocated Amount (£) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={budgetForm.allocated}
                  onChange={(e) => setBudgetForm({ ...budgetForm, allocated: parseFloat(e.target.value) || 0 })}
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

      {/* Rest of the component remains the same... */}
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
              onChange={(e) => setSelecte