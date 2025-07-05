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
  Info,
  Zap
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
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-gray-900/50 backdrop-blur-xl border-b border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center space-x-2">
                <Zap className="h-6 w-6 text-electric" />
                <span className="text-xl font-orbitron font-bold bg-gradient-to-r from-electric to-neon bg-clip-text text-transparent">
                  MuseFuze
                </span>
              </Link>
              <span className="text-gray-500">|</span>
              <span className="text-gray-300 font-rajdhani font-medium">Account</span>
            </div>
            <div className="flex items-center space-x-4">
              {isStaffOrAbove && (
                <Link
                  to="/staff"
                  className="px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-lg transition-all duration-200 font-rajdhani font-medium text-sm shadow-lg hover:shadow-violet-500/25"
                >
                  Staff Dashboard
                </Link>
              )}
              <button
                onClick={logout}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors duration-200 font-rajdhani font-medium text-sm"
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
          <div className="lg:w-80 flex-shrink-0">
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700 p-6 sticky top-24">
              <div className="flex items-center space-x-4 mb-8 pb-6 border-b border-gray-700">
                <div className="w-16 h-16 bg-gradient-to-br from-electric to-neon rounded-full flex items-center justify-center text-black font-orbitron font-bold text-xl">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
                <div>
                  <h3 className="font-orbitron font-bold text-white text-lg">{user?.firstName} {user?.lastName}</h3>
                  <p className="text-gray-400 font-rajdhani">{user?.email}</p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-rajdhani font-bold mt-1 ${getRoleBadgeColor(user?.role || 'user')}`}>
                    {formatRoleName(user?.role || 'user')}
                  </span>
                </div>
              </div>
              
              <nav className="space-y-2">
                {sidebarItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 font-rajdhani font-medium group ${
                        activeSection === item.id
                          ? 'bg-gradient-to-r from-electric/20 to-neon/20 text-electric border border-electric/30 shadow-lg shadow-electric/10'
                          : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                      }`}
                    >
                      <Icon className={`h-5 w-5 transition-transform duration-200 ${
                        activeSection === item.id ? 'scale-110' : 'group-hover:scale-105'
                      }`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeSection === 'overview' && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-4xl font-orbitron font-bold text-white mb-3 bg-gradient-to-r from-electric to-neon bg-clip-text text-transparent">Account Overview</h1>
                  <p className="text-gray-400 font-rajdhani text-lg">Manage your MuseFuze account settings and preferences</p>
                </div>

                {/* Quick Actions */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-gray-800/30 backdrop-blur-xl rounded-2xl border border-gray-700 p-6 hover:border-electric/30 transition-all duration-300 hover:shadow-xl hover:shadow-electric/10 group">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl flex items-center justify-center border border-blue-500/30">
                        <User className="h-6 w-6 text-blue-400" />
                      </div>
                      <h3 className="font-orbitron font-bold text-white">Personal Info</h3>
                    </div>
                    <p className="text-gray-400 font-rajdhani mb-4">Update your name, email, and other personal details</p>
                    <button
                      onClick={() => setActiveSection('personal-info')}
                      className="text-electric hover:text-neon font-rajdhani font-medium flex items-center space-x-2 group-hover:translate-x-1 transition-transform duration-200"
                    >
                      <span>Manage</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="bg-gray-800/30 backdrop-blur-xl rounded-2xl border border-gray-700 p-6 hover:border-electric/30 transition-all duration-300 hover:shadow-xl hover:shadow-electric/10 group">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl flex items-center justify-center border border-green-500/30">
                        <Shield className="h-6 w-6 text-green-400" />
                      </div>
                      <h3 className="font-orbitron font-bold text-white">Security</h3>
                    </div>
                    <p className="text-gray-400 font-rajdhani mb-4">Keep your account secure with strong authentication</p>
                    <button
                      onClick={() => setActiveSection('security')}
                      className="text-electric hover:text-neon font-rajdhani font-medium flex items-center space-x-2 group-hover:translate-x-1 transition-transform duration-200"
                    >
                      <span>Review</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="bg-gray-800/30 backdrop-blur-xl rounded-2xl border border-gray-700 p-6 hover:border-electric/30 transition-all duration-300 hover:shadow-xl hover:shadow-electric/10 group">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl flex items-center justify-center border border-purple-500/30">
                        <Eye className="h-6 w-6 text-purple-400" />
                      </div>
                      <h3 className="font-orbitron font-bold text-white">Privacy</h3>
                    </div>
                    <p className="text-gray-400 font-rajdhani mb-4">Control your data and privacy settings</p>
                    <button
                      onClick={() => setActiveSection('privacy')}
                      className="text-electric hover:text-neon font-rajdhani font-medium flex items-center space-x-2 group-hover:translate-x-1 transition-transform duration-200"
                    >
                      <span>Manage</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Account Status */}
                <div className="bg-gray-800/30 backdrop-blur-xl rounded-2xl border border-gray-700 p-8">
                  <h3 className="font-orbitron font-bold text-white text-xl mb-6">Account Status</h3>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <div className="flex items-center space-x-3 mb-3">
                        <CheckCircle className="h-6 w-6 text-green-400" />
                        <span className="font-rajdhani font-bold text-white text-lg">Account Verified</span>
                      </div>
                      <p className="text-gray-400 font-rajdhani">Your email address has been verified and your account is active</p>
                    </div>
                    <div>
                      <div className="flex items-center space-x-3 mb-3">
                        <div className={`w-4 h-4 rounded-full ${getRoleBadgeColor(user?.role || 'user').split(' ')[0]}`}></div>
                        <span className="font-rajdhani font-bold text-white text-lg">{formatRoleName(user?.role || 'user')}</span>
                      </div>
                      <p className="text-gray-400 font-rajdhani">Your current access level and permissions</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'personal-info' && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-4xl font-orbitron font-bold text-white mb-3 bg-gradient-to-r from-electric to-neon bg-clip-text text-transparent">Personal Info</h1>
                  <p className="text-gray-400 font-rajdhani text-lg">Update your personal information and contact details</p>
                </div>

                <div className="bg-gray-800/30 backdrop-blur-xl rounded-2xl border border-gray-700">
                  <div className="p-6 border-b border-gray-700">
                    <div className="flex justify-between items-center">
                      <h3 className="font-orbitron font-bold text-white text-xl">Basic Information</h3>
                      {!editingProfile && (
                        <button
                          onClick={() => setEditingProfile(true)}
                          className="text-electric hover:text-neon font-rajdhani font-medium flex items-center space-x-2 transition-colors duration-200"
                        >
                          <Edit3 className="h-4 w-4" />
                          <span>Edit</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="p-6">
                    {profileMessage && (
                      <div className={`mb-6 p-4 rounded-xl border ${
                        profileMessage.includes('successfully') 
                          ? 'bg-green-500/10 border-green-500/30 text-green-400' 
                          : 'bg-red-500/10 border-red-500/30 text-red-400'
                      }`}>
                        <p className="font-rajdhani font-medium">{profileMessage}</p>
                      </div>
                    )}

                    {editingProfile ? (
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
                              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-electric/50 focus:border-electric transition-all duration-200 text-white font-rajdhani"
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
                              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-electric/50 focus:border-electric transition-all duration-200 text-white font-rajdhani"
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
                            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-electric/50 focus:border-electric transition-all duration-200 text-white font-rajdhani"
                          />
                        </div>

                        <div className="flex space-x-4">
                          <button
                            type="submit"
                            disabled={profileLoading}
                            className="px-6 py-3 bg-gradient-to-r from-electric to-neon text-black font-rajdhani font-bold rounded-lg hover:shadow-xl hover:shadow-electric/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
                            className="px-6 py-3 text-gray-400 hover:text-white transition-colors duration-200 font-rajdhani font-medium"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-rajdhani font-medium text-gray-400 mb-2">First Name</label>
                            <p className="text-white font-rajdhani text-lg">{user?.firstName}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-rajdhani font-medium text-gray-400 mb-2">Last Name</label>
                            <p className="text-white font-rajdhani text-lg">{user?.lastName}</p>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-rajdhani font-medium text-gray-400 mb-2">Email Address</label>
                          <p className="text-white font-rajdhani text-lg">{user?.email}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-rajdhani font-medium text-gray-400 mb-2">Account Role</label>
                          <span className={`inline-flex items-center px-4 py-2 rounded-xl font-rajdhani font-bold ${getRoleBadgeColor(user?.role || 'user')}`}>
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
              <div className="space-y-8">
                <div>
                  <h1 className="text-4xl font-orbitron font-bold text-white mb-3 bg-gradient-to-r from-electric to-neon bg-clip-text text-transparent">Security</h1>
                  <p className="text-gray-400 font-rajdhani text-lg">Keep your account secure and monitor security activity</p>
                </div>

                <div className="grid gap-6">
                  <div className="bg-gray-800/30 backdrop-blur-xl rounded-2xl border border-gray-700 p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl flex items-center justify-center border border-green-500/30">
                        <Key className="h-6 w-6 text-green-400" />
                      </div>
                      <div>
                        <h3 className="font-orbitron font-bold text-white">Password</h3>
                        <p className="text-gray-400 font-rajdhani">Last changed 30 days ago</p>
                      </div>
                    </div>
                    <button className="text-electric hover:text-neon font-rajdhani font-medium transition-colors duration-200">
                      Change Password
                    </button>
                  </div>

                  <div className="bg-gray-800/30 backdrop-blur-xl rounded-2xl border border-gray-700 p-6">
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl flex items-center justify-center border border-blue-500/30">
                        <Monitor className="h-6 w-6 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-orbitron font-bold text-white">Recent Activity</h3>
                        <p className="text-gray-400 font-rajdhani">Monitor your account activity</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-3 border-b border-gray-700">
                        <div className="flex items-center space-x-3">
                          <Monitor className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="font-rajdhani font-medium text-white">Current session</p>
                            <p className="text-gray-400 font-rajdhani text-sm">Chrome on Windows • Active now</p>
                          </div>
                        </div>
                        <span className="text-green-400 font-rajdhani font-medium text-sm">Active</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'privacy' && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-4xl font-orbitron font-bold text-white mb-3 bg-gradient-to-r from-electric to-neon bg-clip-text text-transparent">Privacy & Data</h1>
                  <p className="text-gray-400 font-rajdhani text-lg">Control your data and privacy settings</p>
                </div>

                <div className="grid gap-6">
                  <div className="bg-gray-800/30 backdrop-blur-xl rounded-2xl border border-gray-700 p-6">
                    <h3 className="font-orbitron font-bold text-white text-xl mb-4">Cookie Preferences</h3>
                    <p className="text-gray-400 font-rajdhani mb-6">
                      Manage your cookie preferences and control what data we collect.
                    </p>
                    <CookiePreferencesButton />
                  </div>

                  <div className="bg-gray-800/30 backdrop-blur-xl rounded-2xl border border-gray-700 p-6">
                    <h3 className="font-orbitron font-bold text-white text-xl mb-4">Download Your Data</h3>
                    <p className="text-gray-400 font-rajdhani mb-6">
                      Download a copy of all your personal data stored in our systems.
                    </p>
                    <button
                      onClick={handleDataDownload}
                      disabled={loading}
                      className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-electric to-neon text-black font-rajdhani font-bold rounded-lg hover:shadow-xl hover:shadow-electric/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Download className="h-4 w-4" />
                      <span>{loading ? 'Preparing Download...' : 'Download Data'}</span>
                    </button>
                  </div>

                  <div className="bg-gray-800/30 backdrop-blur-xl rounded-2xl border border-gray-700 p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="font-orbitron font-bold text-white text-xl">Data We Store</h3>
                      <button
                        onClick={() => setShowDataDetails(!showDataDetails)}
                        className="text-electric hover:text-neon font-rajdhani font-medium flex items-center space-x-2 transition-colors duration-200"
                      >
                        {showDataDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        <span>{showDataDetails ? 'Hide' : 'Show'} Details</span>
                      </button>
                    </div>
                    
                    {showDataDetails && (
                      <div className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="p-4 bg-gray-700/30 rounded-xl border border-gray-600">
                            <h4 className="font-rajdhani font-bold text-white mb-3">Personal Information</h4>
                            <ul className="text-gray-400 font-rajdhani space-y-1 text-sm">
                              <li>• Name and email address</li>
                              <li>• Account creation date</li>
                              <li>• Role and permissions</li>
                              <li>• Cookie preferences</li>
                            </ul>
                          </div>
                          <div className="p-4 bg-gray-700/30 rounded-xl border border-gray-600">
                            <h4 className="font-rajdhani font-bold text-white mb-3">Activity Data</h4>
                            <ul className="text-gray-400 font-rajdhani space-y-1 text-sm">
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

                  <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <AlertTriangle className="h-6 w-6 text-red-400" />
                      <h3 className="font-orbitron font-bold text-red-400 text-xl">Delete Account</h3>
                    </div>
                    <p className="text-red-300 font-rajdhani mb-6">
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                    <button
                      onClick={handleAccountDeletion}
                      className="flex items-center space-x-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 font-rajdhani font-bold"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete Account</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'preferences' && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-4xl font-orbitron font-bold text-white mb-3 bg-gradient-to-r from-electric to-neon bg-clip-text text-transparent">Preferences</h1>
                  <p className="text-gray-400 font-rajdhani text-lg">Customize your experience and notification settings</p>
                </div>

                <div className="grid gap-6">
                  <div className="bg-gray-800/30 backdrop-blur-xl rounded-2xl border border-gray-700 p-6">
                    <h3 className="font-orbitron font-bold text-white text-xl mb-6">Quick Links</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <Link
                        to="/privacy-policy"
                        className="p-6 border border-gray-600 hover:border-electric/50 rounded-xl transition-all duration-300 text-center group hover:bg-gray-700/30"
                      >
                        <Shield className="h-10 w-10 text-electric mx-auto mb-3 group-hover:scale-110 transition-transform duration-200" />
                        <h4 className="font-orbitron font-bold text-white mb-2">Privacy Policy</h4>
                        <p className="text-gray-400 font-rajdhani text-sm">Review our privacy practices</p>
                      </Link>
                      
                      <Link
                        to="/terms"
                        className="p-6 border border-gray-600 hover:border-electric/50 rounded-xl transition-all duration-300 text-center group hover:bg-gray-700/30"
                      >
                        <Settings className="h-10 w-10 text-electric mx-auto mb-3 group-hover:scale-110 transition-transform duration-200" />
                        <h4 className="font-orbitron font-bold text-white mb-2">Terms of Service</h4>
                        <p className="text-gray-400 font-rajdhani text-sm">Read our terms and conditions</p>
                      </Link>
                    </div>
                  </div>

                  <div className="bg-gray-800/30 backdrop-blur-xl rounded-2xl border border-gray-700 p-6">
                    <h3 className="font-orbitron font-bold text-white text-xl mb-6">Account Information</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between py-3 border-b border-gray-700">
                        <span className="text-gray-400 font-rajdhani">Account ID</span>
                        <span className="text-white font-mono">{user?.id}</span>
                      </div>
                      <div className="flex justify-between py-3 border-b border-gray-700">
                        <span className="text-gray-400 font-rajdhani">Member Since</span>
                        <span className="text-white font-rajdhani">
                          {userData?.userData.createdAt ? new Date(userData.userData.createdAt).toLocaleDateString() : 'Loading...'}
                        </span>
                      </div>
                      <div className="flex justify-between py-3">
                        <span className="text-gray-400 font-rajdhani">Last Updated</span>
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