import React, { useState, useEffect } from 'react';
import { Megaphone, Pin, Calendar, User } from 'lucide-react';
import { staffAPI } from '../../services/api';

interface Announcement {
  id: number;
  title: string;
  content: string;
  author_name: string;
  is_sticky: boolean;
  target_roles: string[];
  created_at: string;
  updated_at: string;
}

const TeamAnnouncements: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await staffAPI.getAnnouncements();
      setAnnouncements(response.data);
    } catch (error) {
      console.error('Failed to fetch announcements:', error);
    } finally {
      setLoading(false);
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
          <Megaphone className="h-6 w-6 mr-2" />
          Team Announcements
        </h2>
        <p className="text-gray-400">Important updates and information from the team</p>
      </div>

      <div className="space-y-6">
        {announcements.length === 0 ? (
          <div className="text-center py-12">
            <Megaphone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No announcements yet</p>
          </div>
        ) : (
          announcements.map((announcement) => (
            <div
              key={announcement.id}
              className={`rounded-xl p-6 border transition-all ${
                announcement.is_sticky
                  ? 'bg-amber-900/20 border-amber-500/50 ring-1 ring-amber-500/20'
                  : 'bg-gray-700/30 border-gray-600 hover:border-violet-500/50'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {announcement.is_sticky && (
                    <Pin className="h-5 w-5 text-amber-400" />
                  )}
                  <h3 className="text-xl font-bold text-white">{announcement.title}</h3>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-400">
                  <div className="flex items-center space-x-1">
                    <User className="h-4 w-4" />
                    <span>{announcement.author_name}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(announcement.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="prose prose-invert max-w-none">
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {announcement.content}
                </p>
              </div>

              {announcement.target_roles && announcement.target_roles.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {announcement.target_roles.map((role, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-violet-900/30 text-violet-300 rounded text-xs"
                    >
                      {role === 'all' ? 'All Staff' : role.replace('_', ' ').toUpperCase()}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TeamAnnouncements;