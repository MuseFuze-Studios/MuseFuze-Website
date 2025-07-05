import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import MyContracts from '../components/contracts/MyContracts';
import ContractEditor from '../components/contracts/ContractEditor';
import AssignContract from '../components/contracts/AssignContract';
import ViewUserContracts from '../components/contracts/ViewUserContracts';

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
      { id: 'view', label: 'View User', component: ViewUserContracts }
    );
  }

  const Active = tabs.find(t => t.id === tab)?.component || MyContracts;

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-orbitron font-bold mb-6 bg-gradient-to-r from-electric to-neon bg-clip-text text-transparent">Contracts</h1>
      <div className="flex space-x-2 mb-4">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-lg font-rajdhani font-medium ${tab === t.id ? 'bg-electric text-black' : 'bg-gray-800'}`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="bg-gray-800/50 rounded-2xl border border-gray-700">
        <Active />
      </div>
    </div>
  );
};

export default ContractsPage;
