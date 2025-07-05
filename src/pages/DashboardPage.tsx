import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Settings, Download, Shield, Trash2, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { userAPI } from '../services/api';
import CookiePreferencesButton from '../components/CookiePreferencesButton';

interface UserData {
  userData: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    cookiesAccepted: boolean;
    createdAt: string;
    updatedAt: string;
  };
  gameBuilds: any[];
  messagePosts: any[];
  dataPolicy: {
    passwordStorage: string;
    sessionManagement: string;
    dataRetention: string;
    thirdPartySharing: string;
    advertising: string;
  };
}

const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDataDetails, setShowDataDetails] = useState(false);
  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || ''
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');

  const isStaffOrAbove = user && ['dev_tester', 'developer', 'staff', 'admin', 'ceo'].includes(user.role);

  useEffect(() => {
    if (user) {
      setProfileForm({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      });
    }
  }, [user]);

  const handleDataDownload = async () => {
    setLoading(true);
    try {
      const response = await userAPI.getUserData();
      setUserData(response.data);
      
      // Create and download JSON file
      const dataStr = JSON.stringify(response.data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `musefuze-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download data:', error);
      alert('Failed to download your data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAccountDeletion = async () => {
    const confirmation = prompt(
      'Are you sure you want to delete your account? This action cannot be undone. Type "DELETE" to confirm:'
    );
    
    if (confirmation !== 'DELETE') {
      return;
    }

    try {
      await userAPI.deleteAccount();
      alert('Your account has been successfully deleted.');
      logout();
    } catch (error) {
      console.error('Failed to delete account:', error);
      alert('Failed to delete account. Please try again or contact support.');
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMessage('');

    try {
      await userAPI.updateProfile(profileForm);
      setProfileMessage('Profile updated successfully!');
      // Refresh auth context to get updated user data
      window.location.reload();
    } catch (error: any) {
      setProfileMessage(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ceo': return 'bg-gradient-to-r from-amber-600 to-orange-600 text-white';
      case 'admin': return 'bg-gradient-to-r from-red-600 to-pink-600 text-white';
      case 'staff': return 'bg-gradient-to-r from-violet-600 to-purple-600 text-white';
      case 'developer': return 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white';
      case 'dev_tester': return 'bg-gradient-to-r from-green-600 to-emerald-600 text-white';
      default: return 'bg-gradient-to-r from-gray-600 to-gray-700 text-white';
    }
  };

  const formatRoleName = (role: string) => {
    return role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="text-2xl font-orbitron font-bold bg-gradient-to-r from-electric to-neon bg-clip-text text-transparent">
              MuseFuze Studios
            </Link>
            <div className="flex items-center space-x-4">
              {isStaffOrAbove && (
                <Link
                  to="/staff"
                  className="px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-lg transition-all duration-200 font-rajdhani font-medium"
                >
                  Staff Dashboard
                </Link>
              )}
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors duration-200 font-rajdhani font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-orbitron font-bold mb-4 bg-gradient-to-r from-electric to-neon bg-clip-text text-transparent">
              Welcome, {user?.firstName}
            </h1>
            <p className="text-xl text-gray-300 font-rajdhani mb-6">
              Manage your account and preferences
            </p>
            <div className="flex justify-center">
              <span className={`px-4 py-2 rounded-full font-rajdhani font-bold text-sm ${getRoleBadgeColor(user?.role || 'user')}`}>
                {formatRoleName(user?.role || 'user')}
              </span>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="bg-gray-800/50 rounded-2xl p-2 mb-8 border border-gray-700">
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'profile', label: 'Profile', icon: User },
                { id: 'privacy', label: 'Privacy & Data', icon: Shield },
                { id: 'settings', label: 'Settings', icon: Settings },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-200 font-rajdhani font-medium ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-electric to-neon text-black'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-gray-800/30 rounded-2xl p-8 border border-gray-700">
            {activeTab === 'profile' && (
              <div>
                <h2 className="text-2xl font-orbitron font-bold text-white mb-6">Profile Information</h2>
                
                {profileMessage && (
                  <div className={`mb-6 p-4 rounded-lg ${
                    profileMessage.includes('successfully') 
                      ? 'bg-green-500/10 border border-green-500/20 text-green-400' 
                      : 'bg-red-500/10 border border-red-500/20 text-red-400'
                  }`}>
                    {profileMessage}
                  </div>
                )}

                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-rajdhani font-medium text-gray-300 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={profileForm.firstName}
                        onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-electric/50 font-rajdhani"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-rajdhani font-medium text-gray-300 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={profileForm.lastName}
                        onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-electric/50 font-rajdhani"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-rajdhani font-medium text-gray-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-electric/50 font-rajdhani"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-rajdhani font-medium text-gray-300 mb-2">
                      Account Role
                    </label>
                    <div className="px-4 py-3 bg-gray-700/30 border border-gray-600 rounded-lg">
                      <span className="text-gray-300 font-rajdhani">{formatRoleName(user?.role || 'user')}</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={profileLoading}
                    className="px-6 py-3 bg-gradient-to-r from-electric to-neon text-black font-rajdhani font-bold rounded-lg hover:shadow-xl hover:shadow-electric/25 transition-all duration-300 disabled:opacity-50"
                  >
                    {profileLoading ? 'Updating...' : 'Update Profile'}
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div>
                <h2 className="text-2xl font-orbitron font-bold text-white mb-6">Privacy & Data Management</h2>
                
                <div className="space-y-8">
                  {/* Cookie Preferences */}
                  <div className="bg-gray-700/30 rounded-xl p-6 border border-gray-600">
                    <h3 className="text-xl font-orbitron font-bold text-white mb-4">Cookie Preferences</h3>
                    <p className="text-gray-300 font-rajdhani mb-4">
                      Manage your cookie preferences and control what data we collect.
                    </p>
                    <CookiePreferencesButton />
                  </div>

                  {/* Data Download */}
                  <div className="bg-gray-700/30 rounded-xl p-6 border border-gray-600">
                    <h3 className="text-xl font-orbitron font-bold text-white mb-4">Download Your Data</h3>
                    <p className="text-gray-300 font-rajdhani mb-4">
                      Download a copy of all your personal data stored in our systems.
                    </p>
                    <button
                      onClick={handleDataDownload}
                      disabled={loading}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors duration-200 font-rajdhani font-medium"
                    >
                      <Download className="h-4 w-4" />
                      <span>{loading ? 'Preparing Download...' : 'Download Data'}</span>
                    </button>
                  </div>

                  {/* Data Details */}
                  <div className="bg-gray-700/30 rounded-xl p-6 border border-gray-600">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-orbitron font-bold text-white">What Data We Store</h3>
                      <button
                        onClick={() => setShowDataDetails(!showDataDetails)}
                        className="text-electric hover:text-neon transition-colors duration-200"
                      >
                        {showDataDetails ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    
                    {showDataDetails && userData && (
                      <div className="space-y-4 text-sm">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-rajdhani font-bold text-gray-300 mb-2">Personal Information</h4>
                            <ul className="text-gray-400 font-rajdhani space-y-1">
                              <li>• Name and email address</li>
                              <li>• Account creation date</li>
                              <li>• Role and permissions</li>
                              <li>• Cookie preferences</li>
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-rajdhani font-bold text-gray-300 mb-2">Activity Data</h4>
                            <ul className="text-gray-400 font-rajdhani space-y-1">
                              <li>• Login sessions</li>
                              <li>• Content you've created</li>
                              <li>• Messages and communications</li>
                              <li>• File downloads (staff only)</li>
                            </ul>
                          </div>
                        </div>
                        
                        <div className="pt-4 border-t border-gray-600">
                          <h4 className="font-rajdhani font-bold text-gray-300 mb-2">Data Protection</h4>
                          <ul className="text-gray-400 font-rajdhani space-y-1">
                            <li>• {userData.dataPolicy.passwordStorage}</li>
                            <li>• {userData.dataPolicy.sessionManagement}</li>
                            <li>• {userData.dataPolicy.dataRetention}</li>
                            <li>• {userData.dataPolicy.thirdPartySharing}</li>
                            <li>• {userData.dataPolicy.advertising}</li>
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Account Deletion */}
                  <div className="bg-red-900/20 rounded-xl p-6 border border-red-500/30">
                    <h3 className="text-xl font-orbitron font-bold text-white mb-4 flex items-center">
                      <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
                      Delete Account
                    </h3>
                    <p className="text-gray-300 font-rajdhani mb-4">
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                    <button
                      onClick={handleAccountDeletion}
                      className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 font-rajdhani font-medium"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete Account</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div>
                <h2 className="text-2xl font-orbitron font-bold text-white mb-6">Account Settings</h2>
                
                <div className="space-y-6">
                  <div className="bg-gray-700/30 rounded-xl p-6 border border-gray-600">
                    <h3 className="text-lg font-orbitron font-bold text-white mb-4">Quick Actions</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <Link
                        to="/privacy-policy"
                        className="p-4 bg-gray-600/30 hover:bg-gray-600/50 rounded-lg border border-gray-500 hover:border-electric/50 transition-all duration-200 text-center"
                      >
                        <Shield className="h-8 w-8 text-electric mx-auto mb-2" />
                        <h4 className="text-white font-rajdhani font-bold">Privacy Policy</h4>
                        <p className="text-gray-400 font-rajdhani text-sm">Review our privacy practices</p>
                      </Link>
                      
                      <Link
                        to="/terms"
                        className="p-4 bg-gray-600/30 hover:bg-gray-600/50 rounded-lg border border-gray-500 hover:border-electric/50 transition-all duration-200 text-center"
                      >
                        <Settings className="h-8 w-8 text-electric mx-auto mb-2" />
                        <h4 className="text-white font-rajdhani font-bold">Terms of Service</h4>
                        <p className="text-gray-400 font-rajdhani text-sm">Read our terms and conditions</p>
                      </Link>
                    </div>
                  </div>

                  <div className="bg-gray-700/30 rounded-xl p-6 border border-gray-600">
                    <h3 className="text-lg font-orbitron font-bold text-white mb-4">Account Information</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400 font-rajdhani">Account ID:</span>
                        <span className="text-white font-rajdhani font-mono">{user?.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400 font-rajdhani">Member Since:</span>
                        <span className="text-white font-rajdhani">
                          {userData?.userData.createdAt ? new Date(userData.userData.createdAt).toLocaleDateString() : 'Loading...'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400 font-rajdhani">Last Updated:</span>
                        <span className="text-white font-rajdhani">
                          {userData?.userData.updatedAt ? new Date(userData.userData.updatedAt).toLocaleDateString() : 'Loading...'}
                        </span>
                      </div>
                    </div>
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