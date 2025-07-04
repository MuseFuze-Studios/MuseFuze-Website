import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, CheckCircle, XCircle, AlertCircle, Plus, Search, MapPin, FileText } from 'lucide-react';
import { staffAPI } from '../../services/api';

interface PlaytestSession {
  id: number;
  title: string;
  description: string;
  build_version: string;
  build_title: string;
  scheduled_date: string;
  duration_minutes: number;
  max_participants: number;
  rsvp_count: number;
  created_by_name: string;
  location?: string;
  test_focus?: string;
  requirements?: string;
  status: 'upcoming' | 'in_progress' | 'completed' | 'cancelled';
}

interface RSVP {
  status: 'attending' | 'maybe' | 'not_attending' | null;
  notes: string | null;
}

interface GameBuild {
  id: number;
  version: string;
  name: string;
}

const PlaytestScheduler: React.FC = () => {
  const [sessions, setSessions] = useState<PlaytestSession[]>([]);
  const [rsvps, setRsvps] = useState<{ [key: number]: RSVP }>({});
  const [builds, setBuilds] = useState<GameBuild[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [selectedSession, setSelectedSession] = useState<PlaytestSession | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    build_id: '',
    scheduled_date: '',
    scheduled_time: '',
    duration_minutes: 60,
    max_participants: 10,
    location: '',
    test_focus: '',
    requirements: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [sessionsRes, buildsRes] = await Promise.all([
        staffAPI.getPlaytestSessions(),
        staffAPI.getBuilds()
      ]);
      
      setSessions(sessionsRes.data);
      setBuilds(buildsRes.data.builds || buildsRes.data);

      // Fetch RSVPs for each session
      const rsvpPromises = sessionsRes.data.map((session: PlaytestSession) =>
        staffAPI.getPlaytestRSVP(session.id).catch(() => ({ data: { status: null, notes: null } }))
      );
      
      const rsvpResults = await Promise.all(rsvpPromises);
      const rsvpMap: { [key: number]: RSVP } = {};
      
      sessionsRes.data.forEach((session: PlaytestSession, index: number) => {
        rsvpMap[session.id] = rsvpResults[index].data;
      });
      
      setRsvps(rsvpMap);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRSVP = async (sessionId: number, status: 'attending' | 'maybe' | 'not_attending', notes: string = '') => {
    try {
      await staffAPI.rsvpPlaytest(sessionId, { status, notes });
      setRsvps(prev => ({ ...prev, [sessionId]: { status, notes } }));
      fetchData(); // Refresh to update participant counts
    } catch (error) {
      console.error('Failed to update RSVP:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Combine date and time into a datetime string
      const scheduledDateTime = `${formData.scheduled_date}T${formData.scheduled_time}:00`;
      
      const data = {
        title: formData.title,
        description: formData.description,
        build_id: parseInt(formData.build_id),
        scheduled_date: scheduledDateTime,
        duration_minutes: formData.duration_minutes,
        max_participants: formData.max_participants,
        location: formData.location,
        test_focus: formData.test_focus,
        requirements: formData.requirements
      };

      await staffAPI.createPlaytestSession(data);
      fetchData();
      setShowForm(false);
      setFormData({
        title: '',
        description: '',
        build_id: '',
        scheduled_date: '',
        scheduled_time: '',
        duration_minutes: 60,
        max_participants: 10,
        location: '',
        test_focus: '',
        requirements: ''
      });
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  };

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case 'attending': return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'maybe': return <AlertCircle className="h-4 w-4 text-yellow-400" />;
      case 'not_attending': return <XCircle className="h-4 w-4 text-red-400" />;
      default: return null;
    }
  };

  const getSessionStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'text-blue-400 bg-blue-900/30';
      case 'in_progress': return 'text-green-400 bg-green-900/30';
      case 'completed': return 'text-gray-400 bg-gray-900/30';
      case 'cancelled': return 'text-red-400 bg-red-900/30';
      default: return 'text-gray-400 bg-gray-900/30';
    }
  };

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.build_version.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || session.status === statusFilter;
    
    return matchesSearch && matchesStatus;
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
          <h2 className="text-2xl font-bold text-white mb-2">Playtest Sessions</h2>
          <p className="text-gray-400">Schedule and manage testing sessions</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-violet-500/25"
        >
          <Plus className="h-4 w-4" />
          <span>Schedule Session</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search sessions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
        >
          <option value="all">All Sessions</option>
          <option value="upcoming">Upcoming</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Session Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
            <h3 className="text-2xl font-bold text-white mb-6">Schedule New Session</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Session Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                  placeholder="e.g., Combat System Testing"
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
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                  placeholder="What will be tested in this session?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Build *
                </label>
                <select
                  value={formData.build_id}
                  onChange={(e) => setFormData({ ...formData, build_id: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value="">Select a build</option>
                  {builds.map((build) => (
                    <option key={build.id} value={build.id}>
                      {build.version} - {build.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={formData.scheduled_date}
                    onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Time *
                  </label>
                  <input
                    type="time"
                    value={formData.scheduled_time || ''}
                    onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Duration (minutes) *
                </label>
                <input
                  type="number"
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                  required
                  min="15"
                  max="480"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Max Participants *
                </label>
                <input
                  type="number"
                  value={formData.max_participants}
                  onChange={(e) => setFormData({ ...formData, max_participants: parseInt(e.target.value) })}
                  required
                  min="1"
                  max="50"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                    placeholder="e.g., Discord, Office, Online"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Test Focus
                  </label>
                  <input
                    type="text"
                    value={formData.test_focus}
                    onChange={(e) => setFormData({ ...formData, test_focus: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                    placeholder="e.g., Combat System, UI/UX"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Requirements
                </label>
                <textarea
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                  placeholder="Any special requirements or equipment needed..."
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setFormData({
                      title: '',
                      description: '',
                      build_id: '',
                      scheduled_date: '',
                      scheduled_time: '',
                      duration_minutes: 60,
                      max_participants: 10,
                      location: '',
                      test_focus: '',
                      requirements: ''
                    });
                  }}
                  className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-violet-500/25"
                >
                  Schedule Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Session Detail Modal */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">{selectedSession.title}</h3>
                <p className="text-violet-300">{selectedSession.build_version} - {selectedSession.build_title}</p>
              </div>
              <button
                onClick={() => setSelectedSession(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {selectedSession.description && (
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">Description</h4>
                  <p className="text-gray-300">{selectedSession.description}</p>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">Session Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Date:</span>
                      <span className="text-white">{new Date(selectedSession.scheduled_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Time:</span>
                      <span className="text-white">{new Date(selectedSession.scheduled_date).toLocaleTimeString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Duration:</span>
                      <span className="text-white">{selectedSession.duration_minutes} minutes</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Participants:</span>
                      <span className="text-white">{selectedSession.rsvp_count}/{selectedSession.max_participants}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">Organizer</h4>
                  <p className="text-gray-300">{selectedSession.created_by_name}</p>
                </div>
              </div>

              {selectedSession.location && (
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">Location</h4>
                  <p className="text-gray-300">{selectedSession.location}</p>
                </div>
              )}

              {selectedSession.test_focus && (
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">Test Focus</h4>
                  <p className="text-gray-300">{selectedSession.test_focus}</p>
                </div>
              )}

              {selectedSession.requirements && (
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">Requirements</h4>
                  <p className="text-gray-300">{selectedSession.requirements}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sessions List */}
      <div className="space-y-4">
        {filteredSessions.length === 0 ? (
          <div className="text-center py-16">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No sessions found</h3>
            <p className="text-gray-400">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters' 
                : 'No playtest sessions have been scheduled yet'}
            </p>
          </div>
        ) : (
          filteredSessions.map((session) => {
            const rsvp = rsvps[session.id];
            const sessionDate = new Date(session.scheduled_date);
            const isUpcoming = sessionDate > new Date();
            
            return (
              <div
                key={session.id}
                className="bg-gray-700/30 rounded-xl p-6 border border-gray-600 hover:border-violet-500/50 transition-all cursor-pointer group"
                onClick={() => setSelectedSession(session)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-bold text-white group-hover:text-violet-300 transition-colors">{session.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSessionStatusColor(session.status)}`}>
                        {session.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <p className="text-violet-300 font-medium mb-2">
                      {session.build_version} - {session.build_title}
                    </p>
                    {session.description && (
                      <p className="text-gray-300 mb-4">{session.description}</p>
                    )}
                    
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center space-x-2 text-gray-400">
                        <Calendar className="h-4 w-4" />
                        <span>{sessionDate.toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-400">
                        <Clock className="h-4 w-4" />
                        <span>
                          {sessionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 
                          ({session.duration_minutes}m)
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-400">
                        <Users className="h-4 w-4" />
                        <span>{session.rsvp_count}/{session.max_participants} attending</span>
                      </div>
                    </div>

                    {session.location && (
                      <div className="flex items-center space-x-2 text-gray-400 text-sm mt-2">
                        <MapPin className="h-4 w-4" />
                        <span>{session.location}</span>
                      </div>
                    )}

                    {session.test_focus && (
                      <div className="mt-3">
                        <div className="flex items-center space-x-2 text-gray-400 text-sm">
                          <FileText className="h-4 w-4" />
                          <span>Focus: {session.test_focus}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {isUpcoming && session.status === 'upcoming' && (
                    <div className="ml-6 flex flex-col items-end space-y-2">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(rsvp?.status)}
                        <span className="text-sm text-gray-400">
                          {rsvp?.status ? rsvp.status.replace('_', ' ').toUpperCase() : 'No Response'}
                        </span>
                      </div>
                      
                      <div className="flex space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRSVP(session.id, 'attending');
                          }}
                          className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                            rsvp?.status === 'attending' 
                              ? 'bg-green-600 text-white' 
                              : 'bg-gray-700 text-gray-300 hover:bg-green-600 hover:text-white'
                          }`}
                        >
                          Yes
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRSVP(session.id, 'maybe');
                          }}
                          className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                            rsvp?.status === 'maybe' 
                              ? 'bg-yellow-600 text-white' 
                              : 'bg-gray-700 text-gray-300 hover:bg-yellow-600 hover:text-white'
                          }`}
                        >
                          Maybe
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRSVP(session.id, 'not_attending');
                          }}
                          className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                            rsvp?.status === 'not_attending' 
                              ? 'bg-red-600 text-white' 
                              : 'bg-gray-700 text-gray-300 hover:bg-red-600 hover:text-white'
                          }`}
                        >
                          No
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="text-sm text-gray-400 border-t border-gray-600 pt-4">
                  Organized by {session.created_by_name}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default PlaytestScheduler;