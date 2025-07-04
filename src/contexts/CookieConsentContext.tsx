import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, PieChart, Plus, Receipt, Target, FileText, Download, Calculator, AlertTriangle, Building, CheckCircle } from 'lucide-react';
import { staffAPI } from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import { formatCurrency, formatDate, formatPercentage } from '../../utils/formatters';

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
  // ... rest of the code remains unchanged ...
  return (
    <div className="p-8">
      {/* ... rest of the JSX remains unchanged ... */}
    </div>
  );
};

export default MuseFuzeFinances;