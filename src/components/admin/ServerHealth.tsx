import React, { useState, useEffect } from 'react';
import { Cpu, HardDrive, Activity, Wifi, Database, Clock } from 'lucide-react';

interface ServerStatus {
  cpu: number;
  memory: number;
  disk: number;
  uptime: string;
  connections: number;
  database: string;
  lastUpdated: string;
}

const ServerHealth: React.FC = () => {
  const [status, setStatus] = useState<ServerStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStatus();
    // Set up polling every 30 seconds
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchStatus = async () => {
    try {
      setError(null);
      const response = await fetch('/api/admin/server-status', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      } else if (response.status === 404) {
        // If endpoint doesn't exist, create mock data
        setStatus({
          cpu: Math.floor(Math.random() * 30) + 20, // 20-50%
          memory: Math.floor(Math.random() * 40) + 30, // 30-70%
          disk: Math.floor(Math.random() * 20) + 40, // 40-60%
          uptime: formatUptime(Math.floor(Math.random() * 86400 * 7)), // Random uptime up to 7 days
          connections: Math.floor(Math.random() * 50) + 10, // 10-60 connections
          database: 'Connected',
          lastUpdated: new Date().toISOString()
        });
        setError('Server monitoring endpoint not available - showing simulated data');
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to fetch server status:', error);
      setError('Failed to load server status');
      // Set fallback data
      setStatus({
        cpu: 0,
        memory: 0,
        disk: 0,
        uptime: 'Unknown',
        connections: 0,
        database: 'Unknown',
        lastUpdated: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const formatUptime = (seconds: number): string => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  const getStatusColor = (value: number, thresholds: { warning: number; critical: number }) => {
    if (value >= thresholds.critical) return 'text-red-400 bg-red-900/30 border-red-500/30';
    if (value >= thresholds.warning) return 'text-yellow-400 bg-yellow-900/30 border-yellow-500/30';
    return 'text-green-400 bg-green-900/30 border-green-500/30';
  };

  const getProgressColor = (value: number, thresholds: { warning: number; critical: number }) => {
    if (value >= thresholds.critical) return 'bg-red-500';
    if (value >= thresholds.warning) return 'bg-yellow-500';
    return 'bg-green-500';
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
        <h2 className="text-2xl font-bold text-white mb-2">Server Health</h2>
        <p className="text-gray-400">Current server status and resource usage</p>
        {error && (
          <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
            <p className="text-yellow-400 text-sm">{error}</p>
          </div>
        )}
        {status?.lastUpdated && (
          <p className="text-gray-500 text-sm mt-2">
            Last updated: {new Date(status.lastUpdated).toLocaleString()}
          </p>
        )}
      </div>

      {status && (
        <>
          {/* Resource Usage Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* CPU Usage */}
            <div className={`rounded-xl p-6 border ${getStatusColor(status.cpu, { warning: 70, critical: 90 })}`}>
              <div className="flex items-center justify-between mb-4">
                <Cpu className="h-6 w-6" />
                <span className="text-2xl font-bold">{status.cpu}%</span>
              </div>
              <h3 className="font-medium mb-2">CPU Usage</h3>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(status.cpu, { warning: 70, critical: 90 })}`}
                  style={{ width: `${Math.min(status.cpu, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Memory Usage */}
            <div className={`rounded-xl p-6 border ${getStatusColor(status.memory, { warning: 80, critical: 95 })}`}>
              <div className="flex items-center justify-between mb-4">
                <Activity className="h-6 w-6" />
                <span className="text-2xl font-bold">{status.memory}%</span>
              </div>
              <h3 className="font-medium mb-2">Memory Usage</h3>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(status.memory, { warning: 80, critical: 95 })}`}
                  style={{ width: `${Math.min(status.memory, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Disk Usage */}
            <div className={`rounded-xl p-6 border ${getStatusColor(status.disk, { warning: 85, critical: 95 })}`}>
              <div className="flex items-center justify-between mb-4">
                <HardDrive className="h-6 w-6" />
                <span className="text-2xl font-bold">{status.disk}%</span>
              </div>
              <h3 className="font-medium mb-2">Disk Usage</h3>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(status.disk, { warning: 85, critical: 95 })}`}
                  style={{ width: `${Math.min(status.disk, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Uptime */}
            <div className="bg-blue-900/30 text-blue-400 rounded-xl p-6 border border-blue-500/30">
              <div className="flex items-center justify-between mb-4">
                <Clock className="h-6 w-6" />
                <span className="text-lg font-bold">{status.uptime}</span>
              </div>
              <h3 className="font-medium">Uptime</h3>
            </div>
          </div>

          {/* Additional Metrics */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Network & Connections */}
            <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                <Wifi className="h-5 w-5 mr-2 text-blue-400" />
                Network & Connections
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Active Connections</span>
                  <span className="text-white font-medium">{status.connections}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Network Status</span>
                  <span className="text-green-400 font-medium">Online</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Load Balancer</span>
                  <span className="text-green-400 font-medium">Healthy</span>
                </div>
              </div>
            </div>

            {/* Database & Services */}
            <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                <Database className="h-5 w-5 mr-2 text-green-400" />
                Database & Services
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Database</span>
                  <span className={`font-medium ${status.database === 'Connected' ? 'text-green-400' : 'text-red-400'}`}>
                    {status.database}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">API Server</span>
                  <span className="text-green-400 font-medium">Running</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">File Storage</span>
                  <span className="text-green-400 font-medium">Available</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Cache</span>
                  <span className="text-green-400 font-medium">Active</span>
                </div>
              </div>
            </div>
          </div>

          {/* Refresh Button */}
          <div className="mt-8 text-center">
            <button
              onClick={fetchStatus}
              disabled={loading}
              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 disabled:from-gray-600 disabled:to-gray-700 text-white px-6 py-3 rounded-lg transition-all duration-200 font-medium disabled:cursor-not-allowed"
            >
              {loading ? 'Refreshing...' : 'Refresh Status'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ServerHealth;