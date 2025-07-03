import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, CheckCircle, XCircle, AlertCircle, Plus, Search, Filter, MapPin, FileText } from 'lucide-react';

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

interface PlaytestResult {
  id: number;
  session_id: number;
  participant_name: string;
  feedback: string;
  rating: number;
  bugs_found: number;
  completion_time: number;
  created_at: string;
}

const PlaytestScheduler: React.FC = () => {
  const [sessions, setSessions] = useState<PlaytestSession[]>([]);
  const [rsvps, setRsvps] = useState<{ [key: number]: RSVP }>({});
  const [results, setResults] = useState<{ [key: number]: PlaytestResult[] }>({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedSession, setSelectedSession] = useState<PlaytestSession | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    build_id: '',
    scheduled_date: '',
    duration_minutes: 60,
    max_participants: 10,
    location: '',
    test_focus: '',
    requirements: ''
  });

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      // Mock data for demonstration
      const mockSessions: PlaytestSession[] = [
        {
          id: 1,
          title: "Combat System Testing",
          description: "Focus on new combo mechanics and weapon balancing",
          build_version: 'v0.2.1',
          build_title: 'Alpha Build - Combat Update',
          scheduled_date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
          duration_minutes: 90,
          max_participants: 8,
          rsvp_count: 6,
          created_by_name: 'Jane Smith',
          location: 'Conference Room A',
          test_focus: 'Combat mechanics, weapon balance, combo system',
          requirements: 'Previous alpha testing experience preferred',
          status: 'upcoming'
        },
        {
          id: 2,
          title: "Story Mode Playthrough",
          description: "Complete playthrough of Chapter 1-3 with narrative feedback",
          build_version: 'v0.2.0',
          build_title: 'Alpha Build - Story Mode',
          scheduled_date: new Date(Date.now() + 172800000).toISOString(), // Day after tomorrow
          duration_minutes: 120,
          max_participants: 6,
          rsvp_count: 4,
          created_by_name: 'Mike Johnson',
          location: 'Remote (Discord)',
          test_focus: 'Story pacing, dialogue, character development',
          requirements: 'Must have completed previous builds',
          status: 'upcoming'
        },
        {
          id: 3,
          title: "Performance Testing",
          description: "Test performance on various hardware configurations",
          build_version: 'v0.1.9',
          build_title: 'Pre-Alpha Build',
          scheduled_date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
          duration_minutes: 60,
          max_participants: 12,
          rsvp_count: 10,
          created_by_name: 'Sarah Wilson',
          location: 'Testing Lab',
          test_focus: 'Frame rate, loading times, memory usage',
          requirements: 'Various hardware setups available',
          status: 'completed'
        }
      ];
      setSessions(mockSessions);
      
      // Mock RSVP data
      const mockRsvps = {
        1: { status: 'attending' as const, notes: 'Looking forward to testing the new combat!' },
        2: { status: 'maybe' as const, notes: 'Depends on work schedule' },
        3: { status: 'attending' as const, notes: null }
      };
      setRsvps(mockRsvps);

      // Mock results for completed sessions
      const mockResults = {
        3: [
          {
            id: 1,
            session_id: 3,
            participant_name: 'John Doe',
            feedback: 'Performance was smooth on high-end setup, but noticed frame drops on medium settings',
            rating: 4,
            bugs_found: 2,
            completion_time: 45,
            created_at: new Date(Date.now() - 43200000).toISOString()
          },
          {
            id: 2,
            session_id: 3,
            participant_name: 'Alice Brown',
            feedback: 'Loading times were acceptable, but memory usage seems high',
            rating: 3,
            bugs_found: 1,
            completion_time: 55,
            created_at: new Date(Date.now() - 43200000).toISOString()
          }
        ]
      };
      setResults(mockResults);
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRSVP = async (sessionId: number, status: 'attending' | 'maybe' | 'not_attending', notes: string = '') => {
    try {
      setRsvps(prev => ({ ...prev, [sessionId]: { status, notes } }));
      // Implementation would update RSVP on server
    } catch (error) {
      console.error('Failed to update RSVP:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Implementation would create new session
    setShowForm(false);
    setFormData({
      title: '',
      description: '',
      build_id: '',
      scheduled_date: '',
      duration_minutes: 60,
      max_participants: 10,
      location: '',
      test_focus: '',
      requirements: ''
    });
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

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.scheduled_date}
                    onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
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
              </div>

              <div className="grid md:grid-cols-2 gap-4">
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

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                    placeholder="Conference Room A, Remote, etc."
                  />
                </div>
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
                  placeholder="What specific areas should testers focus on?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Requirements
                </label>
                <textarea
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                  placeholder="Any special requirements or prerequisites for participants"
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-lg transition-all shadow-lg hover:shadow-violet-500/25"
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
          <div className="bg-gray-800 rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">{selectedSession.title}</h3>
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSessionStatusColor(selectedSession.status)}`}>
                    {selectedSession.status.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className="text-violet-300">{selectedSession.build_version}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedSession(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">Session Details</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-300">{new Date(selectedSession.scheduled_date).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-300">{selectedSession.duration_minutes} minutes</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-300">{selectedSession.rsvp_count}/{selectedSession.max_participants} participants</span>
                    </div>
                    {selectedSession.location && (
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-300">{selectedSession.location}</span>
                      </div>
                    )}
                  </div>
                </div>

                {selectedSession.description && (
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">Description</h4>
                    <p className="text-gray-300 bg-gray-700/30 p-3 rounded-lg">{selectedSession.description}</p>
                  </div>
                )}

                {selectedSession.test_focus && (
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">Test Focus</h4>
                    <p className="text-gray-300 bg-blue-900/20 p-3 rounded-lg border border-blue-500/30">{selectedSession.test_focus}</p>
                  </div>
                )}

                {selectedSession.requirements && (
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">Requirements</h4>
                    <p className="text-gray-300 bg-yellow-900/20 p-3 rounded-lg border border-yellow-500/30">{selectedSession.requirements}</p>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {selectedSession.status === 'upcoming' && (
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-4">Your RSVP</h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 mb-2">
                        {getStatusIcon(rsvps[selectedSession.id]?.status)}
                        <span className="text-sm text-gray-400">
                          {rsvps[selectedSession.id]?.status ? rsvps[selectedSession.id].status.replace('_', ' ').toUpperCase() : 'No Response'}
                        </span>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleRSVP(selectedSession.id, 'attending')}
                          className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                            rsvps[selectedSession.id]?.status === 'attending' 
                              ? 'bg-green-600 text-white' 
                              : 'bg-gray-700 text-gray-300 hover:bg-green-600 hover:text-white'
                          }`}
                        >
                          Attending
                        </button>
                        <button
                          onClick={() => handleRSVP(selectedSession.id, 'maybe')}
                          className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                            rsvps[selectedSession.id]?.status === 'maybe' 
                              ? 'bg-yellow-600 text-white' 
                              : 'bg-gray-700 text-gray-300 hover:bg-yellow-600 hover:text-white'
                          }`}
                        >
                          Maybe
                        </button>
                        <button
                          onClick={() => handleRSVP(selectedSession.id, 'not_attending')}
                          className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                            rsvps[selectedSession.id]?.status === 'not_attending' 
                              ? 'bg-red-600 text-white' 
                              : 'bg-gray-700 text-gray-300 hover:bg-red-600 hover:text-white'
                          }`}
                        >
                          Can't Attend
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {selectedSession.status === 'completed' && results[selectedSession.id] && (
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-4">Test Results</h4>
                    <div className="space-y-4">
                      {results[selectedSession.id].map((result) => (
                        <div key={result.id} className="bg-gray-700/30 p-4 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-violet-300 font-medium">{result.participant_name}</span>
                            <div className="flex items-center space-x-2">
                              <span className="text-yellow-400">★ {result.rating}/5</span>
                              <span className="text-gray-400 text-sm">{result.completion_time}min</span>
                            </div>
                          </div>
                          <p className="text-gray-300 text-sm mb-2">{result.feedback}</p>
                          <div className="text-xs text-gray-400">
                            Bugs found: {result.bugs_found} • {new Date(result.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
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

                  {session.status === 'completed' && results[session.id] && (
                    <div className="ml-6 text-right">
                      <div className="text-sm text-gray-400 mb-1">Results Available</div>
                      <div className="text-xs text-gray-500">
                        {results[session.id].length} participant{results[session.id].length !== 1 ? 's' : ''}
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