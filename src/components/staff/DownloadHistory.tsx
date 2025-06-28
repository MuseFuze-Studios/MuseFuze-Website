import React, { useState, useEffect } from 'react';
import { Download, Calendar, User, Monitor } from 'lucide-react';

interface DownloadRecord {
  id: number;
  username: string;
  role: string;
  version: string;
  title: string;
  download_date: string;
  ip_address: string;
  user_agent: string;
}

const DownloadHistory: React.FC = () => {
  const [downloads, setDownloads] = useState<DownloadRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDownloads();
  }, []);

  const fetchDownloads = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/builds/downloads', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setDownloads(data);
      }
    } catch (error) {
      console.error('Failed to fetch download history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ceo': return 'text-amber-400 bg-amber-900/30';
      case 'admin': return 'text-red-400 bg-red-900/30';
      case 'staff': return 'text-violet-400 bg-violet-900/30';
      case 'developer': return 'text-blue-400 bg-blue-900/30';
      case 'dev_tester': return 'text-green-400 bg-green-900/30';
      default: return 'text-gray-400 bg-gray-900/30';
    }
  };

  const getBrowserInfo = (userAgent: string) => {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown';
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-400"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center">
          <Download className="h-6 w-6 mr-2" />
          Download History
        </h2>
        <p className="text-gray-400">Track who's downloading and testing builds</p>
      </div>

      <div className="bg-gray-800/30 rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700/50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">User</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Build</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Date</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {downloads.map((download) => (
                <tr key={download.id} className="hover:bg-gray-700/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <User className="h-5 w-5 text-gray-400" />
                      <div>
                        <div className="text-white font-medium">{download.username}</div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getRoleBadgeColor(download.role)}`}>
                          {download.role.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-white font-medium">{download.version}</div>
                      <div className="text-gray-400 text-sm">{download.title}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2 text-gray-400">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(download.download_date).toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1 text-sm text-gray-400">
                      <div className="flex items-center space-x-2">
                        <Monitor className="h-4 w-4" />
                        <span>{getBrowserInfo(download.user_agent)}</span>
                      </div>
                      <div>IP: {download.ip_address}</div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {downloads.length === 0 && (
          <div className="text-center py-12">
            <Download className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No downloads recorded yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DownloadHistory;