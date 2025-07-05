import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import MyContracts from '../components/contracts/MyContracts';
import ContractEditor from '../components/contracts/ContractEditor';
import AssignContract from '../components/contracts/AssignContract';
import ViewUserContracts from '../components/contracts/ViewUserContracts';
import ContractRequests from '../components/contracts/ContractRequests';

const ContractsPage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user && ['admin', 'ceo'].includes(user.role);
  const [tab, setTab] = useState('my');

  const tabs = [
    { id: 'my', label: 'My Contracts', component: MyContracts },
  ];

  if (isAdmin) {
    tabs.push(
      { id: 'templates', label: 'Templates', component: ContractEditor },
      { id: 'assign', label: 'Assign', component: AssignContract },
      { id: 'view', label: 'View User', component: ViewUserContracts },
      { id: 'requests', label: 'Requests', component: ContractRequests }
    );
  }

  const Active = tabs.find(t => t.id === tab)?.component || MyContracts;

  return (
    <div className="min-h-screen bg-black">
      <header className="bg-gray-900/50 backdrop-blur-xl border-b border-gray-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            to="/dashboard"
            className="inline-flex items-center space-x-2 text-gray-300 hover:text-electric transition-colors duration-200"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-rajdhani">Back to Dashboard</span>
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-white">
        <h1 className="text-4xl font-orbitron font-bold mb-6 bg-gradient-to-r from-electric to-neon bg-clip-text text-transparent">
          Contracts
        </h1>

        <div className="bg-gray-800/50 rounded-2xl p-2 mb-6 border border-gray-700 flex flex-wrap gap-2">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-xl font-rajdhani font-medium transition-all duration-200 ${
                tab === t.id
                  ? 'bg-gradient-to-r from-electric to-neon text-black'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="bg-gray-800/30 rounded-2xl border border-gray-700 overflow-hidden">
          <Active />
        </div>
      </div>
    </div>
  );
};

export default ContractsPage;
