import React, { useState } from 'react';
import BugReports from '../components/staff/BugReports';
import Reviews from '../components/staff/Reviews';
import BuildDownloads from '../components/staff/BuildDownloads';
import TeamAnnouncements from '../components/staff/TeamAnnouncements';
import PlaytestScheduler from '../components/staff/PlaytestScheduler';
import DownloadHistory from '../components/staff/DownloadHistory';
import MessageBoard from '../components/staff/MessageBoard';
import MuseFuzeFinances from '../components/staff/MuseFuzeFinances';
import { Bug, MessageSquare, Download, Megaphone, Calendar, History, MessageCircle, DollarSign, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const StaffDashboard: React.FC = () => {
  const { user } = useAuth();
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

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-black/80 backdrop-blur-xl border-b border-white/10 sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-orbitron font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                Staff Dashboard
              </h1>
              <p className="text-gray-400 font-rajdhani">
                Collaborate, test, and track development progress
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-300 font-rajdhani">
                Welcome, {user?.firstName}
              </span>
              <span className="px-3 py-1 bg-violet-500/20 text-violet-300 text-sm font-rajdhani font-bold rounded-full border border-violet-500/30">
                STAFF
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700 sticky top-24">
              <nav className="space-y-6">
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
                          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 font-rajdhani font-medium group ${
                            activeTab === tab.id
                              ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/25'
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
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 font-rajdhani font-medium group ${
                              activeTab === tab.id
                                ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg shadow-amber-500/25'
                                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                            }`}
                          >
                            <Icon className={`h-5 w-5 transition-transform duration-200 ${
                              activeTab === tab.id ? 'scale-110' : 'group-hover:scale-105'
                            }`} />
                            <span>{tab.label}</span>
                            <span className="ml-auto px-2 py-1 bg-amber-500/20 text-amber-300 text-xs rounded-full">
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
                      <span className="ml-auto px-2 py-1 bg-gray-600/20 text-gray-500 text-xs rounded-full">
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
            <div className="bg-gray-800/30 rounded-2xl border border-gray-700 min-h-[600px] overflow-hidden">
              <ActiveComponent />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;