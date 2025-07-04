import React, { useState, useEffect } from 'react';
import { Star, Plus, Edit, Trash2, Search, Calendar, User } from 'lucide-react';
import { staffAPI } from '../../services/api';

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
}

interface GameBuild {
  id: number;
  version: string;
  name: string;
}

const Reviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [builds, setBuilds] = useState<GameBuild[]>([]);
  const [selectedBuild, setSelectedBuild] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
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
    }
  }, [selectedBuild]);

  const fetchBuilds = async () => {
    try {
      const response = await staffAPI.getBuilds();
      const buildsData = response.data.builds || response.data;
      setBuilds(buildsData);
      if (buildsData.length > 0) {
        setSelectedBuild(buildsData[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch builds:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async (buildId: number) => {
    try {
      const response = await staffAPI.getReviews(buildId);
      setReviews(response.data);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const data = {
        build_id: parseInt(formData.build_id),
        rating: formData.rating,
        feedback: formData.feedback
      };

      if (editingReview) {
        await staffAPI.updateReview(editingReview.id, {
          rating: data.rating,
          feedback: data.feedback
        });
      } else {
        await staffAPI.createReview(data);
      }

      if (selectedBuild) {
        fetchReviews(selectedBuild);
      }
      setShowForm(false);
      setEditingReview(null);
      setFormData({ build_id: '', rating: 5, feedback: '' });
    } catch (error) {
      console.error('Failed to save review:', error);
    }
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
    
    try {
      await staffAPI.deleteReview(id);
      if (selectedBuild) {
        fetchReviews(selectedBuild);
      }
    } catch (error) {
      console.error('Failed to delete review:', error);
    }
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
                  {build.version} - {build.name}
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
                      {build.version} - {build.name}
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
              className="bg-gray-700/30 rounded-xl p-6 border border-gray-600 hover:border-violet-500/50 transition-all group"
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
                  </div>
                </div>
                
                <div className="flex space-x-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(review)}
                    className="p-2 text-gray-400 hover:text-violet-400 transition-colors rounded-lg hover:bg-gray-600/50"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(review.id)}
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