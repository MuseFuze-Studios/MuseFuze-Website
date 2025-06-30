import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Settings, Download, Trash2, Shield, Cookie } from 'lucide-react';

interface UserProfile {
  id: number;
  username: string;
  email: string;
  role: string;
  created_at: string;
  data_processing_consent: boolean;
  marketing_consent: boolean;
  cookie_preferences: Record<string, unknown>;
}

const UserDashboard: React.FC = () => {
  const { logout } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPrivacySettings, setShowPrivacySettings] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: ''
  });
  const [privacySettings, setPrivacySettings] = useState({
    data_processing: false,
    marketing: false,
    cookies: {}
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users/profile', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setFormData({
          username: data.username,
          email: data.email
        });
        setPrivacySettings({
          data_processing: data.data_processing_consent,
          marketing: data.marketing_consent,
          cookies: data.cookie_preferences ? JSON.parse(data.cookie_preferences) : {}
        });
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:5000/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        fetchProfile();
        setEditMode(false);
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleUpdatePrivacy = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/legal/consent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(privacySettings),
      });

      if (response.ok) {
        fetchProfile();
        setShowPrivacySettings(false);
      }
    } catch (error) {
      console.error('Failed to update privacy settings:', error);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/legal/delete-account', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        await logout();
        window.location.href = '/';
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete account');
      }
    } catch (error) {
      console.error('Failed to delete account:', error);
      alert('Failed to delete account');
    }
  };

  const handleDataExport = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/legal/data-export', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `musefuze-data-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Failed to export data:', error);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-400"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Failed to load profile</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
            User Dashboard
          </h1>
          <p className="text-xl text-gray-400">Manage your account and privacy settings</p>
        </div>

        {/* Profile Section */}
        <div className="bg-gray-800/30 rounded-2xl p-8 border border-gray-700 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{profile.username}</h2>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor(profile.role)}`}>
                  {profile.role.replace('_', ' ').toUpperCase()}
                </span>
              </div>
            </div>
            <button
              onClick={() => setEditMode(!editMode)}
              className="flex items-center space-x-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors"
            >
              <Settings className="h-4 w-4" />
              <span>{editMode ? 'Cancel' : 'Edit Profile'}</span>
            </button>
          </div>

          {editMode ? (
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <button
                type="submit"
                className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg transition-all"
              >
                Save Changes
              </button>
            </form>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-gray-300 font-medium mb-2">Email</h3>
                <p className="text-white">{profile.email}</p>
              </div>
              <div>
                <h3 className="text-gray-300 font-medium mb-2">Member Since</h3>
                <p className="text-white">{new Date(profile.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          )}
        </div>

        {/* Privacy & Legal Section */}
        <div className="bg-gray-800/30 rounded-2xl p-8 border border-gray-700 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <Shield className="h-6 w-6 mr-2" />
            Privacy & Legal
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <button
              onClick={() => setShowPrivacySettings(true)}
              className="p-6 bg-gray-700/30 rounded-lg border border-gray-600 hover:border-violet-500/50 transition-all text-left"
            >
              <Cookie className="h-8 w-8 text-violet-400 mb-3" />
              <h3 className="text-white font-medium mb-2">Cookie & Privacy Settings</h3>
              <p className="text-gray-400 text-sm">Manage your data processing and cookie preferences</p>
            </button>

            <button
              onClick={handleDataExport}
              className="p-6 bg-gray-700/30 rounded-lg border border-gray-600 hover:border-blue-500/50 transition-all text-left"
            >
              <Download className="h-8 w-8 text-blue-400 mb-3" />
              <h3 className="text-white font-medium mb-2">Export My Data</h3>
              <p className="text-gray-400 text-sm">Download all your personal data (GDPR Article 20)</p>
            </button>
          </div>

          <div className="mt-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
            <h3 className="text-red-300 font-medium mb-2 flex items-center">
              <Trash2 className="h-5 w-5 mr-2" />
              Danger Zone
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
            >
              Delete Account
            </button>
          </div>
        </div>

        {/* Privacy Settings Modal */}
        {showPrivacySettings && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-2xl font-bold text-white mb-6">Privacy Settings</h3>
              
              <div className="space-y-6">
                <div className="flex justify-between items-center p-4 bg-gray-700/30 rounded-lg">
                  <div>
                    <h4 className="text-white font-medium">Data Processing Consent</h4>
                    <p className="text-gray-400 text-sm">Allow us to process your personal data for service improvement</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={privacySettings.data_processing}
                      onChange={(e) => setPrivacySettings({ ...privacySettings, data_processing: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                  </label>
                </div>

                <div className="flex justify-between items-center p-4 bg-gray-700/30 rounded-lg">
                  <div>
                    <h4 className="text-white font-medium">Marketing Communications</h4>
                    <p className="text-gray-400 text-sm">Receive updates about new games and features</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={privacySettings.marketing}
                      onChange={(e) => setPrivacySettings({ ...privacySettings, marketing: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-8">
                <button
                  onClick={() => setShowPrivacySettings(false)}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdatePrivacy}
                  className="px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-lg transition-all"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full">
              <h3 className="text-2xl font-bold text-white mb-4">Delete Account</h3>
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete your account? This action cannot be undone and will permanently remove all your data.
              </p>
              
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;