import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Clock, Users, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

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
}

interface RSVP {
  status: 'attending' | 'maybe' | 'not_attending' | null;
  notes: string | null;
}

const PlaytestScheduler: React.FC = () => {
  const [sessions, setSessions] = useState<PlaytestSession[]>([]);
  const [rsvps, setRsvps] = useState<{ [key: number]: RSVP }>({});
  const [loading, setLoading] = useState(true);

  const fetchSessions = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:5000/api/playtest/sessions', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setSessions(data);
        
        // Fetch RSVP status for each session
        for (const session of data) {
          fetchRSVP(session.id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const fetchRSVP = async (sessionId: number) => {
    try {
      const response = await fetch(`http://localhost:5000/api/playtest/sessions/${sessionId}/rsvp`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setRsvps(prev => ({ ...prev, [sessionId]: data }));
      }
    } catch (error) {
      console.error('Failed to fetch RSVP:', error);
    }
  };

  const handleRSVP = async (sessionId: number, status: 'attending' | 'maybe' | 'not_attending', notes: string = '') => {
    try {
      const response = await fetch(`http://localhost:5000/api/playtest/sessions/${sessionId}/rsvp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status, notes }),
      });

      if (response.ok) {
        setRsvps(prev => ({ ...prev, [sessionId]: { status, notes } }));
        fetchSessions(); // Refresh to update participant count
      }
    } catch (error) {
      console.error('Failed to update RSVP:', error);
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


  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-400"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center">
          <Calendar className="h-6 w-6 mr-2" />
          Playtest Sessions
        </h2>
        <p className="text-gray-400">Upcoming testing sessions and your RSVP status</p>
      </div>

      <div className="space-y-6">
        {sessions.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No upcoming playtest sessions</p>
          </div>
        ) : (
          sessions.map((session) => {
            const rsvp = rsvps[session.id];
            const sessionDate = new Date(session.scheduled_date);
            const isUpcoming = sessionDate > new Date();
            
            return (
              <div
                key={session.id}
                className="bg-gray-700/30 rounded-xl p-6 border border-gray-600 hover:border-violet-500/50 transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">{session.title}</h3>
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
                  </div>

                  {isUpcoming && (
                    <div className="ml-6 flex flex-col space-y-2">
                      <div className="flex items-center space-x-2 mb-2">
                        {getStatusIcon(rsvp?.status)}
                        <span className="text-sm text-gray-400">
                          {rsvp?.status ? rsvp.status.replace('_', ' ').toUpperCase() : 'No Response'}
                        </span>
                      </div>
                      
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleRSVP(session.id, 'attending')}
                          className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                            rsvp?.status === 'attending' 
                              ? 'bg-green-600 text-white' 
                              : 'bg-gray-700 text-gray-300 hover:bg-green-600 hover:text-white'
                          }`}
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => handleRSVP(session.id, 'maybe')}
                          className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                            rsvp?.status === 'maybe' 
                              ? 'bg-yellow-600 text-white' 
                              : 'bg-gray-700 text-gray-300 hover:bg-yellow-600 hover:text-white'
                          }`}
                        >
                          Maybe
                        </button>
                        <button
                          onClick={() => handleRSVP(session.id, 'not_attending')}
                          className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
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