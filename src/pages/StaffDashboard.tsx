import React, { useState } from 'react';
import BugReports from '../components/staff/BugReports';
import Reviews from '../components/staff/Reviews';
import BuildDownloads from '../components/staff/BuildDownloads';
import TeamAnnouncements from '../components/staff/TeamAnnouncements';
import PlaytestScheduler from '../components/staff/PlaytestScheduler';
import DownloadHistory from '../components/staff/DownloadHistory';
import MessageBoard from '../components/staff/MessageBoard';
import MuseFuzeFinances from '../components/staff/MuseFuzeFinances';
import { Bug, MessageSquare, Download, Megaphone, Calendar, History, MessageCircle, DollarSign, Settings, Zap, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const StaffDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('announcements');

  // Check if user has finance access (admin or finance staff)
  const hasFinanceAccess = user && ['admin', 'ceo'].includes(user.role);

  const tabs = [
    { id: 'announcements', label: 'Announcements', icon: Megaphone, component: TeamAnnouncements },
    { id: 'bugs', label: 'Bug Reports', icon: Bug, component: BugReports },
    { id: 'reviews', label: 'Reviews', icon: MessageSquare, component: Reviews },
    { id: 'messages', label: 'Message Board', icon: MessageCircle, component: MessageBoard },
    { id: 'builds', label: 'Game Builds', icon: Download, component: BuildDownloads },
    { id: 'playtest', label: 'Playtest Sessions', icon: Calendar, component: PlaytestScheduler },
    { id: 'downloads', label: 'Download History', icon: History, component: DownloadHistory },
  ];

  // Add Staff Tools section with Finance module for authorized users
  const staffToolsTabs = hasFinanceAccess ? [
    { id: 'finances', label: 'Finances', icon: DollarSign, component: MuseFuzeFinances },
  ] : [];

  const ActiveComponent = [...tabs, ...staffToolsTabs].find(tab => tab.id === activeTab)?.component || TeamAnnouncements;

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
      {/* Header */}
      <header className="bg-gray-900/50 backdrop-blur-xl border-b border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
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
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700 p-6 sticky top-24">
              <div className="mb-8">
                <h1 className="text-2xl font-orbitron font-bold bg-gradient-to-r from-electric to-neon bg-clip-text text-transparent mb-2">
                  Staff Dashboard
                </h1>
                <p className="text-gray-400 font-rajdhani">
                  Collaborate, test, and track development progress
                </p>
              </div>

              <nav className="space-y-8">
                {/* Main Tools */}
                <div>
                  <h3 className="text-sm font-orbitron font-bold text-gray-400 uppercase tracking-wider mb-4">
                    Main Tools
                  </h3>
                  <div className="space-y-2">
                    {tabs.map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 font-rajdhani font-medium group ${
                            activeTab === tab.id
                              ? 'bg-gradient-to-r from-violet-600/20 to-purple-600/20 text-violet-300 border border-violet-500/30 shadow-lg shadow-violet-500/10'
                              : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                          }`}
                        >
                          <Icon className={`h-5 w-5 transition-transform duration-200 ${
                            activeTab === tab.id ? 'scale-110' : 'group-hover:scale-105'
                          }`} />
                          <span>{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Staff Tools (Finance & Future Features) */}
                {hasFinanceAccess && staffToolsTabs.length > 0 && (
                  <div>
                    <h3 className="text-sm font-orbitron font-bold text-gray-400 uppercase tracking-wider mb-4">
                      Staff Tools
                    </h3>
                    <div className="space-y-2">
                      {staffToolsTabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                          <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 font-rajdhani font-medium group ${
                              activeTab === tab.id
                                ? 'bg-gradient-to-r from-amber-600/20 to-orange-600/20 text-amber-300 border border-amber-500/30 shadow-lg shadow-amber-500/10'
                                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                            }`}
                          >
                            <Icon className={`h-5 w-5 transition-transform duration-200 ${
                              activeTab === tab.id ? 'scale-110' : 'group-hover:scale-105'
                            }`} />
                            <span>{tab.label}</span>
                            <span className="ml-auto px-2 py-1 bg-amber-500/20 text-amber-300 text-xs rounded-full font-orbitron font-bold">
                              ADMIN
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Future Tools Placeholder */}
                <div>
                  <h3 className="text-sm font-orbitron font-bold text-gray-400 uppercase tracking-wider mb-4">
                    Coming Soon
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-500 cursor-not-allowed">
                      <Settings className="h-5 w-5" />
                      <span className="font-rajdhani font-medium">Internal Wiki</span>
                      <span className="ml-auto px-2 py-1 bg-gray-600/20 text-gray-500 text-xs rounded-full font-orbitron font-bold">
                        SOON
                      </span>
                    </div>
                  </div>
                </div>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="bg-gray-800/30 backdrop-blur-xl rounded-2xl border border-gray-700 min-h-[600px] overflow-hidden">
              <ActiveComponent />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;