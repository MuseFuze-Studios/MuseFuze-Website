import React, { useState, useEffect } from 'react';
import { FileText, Clock, User } from 'lucide-react';

interface SystemLog {
  id: number;
  user_id: number;
  username: string;
  action: string;
  details: string;
  ip_address: string;
  created_at: string;
}

const SystemLogs: React.FC = () => {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/logs', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setLogs(data);
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    if (action.includes('login') || action.includes('auth')) {
      return 'text-green-400 bg-green-900/30';
    }
    if (action.includes('delete') || action.includes('remove')) {
      return 'text-red-400 bg-red-900/30';
    }
    if (action.includes('create') || action.includes('add')) {
      return 'text-blue-400 bg-blue-900/30';
    }
    if (action.includes('update') || action.includes('edit')) {
      return 'text-yellow-400 bg-yellow-900/30';
    }
    return 'text-gray-400 bg-gray-900/30';
  };

  const filteredLogs = logs.filter((log) =>
    [log.username, log.action, log.details].some((field) =>
      field?.toLowerCase().includes(filter.toLowerCase())
    )
  );

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
        <h2 className="text-2xl font-bold text-white mb-2">System Logs</h2>
        <p className="text-gray-400">Recent system activity and user actions (last 100 entries)</p>
      </div>

      <div className="mb-6">
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter logs"
          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>

      <div className="space-y-4">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No system logs found</p>
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              className="bg-gray-700/30 rounded-lg p-6 border border-gray-600 hover:border-amber-500/50 transition-all"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getActionColor(log.action)}`}>
                    {log.action.toUpperCase()}
                  </span>
                  <div className="flex items-center space-x-2 text-gray-400">
                    <User className="h-4 w-4" />
                    <span>{log.username || 'System'}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-gray-400 text-sm">
                  <Clock className="h-4 w-4" />
                  <span>{new Date(log.created_at).toLocaleString()}</span>
                </div>
              </div>

              {log.details && (
                <p className="text-gray-300 mb-3">{log.details}</p>
              )}

              {log.ip_address && (
                <div className="text-sm text-gray-400">
                  IP: {log.ip_address}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {logs.length > 0 && (
        <div className="mt-8 text-center">
          <button
            onClick={fetchLogs}
            className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-6 py-3 rounded-lg transition-all duration-200 font-medium"
          >
            Refresh Logs
          </button>
        </div>
      )}
    </div>
  );
};

export default SystemLogs;