import React, { useState, useEffect } from 'react';
import { Users, Package, Bug, Activity, TrendingUp, AlertCircle } from 'lucide-react';

interface DashboardStats {
  users: Array<{ role: string; count: number }>;
  builds: { total_builds: number };
  bugs: Array<{ status: string; count: number }>;
  recentActivity: Array<{
    type: string;
    description: string;
    created_at: string;
  }>;
}

const DashboardStats: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/stats', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUserCount = (role: string) => {
    return stats?.users.find(u => u.role === role)?.count || 0;
  };

  const getBugCount = (status: string) => {
    return stats?.bugs.find(b => b.status === status)?.count || 0;
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Dashboard Overview</h2>
        <p className="text-gray-400">System statistics and recent activity</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Users */}
        <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/30 rounded-xl p-6 border border-blue-500/30">
          <div className="flex items-center justify-between mb-4">
            <Users className="h-8 w-8 text-blue-400" />
            <span className="text-2xl font-bold text-white">
              {getUserCount('user') + getUserCount('staff') + getUserCount('admin')}
            </span>
          </div>
          <h3 className="text-blue-300 font-medium mb-2">Total Users</h3>
          <div className="text-sm text-gray-400">
            {getUserCount('admin')} Admin • {getUserCount('staff')} Staff • {getUserCount('user')} Users
          </div>
        </div>

        {/* Game Builds */}
        <div className="bg-gradient-to-br from-violet-900/30 to-violet-800/30 rounded-xl p-6 border border-violet-500/30">
          <div className="flex items-center justify-between mb-4">
            <Package className="h-8 w-8 text-violet-400" />
            <span className="text-2xl font-bold text-white">
              {stats?.builds.total_builds || 0}
            </span>
          </div>
          <h3 className="text-violet-300 font-medium mb-2">Game Builds</h3>
          <div className="text-sm text-gray-400">Active builds available</div>
        </div>

        {/* Open Bugs */}
        <div className="bg-gradient-to-br from-red-900/30 to-red-800/30 rounded-xl p-6 border border-red-500/30">
          <div className="flex items-center justify-between mb-4">
            <Bug className="h-8 w-8 text-red-400" />
            <span className="text-2xl font-bold text-white">
              {getBugCount('open') + getBugCount('in_progress')}
            </span>
          </div>
          <h3 className="text-red-300 font-medium mb-2">Active Bugs</h3>
          <div className="text-sm text-gray-400">
            {getBugCount('open')} Open • {getBugCount('in_progress')} In Progress
          </div>
        </div>

        {/* System Health */}
        <div className="bg-gradient-to-br from-green-900/30 to-green-800/30 rounded-xl p-6 border border-green-500/30">
          <div className="flex items-center justify-between mb-4">
            <Activity className="h-8 w-8 text-green-400" />
            <span className="text-2xl font-bold text-white">98%</span>
          </div>
          <h3 className="text-green-300 font-medium mb-2">System Health</h3>
          <div className="text-sm text-gray-400">All systems operational</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Bug Status Breakdown */}
        <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center">
            <Bug className="h-5 w-5 mr-2 text-red-400" />
            Bug Reports Status
          </h3>
          
          <div className="space-y-4">
            {stats?.bugs.map((bug) => (
              <div key={bug.status} className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    bug.status === 'open' ? 'bg-red-400' :
                    bug.status === 'in_progress' ? 'bg-yellow-400' :
                    bug.status === 'resolved' ? 'bg-green-400' :
                    'bg-gray-400'
                  }`}></div>
                  <span className="text-gray-300 capitalize">{bug.status.replace('_', ' ')}</span>
                </div>
                <span className="text-white font-medium">{bug.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-amber-400" />
            Recent Activity
          </h3>
          
          <div className="space-y-4">
            {stats?.recentActivity && stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-amber-400 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1">
                    <p className="text-gray-300">{activity.description}</p>
                    <p className="text-gray-500 text-sm">
                      {new Date(activity.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-400">No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-gray-800/30 rounded-xl p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-6">Quick Actions</h3>
        
        <div className="grid md:grid-cols-3 gap-4">
          <button className="p-4 bg-violet-900/30 hover:bg-violet-900/50 rounded-lg border border-violet-500/30 hover:border-violet-500/50 transition-all text-left">
            <Users className="h-6 w-6 text-violet-400 mb-2" />
            <h4 className="text-white font-medium">Manage Users</h4>
            <p className="text-gray-400 text-sm">Add, edit, or remove user accounts</p>
          </button>
          
          <button className="p-4 bg-amber-900/30 hover:bg-amber-900/50 rounded-lg border border-amber-500/30 hover:border-amber-500/50 transition-all text-left">
            <Package className="h-6 w-6 text-amber-400 mb-2" />
            <h4 className="text-white font-medium">Upload Build</h4>
            <p className="text-gray-400 text-sm">Deploy a new game build</p>
          </button>
          
          <button className="p-4 bg-red-900/30 hover:bg-red-900/50 rounded-lg border border-red-500/30 hover:border-red-500/50 transition-all text-left">
            <Bug className="h-6 w-6 text-red-400 mb-2" />
            <h4 className="text-white font-medium">Review Bugs</h4>
            <p className="text-gray-400 text-sm">Check and assign bug reports</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;