import React, { useState } from 'react';
import BugReports from '../components/staff/BugReports';
import Reviews from '../components/staff/Reviews';
import BuildDownloads from '../components/staff/BuildDownloads';
import TeamAnnouncements from '../components/staff/TeamAnnouncements';
import PlaytestScheduler from '../components/staff/PlaytestScheduler';
import DownloadHistory from '../components/staff/DownloadHistory';
import { Bug, MessageSquare, Download, Megaphone, Calendar, History } from 'lucide-react';

const StaffDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('announcements');

  const tabs = [
    { id: 'announcements', label: 'Announcements', icon: Megaphone, component: TeamAnnouncements },
    { id: 'bugs', label: 'Bug Reports', icon: Bug, component: BugReports },
    { id: 'reviews', label: 'Reviews', icon: MessageSquare, component: Reviews },
    { id: 'builds', label: 'Game Builds', icon: Download, component: BuildDownloads },
    { id: 'playtest', label: 'Playtest Sessions', icon: Calendar, component: PlaytestScheduler },
    { id: 'downloads', label: 'Download History', icon: History, component: DownloadHistory },
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || TeamAnnouncements;

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
            Staff Dashboard
          </h1>
          <p className="text-xl text-gray-400">
            Collaborate, test, and track development progress
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
                  className={`flex items-center space-x-2 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="hidden sm:inline">{tab.label}</span>
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

export default StaffDashboard;