import React, { useState } from 'react';
import BugReports from '../components/staff/BugReports';
import Reviews from '../components/staff/Reviews';
import BuildDownloads from '../components/staff/BuildDownloads';
import TeamAnnouncements from '../components/staff/TeamAnnouncements';
import PlaytestScheduler from '../components/staff/PlaytestScheduler';
import DownloadHistory from '../components/staff/DownloadHistory';
import MessageBoard from '../components/staff/MessageBoard';
import MuseFuzeFinances from '../components/staff/MuseFuzeFinances';
import { Bug, MessageSquare, Download, Megaphone, Calendar, History, MessageCircle, DollarSign, Settings, Zap, User, LayoutGrid } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const StaffDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('announcements');
  const [menuOpen, setMenuOpen] = useState(false);

  // Check if user has finance access (admin or finance staff)
  const hasFinanceAccess = user && ['admin', 'ceo'].includes(user.role);

  const coreTabs = [
    { id: 'announcements', label: 'Announcements', icon: Megaphone, component: TeamAnnouncements },
    { id: 'bugs', label: 'Bug Reports', icon: Bug, component: BugReports },
    { id: 'reviews', label: 'Reviews', icon: MessageSquare, component: Reviews },
    { id: 'builds', label: 'Game Builds', icon: Download, component: BuildDownloads },
  ];

  const testingTabs = [
    { id: 'messages', label: 'Message Board', icon: MessageCircle, component: MessageBoard },
    { id: 'playtest', label: 'Playtest Sessions', icon: Calendar, component: PlaytestScheduler },
    { id: 'downloads', label: 'Download History', icon: History, component: DownloadHistory },
  ];

  const adminTabs = hasFinanceAccess ? [
    { id: 'finances', label: 'Finances', icon: DollarSign, component: MuseFuzeFinances },
  ] : [];

  const allTabs = [...coreTabs, ...testingTabs, ...adminTabs];

  const ActiveComponent = allTabs.find(tab => tab.id === activeTab)?.component || TeamAnnouncements;

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ceo': return 'bg-gradient-to-r from-amber-500 to-orange-500 text-white';
      case 'admin': return 'bg-gradient-to-r from-red-500 to-pink-500 text-white';
      case 'staff': return 'bg-gradient-to-r from-violet-500 to-purple-500 text-white';
      case 'developer': return 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white';
      case 'dev_tester': return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white';
      default: return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
    }
  };

  const formatRoleName = (role: string) => {
    return role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="min-h-screen bg-black">
      <header className="fixed top-0 inset-x-0 bg-gray-900/60 backdrop-blur-lg border-b border-gray-700 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 rounded-lg text-gray-300 hover:bg-gray-700/50"
              >
                <LayoutGrid className="h-5 w-5" />
              </button>
              <Link to="/" className="flex items-center space-x-2">
                <Zap className="h-6 w-6 text-electric" />
                <span className="text-xl font-orbitron font-bold bg-gradient-to-r from-electric to-neon bg-clip-text text-transparent">
                  MuseFuze
                </span>
              </Link>
              <span className="text-gray-500">|</span>
              <span className="text-gray-300 font-rajdhani font-medium">Staff Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-electric to-neon rounded-full flex items-center justify-center text-black font-orbitron font-bold text-sm">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
                <div className="hidden sm:block">
                  <span className="text-gray-300 font-rajdhani font-medium">
                    {user?.firstName} {user?.lastName}
                  </span>
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-rajdhani font-bold ${getRoleBadgeColor(user?.role || 'user')}`}>
                    {formatRoleName(user?.role || 'user')}
                  </span>
                </div>
              </div>
              <Link
                to="/dashboard"
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors duration-200 font-rajdhani font-medium text-sm"
              >
                Account
              </Link>
              <button
                onClick={logout}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors duration-200 font-rajdhani font-medium text-sm"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>

        {menuOpen && (
          <div className="absolute left-4 mt-2 w-64 bg-gray-900/95 border border-gray-700 rounded-xl shadow-xl p-4">
            <nav className="space-y-6 text-sm">
              <div>
                <h3 className="text-gray-400 uppercase font-semibold mb-2">Core Tools</h3>
                <div className="space-y-1">
                  {coreTabs.map(tab => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id);
                          setMenuOpen(false);
                        }}
                        className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                          activeTab === tab.id ? 'bg-violet-600/20 text-violet-300' : 'text-gray-300 hover:bg-gray-700/50'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <h3 className="text-gray-400 uppercase font-semibold mb-2">Testing & Feedback</h3>
                <div className="space-y-1">
                  {testingTabs.map(tab => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id);
                          setMenuOpen(false);
                        }}
                        className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                          activeTab === tab.id ? 'bg-violet-600/20 text-violet-300' : 'text-gray-300 hover:bg-gray-700/50'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              {adminTabs.length > 0 && (
                <div>
                  <h3 className="text-gray-400 uppercase font-semibold mb-2">Admin Tools</h3>
                  <div className="space-y-1">
                    {adminTabs.map(tab => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => {
                            setActiveTab(tab.id);
                            setMenuOpen(false);
                          }}
                          className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                            activeTab === tab.id ? 'bg-amber-600/20 text-amber-300' : 'text-gray-300 hover:bg-gray-700/50'
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          <span>{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </nav>
          </div>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8">
        <div className="bg-gray-800/30 backdrop-blur-xl rounded-2xl border border-gray-700 min-h-[600px] overflow-hidden">
          <ActiveComponent />
        </div>
      </main>
    </div>
  );
};

export default StaffDashboard;