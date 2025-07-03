import React, { useState, useEffect } from 'react';
import { Star, Plus, Edit, Trash2, Search, MessageCircle, Calendar, User } from 'lucide-react';

interface Review {
  id: number;
  build_id: number;
  build_version: string;
  build_title: string;
  rating: number;
  feedback: string;
  reviewer_name: string;
  reviewer_id: number;
  created_at: string;
  updated_at: string;
  comments?: ReviewComment[];
}

interface ReviewComment {
  id: number;
  content: string;
  author_name: string;
  created_at: string;
}

interface GameBuild {
  id: number;
  version: string;
  title: string;
}

const Reviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [builds, setBuilds] = useState<GameBuild[]>([]);
  const [selectedBuild, setSelectedBuild] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [newComment, setNewComment] = useState('');
  const [formData, setFormData] = useState({
    build_id: '',
    rating: 5,
    feedback: ''
  });

  useEffect(() => {
    fetchBuilds();
  }, []);

  useEffect(() => {
    if (selectedBuild) {
      fetchReviews(selectedBuild);
    } else if (builds.length > 0) {
      setSelectedBuild(builds[0].id);
    }
  }, [selectedBuild, builds]);

  const fetchBuilds = async () => {
    try {
      const mockBuilds: GameBuild[] = [
        { id: 1, version: 'v0.2.1', title: 'Alpha Build - Combat Update' },
        { id: 2, version: 'v0.2.0', title: 'Alpha Build - Story Mode' },
        { id: 3, version: 'v0.1.9', title: 'Pre-Alpha Build' }
      ];
      setBuilds(mockBuilds);
      if (mockBuilds.length > 0) {
        setSelectedBuild(mockBuilds[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch builds:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async (buildId: number) => {
    try {
      const mockReviews: Review[] = [
        {
          id: 1,
          build_id: buildId,
          build_version: 'v0.2.1',
          build_title: 'Alpha Build - Combat Update',
          rating: 4,
          feedback: "Combat feels much more responsive now. The new combo system is intuitive and satisfying. However, there are still some frame drops during intense battles.",
          reviewer_name: 'John Doe',
          reviewer_id: 1,
          created_at: new Date(Date.now() - 86400000).toISOString(),
          updated_at: new Date(Date.now() - 86400000).toISOString(),
          comments: [
            {
              id: 1,
              content: "Thanks for the feedback! We're working on the performance issues.",
              author_name: "Jane Smith",
              created_at: new Date(Date.now() - 43200000).toISOString()
            }
          ]
        },
        {
          id: 2,
          build_id: buildId,
          build_version: 'v0.2.1',
          build_title: 'Alpha Build - Combat Update',
          rating: 5,
          feedback: "Absolutely love the new visual effects! The particle systems during special attacks are stunning. Great work on the audio design too.",
          reviewer_name: 'Sarah Wilson',
          reviewer_id: 2,
          created_at: new Date(Date.now() - 172800000).toISOString(),
          updated_at: new Date(Date.now() - 172800000).toISOString(),
          comments: []
        },
        {
          id: 3,
          build_id: buildId,
          build_version: 'v0.2.1',
          build_title: 'Alpha Build - Combat Update',
          rating: 3,
          feedback: "The gameplay improvements are solid, but I encountered several bugs with the inventory system. Items sometimes disappear after combat.",
          reviewer_name: 'Mike Johnson',
          reviewer_id: 3,
          created_at: new Date(Date.now() - 259200000).toISOString(),
          updated_at: new Date(Date.now() - 259200000).toISOString(),
          comments: []
        }
      ];
      setReviews(mockReviews);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Implementation would go here
    setShowForm(false);
    setEditingReview(null);
    setFormData({ build_id: '', rating: 5, feedback: '' });
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedReview) return;
    // Implementation would add comment to review
    setNewComment('');
  };

  const handleEdit = (review: Review) => {
    setEditingReview(review);
    setFormData({
      build_id: review.build_id.toString(),
      rating: review.rating,
      feedback: review.feedback
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    // Implementation would delete review
  };

  const renderStars = (rating: number, interactive = false, onRatingChange?: (rating: number) => void) => {
    return Array.from({ length: 5 }, (_, i) => (
      <button
        key={i}
        type={interactive ? "button" : undefined}
        onClick={interactive && onRatingChange ? () => onRatingChange(i + 1) : undefined}
        className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}`}
        disabled={!interactive}
      >
        <Star
          className={`h-4 w-4 ${
            i < rating ? 'text-yellow-400 fill-current' : 'text-gray-400'
          }`}
        />
      </button>
    ));
  };

  const getAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      distribution[review.rating as keyof typeof distribution]++;
    });
    return distribution;
  };

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.feedback.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.reviewer_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRating = ratingFilter === 'all' || review.rating.toString() === ratingFilter;
    
    return matchesSearch && matchesRating;
  });

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-400"></div>
      </div>
    );
  }

  const selectedBuildData = builds.find(b => b.id === selectedBuild);
  const distribution = getRatingDistribution();

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Build Reviews</h2>
          <p className="text-gray-400">Staff feedback and ratings for game builds</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-violet-500/25"
        >
          <Plus className="h-4 w-4" />
          <span>New Review</span>
        </button>
      </div>

      {/* Build Selector and Stats */}
      {builds.length > 0 && (
        <div className="mb-8 grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select Build
            </label>
            <select
              value={selectedBuild || ''}
              onChange={(e) => setSelectedBuild(parseInt(e.target.value))}
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              {builds.map((build) => (
                <option key={build.id} value={build.id}>
                  {build.version} - {build.title}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600">
            <h3 className="text-lg font-semibold text-white mb-3">Rating Overview</h3>
            <div className="flex items-center space-x-3 mb-3">
              <div className="flex">{renderStars(Math.round(parseFloat(getAverageRating())))}</div>
              <span className="text-2xl font-bold text-white">{getAverageRating()}</span>
              <span className="text-gray-400">({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
            </div>
            <div className="space-y-1">
              {[5, 4, 3, 2, 1].map(rating => (
                <div key={rating} className="flex items-center space-x-2 text-sm">
                  <span className="text-gray-400 w-8">{rating}★</span>
                  <div className="flex-1 bg-gray-600 rounded-full h-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${reviews.length > 0 ? (distribution[rating as keyof typeof distribution] / reviews.length) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <span className="text-gray-400 w-8">{distribution[rating as keyof typeof distribution]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search reviews..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          />
        </div>
        
        <select
          value={ratingFilter}
          onChange={(e) => setRatingFilter(e.target.value)}
          className="px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
        >
          <option value="all">All Ratings</option>
          <option value="5">5 Stars</option>
          <option value="4">4 Stars</option>
          <option value="3">3 Stars</option>
          <option value="2">2 Stars</option>
          <option value="1">1 Star</option>
        </select>
      </div>

      {/* Review Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
            <h3 className="text-2xl font-bold text-white mb-6">
              {editingReview ? 'Edit Review' : 'New Review'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
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
                      {build.version} - {build.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Rating *
                </label>
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    {renderStars(formData.rating, true, (rating) => setFormData({ ...formData, rating }))}
                  </div>
                  <span className="text-white ml-4">{formData.rating}/5</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Feedback *
                </label>
                <textarea
                  value={formData.feedback}
                  onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
                  required
                  rows={6}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                  placeholder="Share your detailed thoughts about this build..."
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingReview(null);
                    setFormData({ build_id: '', rating: 5, feedback: '' });
                  }}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-lg transition-all shadow-lg hover:shadow-violet-500/25"
                >
                  {editingReview ? 'Update' : 'Submit'} Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Detail Modal */}
      {selectedReview && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <div className="flex">{renderStars(selectedReview.rating)}</div>
                  <span className="text-lg font-semibold text-white">{selectedReview.rating}/5</span>
                </div>
                <p className="text-violet-300">{selectedReview.build_version} - {selectedReview.build_title}</p>
              </div>
              <button
                onClick={() => setSelectedReview(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-white mb-2">Review</h4>
                <p className="text-gray-300 bg-gray-700/30 p-4 rounded-lg leading-relaxed">{selectedReview.feedback}</p>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-400">
                <div className="flex items-center space-x-1">
                  <User className="h-4 w-4" />
                  <span>By {selectedReview.reviewer_name}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(selectedReview.created_at).toLocaleString()}</span>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-white mb-4">Comments</h4>
                <div className="space-y-4">
                  {selectedReview.comments && selectedReview.comments.length > 0 ? (
                    selectedReview.comments.map((comment) => (
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

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="text-center py-16">
            <Star className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No reviews found</h3>
            <p className="text-gray-400">
              {searchTerm || ratingFilter !== 'all' 
                ? 'Try adjusting your search or filters' 
                : selectedBuildData 
                  ? `No reviews for ${selectedBuildData.version} yet`
                  : 'No reviews have been submitted yet'}
            </p>
          </div>
        ) : (
          filteredReviews.map((review) => (
            <div
              key={review.id}
              className="bg-gray-700/30 rounded-xl p-6 border border-gray-600 hover:border-violet-500/50 transition-all cursor-pointer group"
              onClick={() => setSelectedReview(review)}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="flex">{renderStars(review.rating)}</div>
                    <span className="text-lg font-semibold text-white">{review.rating}/5</span>
                    <span className="text-violet-300">{review.build_version}</span>
                  </div>
                  
                  <p className="text-gray-300 mb-4 leading-relaxed">{review.feedback}</p>
                  
                  <div className="text-sm text-gray-400 flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <User className="h-4 w-4" />
                      <span>By {review.reviewer_name}</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(review.created_at).toLocaleDateString()}</span>
                    </div>
                    {review.comments && review.comments.length > 0 && (
                      <>
                        <span>•</span>
                        <div className="flex items-center space-x-1">
                          <MessageCircle className="h-4 w-4" />
                          <span>{review.comments.length} comment{review.comments.length !== 1 ? 's' : ''}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(review);
                    }}
                    className="p-2 text-gray-400 hover:text-violet-400 transition-colors rounded-lg hover:bg-gray-600/50"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(review.id);
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

export default Reviews;