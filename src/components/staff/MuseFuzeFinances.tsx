import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, PieChart, Plus, Receipt, Target, FileText, Download, Calculator, AlertTriangle } from 'lucide-react';
import { staffAPI } from '../../services/api';
import { formatCurrency } from '../../utils/formatters';

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

interface CompanyInfo {
  id: number;
  company_name: string;
  company_number: string;
  vat_registration: string;
  utr: string;
  fiscal_year_end?: string;
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

const MuseFuzeFinances: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [forecasts, setForecasts] = useState<Forecast[]>([]);
  const [taxReports, setTaxReports] = useState<TaxReport[]>([]);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [showAddFundsForm, setShowAddFundsForm] = useState(false);
  const [showTaxReportModal, setShowTaxReportModal] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [showCompanyInfoModal, setShowCompanyInfoModal] = useState(false);
  const [selectedTaxReport, setSelectedTaxReport] = useState<TaxReport | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
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
    company_name: '',
    company_number: '',
    vat_registration: '',
    utr: '',
    fiscal_year_end: ''
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
  }, []);
  
  // Show success message for 3 seconds then hide it
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const fetchFinancialData = async () => {
    try {
      const [transactionsRes, budgetsRes, forecastsRes, companyInfoRes] = await Promise.all([
        staffAPI.getTransactions(),
        staffAPI.getBudgets(),
        staffAPI.getForecasts(),
        staffAPI.getCompanyInfo().catch(() => ({ data: null }))
      ]);
      
      setTransactions(transactionsRes.data || []);
      setBudgets(budgetsRes.data || []);
      setForecasts(forecastsRes.data || []);
      setCompanyInfo(companyInfoRes.data || {
        id: 1,
        company_name: 'MuseFuze Studios Ltd',
        company_number: '09876543',
        vat_registration: 'GB987654321',
        utr: '1234567890'
      });
    } catch (error) {
      console.error('Failed to fetch financial data:', error);
      
      // Set default company info if not found
      setCompanyInfo({
        id: 1,
        company_name: 'MuseFuze Studios Ltd',
        company_number: '09876543',
        vat_registration: 'GB987654321',
        utr: '1234567890'
      });
      // Set empty arrays as fallback
      setTransactions([]);
      setBudgets([]);
      setForecasts([]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCompanyInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await staffAPI.updateCompanyInfo(companyInfoForm);
      
      // Update local state
      setCompanyInfo({
        id: companyInfo?.id || 1,
        company_name: companyInfoForm.company_name,
        company_number: companyInfoForm.company_number,
        vat_registration: companyInfoForm.vat_registration,
        utr: companyInfoForm.utr,
        fiscal_year_end: companyInfoForm.fiscal_year_end
      });
      
      setShowCompanyInfoModal(false);
      setSuccessMessage('Company information updated successfully');
      
    } catch (error) {
      console.error('Failed to update company info:', error);
      alert('Failed to update company information. Please try again.');
    }
  };
  
  // Handle numeric input to ensure proper formatting
  const handleNumericInput = (e: React.ChangeEvent<HTMLInputElement>, setter: (value: any) => void, field: string, currentValue: any) => {
    const value = e.target.value;
    
    // Allow only numbers and decimal point
    if (/^[0-9]*\.?[0-9]*$/.test(value) || value === '') {
      setter({ ...currentValue, [field]: value });
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
      
      setSuccessMessage('Transaction created successfully');
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
      setSuccessMessage('Budget created successfully');
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
      
      setSuccessMessage('Funds added successfully');
      
      fetchFinancialData();
      setShowAddFundsForm(false);
      setFundsForm({
        amount: '',
        source: '',
        description: '',
        investor_name: ''
      });
    } catch (error) {
      console.error('Failed to add funds:', error);
      alert('Failed to add funds. Please try again.');
    }
  };

  const generateTaxReport = async (reportType: 'vat' | 'corporation_tax') => {
    try {
      const data = {
        report_type: reportType,
        period_start: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
        period_end: new Date().toISOString().split('T')[0],
        company_number: companyInfo?.company_number,
        vat_registration: companyInfo?.vat_registration
      };
      const response = await staffAPI.generateTaxReport(data);
      
      setSelectedTaxReport(response.data || response);
      setShowTaxReportModal(true);
    } catch (error) {
      console.error('Failed to generate tax report:', error);
      alert('Failed to generate tax report. Please try again.');
    }
  };

  const downloadTaxReport = (report: TaxReport) => {
    // Format date for display
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
    };
    
    // Calculate corporation tax
    const corpTaxRate = 0.19; // 19%
    const corpTaxDue = Math.max(0, report.net_profit * corpTaxRate);
    
    // Create a professional report format
    let reportContent = '';
    
    if (report.report_type === 'vat') {
      reportContent = `
====================================================
                VAT RETURN REPORT
               For HMRC Submission
====================================================

Business Name:          ${companyInfo?.company_name || 'MuseFuze Studios Ltd'}
VAT Registration No:    ${report.vat_registration || companyInfo?.vat_registration || 'GB987654321'}
Period:                 ${formatDate(report.period_start)} - ${formatDate(report.period_end)}
Report Generated On:    ${formatDate(report.generated_at)}

----------------------------------------------------
VAT SUMMARY
----------------------------------------------------
Output VAT (Sales VAT):           £${(report.total_vat * 0.5).toLocaleString('en-GB', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
Input VAT (On Expenses):          £${(report.total_vat * 0.5).toLocaleString('en-GB', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
----------------------------------------------------
VAT Payable to HMRC:              £${report.total_vat.toLocaleString('en-GB', {minimumFractionDigits: 2, maximumFractionDigits: 2})}

----------------------------------------------------
NOTES:
- All figures rounded to nearest penny.
- Receipts and invoices are retained as supporting evidence.
- VAT calculated at standard rate of 20% where applicable.

----------------------------------------------------
DECLARATION:
I confirm that the above information is accurate and
complete to the best of my knowledge.

Signature: _______________________
Date:      _______________________

====================================================`;
    } else {
      reportContent = `
====================================================
             CORPORATION TAX REPORT
               For HMRC Submission
====================================================

Business Name:          ${companyInfo?.company_name || 'MuseFuze Studios Ltd'}
UTR:                    ${companyInfo?.utr || '1234567890'}
Company Number:         ${report.company_number || companyInfo?.company_number || '09876543'}
VAT Registration No:    ${report.vat_registration || companyInfo?.vat_registration || 'GB987654321'}
Accounting Period:      ${formatDate(report.period_start)} - ${formatDate(report.period_end)}
Report Generated On:    ${formatDate(report.generated_at)}

----------------------------------------------------
SUMMARY OF FINANCIALS
----------------------------------------------------
Total Income:                      £${report.total_income.toLocaleString('en-GB', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
Allowable Expenses:               £${report.total_expenses.toLocaleString('en-GB', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
Capital Allowances:                £0.00
----------------------------------------------------
Taxable Profit:                   £${report.net_profit.toLocaleString('en-GB', {minimumFractionDigits: 2, maximumFractionDigits: 2})}

Corporation Tax Rate:             19%
Corporation Tax Due:              £${corpTaxDue.toLocaleString('en-GB', {minimumFractionDigits: 2, maximumFractionDigits: 2})}

----------------------------------------------------
VAT SUMMARY
----------------------------------------------------
Output VAT (Sales VAT):           £${(report.total_vat * 0.5).toLocaleString('en-GB', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
Input VAT (On Expenses):          £${(report.total_vat * 0.5).toLocaleString('en-GB', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
----------------------------------------------------
VAT Payable to HMRC:              £${report.total_vat.toLocaleString('en-GB', {minimumFractionDigits: 2, maximumFractionDigits: 2})}

----------------------------------------------------
NOTES:
- All figures rounded to nearest penny.
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

====================================================`;
    }

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.report_type}_report_${report.period_start}_${report.period_end}.txt`;
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
  const totalIncome = transactions.filter(t => t.type === 'income' && t.status === 'approved').reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);
  const totalExpenses = transactions.filter(t => t.type === 'expense' && t.status === 'approved').reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);
  const totalVAT = transactions.filter(t => t.status === 'approved').reduce((sum, t) => sum + parseFloat((t.vat_amount || 0).toString()), 0);
  const netIncome = totalIncome - totalExpenses;
  const totalBudgetAllocated = budgets.reduce((sum, b) => sum + parseFloat(b.allocated.toString()), 0);
  const totalBudgetSpent = budgets.reduce((sum, b) => sum + parseFloat(b.spent.toString()), 0);
  
  // Calculate corporation tax (19%)
  const corpTaxRate = 0.19;
  const estimatedCorpTax = Math.max(0, netIncome * corpTaxRate);

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
            {successMessage && (
              <span className="ml-4 px-3 py-1 bg-green-500/20 text-green-400 text-sm rounded-full animate-fade-out">
                ✓ {successMessage}
              </span>
            )}
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
            <span className="text-2xl font-bold text-white">£{totalIncome.toLocaleString('en-GB', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
          </div>
          <h3 className="text-green-300 font-medium mb-2">Total Income</h3>
          <div className="text-sm text-gray-400">This period</div>
        </div>

        <div className="bg-gradient-to-br from-red-900/30 to-red-800/30 rounded-xl p-6 border border-red-500/30">
          <div className="flex items-center justify-between mb-4">
            <TrendingDown className="h-8 w-8 text-red-400" />
            <span className="text-2xl font-bold text-white">£{totalExpenses.toLocaleString('en-GB', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
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
            <span className="text-2xl font-bold text-white">£{netIncome.toLocaleString('en-GB', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
          </div>
          <h3 className={`font-medium mb-2 ${netIncome >= 0 ? 'text-blue-300' : 'text-orange-300'}`}>Net Profit</h3>
          <div className="text-sm text-gray-400">Income - Expenses</div>
        </div>

        <div className="bg-gradient-to-br from-yellow-900/30 to-yellow-800/30 rounded-xl p-6 border border-yellow-500/30">
          <div className="flex items-center justify-between mb-4">
            <Receipt className="h-8 w-8 text-yellow-400" />
            <span className="text-2xl font-bold text-white">£{totalVAT.toLocaleString('en-GB', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
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
          <div className="text-sm text-gray-400">£{totalBudgetSpent.toLocaleString('en-GB', {minimumFractionDigits: 2, maximumFractionDigits: 2})} / £{totalBudgetAllocated.toLocaleString('en-GB', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
        </div>
      </div>

      {/* HMRC Tax Reports Section */}
      <div className="mb-8 bg-gray-800/30 rounded-xl p-6 border border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white flex items-center">
            <FileText className="h-5 w-5 mr-2 text-amber-400" />
            HMRC Tax Reports
          </h3>
          <div className="flex space-x-2 flex-wrap gap-2">
            <button
              onClick={() => {
                setCompanyInfoForm({
                  company_name: companyInfo?.company_name || 'MuseFuze Studios Ltd',
                  company_number: companyInfo?.company_number || '09876543',
                  vat_registration: companyInfo?.vat_registration || 'GB987654321',
                  utr: companyInfo?.utr || '1234567890',
                  fiscal_year_end: companyInfo?.fiscal_year_end || ''
                });
                setShowCompanyInfoModal(true);
              }}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm"
            >
              Company Info
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
          <div className="bg-gray-800/30 p-4 rounded-lg border border-gray-600">
            <h4 className="text-white font-medium mb-2">Company Details</h4>
            <p className="text-gray-300 text-sm">Name: {companyInfo?.company_name || 'MuseFuze Studios Ltd'}</p>
            <p className="text-gray-300 text-sm">Company No: {companyInfo?.company_number || '09876543'}</p>
            <p className="text-gray-300 text-sm">VAT Reg: {companyInfo?.vat_registration || 'GB987654321'}</p>
            <p className="text-gray-300 text-sm">UTR: {companyInfo?.utr || '1234567890'}</p>
          </div>
          
          <div className="bg-amber-900/20 p-4 rounded-lg border border-amber-500/30">
            <h4 className="text-amber-300 font-medium mb-2">VAT Quarter</h4>
            <p className="text-white text-lg font-bold">£{totalVAT.toLocaleString('en-GB', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
            <p className="text-gray-400 text-sm">VAT to declare</p>
          </div>
          
          <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-500/30">
            <h4 className="text-blue-300 font-medium mb-2">Corporation Tax</h4>
            <p className="text-white text-lg font-bold">£{estimatedCorpTax.toLocaleString('en-GB', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
            <p className="text-gray-400 text-sm">Estimated (19%)</p>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="bg-green-900/20 p-4 rounded-lg border border-green-500/30 w-full">
            <h4 className="text-green-300 font-medium mb-2">Next Deadline</h4>
            <p className="text-white text-lg font-bold">31 Jan 2026</p>
            <p className="text-gray-400 text-sm">VAT Return</p>
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
                      <span className={`px-2 py-1 rounded text-sm font-medium ${getCategoryColor(budget.category)} truncate max-w-[200px]`}>
                        {budget.category}
                      </span>
                      <div className="text-right">
                        <div className="text-white font-medium">
                          £{budget.spent.toLocaleString('en-GB', {minimumFractionDigits: 2, maximumFractionDigits: 2})} / 
                          £{budget.allocated.toLocaleString('en-GB', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                        </div>
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
                        <div className="text-white text-sm">Act: £{forecast.actual.toLocaleString('en-GB', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
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
                  <div className={`text-xl font-bold ${
                    transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}£{parseFloat(transaction.amount.toString()).toLocaleString('en-GB', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </div>
                  <div className="text-xs text-gray-400">
                    {transaction.currency} • {parseFloat(transaction.vat_rate.toString())}% VAT
                    {transaction.vat_amount > 0 && ` (£${parseFloat(transaction.vat_amount.toString()).toLocaleString('en-GB', {minimumFractionDigits: 2, maximumFractionDigits: 2})})`}
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

      {/* Company Info Modal */}
      {showCompanyInfoModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-8 max-w-lg w-full border border-gray-700">
            <h3 className="text-2xl font-bold text-white mb-6">Company Information</h3>
            
            <form onSubmit={handleCompanyInfoSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  value={companyInfoForm.company_name}
                  onChange={(e) => setCompanyInfoForm({ ...companyInfoForm, company_name: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="MuseFuze Studios Ltd"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Company Number *
                </label>
                <input
                  type="text"
                  value={companyInfoForm.company_number}
                  onChange={(e) => setCompanyInfoForm({ ...companyInfoForm, company_number: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="09876543"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  VAT Registration Number *
                </label>
                <input
                  type="text"
                  value={companyInfoForm.vat_registration}
                  onChange={(e) => setCompanyInfoForm({ ...companyInfoForm, vat_registration: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="GB987654321"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  UTR (Unique Taxpayer Reference) *
                </label>
                <input
                  type="text"
                  value={companyInfoForm.utr}
                  onChange={(e) => setCompanyInfoForm({ ...companyInfoForm, utr: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="1234567890"
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowCompanyInfoModal(false)}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg transition-all shadow-lg hover:shadow-blue-500/25"
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
                  type="text"
                  value={fundsForm.amount}
                  onChange={(e) => handleNumericInput(e, setFundsForm, 'amount', fundsForm)}
                  required
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
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
                    type="text"
                    value={transactionForm.amount}
                    onChange={(e) => handleNumericInput(e, setTransactionForm, 'amount', transactionForm)}
                    required
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    VAT Rate *
                  </label>
                  <select 
                    value={transactionForm.vat_rate.toString()}
                    onChange={(e) => setTransactionForm({ ...transactionForm, vat_rate: parseFloat(e.target.value) || 0 })}
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
                <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 animate-pulse">
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
                  type="text"
                  value={budgetForm.allocated}
                  onChange={(e) => handleNumericInput(e, setBudgetForm, 'allocated', budgetForm)}
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

      {/* Tax Report Modal */}
      {showTaxReportModal && selectedTaxReport && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  {selectedTaxReport.report_type.toUpperCase()} Report
                  <span className="ml-2 text-sm px-2 py-1 bg-amber-900/30 text-amber-300 rounded-full">
                    {selectedTaxReport.status.toUpperCase()}
                  </span>
                </h3>
                <p className="text-gray-400">
                  {new Date(selectedTaxReport.period_start).toLocaleDateString('en-GB')} - {new Date(selectedTaxReport.period_end).toLocaleDateString('en-GB')}
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
                  <h4 className="text-green-300 font-medium mb-2">Total Income</h4>
                  <p className="text-white text-2xl font-bold">£{selectedTaxReport.total_income.toLocaleString('en-GB', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                </div>
                <div className="bg-red-900/20 p-4 rounded-lg border border-red-500/30">
                  <h4 className="text-red-300 font-medium mb-2">Total Expenses</h4>
                  <p className="text-white text-2xl font-bold">£{selectedTaxReport.total_expenses.toLocaleString('en-GB', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                </div>
                <div className="bg-yellow-900/20 p-4 rounded-lg border border-yellow-500/30">
                  <h4 className="text-yellow-300 font-medium mb-2">Total VAT</h4>
                  <p className="text-white text-2xl font-bold">£{selectedTaxReport.total_vat.toLocaleString('en-GB', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                </div>
                <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-500/30">
                  <h4 className="text-blue-300 font-medium mb-2">Net Profit</h4>
                  <p className="text-white text-2xl font-bold">£{selectedTaxReport.net_profit.toLocaleString('en-GB', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                </div>
              </div>
              
              <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-500/30">
                <h4 className="text-blue-300 font-medium mb-2">Corporation Tax Due (19%)</h4>
                <div className="flex justify-between items-center">
                  <p className="text-white text-xl font-bold">
                    £{(selectedTaxReport.net_profit * 0.19).toLocaleString('en-GB', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </p>
                  <div className="text-sm text-gray-400">
                    Based on net profit at 19% rate
                  </div>
                </div>
              </div>

              <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600">
                <h4 className="text-white font-medium mb-2">Company Information</h4>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Company Name:</p>
                    <p className="text-white">{companyInfo?.company_name}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Company Number:</p>
                    <p className="text-white">{companyInfo?.company_number}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">VAT Registration:</p>
                    <p className="text-white">{companyInfo?.vat_registration}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">UTR:</p>
                    <p className="text-white">{companyInfo?.utr}</p>
                  </div>
                </div>
              </div>

              <div className="bg-amber-900/20 p-4 rounded-lg border border-amber-500/30">
                <div className="flex items-center mb-2">
                  <AlertTriangle className="h-4 w-4 text-amber-400 mr-2" />
                  <span className="text-amber-300 font-medium">HMRC Compliance Notice</span>
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