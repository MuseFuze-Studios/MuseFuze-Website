import React, { useState } from 'react';
import UserManagement from '../components/admin/UserManagement';
import FeatureToggles from '../components/admin/FeatureToggles';
import BuildManagement from '../components/admin/BuildManagement';
import SystemLogs from '../components/admin/SystemLogs';
import DashboardStats from '../components/admin/DashboardStats';
import { Users, ToggleLeft, Upload, FileText, BarChart3 } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('stats');

  const tabs = [
    { id: 'stats', label: 'Dashboard', icon: BarChart3, component: DashboardStats },
    { id: 'users', label: 'Users', icon: Users, component: UserManagement },
    { id: 'features', label: 'Features', icon: ToggleLeft, component: FeatureToggles },
    { id: 'builds', label: 'Builds', icon: Upload, component: BuildManagement },
    { id: 'logs', label: 'Logs', icon: FileText, component: SystemLogs },
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || DashboardStats;

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
            Admin Panel
          </h1>
          <p className="text-xl text-gray-400">
            System administration and management controls
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-gray-800/50 rounded-2xl p-2 mb-8 border border-gray-700">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-200 font-medium ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-gray-800/30 rounded-2xl border border-gray-700 min-h-[600px]">
          <ActiveComponent />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;