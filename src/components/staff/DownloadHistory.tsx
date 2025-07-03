import React, { useState, useEffect } from 'react';
import { Download, Calendar, User, Monitor, Search, Filter, FileText, Clock } from 'lucide-react';

interface DownloadRecord {
  id: number;
  username: string;
  role: string;
  version: string;
  title: string;
  download_date: string;
  ip_address: string;
  user_agent: string;
  file_size: number;
  download_duration?: number;
  notes?: string;
}

const DownloadHistory: React.FC = () => {
  const [downloads, setDownloads] = useState<DownloadRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedDownload, setSelectedDownload] = useState<DownloadRecord | null>(null);

  useEffect(() => {
    fetchDownloads();
  }, []);

  const fetchDownloads = async () => {
    try {
      // Mock data for demonstration
      const mockDownloads: DownloadRecord[] = [
        {
          id: 1,
          username: 'john_doe',
          role: 'developer',
          version: 'v0.2.1',
          title: 'Alpha Build - Combat Update',
          download_date: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
          ip_address: '192.168.1.100',
          user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          file_size: 1024 * 1024 * 250, // 250MB
          download_duration: 45,
          notes: 'Testing new combat mechanics'
        },
        {
          id: 2,
          username: 'sarah_wilson',
          role: 'tester',
          version: 'v0.2.1',
          title: 'Alpha Build - Combat Update',
          download_date: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
          ip_address: '192.168.1.101',
          user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          file_size: 1024 * 1024 * 250, // 250MB
          download_duration: 38,
          notes: 'Performance testing on Mac'
        },
        {
          id: 3,
          username: 'mike_johnson',
          role: 'staff',
          version: 'v0.2.0',
          title: 'Alpha Build - Story Mode',
          download_date: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          ip_address: '192.168.1.102',
          user_agent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
          file_size: 1024 * 1024 * 180, // 180MB
          download_duration: 52,
          notes: 'Story mode review'
        },
        {
          id: 4,
          username: 'alice_brown',
          role: 'developer',
          version: 'v0.1.9',
          title: 'Pre-Alpha Build',
          download_date: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
          ip_address: '192.168.1.103',
          user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          file_size: 1024 * 1024 * 120, // 120MB
          download_duration: 28
        },
        {
          id: 5,
          username: 'david_lee',
          role: 'tester',
          version: 'v0.2.1',
          title: 'Alpha Build - Combat Update',
          download_date: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
          ip_address: '192.168.1.104',
          user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          file_size: 1024 * 1024 * 250, // 250MB
          download_duration: 41,
          notes: 'Mobile compatibility testing'
        }
      ];
      setDownloads(mockDownloads);
    } catch (error) {
      console.error('Failed to fetch download history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ceo': return 'text-amber-400 bg-amber-900/30 border-amber-500/50';
      case 'admin': return 'text-red-400 bg-red-900/30 border-red-500/50';
      case 'staff': return 'text-violet-400 bg-violet-900/30 border-violet-500/50';
      case 'developer': return 'text-blue-400 bg-blue-900/30 border-blue-500/50';
      case 'tester': return 'text-green-400 bg-green-900/30 border-green-500/50';
      default: return 'text-gray-400 bg-gray-900/30 border-gray-500/50';
    }
  };

  const getBrowserInfo = (userAgent: string) => {
    if (userAgent.includes('Chrome')) return { browser: 'Chrome', icon: '🌐' };
    if (userAgent.includes('Firefox')) return { browser: 'Firefox', icon: '🦊' };
    if (userAgent.includes('Safari')) return { browser: 'Safari', icon: '🧭' };
    if (userAgent.includes('Edge')) return { browser: 'Edge', icon: '🔷' };
    return { browser: 'Unknown', icon: '❓' };
  };

  const getOSInfo = (userAgent: string) => {
    if (userAgent.includes('Windows')) return { os: 'Windows', icon: '🪟' };
    if (userAgent.includes('Macintosh')) return { os: 'macOS', icon: '🍎' };
    if (userAgent.includes('Linux')) return { os: 'Linux', icon: '🐧' };
    if (userAgent.includes('Android')) return { os: 'Android', icon: '🤖' };
    if (userAgent.includes('iOS')) return { os: 'iOS', icon: '📱' };
    return { os: 'Unknown', icon: '❓' };
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return minutes > 0 ? `${minutes}m ${remainingSeconds}s` : `${remainingSeconds}s`;
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const filteredDownloads = downloads.filter(download => {
    const matchesSearch = download.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         download.version.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         download.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (download.notes && download.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRole = roleFilter === 'all' || download.role === roleFilter;
    
    const matchesDate = dateFilter === 'all' || (() => {
      const downloadDate = new Date(download.download_date);
      const now = new Date();
      const diffInDays = Math.floor((now.getTime() - downloadDate.getTime()) / (1000 * 60 * 60 * 24));
      
      switch (dateFilter) {
        case 'today': return diffInDays === 0;
        case 'week': return diffInDays <= 7;
        case 'month': return diffInDays <= 30;
        default: return true;
      }
    })();
    
    return matchesSearch && matchesRole && matchesDate;
  });

  // Calculate statistics
  const totalDownloads = downloads.length;
  const totalDataTransferred = downloads.reduce((sum, download) => sum + download.file_size, 0);
  const averageDownloadTime = downloads.filter(d => d.download_duration).reduce((sum, d) => sum + (d.download_duration || 0), 0) / downloads.filter(d => d.download_duration).length;
  const uniqueUsers = new Set(downloads.map(d => d.username)).size;

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
        <p className="text-gray-400">Track build downloads and usage analytics</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/30 rounded-xl p-6 border border-blue-500/30">
          <div className="flex items-center justify-between mb-4">
            <Download className="h-8 w-8 text-blue-400" />
            <span className="text-2xl font-bold text-white">{totalDownloads}</span>
          </div>
          <h3 className="text-blue-300 font-medium mb-2">Total Downloads</h3>
          <div className="text-sm text-gray-400">All time</div>
        </div>

        <div className="bg-gradient-to-br from-violet-900/30 to-violet-800/30 rounded-xl p-6 border border-violet-500/30">
          <div className="flex items-center justify-between mb-4">
            <FileText className="h-8 w-8 text-violet-400" />
            <span className="text-2xl font-bold text-white">{formatFileSize(totalDataTransferred)}</span>
          </div>
          <h3 className="text-violet-300 font-medium mb-2">Data Transferred</h3>
          <div className="text-sm text-gray-400">Total bandwidth</div>
        </div>

        <div className="bg-gradient-to-br from-green-900/30 to-green-800/30 rounded-xl p-6 border border-green-500/30">
          <div className="flex items-center justify-between mb-4">
            <Clock className="h-8 w-8 text-green-400" />
            <span className="text-2xl font-bold text-white">{Math.round(averageDownloadTime)}s</span>
          </div>
          <h3 className="text-green-300 font-medium mb-2">Avg. Download Time</h3>
          <div className="text-sm text-gray-400">Per download</div>
        </div>

        <div className="bg-gradient-to-br from-amber-900/30 to-amber-800/30 rounded-xl p-6 border border-amber-500/30">
          <div className="flex items-center justify-between mb-4">
            <User className="h-8 w-8 text-amber-400" />
            <span className="text-2xl font-bold text-white">{uniqueUsers}</span>
          </div>
          <h3 className="text-amber-300 font-medium mb-2">Unique Users</h3>
          <div className="text-sm text-gray-400">Active downloaders</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search downloads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex gap-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <option value="all">All Roles</option>
            <option value="developer">Developer</option>
            <option value="tester">Tester</option>
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
          </select>
          
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </div>

      {/* Download Detail Modal */}
      {selectedDownload && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Download Details</h3>
                <p className="text-violet-300">{selectedDownload.version} - {selectedDownload.title}</p>
              </div>
              <button
                onClick={() => setSelectedDownload(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">User Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Username:</span>
                      <span className="text-white">{selectedDownload.username}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Role:</span>
                      <span className={`px-2 py-1 rounded border text-xs font-medium ${getRoleBadgeColor(selectedDownload.role)}`}>
                        {selectedDownload.role.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">IP Address:</span>
                      <span className="text-white font-mono">{selectedDownload.ip_address}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Download Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">File Size:</span>
                      <span className="text-white">{formatFileSize(selectedDownload.file_size)}</span>
                    </div>
                    {selectedDownload.download_duration && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Duration:</span>
                        <span className="text-white">{formatDuration(selectedDownload.download_duration)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-400">Downloaded:</span>
                      <span className="text-white">{new Date(selectedDownload.download_date).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-white mb-3">System Information</h4>
                <div className="bg-gray-700/30 p-4 rounded-lg">
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{getBrowserInfo(selectedDownload.user_agent).icon}</span>
                      <div>
                        <span className="text-gray-400">Browser:</span>
                        <span className="text-white ml-2">{getBrowserInfo(selectedDownload.user_agent).browser}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{getOSInfo(selectedDownload.user_agent).icon}</span>
                      <div>
                        <span className="text-gray-400">OS:</span>
                        <span className="text-white ml-2">{getOSInfo(selectedDownload.user_agent).os}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-600">
                    <span className="text-gray-400 text-xs">User Agent:</span>
                    <p className="text-gray-300 text-xs font-mono mt-1 break-all">{selectedDownload.user_agent}</p>
                  </div>
                </div>
              </div>

              {selectedDownload.notes && (
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Notes</h4>
                  <p className="text-gray-300 bg-blue-900/20 p-3 rounded-lg border border-blue-500/30">
                    {selectedDownload.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Downloads Table */}
      <div className="bg-gray-800/30 rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700/50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">User</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Build</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Downloaded</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Details</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredDownloads.map((download) => {
                const browserInfo = getBrowserInfo(download.user_agent);
                const osInfo = getOSInfo(download.user_agent);
                
                return (
                  <tr 
                    key={download.id} 
                    className="hover:bg-gray-700/30 transition-colors cursor-pointer"
                    onClick={() => setSelectedDownload(download)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <User className="h-5 w-5 text-gray-400" />
                        <div>
                          <div className="text-white font-medium">{download.username}</div>
                          <span className={`px-2 py-1 rounded border text-xs font-medium ${getRoleBadgeColor(download.role)}`}>
                            {download.role.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-white font-medium">{download.version}</div>
                        <div className="text-gray-400 text-sm">{download.title}</div>
                        <div className="text-gray-500 text-xs">{formatFileSize(download.file_size)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2 text-gray-400">
                        <Calendar className="h-4 w-4" />
                        <div>
                          <div className="text-white">{getTimeAgo(download.download_date)}</div>
                          <div className="text-gray-400 text-xs">{new Date(download.download_date).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{browserInfo.icon}</span>
                          <span className="text-gray-300">{browserInfo.browser}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{osInfo.icon}</span>
                          <span className="text-gray-300">{osInfo.os}</span>
                        </div>
                        {download.download_duration && (
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-400">{formatDuration(download.download_duration)}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {download.notes ? (
                        <div className="text-gray-300 text-sm max-w-xs truncate" title={download.notes}>
                          {download.notes}
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm italic">No notes</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredDownloads.length === 0 && (
          <div className="text-center py-16">
            <Download className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No downloads found</h3>
            <p className="text-gray-400">
              {searchTerm || roleFilter !== 'all' || dateFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'No downloads have been recorded yet'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DownloadHistory;