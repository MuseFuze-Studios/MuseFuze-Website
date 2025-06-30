import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { userAPI, staffAPI } from '../services/api';
import { Link } from 'react-router-dom';
import { 
  User, 
  LogOut, 
  Upload, 
  MessageSquare, 
  Settings, 
  Download,
  ExternalLink,
  Trash2,
  Plus,
  Eye,
  Calendar,
  Shield,
  Reply,
  ChevronDown,
  ChevronUp,
  Crown
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import UploadProgress from '../components/UploadProgress';

interface UserData {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  cookiesAccepted: boolean;
  createdAt: string;
}

interface GameBuild {
  id: number;
  name: string;
  version: string;
  description: string;
  fileUrl?: string;
  externalUrl?: string;
  uploadDate: string;
  firstName: string;
  lastName: string;
}

interface MessagePost {
  id: number;
  title: string;
  content: string;
  authorId: number;
  firstName: string;
  lastName: string;
  createdAt: string;
  updatedAt: string;
  isEdited: boolean;
  replyCount: number;
}

interface MessageReply {
  id: number;
  title: string;
  content: string;
  authorId: number;
  firstName: string;
  lastName: string;
  createdAt: string;
  updatedAt: string;
  isEdited: boolean;
  parentId: number;
}

interface UploadState {
  progress: number;
  fileName: string;
  isUploading: boolean;
  error?: string;
}

const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [gameBuilds, setGameBuilds] = useState<GameBuild[]>([]);
  const [messagePosts, setMessagePosts] = useState<MessagePost[]>([]);
  const [expandedPosts, setExpandedPosts] = useState<Set<number>>(new Set());
  const [postReplies, setPostReplies] = useState<Record<number, MessageReply[]>>({});
  const [loading, setLoading] = useState(true);
  const [uploadState, setUploadState] = useState<UploadState | null>(null);

  // Build upload form
  const [buildForm, setBuildForm] = useState({
    name: '',
    version: '',
    description: '',
    externalUrl: '',
    file: null as File | null,
  });

  // Message form
  const [messageForm, setMessageForm] = useState({
    title: '',
    content: '',
  });

  // Reply forms
  const [replyForms, setReplyForms] = useState<Record<number, { content: string }>>({});
  const [showReplyForm, setShowReplyForm] = useState<number | null>(null);

  const [showBuildForm, setShowBuildForm] = useState(false);
  const [showMessageForm, setShowMessageForm] = useState(false);

  const loadDashboardData = useCallback(async () => {
    try {
      const [profileResponse] = await Promise.all([
        userAPI.getProfile(),
      ]);

      setUserData(profileResponse.data.user);

      const staffRoles = ['dev_tester', 'developer', 'staff', 'admin', 'ceo'];
      if (user && staffRoles.includes(user.role)) {
        const [buildsResponse, messagesResponse] = await Promise.all([
          staffAPI.getBuilds(),
          staffAPI.getMessages(),
        ]);

        setGameBuilds(buildsResponse.data.builds);
        setMessagePosts(messagesResponse.data.posts);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.role]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const formatRole = (role: string) => {
    return role
      .replace('_', ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };


  const simulateUploadProgress = (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      setUploadState({
        progress: 0,
        fileName: file.name,
        isUploading: true,
      });

      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          setUploadState(prev => prev ? { ...prev, progress: 100, isUploading: false } : null);
          setTimeout(() => {
            setUploadState(null);
            resolve();
          }, 1000);
        } else {
          setUploadState(prev => prev ? { ...prev, progress: Math.round(progress) } : null);
        }
      }, 200);

      // Simulate potential error (5% chance)
      if (Math.random() < 0.05) {
        setTimeout(() => {
          clearInterval(interval);
          setUploadState(prev => prev ? { 
            ...prev, 
            progress: 0, 
            isUploading: false, 
            error: 'Upload failed. Please try again.' 
          } : null);
          setTimeout(() => setUploadState(null), 3000);
          reject(new Error('Upload failed'));
        }, 2000);
      }
    });
  };

  const handleBuildUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('name', buildForm.name);
    formData.append('version', buildForm.version);
    formData.append('description', buildForm.description);
    if (buildForm.externalUrl) {
      formData.append('externalUrl', buildForm.externalUrl);
    }
    if (buildForm.file) {
      formData.append('buildFile', buildForm.file);
      
      try {
        await simulateUploadProgress(buildForm.file);
      } catch {
        return; // Upload failed
      }
    }

    try {
      await staffAPI.uploadBuild(formData);
      setBuildForm({ name: '', version: '', description: '', externalUrl: '', file: null });
      setShowBuildForm(false);
      loadDashboardData();
    } catch (error) {
      console.error('Build upload failed:', error);
    }
  };

  const handleMessagePost = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await staffAPI.createMessage(messageForm);
      setMessageForm({ title: '', content: '' });
      setShowMessageForm(false);
      loadDashboardData();
    } catch (error) {
      console.error('Message post failed:', error);
    }
  };

  const handleReplySubmit = async (postId: number) => {
    const replyContent = replyForms[postId]?.content;
    if (!replyContent?.trim()) return;

    try {
      await staffAPI.createMessage({
        title: `Re: ${messagePosts.find(p => p.id === postId)?.title || 'Reply'}`,
        content: replyContent,
        parentId: postId,
      });
      
      setReplyForms(prev => ({ ...prev, [postId]: { content: '' } }));
      setShowReplyForm(null);
      loadDashboardData();
      
      // Reload replies for this post
      if (expandedPosts.has(postId)) {
        loadReplies(postId);
      }
    } catch (error) {
      console.error('Reply failed:', error);
    }
  };

  const loadReplies = async (postId: number) => {
    try {
      const response = await staffAPI.getReplies(postId);
      setPostReplies(prev => ({ ...prev, [postId]: response.data.replies }));
    } catch (error) {
      console.error('Failed to load replies:', error);
    }
  };

  const togglePostExpansion = async (postId: number) => {
    const newExpanded = new Set(expandedPosts);
    if (newExpanded.has(postId)) {
      newExpanded.delete(postId);
    } else {
      newExpanded.add(postId);
      // Load replies when expanding
      if (!postReplies[postId]) {
        await loadReplies(postId);
      }
    }
    setExpandedPosts(newExpanded);
  };

  const deleteBuild = async (id: number) => {
    if (confirm('Are you sure you want to delete this build?')) {
      try {
        await staffAPI.deleteBuild(id);
        loadDashboardData();
      } catch (error) {
        console.error('Build deletion failed:', error);
      }
    }
  };

  const deleteMessage = async (id: number) => {
    if (confirm('Are you sure you want to delete this message?')) {
      try {
        await staffAPI.deleteMessage(id);
        loadDashboardData();
      } catch (error) {
        console.error('Message deletion failed:', error);
      }
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-black/80 backdrop-blur-xl border-b border-white/10 sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-orbitron font-bold bg-gradient-to-r from-electric to-neon bg-clip-text text-transparent">
              Dashboard
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-300 font-rajdhani">
                Welcome, {user?.firstName}
              </span>
              {user && ['dev_tester','developer','staff','admin','ceo'].includes(user.role) && (
                <span className="px-3 py-1 bg-electric/20 text-electric text-sm font-rajdhani font-bold rounded-full border border-electric/30">
                  STAFF
                </span>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors duration-200"
              >
                <LogOut className="h-4 w-4" />
                <span className="font-rajdhani">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 sticky top-24">
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 font-rajdhani ${
                    activeTab === 'profile' 
                      ? 'bg-electric/20 text-electric border border-electric/30' 
                      : 'text-gray-300 hover:bg-white/10'
                  }`}
                >
                  <User className="h-5 w-5" />
                  <span>Profile</span>
                </button>

                {user && ['dev_tester','developer','staff','admin','ceo'].includes(user.role) && (
                  <>
                    <button
                      onClick={() => setActiveTab('builds')}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 font-rajdhani ${
                        activeTab === 'builds' 
                          ? 'bg-electric/20 text-electric border border-electric/30' 
                          : 'text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      <Upload className="h-5 w-5" />
                      <span>Dev Builds</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('messages')}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 font-rajdhani ${
                        activeTab === 'messages' 
                          ? 'bg-electric/20 text-electric border border-electric/30' 
                          : 'text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      <MessageSquare className="h-5 w-5" />
                      <span>Message Board</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('tools')}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 font-rajdhani ${
                        activeTab === 'tools' 
                          ? 'bg-electric/20 text-electric border border-electric/30' 
                          : 'text-gray-300 hover:bg-white/10'
                      }`}
                    >
                    <Settings className="h-5 w-5" />
                      <span>Staff Tools</span>
                    </button>
                  </>
                )}

                {user && ['admin','ceo'].includes(user.role) && (
                  <Link
                    to="/admin"
                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 font-rajdhani text-gray-300 hover:bg-white/10"
                  >
                    <Crown className="h-5 w-5" />
                    <span>Admin Panel</span>
                  </Link>
                )}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
                  <h2 className="text-2xl font-orbitron font-bold mb-6 text-white">Profile Information</h2>
                  
                  {userData && (
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-rajdhani font-medium text-gray-200 mb-2">
                          First Name
                        </label>
                        <div className="px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white font-rajdhani">
                          {userData.firstName}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-rajdhani font-medium text-gray-200 mb-2">
                          Last Name
                        </label>
                        <div className="px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white font-rajdhani">
                          {userData.lastName}
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-rajdhani font-medium text-gray-200 mb-2">
                          Email Address
                        </label>
                        <div className="px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white font-rajdhani">
                          {userData.email}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-rajdhani font-medium text-gray-200 mb-2">
                          Account Type
                        </label>
                        <div className="px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white font-rajdhani flex items-center">
                          {['dev_tester','developer','staff','admin','ceo'].includes(userData.role) ? (
                            <>
                              <Shield className="h-4 w-4 text-electric mr-2" />
                              {formatRole(userData.role)}
                            </>
                          ) : (
                            <>
                              <User className="h-4 w-4 text-gray-400 mr-2" />
                              {formatRole(userData.role)}
                            </>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-rajdhani font-medium text-gray-200 mb-2">
                          Member Since
                        </label>
                        <div className="px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white font-rajdhani flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          {new Date(userData.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
                  <h3 className="text-xl font-orbitron font-bold mb-4 text-white">Privacy & Data</h3>
                  <p className="text-gray-300 font-rajdhani mb-4">
                    Your data is stored securely and is never shared with third parties. 
                    You can view all data we have about you below.
                  </p>
                  <button
                    onClick={async () => {
                      try {
                        const response = await userAPI.getUserData();
                        const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'my-musefuze-data.json';
                        a.click();
                        URL.revokeObjectURL(url);
                      } catch (error) {
                        console.error('Failed to download data:', error);
                      }
                    }}
                    className="inline-flex items-center px-4 py-2 bg-electric/20 text-electric border border-electric/30 rounded-lg hover:bg-electric/30 transition-colors duration-200 font-rajdhani"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download My Data
                  </button>
                </div>
              </div>
            )}

            {/* Dev Builds Tab */}
            {activeTab === 'builds' && user && ['dev_tester','developer','staff','admin','ceo'].includes(user.role) && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-orbitron font-bold text-white">Development Builds</h2>
                  <button
                    onClick={() => setShowBuildForm(!showBuildForm)}
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-electric to-neon text-black font-rajdhani font-bold rounded-lg hover:shadow-xl hover:shadow-electric/25 transition-all duration-300"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Upload Build
                  </button>
                </div>

                {/* Upload Progress */}
                {uploadState && (
                  <UploadProgress
                    progress={uploadState.progress}
                    fileName={uploadState.fileName}
                    isComplete={uploadState.progress === 100 && !uploadState.isUploading}
                    error={uploadState.error}
                    onCancel={uploadState.isUploading ? () => setUploadState(null) : undefined}
                  />
                )}

                {showBuildForm && (
                  <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
                    <h3 className="text-xl font-orbitron font-bold mb-6 text-white">Upload New Build</h3>
                    <form onSubmit={handleBuildUpload} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-rajdhani font-medium text-gray-200 mb-2">
                            Build Name
                          </label>
                          <input
                            type="text"
                            required
                            value={buildForm.name}
                            onChange={(e) => setBuildForm({ ...buildForm, name: e.target.value })}
                            className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-electric/20 focus:border-electric transition-colors duration-200 font-rajdhani text-white placeholder-gray-400"
                            placeholder="e.g., FRONTLINE Alpha"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-rajdhani font-medium text-gray-200 mb-2">
                            Version
                          </label>
                          <input
                            type="text"
                            required
                            value={buildForm.version}
                            onChange={(e) => setBuildForm({ ...buildForm, version: e.target.value })}
                            className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-electric/20 focus:border-electric transition-colors duration-200 font-rajdhani text-white placeholder-gray-400"
                            placeholder="e.g., 1.0.0-alpha"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-rajdhani font-medium text-gray-200 mb-2">
                          Description
                        </label>
                        <textarea
                          rows={3}
                          value={buildForm.description}
                          onChange={(e) => setBuildForm({ ...buildForm, description: e.target.value })}
                          className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-electric/20 focus:border-electric transition-colors duration-200 font-rajdhani text-white placeholder-gray-400 resize-none"
                          placeholder="Describe what's new in this build..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-rajdhani font-medium text-gray-200 mb-2">
                          Upload File
                        </label>
                        <input
                          type="file"
                          accept=".zip,.rar,.7z,.tar,.gz,.exe,.msi,.dmg,.pkg,.deb,.rpm,.apk,.ipa"
                          onChange={(e) => setBuildForm({ ...buildForm, file: e.target.files?.[0] || null })}
                          className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-electric/20 focus:border-electric transition-colors duration-200 font-rajdhani text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-electric/20 file:text-electric file:font-rajdhani file:font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-rajdhani font-medium text-gray-200 mb-2">
                          Or External URL
                        </label>
                        <input
                          type="url"
                          value={buildForm.externalUrl}
                          onChange={(e) => setBuildForm({ ...buildForm, externalUrl: e.target.value })}
                          className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-electric/20 focus:border-electric transition-colors duration-200 font-rajdhani text-white placeholder-gray-400"
                          placeholder="https://example.com/build.zip"
                        />
                      </div>

                      <div className="flex space-x-4">
                        <button
                          type="submit"
                          disabled={uploadState?.isUploading}
                          className="px-6 py-3 bg-gradient-to-r from-electric to-neon text-black font-rajdhani font-bold rounded-lg hover:shadow-xl hover:shadow-electric/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {uploadState?.isUploading ? 'Uploading...' : 'Upload Build'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowBuildForm(false)}
                          className="px-6 py-3 bg-white/10 text-white font-rajdhani font-bold rounded-lg hover:bg-white/20 transition-colors duration-200"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="space-y-4">
                  {gameBuilds.map((build) => (
                    <div key={build.id} className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-orbitron font-bold text-white mb-2">{build.name}</h3>
                          <p className="text-electric font-rajdhani font-bold">Version {build.version}</p>
                          <p className="text-gray-300 font-rajdhani text-sm">
                            Uploaded by {build.firstName} {build.lastName} on {new Date(build.uploadDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          {build.fileUrl && (
                            <a
                              href={`http://localhost:5000${build.fileUrl}`}
                              download
                              className="p-2 bg-electric/20 text-electric rounded-lg hover:bg-electric/30 transition-colors duration-200"
                              title="Download"
                            >
                              <Download className="h-4 w-4" />
                            </a>
                          )}
                          {build.externalUrl && (
                            <a
                              href={build.externalUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 bg-neon/20 text-neon rounded-lg hover:bg-neon/30 transition-colors duration-200"
                              title="External Link"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                          <button
                            onClick={() => deleteBuild(build.id)}
                            className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors duration-200"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      {build.description && (
                        <p className="text-gray-300 font-rajdhani">{build.description}</p>
                      )}
                    </div>
                  ))}

                  {gameBuilds.length === 0 && (
                    <div className="text-center py-12">
                      <Upload className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-400 font-rajdhani text-lg">No builds uploaded yet</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Message Board Tab */}
            {activeTab === 'messages' && user && ['dev_tester','developer','staff','admin','ceo'].includes(user.role) && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-orbitron font-bold text-white">Staff Message Board</h2>
                  <button
                    onClick={() => setShowMessageForm(!showMessageForm)}
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-electric to-neon text-black font-rajdhani font-bold rounded-lg hover:shadow-xl hover:shadow-electric/25 transition-all duration-300"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Post
                  </button>
                </div>

                {showMessageForm && (
                  <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
                    <h3 className="text-xl font-orbitron font-bold mb-6 text-white">Create New Post</h3>
                    <form onSubmit={handleMessagePost} className="space-y-6">
                      <div>
                        <label className="block text-sm font-rajdhani font-medium text-gray-200 mb-2">
                          Title
                        </label>
                        <input
                          type="text"
                          required
                          value={messageForm.title}
                          onChange={(e) => setMessageForm({ ...messageForm, title: e.target.value })}
                          className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-electric/20 focus:border-electric transition-colors duration-200 font-rajdhani text-white placeholder-gray-400"
                          placeholder="Post title..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-rajdhani font-medium text-gray-200 mb-2">
                          Content
                        </label>
                        <textarea
                          rows={6}
                          required
                          value={messageForm.content}
                          onChange={(e) => setMessageForm({ ...messageForm, content: e.target.value })}
                          className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-electric/20 focus:border-electric transition-colors duration-200 font-rajdhani text-white placeholder-gray-400 resize-none"
                          placeholder="What's on your mind?"
                        />
                      </div>

                      <div className="flex space-x-4">
                        <button
                          type="submit"
                          className="px-6 py-3 bg-gradient-to-r from-electric to-neon text-black font-rajdhani font-bold rounded-lg hover:shadow-xl hover:shadow-electric/25 transition-all duration-300"
                        >
                          Post Message
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowMessageForm(false)}
                          className="px-6 py-3 bg-white/10 text-white font-rajdhani font-bold rounded-lg hover:bg-white/20 transition-colors duration-200"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="space-y-4">
                  {messagePosts.map((post) => (
                    <div key={post.id} className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-orbitron font-bold text-white mb-2">{post.title}</h3>
                          <p className="text-gray-300 font-rajdhani text-sm mb-2">
                            By {post.firstName} {post.lastName} • {new Date(post.createdAt).toLocaleDateString()}
                            {post.isEdited && <span className="text-gray-500 ml-2">(edited)</span>}
                          </p>
                        </div>
                        {post.authorId === user?.id && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => deleteMessage(post.id)}
                              className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors duration-200"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>
                      
                      <p className="text-gray-300 font-rajdhani whitespace-pre-wrap mb-4">{post.content}</p>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-white/10">
                        <div className="flex items-center space-x-4">
                          {post.replyCount > 0 && (
                            <button
                              onClick={() => togglePostExpansion(post.id)}
                              className="flex items-center space-x-2 text-electric hover:text-neon transition-colors duration-200 font-rajdhani text-sm"
                            >
                              {expandedPosts.has(post.id) ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                              <span>
                                {post.replyCount} {post.replyCount === 1 ? 'reply' : 'replies'}
                              </span>
                            </button>
                          )}
                        </div>
                        
                        <button
                          onClick={() => setShowReplyForm(showReplyForm === post.id ? null : post.id)}
                          className="flex items-center space-x-2 px-3 py-1 bg-electric/20 text-electric rounded-lg hover:bg-electric/30 transition-colors duration-200 font-rajdhani text-sm"
                        >
                          <Reply className="h-4 w-4" />
                          <span>Reply</span>
                        </button>
                      </div>

                      {/* Reply Form */}
                      {showReplyForm === post.id && (
                        <div className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10">
                          <textarea
                            rows={3}
                            value={replyForms[post.id]?.content || ''}
                            onChange={(e) => setReplyForms(prev => ({
                              ...prev,
                              [post.id]: { content: e.target.value }
                            }))}
                            className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-electric/20 focus:border-electric transition-colors duration-200 font-rajdhani text-white placeholder-gray-400 resize-none"
                            placeholder="Write your reply..."
                          />
                          <div className="flex space-x-2 mt-3">
                            <button
                              onClick={() => handleReplySubmit(post.id)}
                              disabled={!replyForms[post.id]?.content?.trim()}
                              className="px-4 py-2 bg-electric/20 text-electric rounded-lg hover:bg-electric/30 transition-colors duration-200 font-rajdhani text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Post Reply
                            </button>
                            <button
                              onClick={() => setShowReplyForm(null)}
                              className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors duration-200 font-rajdhani text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Replies */}
                      {expandedPosts.has(post.id) && postReplies[post.id] && (
                        <div className="mt-4 space-y-3">
                          {postReplies[post.id].map((reply) => (
                            <div key={reply.id} className="ml-6 p-4 bg-white/5 rounded-lg border border-white/10">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <p className="text-gray-300 font-rajdhani text-sm">
                                    {reply.firstName} {reply.lastName} • {new Date(reply.createdAt).toLocaleDateString()}
                                    {reply.isEdited && <span className="text-gray-500 ml-2">(edited)</span>}
                                  </p>
                                </div>
                                {reply.authorId === user?.id && (
                                  <button
                                    onClick={() => deleteMessage(reply.id)}
                                    className="p-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors duration-200"
                                    title="Delete"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                )}
                              </div>
                              <p className="text-gray-300 font-rajdhani whitespace-pre-wrap">{reply.content}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  {messagePosts.length === 0 && (
                    <div className="text-center py-12">
                      <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-400 font-rajdhani text-lg">No messages yet</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Staff Tools Tab */}
            {activeTab === 'tools' && user && ['dev_tester','developer','staff','admin','ceo'].includes(user.role) && (
              <div className="space-y-6">
                <h2 className="text-2xl font-orbitron font-bold text-white">Staff Tools</h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 text-center">
                    <Settings className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-orbitron font-bold text-white mb-2">Coming Soon</h3>
                    <p className="text-gray-300 font-rajdhani">
                      Additional staff tools and features will be added here as the platform grows.
                    </p>
                  </div>

                  <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 text-center">
                    <Eye className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-orbitron font-bold text-white mb-2">Future Features</h3>
                    <p className="text-gray-300 font-rajdhani">
                      Team management, bug tracker, analytics dashboard, and more internal tools.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;