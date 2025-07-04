import React, { useState, useEffect } from 'react';
import { Upload, Trash2, FileText, Calendar } from 'lucide-react';

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

const BuildManagement: React.FC = () => {
  const [builds, setBuilds] = useState<GameBuild[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    version: '',
    title: '',
    description: '',
    testInstructions: '',
    knownIssues: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    fetchBuilds();
  }, []);

  const fetchBuilds = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/builds', {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      alert('Please select a file to upload');
      return;
    }

    setUploading(true);
    
    const formDataToSend = new FormData();
    formDataToSend.append('buildFile', selectedFile);
    formDataToSend.append('name', formData.title);
    formDataToSend.append('version', formData.version);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('testInstructions', formData.testInstructions);
    formDataToSend.append('knownIssues', formData.knownIssues);

    try {
      const response = await fetch('/api/staff/builds/upload', {
        method: 'POST',
        credentials: 'include',
        body: formDataToSend,
      });

      if (response.ok) {
        fetchBuilds();
        setShowForm(false);
        setFormData({
          version: '',
          title: '',
          description: '',
          testInstructions: '',
          knownIssues: ''
        });
        setSelectedFile(null);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to upload build');
      }
    } catch (error) {
      console.error('Failed to upload build:', error);
      alert('Failed to upload build');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this build? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/staff/builds/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        fetchBuilds();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete build');
      }
    } catch (error) {
      console.error('Failed to delete build:', error);
      alert('Failed to delete build');
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Build Management</h2>
          <p className="text-gray-400">Upload and manage game builds</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2"
        >
          <Upload className="h-4 w-4" />
          <span>Upload Build</span>
        </button>
      </div>

      {/* Upload Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-white mb-6">Upload New Build</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Version *
                </label>
                <input
                  type="text"
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                  required
                  placeholder="e.g., 0.0.5 Dev Test"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="e.g., Alpha Build - Combat System Update"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  placeholder="Brief description of changes and improvements..."
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Test Instructions
                </label>
                <textarea
                  value={formData.testInstructions}
                  onChange={(e) => setFormData({ ...formData, testInstructions: e.target.value })}
                  rows={3}
                  placeholder="Instructions for testing this build..."
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Known Issues
                </label>
                <textarea
                  value={formData.knownIssues}
                  onChange={(e) => setFormData({ ...formData, knownIssues: e.target.value })}
                  rows={3}
                  placeholder="List any known bugs or issues..."
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Build File * (ZIP, RAR, 7Z, EXE)
                </label>
                <input
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  accept=".zip,.rar,.7z,.exe"
                  required
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-amber-600 file:text-white hover:file:bg-amber-700"
                />
                {selectedFile && (
                  <p className="text-sm text-gray-400 mt-2">
                    Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                  </p>
                )}
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setFormData({
                      version: '',
                      title: '',
                      description: '',
                      testInstructions: '',
                      knownIssues: ''
                    });
                    setSelectedFile(null);
                  }}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-lg transition-all flex items-center space-x-2"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      <span>Upload Build</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Builds List */}
      <div className="space-y-6">
        {builds.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No builds uploaded yet</p>
          </div>
        ) : (
          builds.map((build) => (
            <div
              key={build.id}
              className="bg-gray-700/30 rounded-xl p-6 border border-gray-600 hover:border-amber-500/50 transition-all"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-bold text-white">{build.version}</h3>
                    <span className="px-3 py-1 bg-amber-900/30 text-amber-300 rounded-full text-sm font-medium">
                      {formatFileSize(build.file_size)}
                    </span>
                  </div>
                  <h4 className="text-lg text-amber-300 font-medium mb-3">{build.title}</h4>
                  
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

                  {(build.test_instructions || build.known_issues) && (
                    <div className="grid md:grid-cols-2 gap-4">
                      {build.test_instructions && (
                        <div>
                          <h5 className="text-sm font-medium text-gray-300 mb-2">Test Instructions</h5>
                          <p className="text-gray-400 text-sm bg-gray-800/50 p-3 rounded-lg">
                            {build.test_instructions}
                          </p>
                        </div>
                      )}
                      {build.known_issues && (
                        <div>
                          <h5 className="text-sm font-medium text-gray-300 mb-2">Known Issues</h5>
                          <p className="text-gray-400 text-sm bg-yellow-900/20 p-3 rounded-lg border border-yellow-500/30">
                            {build.known_issues}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleDelete(build.id)}
                  className="ml-6 p-2 text-gray-400 hover:text-red-400 transition-colors"
                  title="Delete Build"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BuildManagement;