import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, 
  Settings, 
  Download, 
  Shield, 
  Trash2, 
  Eye, 
  EyeOff, 
  AlertTriangle,
  Edit3,
  Mail,
  Calendar,
  Key,
  Bell,
  Globe,
  Smartphone,
  Monitor,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight,
  Info
} from 'lucide-react';
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
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('overview');
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
  const [editingProfile, setEditingProfile] = useState(false);

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
      setEditingProfile(false);
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
      case 'ceo': return 'bg-gradient-to-r from-amber-500 to-orange-500 text-white';
      case 'admin': return 'bg-gradient-to-r from-red-500 to-pink-500 text-white';
      case 'staff': return 'bg-gradient-to-r from-violet-500 to-purple-500 text-white';
      case 'developer': return 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white';
      case 'dev_tester': return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white';
      default: return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
    }
  };

  const formatRoleName = (role: string) => {
    return role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const sidebarItems = [
    { id: 'overview', label: 'Account Overview', icon: User },
    { id: 'personal-info', label: 'Personal Info', icon: Edit3 },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'privacy', label: 'Privacy & Data', icon: Eye },
    { id: 'preferences', label: 'Preferences', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-2xl font-bold text-gray-900">
                MuseFuze
              </Link>
              <span className="text-gray-400">|</span>
              <span className="text-gray-600 font-medium">Account</span>
            </div>
            <div className="flex items-center space-x-4">
              {isStaffOrAbove && (
                <Link
                  to="/staff"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 font-medium text-sm"
                >
                  Staff Dashboard
                </Link>
              )}
              <button
                onClick={logout}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 font-medium text-sm"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-gray-200">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{user?.firstName} {user?.lastName}</h3>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
              </div>
              
              <nav className="space-y-1">
                {sidebarItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors duration-200 ${
                        activeSection === item.id
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeSection === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Account Overview</h1>
                  <p className="text-gray-600">Manage your MuseFuze account settings and preferences</p>
                </div>

                {/* Quick Actions */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900">Personal Info</h3>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">Update your name, email, and other personal details</p>
                    <button
                      onClick={() => setActiveSection('personal-info')}
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center space-x-1"
                    >
                      <span>Manage</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Shield className="h-5 w-5 text-green-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900">Security</h3>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">Keep your account secure with strong authentication</p>
                    <button
                      onClick={() => setActiveSection('security')}
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center space-x-1"
                    >
                      <span>Review</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Eye className="h-5 w-5 text-purple-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900">Privacy</h3>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">Control your data and privacy settings</p>
                    <button
                      onClick={() => setActiveSection('privacy')}
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center space-x-1"
                    >
                      <span>Manage</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Account Status */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Account Status</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="font-medium text-gray-900">Account Verified</span>
                      </div>
                      <p className="text-gray-600 text-sm">Your email address has been verified</p>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <div className={`w-3 h-3 rounded-full ${getRoleBadgeColor(user?.role || 'user').split(' ')[0]}`}></div>
                        <span className="font-medium text-gray-900">{formatRoleName(user?.role || 'user')}</span>
                      </div>
                      <p className="text-gray-600 text-sm">Your current access level</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'personal-info' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Personal Info</h1>
                  <p className="text-gray-600">Update your personal information and contact details</p>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-gray-900">Basic Information</h3>
                      {!editingProfile && (
                        <button
                          onClick={() => setEditingProfile(true)}
                          className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center space-x-1"
                        >
                          <Edit3 className="h-4 w-4" />
                          <span>Edit</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="p-6">
                    {profileMessage && (
                      <div className={`mb-6 p-4 rounded-lg ${
                        profileMessage.includes('successfully') 
                          ? 'bg-green-50 border border-green-200 text-green-800' 
                          : 'bg-red-50 border border-red-200 text-red-800'
                      }`}>
                        {profileMessage}
                      </div>
                    )}

                    {editingProfile ? (
                      <form onSubmit={handleProfileUpdate} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              First Name
                            </label>
                            <input
                              type="text"
                              value={profileForm.firstName}
                              onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Last Name
                            </label>
                            <input
                              type="text"
                              value={profileForm.lastName}
                              onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address
                          </label>
                          <input
                            type="email"
                            value={profileForm.email}
                            onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        <div className="flex space-x-3">
                          <button
                            type="submit"
                            disabled={profileLoading}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors duration-200 font-medium"
                          >
                            {profileLoading ? 'Saving...' : 'Save Changes'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingProfile(false);
                              setProfileForm({
                                firstName: user?.firstName || '',
                                lastName: user?.lastName || '',
                                email: user?.email || ''
                              });
                              setProfileMessage('');
                            }}
                            className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 font-medium"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                            <p className="text-gray-900">{user?.firstName}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                            <p className="text-gray-900">{user?.lastName}</p>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                          <p className="text-gray-900">{user?.email}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Account Role</label>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor(user?.role || 'user')}`}>
                            {formatRoleName(user?.role || 'user')}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'security' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Security</h1>
                  <p className="text-gray-600">Keep your account secure and monitor security activity</p>
                </div>

                <div className="grid gap-6">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Key className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Password</h3>
                        <p className="text-gray-600 text-sm">Last changed 30 days ago</p>
                      </div>
                    </div>
                    <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                      Change Password
                    </button>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Monitor className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Recent Activity</h3>
                        <p className="text-gray-600 text-sm">Monitor your account activity</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                          <Monitor className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Current session</p>
                            <p className="text-xs text-gray-500">Chrome on Windows • Active now</p>
                          </div>
                        </div>
                        <span className="text-xs text-green-600 font-medium">Active</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'privacy' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy & Data</h1>
                  <p className="text-gray-600">Control your data and privacy settings</p>
                </div>

                <div className="grid gap-6">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Cookie Preferences</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Manage your cookie preferences and control what data we collect.
                    </p>
                    <CookiePreferencesButton />
                  </div>

                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Download Your Data</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Download a copy of all your personal data stored in our systems.
                    </p>
                    <button
                      onClick={handleDataDownload}
                      disabled={loading}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors duration-200 font-medium"
                    >
                      <Download className="h-4 w-4" />
                      <span>{loading ? 'Preparing Download...' : 'Download Data'}</span>
                    </button>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold text-gray-900">Data We Store</h3>
                      <button
                        onClick={() => setShowDataDetails(!showDataDetails)}
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center space-x-1"
                      >
                        {showDataDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        <span>{showDataDetails ? 'Hide' : 'Show'} Details</span>
                      </button>
                    </div>
                    
                    {showDataDetails && (
                      <div className="space-y-4 text-sm">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <h4 className="font-medium text-gray-900 mb-2">Personal Information</h4>
                            <ul className="text-gray-600 space-y-1">
                              <li>• Name and email address</li>
                              <li>• Account creation date</li>
                              <li>• Role and permissions</li>
                              <li>• Cookie preferences</li>
                            </ul>
                          </div>
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <h4 className="font-medium text-gray-900 mb-2">Activity Data</h4>
                            <ul className="text-gray-600 space-y-1">
                              <li>• Login sessions</li>
                              <li>• Content you've created</li>
                              <li>• Messages and communications</li>
                              <li>• File downloads (staff only)</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <AlertTriangle className="h-6 w-6 text-red-600" />
                      <h3 className="font-semibold text-red-900">Delete Account</h3>
                    </div>
                    <p className="text-red-700 text-sm mb-4">
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                    <button
                      onClick={handleAccountDeletion}
                      className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 font-medium"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete Account</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'preferences' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Preferences</h1>
                  <p className="text-gray-600">Customize your experience and notification settings</p>
                </div>

                <div className="grid gap-6">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Quick Links</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <Link
                        to="/privacy-policy"
                        className="p-4 border border-gray-200 hover:border-gray-300 rounded-lg transition-colors duration-200 text-center"
                      >
                        <Shield className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                        <h4 className="font-medium text-gray-900">Privacy Policy</h4>
                        <p className="text-gray-600 text-sm">Review our privacy practices</p>
                      </Link>
                      
                      <Link
                        to="/terms"
                        className="p-4 border border-gray-200 hover:border-gray-300 rounded-lg transition-colors duration-200 text-center"
                      >
                        <Settings className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                        <h4 className="font-medium text-gray-900">Terms of Service</h4>
                        <p className="text-gray-600 text-sm">Read our terms and conditions</p>
                      </Link>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Account Information</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Account ID</span>
                        <span className="text-gray-900 font-mono">{user?.id}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Member Since</span>
                        <span className="text-gray-900">
                          {userData?.userData.createdAt ? new Date(userData.userData.createdAt).toLocaleDateString() : 'Loading...'}
                        </span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-gray-600">Last Updated</span>
                        <span className="text-gray-900">
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