import React, { useState, useEffect } from 'react';
import { staffAPI } from '../../services/api';
import { Plus, Trash2, Reply, Pencil, ChevronUp, ChevronDown, MessageSquare } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface MessagePost {
  id: number;
  title: string;
  content: string;
  authorId: number;
  firstName: string;
  lastName: string;
  role: string;
  parentId: number | null;
  category?: string | null;
  createdAt: string;
  updatedAt: string;
  isEdited: boolean;
  replyCount: number;
}

interface MessageReply {
  id: number;
  title: string;
  content: string;
  authorId: number;
  firstName: string;
  lastName: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  isEdited: boolean;
  parentId: number;
  category?: string | null;
}

const categories = ['#build-updates', '#feedback', '#ops', '#general'];

const MessageBoard: React.FC = () => {
  const { user } = useAuth();
  const [messagePosts, setMessagePosts] = useState<MessagePost[]>([]);
  const [replyForms, setReplyForms] = useState<Record<number, { content: string }>>({});
  const [showReplyForm, setShowReplyForm] = useState<number | null>(null);
  const [expandedPosts, setExpandedPosts] = useState<Set<number>>(new Set());
  const [postReplies, setPostReplies] = useState<Record<number, MessageReply[]>>({});
  const [showMessageForm, setShowMessageForm] = useState(false);
  const [editingMessage, setEditingMessage] = useState<MessagePost | null>(null);
  const [messageForm, setMessageForm] = useState({ title: '', content: '', category: categories[0] });

  const loadPosts = async () => {
    try {
      const response = await staffAPI.getMessages();
      setMessagePosts(response.data.posts);
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleMessagePost = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingMessage) {
        await staffAPI.updateMessage(editingMessage.id, messageForm);
        setEditingMessage(null);
      } else {
        await staffAPI.createMessage(messageForm);
      }
      setMessageForm({ title: '', content: '', category: categories[0] });
      setShowMessageForm(false);
      loadPosts();
    } catch (err) {
      console.error('Message post failed:', err);
    }
  };

  const handleReplySubmit = async (postId: number) => {
    const replyContent = replyForms[postId]?.content;
    if (!replyContent?.trim()) return;

    try {
      await staffAPI.createMessage({
        title: `Re: ${messagePosts.find(p => p.id === postId)?.title || 'Reply'}`,
        content: replyContent,
        parentId: postId,
        category: null,
      });
      setReplyForms(prev => ({ ...prev, [postId]: { content: '' } }));
      setShowReplyForm(null);
      loadPosts();
      if (expandedPosts.has(postId)) {
        loadReplies(postId);
      }
    } catch (err) {
      console.error('Reply failed:', err);
    }
  };

  const loadReplies = async (postId: number) => {
    try {
      const response = await staffAPI.getReplies(postId);
      setPostReplies(prev => ({ ...prev, [postId]: response.data.replies }));
    } catch (err) {
      console.error('Failed to load replies:', err);
    }
  };

  const togglePostExpansion = async (postId: number) => {
    const newExpanded = new Set(expandedPosts);
    if (newExpanded.has(postId)) {
      newExpanded.delete(postId);
    } else {
      newExpanded.add(postId);
      if (!postReplies[postId]) {
        await loadReplies(postId);
      }
    }
    setExpandedPosts(newExpanded);
  };

  const deleteMessage = async (id: number) => {
    if (confirm('Are you sure you want to delete this message?')) {
      try {
        await staffAPI.deleteMessage(id);
        loadPosts();
      } catch (err) {
        console.error('Message deletion failed:', err);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-orbitron font-bold text-white">Staff Message Board</h2>
        <button
          onClick={() => {
            setEditingMessage(null);
            setMessageForm({ title: '', content: '', category: categories[0] });
            setShowMessageForm(!showMessageForm);
          }}
          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-electric to-neon text-black font-rajdhani font-bold rounded-full shadow-md hover:shadow-xl transition-all duration-300"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Post
        </button>
      </div>

      {showMessageForm && (
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
          <h3 className="text-xl font-orbitron font-bold mb-6 text-white">
            {editingMessage ? 'Edit Message' : 'Create New Post'}
          </h3>
          <form onSubmit={handleMessagePost} className="space-y-6">
            <div>
              <label className="block text-sm font-rajdhani font-medium text-gray-200 mb-2">
                Title
              </label>
              <input
                type="text"
                required
                value={messageForm.title}
                onChange={(e) => setMessageForm({ ...messageForm, title: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-electric/20 focus:border-electric transition-colors duration-200 font-rajdhani text-white placeholder-gray-400"
                placeholder="Post title..."
              />
            </div>

            {!editingMessage?.parentId && (
              <div>
                <label className="block text-sm font-rajdhani font-medium text-gray-200 mb-2">
                  Category
                </label>
                <select
                  value={messageForm.category}
                  onChange={(e) => setMessageForm({ ...messageForm, category: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-electric/20 focus:border-electric transition-colors duration-200 font-rajdhani text-white"
                >
                  {categories.map((c) => (
                    <option key={c} value={c} className="bg-black">
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-rajdhani font-medium text-gray-200 mb-2">
                Content
              </label>
              <textarea
                rows={6}
                required
                value={messageForm.content}
                onChange={(e) => setMessageForm({ ...messageForm, content: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-electric/20 focus:border-electric transition-colors duration-200 font-rajdhani text-white placeholder-gray-400 resize-none"
                placeholder="What's on your mind?"
              />
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-electric to-neon text-black font-rajdhani font-bold rounded-lg hover:shadow-xl hover:shadow-electric/25 transition-all duration-300"
              >
                {editingMessage ? 'Update' : 'Post Message'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingMessage(null);
                  setShowMessageForm(false);
                }}
                className="px-6 py-3 bg-white/10 text-white font-rajdhani font-bold rounded-lg hover:bg-white/20 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {messagePosts.map((post) => (
          <div key={post.id} className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-orbitron font-bold text-white mb-2 flex items-center space-x-2">
                  <span>{post.title}</span>
                  {post.category && (
                    <span className="text-xs bg-cyber/30 text-cyber px-2 py-0.5 rounded">
                      {post.category}
                    </span>
                  )}
                </h3>
                <p className="text-gray-300 font-rajdhani text-sm mb-2 flex items-center space-x-2">
                  <span>
                    By {post.firstName} {post.lastName}
                  </span>
                  <span className="text-xs bg-white/10 px-2 py-0.5 rounded uppercase">
                    {post.role}
                  </span>
                  <span>• {new Date(post.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                  {post.isEdited && <span className="text-gray-500">(edited)</span>}
                </p>
              </div>
              {post.authorId === user?.id && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setEditingMessage(post);
                      setMessageForm({ title: post.title, content: post.content, category: post.category || categories[0] });
                      setShowMessageForm(true);
                    }}
                    className="p-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors duration-200"
                    title="Edit"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteMessage(post.id)}
                    className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors duration-200"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            <p className="text-gray-300 font-rajdhani whitespace-pre-wrap mb-4">{post.content}</p>

            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <div className="flex items-center space-x-4">
                {post.replyCount > 0 && (
                  <button
                    onClick={() => togglePostExpansion(post.id)}
                    className="flex items-center space-x-2 text-electric hover:text-neon transition-colors duration-200 font-rajdhani text-sm"
                  >
                    {expandedPosts.has(post.id) ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                    <span>
                      {post.replyCount} {post.replyCount === 1 ? 'reply' : 'replies'}
                    </span>
                  </button>
                )}
              </div>

              <button
                onClick={() => setShowReplyForm(showReplyForm === post.id ? null : post.id)}
                className="flex items-center space-x-2 px-3 py-1 bg-electric/20 text-electric rounded-lg hover:bg-electric/30 transition-colors duration-200 font-rajdhani text-sm"
              >
                <Reply className="h-4 w-4" />
                <span>Reply</span>
              </button>
            </div>

            {showReplyForm === post.id && (
              <div className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10">
                <textarea
                  rows={3}
                  value={replyForms[post.id]?.content || ''}
                  onChange={(e) =>
                    setReplyForms(prev => ({
                      ...prev,
                      [post.id]: { content: e.target.value }
                    }))
                  }
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-electric/20 focus:border-electric transition-colors duration-200 font-rajdhani text-white placeholder-gray-400 resize-none"
                  placeholder="Write your reply..."
                />
                <div className="flex space-x-2 mt-3">
                  <button
                    onClick={() => handleReplySubmit(post.id)}
                    disabled={!replyForms[post.id]?.content?.trim()}
                    className="px-4 py-2 bg-electric/20 text-electric rounded-lg hover:bg-electric/30 transition-colors duration-200 font-rajdhani text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Post Reply
                  </button>
                  <button
                    onClick={() => setShowReplyForm(null)}
                    className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors duration-200 font-rajdhani text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {expandedPosts.has(post.id) && postReplies[post.id] && (
              <div className="mt-4 space-y-3">
                {postReplies[post.id].map((reply) => (
                  <div key={reply.id} className="ml-6 p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-gray-300 font-rajdhani text-sm flex items-center space-x-2">
                          <span>{reply.firstName} {reply.lastName}</span>
                          <span className="text-xs bg-white/10 px-2 py-0.5 rounded uppercase">{reply.role}</span>
                          <span>• {new Date(reply.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                          {reply.isEdited && <span className="text-gray-500">(edited)</span>}
                        </p>
                      </div>
                      {reply.authorId === user?.id && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setEditingMessage(reply as unknown as MessagePost);
                              setMessageForm({ title: reply.title, content: reply.content, category: reply.category || categories[0] });
                              setShowMessageForm(true);
                            }}
                            className="p-1 bg-white/10 text-white rounded hover:bg-white/20 transition-colors duration-200"
                            title="Edit"
                          >
                            <Pencil className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => deleteMessage(reply.id)}
                            className="p-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors duration-200"
                            title="Delete"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                    <p className="text-gray-300 font-rajdhani whitespace-pre-wrap">{reply.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {messagePosts.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400 font-rajdhani text-lg">No messages yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBoard;
