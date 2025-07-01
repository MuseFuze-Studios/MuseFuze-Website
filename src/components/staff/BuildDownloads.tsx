import React, { useState, useEffect } from 'react';
import { Download, Calendar, FileText, AlertTriangle } from 'lucide-react';

interface GameBuild {
  id: number;
  version: string;
  title: string;
  description: string;
  file_size: number;
  upload_date: string;
  test_instructions: string;
  known_issues: string;
  uploaded_by_name: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const BuildDownloads: React.FC = () => {
  const [builds, setBuilds] = useState<GameBuild[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<number | null>(null);

  useEffect(() => {
    fetchBuilds();
  }, []);

  const fetchBuilds = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/builds`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setBuilds(data);
      }
    } catch (error) {
      console.error('Failed to fetch builds:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (buildId: number, version: string) => {
    setDownloading(buildId);
    
    try {
      const response = await fetch(`${API_BASE_URL}/builds/download/${buildId}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${version}.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Failed to download build');
      }
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed');
    } finally {
      setDownloading(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
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
        <h2 className="text-2xl font-bold text-white mb-2">Game Builds</h2>
        <p className="text-gray-400">Download and test the latest game builds</p>
      </div>

      <div className="space-y-6">
        {builds.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No builds available</p>
          </div>
        ) : (
          builds.map((build) => (
            <div
              key={build.id}
              className="bg-gray-700/30 rounded-xl p-6 border border-gray-600 hover:border-violet-500/50 transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-bold text-white">{build.version}</h3>
                    <span className="px-3 py-1 bg-violet-900/30 text-violet-300 rounded-full text-sm font-medium">
                      {formatFileSize(build.file_size)}
                    </span>
                  </div>
                  <h4 className="text-lg text-violet-300 font-medium mb-3">{build.title}</h4>
                  
                  {build.description && (
                    <p className="text-gray-300 mb-4">{build.description}</p>
                  )}

                  <div className="flex items-center space-x-4 text-sm text-gray-400 mb-4">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(build.upload_date).toLocaleDateString()}</span>
                    </div>
                    <span>•</span>
                    <span>Uploaded by {build.uploaded_by_name}</span>
                  </div>

                  {build.test_instructions && (
                    <div className="mb-4">
                      <h5 className="text-sm font-medium text-gray-300 mb-2 flex items-center">
                        <FileText className="h-4 w-4 mr-1" />
                        Test Instructions
                      </h5>
                      <p className="text-gray-400 text-sm bg-gray-800/50 p-3 rounded-lg">
                        {build.test_instructions}
                      </p>
                    </div>
                  )}

                  {build.known_issues && (
                    <div className="mb-4">
                      <h5 className="text-sm font-medium text-gray-300 mb-2 flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-1 text-yellow-400" />
                        Known Issues
                      </h5>
                      <p className="text-gray-400 text-sm bg-yellow-900/20 p-3 rounded-lg border border-yellow-500/30">
                        {build.known_issues}
                      </p>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleDownload(build.id, build.version)}
                  disabled={downloading === build.id}
                  className="ml-6 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white px-6 py-3 rounded-lg transition-all duration-200 flex items-center space-x-2 font-medium"
                >
                  {downloading === build.id ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Downloading...</span>
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      <span>Download</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BuildDownloads;