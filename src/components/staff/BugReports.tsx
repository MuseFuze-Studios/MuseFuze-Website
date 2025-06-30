import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, AlertCircle, Clock, CheckCircle, User } from 'lucide-react';

interface BugReport {
  id: number;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'fixed' | 'closed';
  tags: string[];
  build_id?: number;
  build_version?: string;
  build_title?: string;
  reported_by: number;
  reporter_name: string;
  assigned_to?: number;
  assignee_name?: string;
  created_at: string;
}

interface TeamMember {
  id: number;
  username: string;
  role: string;
}

interface GameBuild {
  id: number;
  version: string;
  title: string;
}

const BugReports: React.FC = () => {
  const [bugs, setBugs] = useState<BugReport[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [builds, setBuilds] = useState<GameBuild[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBug, setEditingBug] = useState<BugReport | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as const,
    build_id: '',
    tags: '',
    assigned_to: '',
    status: 'open' as const
  });

  useEffect(() => {
    fetchBugs();
    fetchTeamMembers();
    fetchBuilds();
  }, []);

  const fetchBugs = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/bugs', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setBugs(data);
      }
    } catch (error) {
      console.error('Failed to fetch bugs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/bugs/team-members', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setTeamMembers(data);
      }
    } catch (error) {
      console.error('Failed to fetch team members:', error);
    }
  };

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
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const tags = formData.tags.split(',').map(tag => tag.trim()).filter(Boolean);
    
    try {
      const url = editingBug 
        ? `http://localhost:5000/api/bugs/${editingBug.id}`
        : 'http://localhost:5000/api/bugs';
      
      const response = await fetch(url, {
        method: editingBug ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          build_id: formData.build_id ? parseInt(formData.build_id) : null,
          assigned_to: formData.assigned_to ? parseInt(formData.assigned_to) : null,
          tags
        }),
      });

      if (response.ok) {
        fetchBugs();
        setShowForm(false);
        setEditingBug(null);
        setFormData({ 
          title: '', 
          description: '', 
          priority: 'medium', 
          build_id: '', 
          tags: '', 
          assigned_to: '', 
          status: 'open' 
        });
      }
    } catch (error) {
      console.error('Failed to save bug:', error);
    }
  };

  const handleEdit = (bug: BugReport) => {
    setEditingBug(bug);
    setFormData({
      title: bug.title,
      description: bug.description,
      priority: bug.priority,
      build_id: bug.build_id?.toString() || '',
      tags: (bug.tags || []).join(', '),
      assigned_to: bug.assigned_to?.toString() || '',
      status: bug.status
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this bug report?')) return;

    try {
      const response = await fetch(`http://localhost:5000/api/bugs/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        fetchBugs();
      }
    } catch (error) {
      console.error('Failed to delete bug:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-400 bg-red-900/30';
      case 'high': return 'text-orange-400 bg-orange-900/30';
      case 'medium': return 'text-yellow-400 bg-yellow-900/30';
      case 'low': return 'text-green-400 bg-green-900/30';
      default: return 'text-gray-400 bg-gray-900/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertCircle className="h-4 w-4 text-red-400" />;
      case 'in_progress': return <Clock className="h-4 w-4 text-yellow-400" />;
      case 'fixed': return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'closed': return <CheckCircle className="h-4 w-4 text-gray-400" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
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
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-white">Bug Reports</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>New Bug Report</span>
        </button>
      </div>

      {/* Bug Report Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-white mb-6">
              {editingBug ? 'Edit Bug Report' : 'New Bug Report'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as BugReport['priority'] })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                {editingBug && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as BugReport['status'] })}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="fixed">Fixed</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Related Build (Optional)
                  </label>
                  <select
                    value={formData.build_id}
                    onChange={(e) => setFormData({ ...formData, build_id: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="">Select a build</option>
                    {builds.map((build) => (
                      <option key={build.id} value={build.id}>
                        {build.version} - {build.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Assign To (Optional)
                  </label>
                  <select
                    value={formData.assigned_to}
                    onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="">Unassigned</option>
                    {teamMembers.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.username} ({member.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="ui, gameplay, crash"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingBug(null);
                    setFormData({ 
                      title: '', 
                      description: '', 
                      priority: 'medium', 
                      build_id: '', 
                      tags: '', 
                      assigned_to: '', 
                      status: 'open' 
                    });
                  }}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-lg transition-all"
                >
                  {editingBug ? 'Update' : 'Create'} Bug Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bug Reports List */}
      <div className="space-y-4">
        {bugs.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No bug reports found</p>
          </div>
        ) : (
          bugs.map((bug) => (
            <div
              key={bug.id}
              className="bg-gray-700/30 rounded-lg p-6 border border-gray-600 hover:border-violet-500/50 transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    {getStatusIcon(bug.status)}
                    <h3 className="text-lg font-semibold text-white">{bug.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(bug.priority)}`}>
                      {bug.priority.toUpperCase()}
                    </span>
                    <span className="px-2 py-1 bg-gray-600 text-gray-300 rounded-full text-xs font-medium">
                      {bug.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  
                  {bug.build_version && (
                    <p className="text-violet-300 text-sm mb-2">
                      Build: {bug.build_version} - {bug.build_title}
                    </p>
                  )}
                  
                  <p className="text-gray-300 mb-3">{bug.description}</p>
                  
                  {bug.tags && bug.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {bug.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-violet-900/30 text-violet-300 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div className="text-sm text-gray-400 flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <User className="h-4 w-4" />
                      <span>Reported by {bug.reporter_name}</span>
                    </div>
                    <span>•</span>
                    <span>{new Date(bug.created_at).toLocaleDateString()}</span>
                    {bug.assignee_name && (
                      <>
                        <span>•</span>
                        <span>Assigned to {bug.assignee_name}</span>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => handleEdit(bug)}
                    className="p-2 text-gray-400 hover:text-violet-400 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(bug.id)}
                    className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BugReports;