import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, PieChart, Info } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

interface FinancialData {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  totalVAT: number;
  lastUpdated: string;
}

const PublicFinances: React.FC = () => {
  const [financialData, setFinancialData] = useState<FinancialData>({
    totalIncome: 25000,
    totalExpenses: 15000,
    netProfit: 10000,
    totalVAT: 2000,
    lastUpdated: new Date().toISOString()
  });
  const [showInfo, setShowInfo] = useState(false);

  // In a real implementation, you would fetch this data from your API
  useEffect(() => {
    // This would be replaced with an actual API call
    const fetchFinancialData = async () => {
      try {
        // Mock data for demonstration
        // In production, you would fetch from an endpoint like:
        // const response = await fetch('/api/public/finances');
        // const data = await response.json();
        
        // For now, we'll use the initial state data
        // setFinancialData(data);
      } catch (error) {
        console.error('Failed to fetch financial data:', error);
      }
    };

    fetchFinancialData();
  }, []);

  return (
    <section id="finances" className="py-20 bg-black relative">
      {/* Glassmorphism background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-electric/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-neon/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyber/5 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-orbitron font-bold mb-6 bg-gradient-to-r from-electric to-neon bg-clip-text text-transparent">
            Financial Transparency
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-electric to-neon mx-auto mb-8"></div>
          <p className="text-xl font-rajdhani text-gray-300 max-w-3xl mx-auto">
            We believe in transparency. As an independent studio, we're committed to sharing our financial journey with our community.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          {/* Financial Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {/* Total Income */}
            <div className="bg-gradient-to-br from-green-900/30 to-green-800/30 rounded-xl p-6 border border-green-500/30 group hover:border-green-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-green-500/10">
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="h-8 w-8 text-green-400 group-hover:scale-110 transition-transform duration-200" />
                <span className="text-2xl font-bold text-white">{formatCurrency(financialData.totalIncome)}</span>
              </div>
              <h3 className="text-green-300 font-medium mb-2">Total Income</h3>
              <div className="text-sm text-gray-400">Year to date</div>
            </div>

            {/* Total Expenses */}
            <div className="bg-gradient-to-br from-red-900/30 to-red-800/30 rounded-xl p-6 border border-red-500/30 group hover:border-red-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-red-500/10">
              <div className="flex items-center justify-between mb-4">
                <TrendingDown className="h-8 w-8 text-red-400 group-hover:scale-110 transition-transform duration-200" />
                <span className="text-2xl font-bold text-white">{formatCurrency(financialData.totalExpenses)}</span>
              </div>
              <h3 className="text-red-300 font-medium mb-2">Total Expenses</h3>
              <div className="text-sm text-gray-400">Year to date</div>
            </div>

            {/* Net Profit */}
            <div className={`bg-gradient-to-br rounded-xl p-6 border group transition-all duration-300 hover:shadow-xl ${
              financialData.netProfit >= 0 
                ? 'from-blue-900/30 to-blue-800/30 border-blue-500/30 hover:border-blue-500/50 hover:shadow-blue-500/10' 
                : 'from-orange-900/30 to-orange-800/30 border-orange-500/30 hover:border-orange-500/50 hover:shadow-orange-500/10'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <DollarSign className={`h-8 w-8 ${financialData.netProfit >= 0 ? 'text-blue-400' : 'text-orange-400'} group-hover:scale-110 transition-transform duration-200`} />
                <span className="text-2xl font-bold text-white">{formatCurrency(financialData.netProfit)}</span>
              </div>
              <h3 className={`font-medium mb-2 ${financialData.netProfit >= 0 ? 'text-blue-300' : 'text-orange-300'}`}>Net Profit</h3>
              <div className="text-sm text-gray-400">Income - Expenses</div>
            </div>

            {/* VAT */}
            <div className="bg-gradient-to-br from-yellow-900/30 to-yellow-800/30 rounded-xl p-6 border border-yellow-500/30 group hover:border-yellow-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-yellow-500/10">
              <div className="flex items-center justify-between mb-4">
                <PieChart className="h-8 w-8 text-yellow-400 group-hover:scale-110 transition-transform duration-200" />
                <span className="text-2xl font-bold text-white">{formatCurrency(financialData.totalVAT)}</span>
              </div>
              <h3 className="text-yellow-300 font-medium mb-2">VAT Collected</h3>
              <div className="text-sm text-gray-400">Year to date</div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 relative">
            <button 
              onClick={() => setShowInfo(!showInfo)}
              className="absolute top-4 right-4 text-gray-400 hover:text-electric transition-colors"
              aria-label={showInfo ? "Hide information" : "Show information"}
            >
              <Info className="h-5 w-5" />
            </button>
            
            <h3 className="text-2xl font-orbitron font-bold mb-4 text-white">Our Financial Commitment</h3>
            
            <p className="text-gray-300 font-rajdhani mb-4">
              At MuseFuze Studios, we believe in building trust through transparency. As an independent studio, 
              we're sharing our financial journey with our community and stakeholders.
            </p>
            
            {showInfo && (
              <div className="mt-6 space-y-4 text-gray-300 font-rajdhani">
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