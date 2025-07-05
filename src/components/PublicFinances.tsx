import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, PieChart, Info } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import axios from 'axios';

interface FinancialData {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  totalVAT: number;
  lastUpdated: string;
}

const PublicFinances: React.FC = () => {
  const [financialData, setFinancialData] = useState<FinancialData>({
    totalIncome: 0,
    totalExpenses: 0,
    netProfit: 0,
    totalVAT: 0,
    lastUpdated: new Date().toISOString()
  });
  const [showInfo, setShowInfo] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFinancialData = async () => {
      try {
        setLoading(true);
        
        // Fetch transactions to calculate totals
        const response = await axios.get('/api/staff/finance/transactions-public');
        const transactions = response.data || [];

        // Calculate total income
        const income = transactions
          .filter((t: any) => t.type === 'income')
          .reduce((sum: number, t: any) => sum + Number(t.amount), 0);

        // Calculate total expenses
        const expenses = transactions
          .filter((t: any) => t.type === 'expense')
          .reduce((sum: number, t: any) => sum + Number(t.amount), 0);

        // Calculate VAT (based on field, or default to 0)
        const vat = transactions
          .reduce((sum: number, t: any) => sum + Number(t.vat_amount || 0), 0);

        // Update state
        setFinancialData({
          totalIncome: income,
          totalExpenses: expenses,
          netProfit: income - expenses,
          totalVAT: vat,
          lastUpdated: new Date().toISOString()
        });
      } catch (error) {
        console.error('Failed to fetch financial data:', error);
        // If API fails, use sample data
        setFinancialData({
          totalIncome: 404,
          totalExpenses: 404,
          netProfit: 404,
          totalVAT: 404,
          lastUpdated: new Date().toISOString()
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFinancialData();
  }, []);

  // Show loading state
  if (loading) {
    return (
      <section id="finances" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-orbitron font-bold mb-6 text-gray-900">
              Financial Transparency
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-electric to-neon mx-auto mb-8"></div>
          </div>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-electric"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="finances" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-orbitron font-bold mb-6 text-gray-900">
            Financial Transparency
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-electric to-neon mx-auto mb-8"></div>
          <p className="text-xl font-rajdhani text-gray-600 max-w-3xl mx-auto">
            We believe in transparency. As an independent studio, we're committed to sharing our financial journey with our community.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          {/* Financial Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {/* Total Income */}
            <div className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100 group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">{formatCurrency(financialData.totalIncome)}</span>
              </div>
              <h3 className="text-green-600 font-orbitron font-bold mb-2">Total Income</h3>
              <div className="text-sm text-gray-500 font-rajdhani">Year to date</div>
            </div>

            {/* Total Expenses */}
            <div className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100 group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500/10 to-red-600/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <TrendingDown className="h-6 w-6 text-red-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">{formatCurrency(financialData.totalExpenses)}</span>
              </div>
              <h3 className="text-red-600 font-orbitron font-bold mb-2">Total Expenses</h3>
              <div className="text-sm text-gray-500 font-rajdhani">Year to date</div>
            </div>

            {/* Net Profit */}
            <div className={`bg-white rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100 group`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 ${
                  financialData.netProfit >= 0 
                    ? 'bg-gradient-to-br from-blue-500/10 to-blue-600/10' 
                    : 'bg-gradient-to-br from-orange-500/10 to-orange-600/10'
                }`}>
                  <DollarSign className={`h-6 w-6 ${financialData.netProfit >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
                </div>
                <span className="text-2xl font-bold text-gray-900">{formatCurrency(financialData.netProfit)}</span>
              </div>
              <h3 className={`font-orbitron font-bold mb-2 ${financialData.netProfit >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>Net Profit</h3>
              <div className="text-sm text-gray-500 font-rajdhani">Income - Expenses</div>
            </div>

            {/* VAT */}
            <div className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100 group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <PieChart className="h-6 w-6 text-yellow-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">{formatCurrency(financialData.totalVAT)}</span>
              </div>
              <h3 className="text-yellow-600 font-orbitron font-bold mb-2">VAT Collected</h3>
              <div className="text-sm text-gray-500 font-rajdhani">Year to date</div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 relative">
            <button 
              onClick={() => setShowInfo(!showInfo)}
              className="absolute top-6 right-6 text-gray-400 hover:text-electric transition-colors"
              aria-label={showInfo ? "Hide information" : "Show information"}
            >
              <Info className="h-5 w-5" />
            </button>
            
            <h3 className="text-2xl font-orbitron font-bold mb-4 text-gray-900">Our Financial Commitment</h3>
            
            <p className="text-gray-600 font-rajdhani mb-4 leading-relaxed">
              At MuseFuze Studios, we believe in building trust through transparency. As an independent studio, 
              we're sharing our financial journey with our community and stakeholders.
            </p>
            
            {showInfo && (
              <div className="mt-6 space-y-4 text-gray-600 font-rajdhani">
                <p>
                  <strong className="text-electric">Why we share our finances:</strong> We want to build a sustainable 
                  business that creates value for our community, team members, and partners. By sharing our financial 
                  information, we're holding ourselves accountable and demonstrating our commitment to ethical business practices.
                </p>
                
                <p>
                  <strong className="text-electric">How we use our revenue:</strong> The majority of our income is reinvested 
                  into development, with a focus on creating high-quality experiences. We allocate funds to fair compensation 
                  for our team members, technology infrastructure, and sustainable growth.
                </p>
                
                <p>
                  <strong className="text-electric">Our funding approach:</strong> We're bootstrapped and independent, 
                  which means we maintain creative control over our projects. We're selective about partnerships and 
                  investment opportunities that align with our values and vision.
                </p>
              </div>
            )}
            
            <div className="mt-6 text-right">
              <p className="text-sm text-gray-400 font-rajdhani">
                Last updated: {new Date(financialData.lastUpdated).toLocaleDateString('en-GB', { 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PublicFinances;