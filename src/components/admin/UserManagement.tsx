import React, { useState, useEffect } from 'react';
import { Users, Edit, Trash2, Shield, User, Crown, Pencil } from 'lucide-react';

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'dev_tester' | 'developer' | 'staff' | 'admin' | 'ceo';
  createdAt: string;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [detailsUser, setDetailsUser] = useState<User | null>(null);
  const [detailsForm, setDetailsForm] = useState({ firstName: '', lastName: '', email: '' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setError(null);
      const response = await fetch('/api/admin/users', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else if (response.status === 404) {
        // If endpoint doesn't exist, create mock data
        setUsers([
          {
            id: 1,
            email: 'admin@musefuze.com',
            firstName: 'Admin',
            lastName: 'User',
            role: 'admin',
            createdAt: new Date().toISOString()
          },
          {
            id: 2,
            email: 'staff@musefuze.com',
            firstName: 'Staff',
            lastName: 'Member',
            role: 'staff',
            createdAt: new Date(Date.now() - 86400000).toISOString()
          },
          {
            id: 3,
            email: 'user@musefuze.com',
            firstName: 'Regular',
            lastName: 'User',
            role: 'user',
            createdAt: new Date(Date.now() - 172800000).toISOString()
          }
        ]);
        setError('User management endpoint not available - showing sample data');
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setError('Failed to load users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        fetchUsers();
        setEditingUser(null);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update user role');
      }
    } catch (error) {
      console.error('Failed to update user role:', error);
      alert('Failed to update user role');
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        fetchUsers();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('Failed to delete user');
    }
  };

  const handleUpdateDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!detailsUser) return;
    try {
      const response = await fetch(`/api/admin/users/${detailsUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(detailsForm),
      });
      if (response.ok) {
        fetchUsers();
        setDetailsUser(null);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update user');
      }
    } catch (error) {
      console.error('Failed to update user:', error);
      alert('Failed to update user');
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ceo': return <Crown className="h-4 w-4 text-amber-400" />;
      case 'admin': return <Crown className="h-4 w-4 text-red-400" />;
      case 'staff': return <Shield className="h-4 w-4 text-violet-400" />;
      case 'developer': return <Shield className="h-4 w-4 text-blue-400" />;
      case 'dev_tester': return <Shield className="h-4 w-4 text-green-400" />;
      default: return <User className="h-4 w-4 text-gray-400" />;
    }
  };

  const getRoleColor = (role: string) => {
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
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">User Management</h2>
        <p className="text-gray-400">Manage user accounts and permissions</p>
        {error && (
          <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
            <p className="text-yellow-400 text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* Role Change Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold text-white mb-6">Change User Role</h3>
            
            <div className="mb-6">
              <p className="text-gray-300 mb-2">User: <span className="text-white font-medium">{editingUser.firstName} {editingUser.lastName}</span></p>
              <p className="text-gray-300 mb-4">Current Role: <span className={`px-2 py-1 rounded text-sm ${getRoleColor(editingUser.role)}`}>{editingUser.role}</span></p>
              
              <label className="block text-sm font-medium text-gray-300 mb-2">
                New Role
              </label>
              <div className="space-y-2">
                {['user', 'dev_tester', 'developer', 'staff', 'admin', 'ceo'].map((role) => (
                  <button
                    key={role}
                    onClick={() => handleRoleChange(editingUser.id, role)}
                    className={`w-full p-3 rounded-lg border transition-all text-left flex items-center space-x-2 ${
                      editingUser.role === role
                        ? 'border-gray-500 bg-gray-700/50'
                        : 'border-gray-600 hover:border-amber-500/50 hover:bg-gray-700/30'
                    }`}
                  >
                    {getRoleIcon(role)}
                    <span className="text-white capitalize">{role.replace('_', ' ')}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setEditingUser(null)}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Details Modal */}
      {detailsUser && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold text-white mb-6">Edit User Details</h3>
            <form onSubmit={handleUpdateDetails} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">First Name</label>
                <input
                  type="text"
                  value={detailsForm.firstName}
                  onChange={(e) => setDetailsForm({ ...detailsForm, firstName: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Last Name</label>
                <input
                  type="text"
                  value={detailsForm.lastName}
                  onChange={(e) => setDetailsForm({ ...detailsForm, lastName: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  value={detailsForm.email}
                  onChange={(e) => setDetailsForm({ ...detailsForm, email: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div className="flex justify-end space-x-4 pt-2">
                <button
                  type="button"
                  onClick={() => setDetailsUser(null)}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-lg transition-all"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-gray-800/30 rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700/50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">User</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Role</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Created</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-700/30 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-white font-medium">{user.firstName} {user.lastName}</div>
                      <div className="text-gray-400 text-sm">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      {getRoleIcon(user.role)}
                      <span className={`px-2 py-1 rounded text-sm font-medium ${getRoleColor(user.role)}`}>
                        {user.role.replace('_', ' ')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-sm">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingUser(user)}
                        className="p-2 text-gray-400 hover:text-amber-400 transition-colors"
                        title="Change Role"
                      >
                        <Edit className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => {
                          setDetailsUser(user);
                          setDetailsForm({ 
                            firstName: user.firstName, 
                            lastName: user.lastName, 
                            email: user.email 
                          });
                        }}
                        className="p-2 text-gray-400 hover:text-blue-400 transition-colors"
                        title="Edit Details"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                        title="Delete User"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No users found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;