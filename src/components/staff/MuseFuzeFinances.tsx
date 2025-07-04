import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, PieChart, Plus, Receipt, Target, FileText, Calculator, Download } from 'lucide-react';
import { staffAPI } from '../../services/api';

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
  vat_rate?: number;
  vat_amount?: number;
  net_amount?: number;
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

interface TaxReport {
  period: string;
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  vatOwed: number;
  corporationTax: number;
}

const MuseFuzeFinances: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [forecasts, setForecasts] = useState<Forecast[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [showFundsForm, setShowFundsForm] = useState(false);
  const [showTaxReport, setShowTaxReport] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [transactionForm, setTransactionForm] = useState({
    type: 'expense' as 'income' | 'expense',
    category: '',
    amount: 0,
    description: '',
    justification: '',
    vatRate: 20 // Default UK VAT rate
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
      // Set empty arrays as fallback
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
      const vatAmount = (transactionForm.amount * transactionForm.vatRate) / 100;
      const netAmount = transactionForm.amount - vatAmount;

      await staffAPI.createTransaction({
        ...transactionForm,
        vat_rate: transactionForm.vatRate,
        vat_amount: vatAmount,
        net_amount: netAmount
      });
      
      fetchFinancialData();
      setShowTransactionForm(false);
      setTransactionForm({
        type: 'expense' as 'income' | 'expense',
        category: '',
        amount: 0,
        description: '',
        justification: '',
        vatRate: 20
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

  const handleFundsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await staffAPI.createTransaction({
        type: 'income',
        category: 'Funding',
        amount: fundsForm.amount,
        description: `Funds added: ${fundsForm.source}`,
        justification: fundsForm.description,
        vatRate: 0 // No VAT on funding
      });
      
      fetchFinancialData();
      setShowFundsForm(false);
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

  const generateTaxReport = () => {
    const currentYear = new Date().getFullYear();
    const totalIncome = transactions.filter(t => t.type === 'income' && t.status === 'approved').reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions.filter(t => t.type === 'expense' && t.status === 'approved').reduce((sum, t) => sum + t.amount, 0);
    const netProfit = totalIncome - totalExpenses;
    const vatOwed = transactions.reduce((sum, t) => sum + (t.vat_amount || 0), 0);
    
    // UK Corporation Tax rate (simplified - actual rates vary by profit level)
    const corporationTaxRate = netProfit <= 250000 ? 0.19 : 0.25;
    const corporationTax = Math.max(0, netProfit * corporationTaxRate);

    return {
      period: `${currentYear} Tax Year`,
      totalIncome,
      totalExpenses,
      netProfit,
      vatOwed,
      corporationTax
    };
  };

  const downloadTaxReport = () => {
    const report = generateTaxReport();
    const csvContent = [
      ['MuseFuze Studios - HMRC Tax Report'],
      ['Period', report.period],
      [''],
      ['Income Summary'],
      ['Total Income', `£${report.totalIncome.toLocaleString()}`],
      [''],
      ['Expense Summary'],
      ['Total Expenses', `£${report.totalExpenses.toLocaleString()}`],
      [''],
      ['Profit & Loss'],
      ['Net Profit/Loss', `£${report.netProfit.toLocaleString()}`],
      [''],
      ['Tax Calculations'],
      ['VAT Owed', `£${report.vatOwed.toLocaleString()}`],
      ['Corporation Tax', `£${report.corporationTax.toLocaleString()}`],
      ['Total Tax Liability', `£${(report.vatOwed + report.corporationTax).toLocaleString()}`],
      [''],
      ['Generated', new Date().toLocaleString()],
      ['Company', 'MuseFuze Studios Ltd'],
      ['Prepared for', 'HMRC Submission']
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MuseFuze-Tax-Report-${new Date().getFullYear()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
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
      'Funding': 'text-emerald-400 bg-emerald-900/30',
      'Office Expenses': 'text-cyan-400 bg-cyan-900/30',
      'Travel': 'text-pink-400 bg-pink-900/30'
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
          <p className="text-gray-400">Financial tracking and HMRC compliance for MuseFuze Studios Ltd</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowTaxReport(true)}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-green-500/25"
          >
            <FileText className="h-4 w-4" />
            <span>Tax Report</span>
          </button>
          <button
            onClick={() => setShowFundsForm(true)}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-emerald-500/25"
          >
            <Plus className="h-4 w-4" />
            <span>Add Funds</span>
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
          <h3 className={`font-medium mb-2 ${netIncome >= 0 ? 'text-blue-300' : 'text-orange-300'}`}>Net Profit/Loss</h3>
          <div className="text-sm text-gray-400">Income - Expenses</div>
        </div>

        <div className="bg-gradient-to-br from-yellow-900/30 to-yellow-800/30 rounded-xl p-6 border border-yellow-500/30">
          <div className="flex items-center justify-between mb-4">
            <Calculator className="h-8 w-8 text-yellow-400" />
            <span className="text-2xl font-bold text-white">£{totalVAT.toLocaleString()}</span>
          </div>
          <h3 className="text-yellow-300 font-medium mb-2">VAT Owed</h3>
          <div className="text-sm text-gray-400">To HMRC</div>
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

      {/* Tax Report Modal */}
      {showTaxReport && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
              <FileText className="h-6 w-6 mr-2" />
              HMRC Tax Report
            </h3>
            
            {(() => {
              const report = generateTaxReport();
              return (
                <div className="space-y-6">
                  <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-500/30">
                    <h4 className="text-lg font-semibold text-blue-300 mb-3">Tax Year Summary</h4>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Period:</span>
                        <span className="text-white ml-2">{report.period}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Company:</span>
                        <span className="text-white ml-2">MuseFuze Studios Ltd</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-green-900/20 p-4 rounded-lg border border-green-500/30">
                      <h4 className="text-lg font-semibold text-green-300 mb-3">Income</h4>
                      <div className="text-2xl font-bold text-white">£{report.totalIncome.toLocaleString()}</div>
                    </div>

                    <div className="bg-red-900/20 p-4 rounded-lg border border-red-500/30">
                      <h4 className="text-lg font-semibold text-red-300 mb-3">Expenses</h4>
                      <div className="text-2xl font-bold text-white">£{report.totalExpenses.toLocaleString()}</div>
                    </div>
                  </div>

                  <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600">
                    <h4 className="text-lg font-semibold text-white mb-3">Tax Calculations</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Net Profit/Loss:</span>
                        <span className={`font-bold ${report.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          £{report.netProfit.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">VAT Owed (20%):</span>
                        <span className="text-yellow-400 font-bold">£{report.vatOwed.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Corporation Tax:</span>
                        <span className="text-orange-400 font-bold">£{report.corporationTax.toLocaleString()}</span>
                      </div>
                      <div className="border-t border-gray-600 pt-3">
                        <div className="flex justify-between text-lg">
                          <span className="text-white font-semibold">Total Tax Liability:</span>
                          <span className="text-red-400 font-bold">£{(report.vatOwed + report.corporationTax).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-900/20 p-4 rounded-lg border border-yellow-500/30">
                    <h4 className="text-lg font-semibold text-yellow-300 mb-2">HMRC Compliance Notes</h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>• VAT returns must be submitted quarterly</li>
                      <li>• Corporation Tax return due 12 months after year end</li>
                      <li>• Keep all receipts and invoices for 6 years</li>
                      <li>• Consider Making Tax Digital (MTD) requirements</li>
                    </ul>
                  </div>

                  <div className="flex justify-end space-x-4">
                    <button
                      onClick={() => setShowTaxReport(false)}
                      className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                    >
                      Close
                    </button>
                    <button
                      onClick={downloadTaxReport}
                      className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg transition-all shadow-lg hover:shadow-green-500/25 flex items-center space-x-2"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download Report</span>
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Add Funds Modal */}
      {showFundsForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-8 max-w-lg w-full border border-gray-700">
            <h3 className="text-2xl font-bold text-white mb-6">Add Funds</h3>
            
            <form onSubmit={handleFundsSubmit} className="space-y-6">
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
                  Funding Source *
                </label>
                <select
                  value={fundsForm.source}
                  onChange={(e) => setFundsForm({ ...fundsForm, source: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Select source</option>
                  <option value="Personal Investment">Personal Investment</option>
                  <option value="Business Loan">Business Loan</option>
                  <option value="Grant Funding">Grant Funding</option>
                  <option value="Revenue">Revenue</option>
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
                  onClick={() => setShowFundsForm(false)}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-lg transition-all shadow-lg hover:shadow-emerald-500/25"
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
                    <option value="Office Expenses">Office Expenses</option>
                    <option value="Travel">Travel</option>
                    <option value="Funding">Funding</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
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
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    VAT Rate (%) *
                  </label>
                  <select
                    value={transactionForm.vatRate}
                    onChange={(e) => setTransactionForm({ ...transactionForm, vatRate: parseFloat(e.target.value) })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    <option value={0}>0% (No VAT)</option>
                    <option value={5}>5% (Reduced Rate)</option>
                    <option value={20}>20% (Standard Rate)</option>
                  </select>
                </div>
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
                  placeholder="Explain why this transaction is necessary for the business (required for HMRC)"
                />
              </div>

              {transactionForm.amount > 0 && (
                <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-500/30">
                  <h4 className="text-blue-300 font-medium mb-2">VAT Calculation</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Net Amount:</span>
                      <div className="text-white font-medium">£{(transactionForm.amount - (transactionForm.amount * transactionForm.vatRate / 100)).toFixed(2)}</div>
                    </div>
                    <div>
                      <span className="text-gray-400">VAT ({transactionForm.vatRate}%):</span>
                      <div className="text-yellow-400 font-medium">£{(transactionForm.amount * transactionForm.vatRate / 100).toFixed(2)}</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Total:</span>
                      <div className="text-white font-medium">£{transactionForm.amount.toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              )}

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

      {/* Budget Tracker */}
      <div className="grid lg:grid-cols-2 gap-8 mb-8">
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
            {budgets.filter(b => b.period === selectedPeriod).length > 0 ? (
              budgets.filter(b => b.period === selectedPeriod).map((budget) => {
                const percentage = budget.allocated > 0 ? (budget.spent / budget.allocated) * 100 : 0;
                return (
                  <div key={budget.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className={`px-2 py-1 rounded text-sm font-medium ${getCategoryColor(budget.category)}`}>
                        {budget.category}
                      </span>
                      <div className="text-right">
                        <div className="text-white font-medium">£{budget.spent.toLocaleString()} / £{budget.allocated.toLocaleString()}</div>
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
              })
            ) : (
              <div className="text-center py-8">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">No budgets set for {selectedPeriod} period</p>
              </div>
            )}
          </div>
        </div>

        {/* Forecast Chart */}
        <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center">
            <PieChart className="h-5 w-5 mr-2 text-blue-400" />
            Financial Forecast
          </h3>
          
          <div className="space-y-4">
            {forecasts.length > 0 ? (
              forecasts.map((forecast, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-gray-300">{forecast.month}</span>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-blue-400 text-sm">Est: £{forecast.estimated.toLocaleString()}</div>
                      {forecast.actual > 0 && (
                        <div className="text-white text-sm">Act: £{forecast.actual.toLocaleString()}</div>
                      )}
                    </div>
                    <div className="w-24 bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${forecast.actual > 0 ? Math.min((forecast.actual / forecast.estimated) * 100, 100) : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">No forecast data available</p>
              </div>
            )}
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
          {transactions.length > 0 ? (
            transactions.slice(0, 5).map((transaction) => (
              <div key={transaction.id} className="flex justify-between items-center p-4 bg-gray-700/30 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className={`px-2 py-1 rounded text-sm font-medium ${getCategoryColor(transaction.category)}`}>
                      {transaction.category}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                      {transaction.status.toUpperCase()}
                    </span>
                    {transaction.vat_rate && transaction.vat_rate > 0 && (
                      <span className="px-2 py-1 bg-yellow-900/30 text-yellow-300 rounded text-xs">
                        VAT {transaction.vat_rate}%
                      </span>
                    )}
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
                    {transaction.type === 'income' ? '+' : '-'}£{transaction.amount.toLocaleString()}
                  </div>
                  {transaction.vat_amount && transaction.vat_amount > 0 && (
                    <div className="text-xs text-yellow-400">
                      VAT: £{transaction.vat_amount.toFixed(2)}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">No transactions recorded yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MuseFuzeFinances;