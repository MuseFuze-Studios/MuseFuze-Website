import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, PieChart, Plus, Receipt, Target, FileText, Download, Calculator, AlertTriangle } from 'lucide-react';
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
  hmrc_category: string;
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
  fiscal_year: number;
}

interface TaxReport {
  id: number;
  report_type: 'vat' | 'corporation_tax' | 'paye';
  period_start: string;
  period_end: string;
  total_income: number;
  total_expenses: number;
  total_vat: number;
  net_profit: number;
  company_number?: string;
  vat_registration?: string;
  status: 'draft' | 'submitted' | 'accepted' | 'rejected';
  generated_at: string;
}

interface CompanyInfo {
  company_name: string;
  company_number: string;
  vat_registration: string;
  utr: string;
}

const MuseFuzeFinances: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [forecasts, setForecasts] = useState<Forecast[]>([]);
  const [taxReports, setTaxReports] = useState<TaxReport[]>([]);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    company_name: 'MuseFuze Studios Ltd',
    company_number: '09876543',
    vat_registration: 'GB987654321',
    utr: '1234567890'
  });
  const [loading, setLoading] = useState(true);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [showAddFundsForm, setShowAddFundsForm] = useState(false);
  const [showTaxReportModal, setShowTaxReportModal] = useState(false);
  const [showCompanyInfoForm, setShowCompanyInfoForm] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [selectedTaxReport, setSelectedTaxReport] = useState<TaxReport | null>(null);
  
  const [transactionForm, setTransactionForm] = useState({
    type: 'expense' as 'income' | 'expense',
    category: '',
    amount: '',
    vat_rate: 20.00,
    description: '',
    justification: '',
    hmrc_category: ''
  });
  
  const [budgetForm, setBudgetForm] = useState({
    category: '',
    allocated: '',
    period: 'monthly' as 'monthly' | 'quarterly' | 'yearly'
  });

  const [fundsForm, setFundsForm] = useState({
    amount: '',
    source: '',
    description: '',
    investor_name: ''
  });

  const [companyInfoForm, setCompanyInfoForm] = useState({
    company_name: 'MuseFuze Studios Ltd',
    company_number: '09876543',
    vat_registration: 'GB987654321',
    utr: '1234567890'
  });

  // UK VAT rates
  const vatRates = [
    { value: 0, label: '0% (Zero-rated)' },
    { value: 5, label: '5% (Reduced rate)' },
    { value: 20, label: '20% (Standard rate)' }
  ];

  // HMRC expense categories
  const hmrcCategories = [
    'Office costs',
    'Travel costs',
    'Clothing',
    'Staff costs',
    'Things you buy to sell on',
    'Legal and professional costs',
    'Marketing',
    'Insurance',
    'Other business costs',
    'Software and subscriptions',
    'Equipment and machinery',
    'Training and development'
  ];

  // Business expense categories
  const expenseCategories = [
    'Software Licenses',
    'Marketing & Advertising',
    'Hardware & Equipment',
    'Professional Services',
    'Development Tools',
    'Office Supplies',
    'Travel & Transport',
    'Training & Education',
    'Insurance',
    'Legal & Compliance',
    'Utilities',
    'Rent & Facilities'
  ];

  // Income categories
  const incomeCategories = [
    'Game Sales',
    'Software Licensing',
    'Consulting Services',
    'Investment Funding',
    'Grants',
    'Merchandise Sales',
    'Subscription Revenue',
    'Commission Income'
  ];

  useEffect(() => {
    fetchFinancialData();
    fetchCompanyInfo();
    fetchTaxDeadlines();
  }, []);

  const fetchFinancialData = async () => {
    try {
      const [transactionsRes, budgetsRes, forecastsRes] = await Promise.all([
        staffAPI.getTransactions(),
        staffAPI.getBudgets(),
        staffAPI.getForecasts()
      ]);
      
      setTransactions(transactionsRes.data || []);
      setBudgets(budgetsRes.data || []);
      setForecasts(forecastsRes.data || []);
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

  const fetchCompanyInfo = async () => {
    try {
      const response = await staffAPI.getCompanyInfo();
      if (response.data) {
        setCompanyInfo(response.data);
        setCompanyInfoForm(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch company info:', error);
      // Use default values if API fails
    }
  };

  const fetchTaxDeadlines = async () => {
    try {
      const response = await staffAPI.getTaxDeadlines();
      // Process deadlines if needed
    } catch (error) {
      console.error('Failed to fetch tax deadlines:', error);
    }
  };

  const handleTransactionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!transactionForm.amount || parseFloat(transactionForm.amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    
    if (!transactionForm.category || !transactionForm.description || !transactionForm.justification) {
      alert('Please fill in all required fields');
      return;
    }
    
    try {
      const transactionData = {
        ...transactionForm,
        amount: parseFloat(transactionForm.amount) || 0,
        date: new Date().toISOString().split('T')[0]
      };
      
      console.log('Submitting transaction:', transactionData);
      await staffAPI.createTransaction(transactionData);
      
      fetchFinancialData();
      setShowTransactionForm(false);
      setTransactionForm({
        type: 'expense' as 'income' | 'expense',
        category: '',
        amount: '',
        vat_rate: 20.00,
        description: '',
        justification: '',
        hmrc_category: ''
      });
      
      alert('Transaction created successfully!');
    } catch (error) {
      console.error('Failed to create transaction:', error);
      alert('Failed to create transaction. Please try again.');
    }
  };

  const handleBudgetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await staffAPI.createBudget({
        ...budgetForm,
        allocated: parseFloat(budgetForm.allocated) || 0
      });
      fetchFinancialData();
      setShowBudgetForm(false);
      setBudgetForm({
        category: '',
        allocated: '',
        period: 'monthly' as 'monthly' | 'quarterly' | 'yearly'
      });
    } catch (error) {
      console.error('Failed to create budget:', error);
      alert('Failed to create budget. Please try again.');
    }
  };

  const handleAddFunds = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fundsForm.amount || parseFloat(fundsForm.amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    
    try {
      const transactionData = {
        type: 'income',
        category: 'Investment Funding',
        amount: parseFloat(fundsForm.amount) || 0,
        vat_rate: 0,
        description: `${fundsForm.source}: ${fundsForm.description}`,
        justification: `Investment funding from ${fundsForm.investor_name || 'investor'}`,
        hmrc_category: 'Investment Income',
        date: new Date().toISOString().split('T')[0]
      };
      
      console.log('Submitting funds transaction:', transactionData);
      await staffAPI.createTransaction(transactionData);
      
      fetchFinancialData();
      setShowAddFundsForm(false);
      setFundsForm({
        amount: '',
        source: '',
        description: '',
        investor_name: ''
      });
      
      alert('Funds added successfully!');
    } catch (error) {
      console.error('Failed to add funds:', error);
      alert('Failed to add funds. Please try again.');
    }
  };

  const generateTaxReport = async (reportType: 'vat' | 'corporation_tax') => {
    try {
      const reportData = {
        report_type: reportType,
        period_start: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
        period_end: new Date().toISOString().split('T')[0],
        company_number: companyInfo.company_number,
        vat_registration: companyInfo.vat_registration
      };
      
      const response = await staffAPI.generateTaxReport(reportData);
      
      setSelectedTaxReport(response.data || response);
      setShowTaxReportModal(true);
    } catch (error) {
      console.error('Failed to generate tax report:', error);
      alert('Failed to generate tax report. Please try again.');
    }
  };

  const downloadTaxReport = (report: TaxReport) => {
    const reportData = {
      company: companyInfo.company_name,
      company_number: companyInfo.company_number,
      vat_registration: companyInfo.vat_registration,
      utr: companyInfo.utr,
      period: `${report.period_start} to ${report.period_end}`,
      type: report.report_type.toUpperCase(),
      summary: {
        total_income: `£${report.total_income.toLocaleString()}`,
        total_expenses: `£${report.total_expenses.toLocaleString()}`,
        total_vat: `£${report.total_vat.toLocaleString()}`,
        net_profit: `£${report.net_profit.toLocaleString()}`
      },
      generated_at: new Date(report.generated_at).toLocaleString(),
      status: report.status
    };

    // Format the tax report as a text document
    const reportText = formatTaxReportText(reportData, report);
    
    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.report_type}_report_${report.period_start}_${report.period_end}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatTaxReportText = (reportData: any, report: TaxReport) => {
    const reportType = report.report_type === 'vat' ? 'VAT' : 'CORPORATION TAX';
    const today = new Date().toLocaleDateString('en-GB');
    
    return `
====================================================
             ${reportType} REPORT
               For HMRC Submission
====================================================

Business Name:          ${reportData.company}
UTR:                    ${reportData.utr}
Company Number:         ${reportData.company_number}
VAT Registration No:    ${reportData.vat_registration}
Accounting Period:      ${new Date(report.period_start).toLocaleDateString('en-GB')} - ${new Date(report.period_end).toLocaleDateString('en-GB')}
Report Generated On:    ${today}

----------------------------------------------------
SUMMARY OF FINANCIALS
----------------------------------------------------
Total Income:                      £${report.total_income.toLocaleString()}
Allowable Expenses:               £${report.total_expenses.toLocaleString()}
Capital Allowances:                £0.00
----------------------------------------------------
Taxable Profit:                   £${report.net_profit.toLocaleString()}

Corporation Tax Rate:             19%
Corporation Tax Due:              £${(report.net_profit * 0.19).toLocaleString()}

----------------------------------------------------
VAT SUMMARY
----------------------------------------------------
Output VAT (Sales VAT):           £${(report.total_income * 0.2 / 6).toLocaleString()}
Input VAT (On Expenses):          £${(report.total_expenses * 0.2 / 6).toLocaleString()}
----------------------------------------------------
VAT Payable to HMRC:              £${report.total_vat.toLocaleString()}

----------------------------------------------------
NOTES:
- All figures rounded to nearest pound.
- Receipts and invoices are retained as supporting evidence.
- Capital allowances not claimed this period.
- VAT calculated assuming 20% rate.
- Profit is before salary or dividends.

----------------------------------------------------
DECLARATION:
I confirm that the above information is accurate and
complete to the best of my knowledge.

Signature: _______________________
Date:      _______________________

====================================================
`;
  };

  const handleCompanyInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCompanyInfo(companyInfoForm);
    setShowCompanyInfoForm(false);
    alert('Company information updated successfully!');
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
      'Marketing & Advertising': 'text-purple-400 bg-purple-900/30',
      'Hardware & Equipment': 'text-orange-400 bg-orange-900/30',
      'Professional Services': 'text-green-400 bg-green-900/30',
      'Development Tools': 'text-violet-400 bg-violet-900/30',
      'Investment Funding': 'text-emerald-400 bg-emerald-900/30',
      'Game Sales': 'text-cyan-400 bg-cyan-900/30'
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
  const totalVAT = transactions.filter(t => t.status === 'approved').reduce((sum, t) => sum + (t.vat_amount || 0), 0);
  const netIncome = totalIncome - totalExpenses;
  const totalBudgetAllocated = budgets.reduce((sum, b) => sum + b.allocated, 0);
  const totalBudgetSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  
  // Calculate next tax deadlines
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  
  // VAT deadlines (quarterly)
  const vatQuarters = [
    { end: new Date(currentYear, 2, 31), deadline: new Date(currentYear, 4, 7) }, // Q1: Jan-Mar, due May 7
    { end: new Date(currentYear, 5, 30), deadline: new Date(currentYear, 7, 7) }, // Q2: Apr-Jun, due Aug 7
    { end: new Date(currentYear, 8, 30), deadline: new Date(currentYear, 10, 7) }, // Q3: Jul-Sep, due Nov 7
    { end: new Date(currentYear, 11, 31), deadline: new Date(currentYear + 1, 1, 31) }, // Q4: Oct-Dec, due Jan 31
  ];
  
  // Find next VAT deadline
  const nextVatDeadline = vatQuarters.find(q => q.deadline > currentDate) || 
    { end: new Date(currentYear + 1, 2, 31), deadline: new Date(currentYear + 1, 4, 7) };
  
  // Corporation tax deadline (12 months after end of financial year)
  const corpTaxDeadline = new Date(currentYear + 1, 11, 31); // Assuming financial year end is Dec 31

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
          <p className="text-gray-400">UK-compliant financial tracking and HMRC reporting</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowAddFundsForm(true)}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-green-500/25"
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

      {/* HMRC Tax Reports Section */}
      <div className="mb-8 bg-gray-800/30 rounded-xl p-6 border border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white flex items-center">
            <FileText className="h-5 w-5 mr-2 text-amber-400" /> 
            HMRC Tax Reports & Deadlines
          </h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowCompanyInfoForm(true)}
              className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-lg"
            >
              <span>Company Info</span>
            </button>
            <button
              onClick={() => generateTaxReport('vat')}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors text-sm"
            >
              Generate VAT Report
            </button>
            <button
              onClick={() => generateTaxReport('corporation_tax')}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors text-sm"
            >
              Generate Corporation Tax
            </button>
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600">
            <h4 className="text-white font-medium mb-2">Company Details</h4>
            <p className="text-gray-300 text-sm">Name: {companyInfo.company_name}</p>
            <p className="text-gray-300 text-sm">Company No: {companyInfo.company_number}</p>
            <p className="text-gray-300 text-sm">VAT Reg: {companyInfo.vat_registration}</p>
            <p className="text-gray-300 text-sm">UTR: {companyInfo.utr}</p>
          </div>
          <div className="bg-amber-900/20 p-4 rounded-lg border border-amber-500/30">
            <h4 className="text-amber-300 font-medium mb-2">VAT Quarter</h4>
            <p className="text-white text-lg font-bold">£{totalVAT.toLocaleString()}</p>
            <p className="text-gray-400 text-sm">VAT to declare</p>
          </div>
          <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-500/30">
            <h4 className="text-blue-300 font-medium mb-2">Corporation Tax</h4>
            <p className="text-white text-lg font-bold">£{Math.max(0, netIncome * 0.19).toLocaleString()}</p>
            <p className="text-gray-400 text-sm">Estimated (19%)</p>
          </div>
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

        {/* Expense Forecast */}
        <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center">
            <PieChart className="h-5 w-5 mr-2 text-blue-400" />
            Expense Forecast
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
                        <div className="text-white text-sm">Act: £{Number(forecast.actual || 0).toLocaleString()}</div>
                      )}
                    </div>
                    <div className="w-24 bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${Number(forecast.actual || 0) > 0 ? Math.min((Number(forecast.actual || 0) / Number(forecast.estimated || 1)) * 100, 100) : 0}%` }}
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

      {/* Recent Transactions */}
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
                    {transaction.vat_amount > 0 && (
                      <span className="px-2 py-1 bg-yellow-900/30 text-yellow-300 rounded text-xs">
                        VAT: £{(Number(transaction.vat_amount) || 0).toFixed(2)}
                      </span>
                    )}
                  </div>
                  <h4 className="text-white font-medium">{transaction.description}</h4>
                  <p className="text-gray-400 text-sm">{transaction.justification}</p>
                  <div className="text-xs text-gray-500 mt-1">
                    By {transaction.responsible_staff} • {new Date(transaction.date).toLocaleDateString()}
                    {transaction.hmrc_category && (
                      <span className="ml-2">• HMRC: {transaction.hmrc_category}</span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${
                    transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}£{transaction.amount.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-400">
                    {transaction.currency || 'GBP'} • {(Number(transaction.vat_rate) || 0)}% VAT
                  </div>
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

      {/* Company Info Form Modal */}
      {showCompanyInfoForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-8 max-w-lg w-full border border-gray-700">
            <h3 className="text-2xl font-bold text-white mb-6">Company Information</h3>
            
            <form onSubmit={handleCompanyInfoSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  value={companyInfoForm.company_name}
                  onChange={(e) => setCompanyInfoForm({ ...companyInfoForm, company_name: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="e.g., MuseFuze Studios Ltd"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Company Number
                </label>
                <input
                  type="text"
                  value={companyInfoForm.company_number}
                  onChange={(e) => setCompanyInfoForm({ ...companyInfoForm, company_number: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="e.g., 09876543"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  VAT Registration Number
                </label>
                <input
                  type="text"
                  value={companyInfoForm.vat_registration}
                  onChange={(e) => setCompanyInfoForm({ ...companyInfoForm, vat_registration: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="e.g., GB987654321"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Unique Taxpayer Reference (UTR)
                </label>
                <input
                  type="text"
                  value={companyInfoForm.utr}
                  onChange={(e) => setCompanyInfoForm({ ...companyInfoForm, utr: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="e.g., 1234567890"
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowCompanyInfoForm(false)}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-lg transition-all shadow-lg hover:shadow-amber-500/25"
                >
                  Save Information
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Funds Modal */}
      {showAddFundsForm && (
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
                  min="0.01"
                  value={fundsForm.amount}
                  onChange={(e) => setFundsForm({ ...fundsForm, amount: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter amount"
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
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select source</option>
                  <option value="Angel Investment">Angel Investment</option>
                  <option value="Venture Capital">Venture Capital</option>
                  <option value="Government Grant">Government Grant</option>
                  <option value="Bank Loan">Bank Loan</option>
                  <option value="Personal Investment">Personal Investment</option>
                  <option value="Crowdfunding">Crowdfunding</option>
                  <option value="Revenue Reinvestment">Revenue Reinvestment</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Investor/Source Name
                </label>
                <input
                  type="text"
                  value={fundsForm.investor_name}
                  onChange={(e) => setFundsForm({ ...fundsForm, investor_name: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Name of investor or funding source"
                />
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
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Purpose and details of the funding"
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowAddFundsForm(false)}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg transition-all shadow-lg hover:shadow-green-500/25"
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
                    {(transactionForm.type === 'expense' ? expenseCategories : incomeCategories).map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
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
                    min="0.01"
                    value={transactionForm.amount}
                    onChange={(e) => setTransactionForm({ ...transactionForm, amount: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                    placeholder="Enter amount"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    VAT Rate *
                  </label>
                  <select
                    value={transactionForm.vat_rate}
                    onChange={(e) => setTransactionForm({ ...transactionForm, vat_rate: parseFloat(e.target.value) })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    {vatRates.map((rate) => (
                      <option key={rate.value} value={rate.value}>{rate.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  HMRC Category *
                </label>
                <select
                  value={transactionForm.hmrc_category}
                  onChange={(e) => setTransactionForm({ ...transactionForm, hmrc_category: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value="">Select HMRC category</option>
                  {hmrcCategories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
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
                  placeholder="Explain why this transaction is necessary for the business"
                />
              </div>

              {parseFloat(transactionForm.amount) > 0 && transactionForm.vat_rate > 0 && (
                <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Calculator className="h-4 w-4 text-yellow-400 mr-2" />
                    <span className="text-yellow-300 font-medium">VAT Calculation</span>
                  </div>
                  <div className="text-sm text-gray-300">
                    <div>Net Amount: £{(parseFloat(transactionForm.amount) || 0).toFixed(2)}</div>
                    <div>VAT ({transactionForm.vat_rate}%): £{((parseFloat(transactionForm.amount) || 0) * transactionForm.vat_rate / 100).toFixed(2)}</div>
                    <div className="font-medium">Total: £{((parseFloat(transactionForm.amount) || 0) + ((parseFloat(transactionForm.amount) || 0) * transactionForm.vat_rate / 100)).toFixed(2)}</div>
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
                  {expenseCategories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Allocated Amount (£) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={budgetForm.allocated}
                  onChange={(e) => setBudgetForm({ ...budgetForm, allocated: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                  placeholder="Enter budget amount"
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

      {/* Tax Report Modal */}
      {showTaxReportModal && selectedTaxReport && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  {selectedTaxReport.report_type.toUpperCase()} Report
                </h3>
                <p className="text-gray-400">
                  {new Date(selectedTaxReport.period_start).toLocaleDateString()} - {new Date(selectedTaxReport.period_end).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => setShowTaxReportModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-green-900/20 p-4 rounded-lg border border-green-500/30">
                  <h4 className="text-green-300 font-medium mb-2">Total Income (YTD)</h4>
                  <p className="text-white text-2xl font-bold">£{selectedTaxReport.total_income.toLocaleString()}</p>
                </div>
                <div className="bg-red-900/20 p-4 rounded-lg border border-red-500/30">
                  <h4 className="text-red-300 font-medium mb-2">Total Expenses (YTD)</h4>
                  <p className="text-white text-2xl font-bold">£{selectedTaxReport.total_expenses.toLocaleString()}</p>
                </div>
                <div className="bg-yellow-900/20 p-4 rounded-lg border border-yellow-500/30">
                  <h4 className="text-yellow-300 font-medium mb-2">Total VAT</h4>
                  <p className="text-white text-2xl font-bold">£{selectedTaxReport.total_vat.toLocaleString()}</p>
                </div>
                <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-500/30">
                  <h4 className="text-blue-300 font-medium mb-2">Taxable Profit</h4>
                  <p className="text-white text-2xl font-bold">£{selectedTaxReport.net_profit.toLocaleString()}</p>
                </div>
              </div>

              <div className="bg-indigo-900/20 p-4 rounded-lg border border-indigo-500/30">
                <h4 className="text-indigo-300 font-medium mb-2">Corporation Tax Due (19%)</h4>
                <p className="text-white text-2xl font-bold">£{(selectedTaxReport.net_profit * 0.19).toLocaleString()}</p>
              </div>

              <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600">
                <h4 className="text-white font-medium mb-2">Company Information</h4>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Company Name:</p>
                    <p className="text-white">{companyInfo.company_name}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Company Number:</p>
                    <p className="text-white">{companyInfo.company_number}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">VAT Registration:</p>
                    <p className="text-white">{companyInfo.vat_registration}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">UTR:</p>
                    <p className="text-white">{companyInfo.utr}</p>
                  </div>
                </div>
              </div>

              <div className="bg-amber-900/20 p-4 rounded-lg border border-amber-500/30">
                <div className="flex items-center mb-2">
                  <AlertTriangle className="h-4 w-4 text-amber-400 mr-2" />
                  <span className="text-amber-300 font-medium">HMRC Compliance</span>
                </div>
                <p className="text-gray-300 text-sm">
                  This report is generated for HMRC compliance purposes. Please review all figures before submission.
                  Ensure all supporting documentation is available for inspection.
                </p>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => downloadTaxReport(selectedTaxReport)}
                  className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Report</span>
                </button>
                <button
                  onClick={() => setShowTaxReportModal(false)}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MuseFuzeFinances;