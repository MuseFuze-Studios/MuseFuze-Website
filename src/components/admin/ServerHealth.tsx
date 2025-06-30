import React, { useState, useEffect } from 'react';
import { Cpu, HardDrive, Activity } from 'lucide-react';

interface Status {
  cpu: number;
  memory: number;
  disk: number;
  uptime: string;
}

const ServerHealth: React.FC = () => {
  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/server-status', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      }
    } catch (error) {
      console.error('Failed to fetch server status:', error);
    } finally {
      setLoading(false);
    }
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700 flex items-center space-x-4">
          <Cpu className="h-6 w-6 text-amber-400" />
          <div>
            <h3 className="text-gray-300 text-sm">CPU Usage</h3>
            <p className="text-white font-medium">{status?.cpu ?? 0}%</p>
          </div>
        </div>
        <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700 flex items-center space-x-4">
          <Activity className="h-6 w-6 text-violet-400" />
          <div>
            <h3 className="text-gray-300 text-sm">Memory Usage</h3>
            <p className="text-white font-medium">{status?.memory ?? 0}%</p>
          </div>
        </div>
        <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700 flex items-center space-x-4">
          <HardDrive className="h-6 w-6 text-blue-400" />
          <div>
            <h3 className="text-gray-300 text-sm">Disk Usage</h3>
            <p className="text-white font-medium">{status?.disk ?? 0}%</p>
          </div>
        </div>
        <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700 flex items-center space-x-4">
          <Activity className="h-6 w-6 text-green-400" />
          <div>
            <h3 className="text-gray-300 text-sm">Uptime</h3>
            <p className="text-white font-medium">{status?.uptime || '--'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServerHealth;