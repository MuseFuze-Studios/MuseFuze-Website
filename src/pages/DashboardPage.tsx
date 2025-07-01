import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { userAPI } from '../services/api';
import { Link } from 'react-router-dom';
import {
  User,
  LogOut,
  Download,
  Trash2,
  Calendar,
  Shield,
  Crown,
  Edit,
  Cookie,
  X,
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { useCookieConsent } from '../contexts/CookieConsentContext';

interface UserData {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  cookiesAccepted: boolean;
  createdAt: string;
}


const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);



  // Profile editing
  const [editProfile, setEditProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ firstName: '', lastName: '', email: '' });
  const [showCookieModal, setShowCookieModal] = useState(false);
  const [cookiePref, setCookiePref] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { acceptCookies, declineCookies } = useCookieConsent();



  const loadDashboardData = useCallback(async () => {
    try {
      const [profileResponse] = await Promise.all([
        userAPI.getProfile(),
      ]);

      setUserData(profileResponse.data.user);
      setProfileForm({
        firstName: profileResponse.data.user.firstName,
        lastName: profileResponse.data.user.lastName,
        email: profileResponse.data.user.email,
      });


    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

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


  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await userAPI.updateProfile(profileForm);
      setEditProfile(false);
      loadDashboardData();
    } catch (error) {
      console.error('Profile update failed:', error);
    }
  };

  const handleSaveCookies = async () => {
    try {
      await userAPI.updateCookies({ cookiesAccepted: cookiePref });
      if (cookiePref) {
        acceptCookies();
      } else {
        declineCookies();
      }
      setUserData(prev => prev ? { ...prev, cookiesAccepted: cookiePref } : prev);
      setShowCookieModal(false);
    } catch (error) {
      console.error('Failed to update cookie preferences:', error);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await userAPI.deleteAccount();
      await logout();
      window.location.href = '/';
    } catch (error) {
      console.error('Failed to delete account:', error);
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

                {user && ['dev_tester','developer','staff','admin','ceo'].includes(user.role) && null}

                {user && ['staff','admin','ceo'].includes(user.role) && (
                  <Link
                    to="/staff"
                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 font-rajdhani text-gray-300 hover:bg-white/10"
                  >
                    <Shield className="h-5 w-5" />
                    <span>Staff Dashboard</span>
                  </Link>
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
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-orbitron font-bold text-white">Profile Information</h2>
                    <button
                      onClick={() => {
                        if (editProfile) {
                          setEditProfile(false);
                          setProfileForm({
                            firstName: userData?.firstName || '',
                            lastName: userData?.lastName || '',
                            email: userData?.email || '',
                          });
                        } else {
                          setEditProfile(true);
                        }
                      }}
                      className="flex items-center space-x-2 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                    >
                      {editProfile ? <><X className="h-4 w-4" /><span className="font-rajdhani">Cancel</span></> : <><Edit className="h-4 w-4" /><span className="font-rajdhani">Edit</span></>}
                    </button>
                  </div>

                  {userData && (
                    <form onSubmit={handleProfileUpdate} className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-rajdhani font-medium text-gray-200 mb-2">
                          First Name
                        </label>
                        {editProfile ? (
                          <input
                            type="text"
                            value={profileForm.firstName}
                            onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                            className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-electric/20 focus:border-electric transition-colors duration-200 font-rajdhani text-white placeholder-gray-400"
                          />
                        ) : (
                          <div className="px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white font-rajdhani">
                            {userData.firstName}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-rajdhani font-medium text-gray-200 mb-2">
                          Last Name
                        </label>
                        {editProfile ? (
                          <input
                            type="text"
                            value={profileForm.lastName}
                            onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                            className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-electric/20 focus:border-electric transition-colors duration-200 font-rajdhani text-white placeholder-gray-400"
                          />
                        ) : (
                          <div className="px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white font-rajdhani">
                            {userData.lastName}
                          </div>
                        )}
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-rajdhani font-medium text-gray-200 mb-2">
                          Email Address
                        </label>
                        {editProfile ? (
                          <input
                            type="email"
                            value={profileForm.email}
                            onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                            className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-electric/20 focus:border-electric transition-colors duration-200 font-rajdhani text-white placeholder-gray-400"
                          />
                        ) : (
                          <div className="px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white font-rajdhani">
                            {userData.email}
                          </div>
                        )}
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
                    {editProfile && (
                        <div className="flex space-x-4 md:col-span-2">
                          <button
                            type="submit"
                            className="px-6 py-3 bg-gradient-to-r from-electric to-neon text-black font-rajdhani font-bold rounded-lg hover:shadow-xl hover:shadow-electric/25 transition-all duration-300"
                          >
                            Save Changes
                          </button>
                        </div>
                      )}
                    </form>
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

                  <div className="mt-6 flex flex-col sm:flex-row gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        setCookiePref(userData?.cookiesAccepted ?? false);
                        setShowCookieModal(true);
                      }}
                      className="inline-flex items-center px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors font-rajdhani"
                    >
                      <Cookie className="h-4 w-4 mr-2" />
                      Cookie Preferences
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-rajdhani"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
      {showCookieModal && (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full">
          <h3 className="text-2xl font-bold text-white mb-6">Cookie Preferences</h3>
          <div className="flex justify-between items-center mb-6">
            <span className="text-white font-rajdhani">Allow cookies</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={cookiePref}
                onChange={(e) => setCookiePref(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-electric"></div>
            </label>
          </div>
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => setShowCookieModal(false)}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveCookies}
              className="px-6 py-3 bg-gradient-to-r from-electric to-neon text-black font-rajdhani font-bold rounded-lg hover:shadow-xl hover:shadow-electric/25 transition-all duration-300"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    )}

    {showDeleteConfirm && (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full">
          <h3 className="text-2xl font-bold text-white mb-4">Delete Account</h3>
          <p className="text-gray-300 mb-6">Are you sure you want to delete your account? This action cannot be undone.</p>
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
              Delete
            </button>
          </div>
        </div>
      </div>
    )}
    </div>
  );
};

export default DashboardPage;