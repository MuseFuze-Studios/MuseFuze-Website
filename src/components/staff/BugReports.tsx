import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, AlertCircle, Clock, CheckCircle, User, Search, Filter, MessageCircle, Calendar } from 'lucide-react';

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
  updated_at: string;
  comments?: BugComment[];
}

interface BugComment {
  id: number;
  content: string;
  author_name: string;
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
  const [selectedBug, setSelectedBug] = useState<BugReport | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [newComment, setNewComment] = useState('');
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
      // Mock data for demonstration
      const mockBugs: BugReport[] = [
        {
          id: 1,
          title: "Player movement stutters on low-end devices",
          description: "Movement feels choppy when frame rate drops below 30fps",
          priority: 'high',
          status: 'in_progress',
          tags: ['performance', 'movement'],
          build_version: 'v0.2.1',
          build_title: 'Alpha Build',
          reported_by: 1,
          reporter_name: 'John Doe',
          assigned_to: 2,
          assignee_name: 'Jane Smith',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          updated_at: new Date(Date.now() - 43200000).toISOString(),
          comments: [
            {
              id: 1,
              content: "Reproduced on Android devices with 2GB RAM",
              author_name: "Jane Smith",
              created_at: new Date(Date.now() - 21600000).toISOString()
            }
          ]
        },
        {
          id: 2,
          title: "Audio cuts out during cutscenes",
          description: "Background music stops playing randomly during story sequences",
          priority: 'medium',
          status: 'open',
          tags: ['audio', 'cutscenes'],
          build_version: 'v0.2.1',
          build_title: 'Alpha Build',
          reported_by: 3,
          reporter_name: 'Mike Johnson',
          created_at: new Date(Date.now() - 172800000).toISOString(),
          updated_at: new Date(Date.now() - 172800000).toISOString(),
          comments: []
        }
      ];
      setBugs(mockBugs);
    } catch (error) {
      console.error('Failed to fetch bugs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const mockMembers: TeamMember[] = [
        { id: 1, username: 'john_doe', role: 'developer' },
        { id: 2, username: 'jane_smith', role: 'developer' },
        { id: 3, username: 'mike_johnson', role: 'tester' }
      ];
      setTeamMembers(mockMembers);
    } catch (error) {
      console.error('Failed to fetch team members:', error);
    }
  };

  const fetchBuilds = async () => {
    try {
      const mockBuilds: GameBuild[] = [
        { id: 1, version: 'v0.2.1', title: 'Alpha Build' },
        { id: 2, version: 'v0.2.0', title: 'Previous Alpha' }
      ];
      setBuilds(mockBuilds);
    } catch (error) {
      console.error('Failed to fetch builds:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Implementation would go here
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
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedBug) return;
    
    // Implementation would add comment to bug
    setNewComment('');
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
    // Implementation would delete bug
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-400 bg-red-900/30 border-red-500/50';
      case 'high': return 'text-orange-400 bg-orange-900/30 border-orange-500/50';
      case 'medium': return 'text-yellow-400 bg-yellow-900/30 border-yellow-500/50';
      case 'low': return 'text-green-400 bg-green-900/30 border-green-500/50';
      default: return 'text-gray-400 bg-gray-900/30 border-gray-500/50';
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-red-400 bg-red-900/30';
      case 'in_progress': return 'text-yellow-400 bg-yellow-900/30';
      case 'fixed': return 'text-green-400 bg-green-900/30';
      case 'closed': return 'text-gray-400 bg-gray-900/30';
      default: return 'text-gray-400 bg-gray-900/30';
    }
  };

  const filteredBugs = bugs.filter(bug => {
    const matchesSearch = bug.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bug.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bug.reporter_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || bug.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || bug.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

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
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Bug Reports</h2>
          <p className="text-gray-400">Track and manage development issues</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-violet-500/25"
        >
          <Plus className="h-4 w-4" />
          <span>New Bug Report</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search bugs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="fixed">Fixed</option>
            <option value="closed">Closed</option>
          </select>
          
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <option value="all">All Priority</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Bug Report Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
            <h3 className="text-2xl font-bold text-white mb-6">
              {editingBug ? 'Edit Bug Report' : 'New Bug Report'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                  placeholder="Brief description of the bug"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                  placeholder="Detailed description, steps to reproduce, expected vs actual behavior"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Priority *
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
                    Related Build
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
                    Assign To
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
                  Tags
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="ui, gameplay, performance (comma-separated)"
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
                  className="px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-lg transition-all shadow-lg hover:shadow-violet-500/25"
                >
                  {editingBug ? 'Update' : 'Create'} Bug Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bug Detail Modal */}
      {selectedBug && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">{selectedBug.title}</h3>
                <div className="flex items-center space-x-3">
                  {getStatusIcon(selectedBug.status)}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedBug.status)}`}>
                    {selectedBug.status.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className={`px-2 py-1 rounded border text-xs font-medium ${getPriorityColor(selectedBug.priority)}`}>
                    {selectedBug.priority.toUpperCase()}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedBug(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-white mb-2">Description</h4>
                <p className="text-gray-300 bg-gray-700/30 p-4 rounded-lg">{selectedBug.description}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Reporter:</span>
                      <span className="text-white">{selectedBug.reporter_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Assigned to:</span>
                      <span className="text-white">{selectedBug.assignee_name || 'Unassigned'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Build:</span>
                      <span className="text-white">{selectedBug.build_version || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Created:</span>
                      <span className="text-white">{new Date(selectedBug.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {selectedBug.tags && selectedBug.tags.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedBug.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-violet-900/30 text-violet-300 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-lg font-semibold text-white mb-4">Comments</h4>
                <div className="space-y-4">
                  {selectedBug.comments && selectedBug.comments.length > 0 ? (
                    selectedBug.comments.map((comment) => (
                      <div key={comment.id} className="bg-gray-700/30 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-violet-300 font-medium">{comment.author_name}</span>
                          <span className="text-gray-400 text-sm">
                            {new Date(comment.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-gray-300">{comment.content}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 italic">No comments yet</p>
                  )}

                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                    <button
                      onClick={handleAddComment}
                      disabled={!newComment.trim()}
                      className="px-4 py-2 bg-violet-600 hover:bg-violet-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bug Reports List */}
      <div className="space-y-4">
        {filteredBugs.length === 0 ? (
          <div className="text-center py-16">
            <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No bugs found</h3>
            <p className="text-gray-400">
              {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' 
                ? 'Try adjusting your search or filters' 
                : 'No bug reports have been submitted yet'}
            </p>
          </div>
        ) : (
          filteredBugs.map((bug) => (
            <div
              key={bug.id}
              className="bg-gray-700/30 rounded-xl p-6 border border-gray-600 hover:border-violet-500/50 transition-all cursor-pointer group"
              onClick={() => setSelectedBug(bug)}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    {getStatusIcon(bug.status)}
                    <h3 className="text-lg font-semibold text-white group-hover:text-violet-300 transition-colors">
                      {bug.title}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(bug.priority)}`}>
                      {bug.priority.toUpperCase()}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(bug.status)}`}>
                      {bug.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  
                  {bug.build_version && (
                    <p className="text-violet-300 text-sm mb-2">
                      Build: {bug.build_version} - {bug.build_title}
                    </p>
                  )}
                  
                  <p className="text-gray-300 mb-3 line-clamp-2">{bug.description}</p>
                  
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
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(bug.created_at).toLocaleDateString()}</span>
                    </div>
                    {bug.assignee_name && (
                      <>
                        <span>•</span>
                        <span>Assigned to {bug.assignee_name}</span>
                      </>
                    )}
                    {bug.comments && bug.comments.length > 0 && (
                      <>
                        <span>•</span>
                        <div className="flex items-center space-x-1">
                          <MessageCircle className="h-4 w-4" />
                          <span>{bug.comments.length} comment{bug.comments.length !== 1 ? 's' : ''}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(bug);
                    }}
                    className="p-2 text-gray-400 hover:text-violet-400 transition-colors rounded-lg hover:bg-gray-600/50"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(bug.id);
                    }}
                    className="p-2 text-gray-400 hover:text-red-400 transition-colors rounded-lg hover:bg-gray-600/50"
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