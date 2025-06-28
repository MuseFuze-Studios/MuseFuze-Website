import React, { useState, useEffect } from 'react';
import { Star, Plus, Edit, Trash2 } from 'lucide-react';

interface Review {
  id: number;
  build_id: number;
  build_version: string;
  rating: number;
  feedback: string;
  reviewer_name: string;
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
      const response = await fetch('http://localhost:5000/api/builds', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setBuilds(data);
        if (data.length > 0) {
          setSelectedBuild(data[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch builds:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async (buildId: number) => {
    try {
      const response = await fetch(`http://localhost:5000/api/reviews/build/${buildId}`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setReviews(data);
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingReview 
        ? `http://localhost:5000/api/reviews/${editingReview.id}`
        : 'http://localhost:5000/api/reviews';
      
      const response = await fetch(url, {
        method: editingReview ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          build_id: parseInt(formData.build_id) || selectedBuild,
          rating: formData.rating,
          feedback: formData.feedback
        }),
      });

      if (response.ok) {
        if (selectedBuild) {
          fetchReviews(selectedBuild);
        }
        setShowForm(false);
        setEditingReview(null);
        setFormData({ build_id: '', rating: 5, feedback: '' });
      }
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
      const response = await fetch(`http://localhost:5000/api/reviews/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok && selectedBuild) {
        fetchReviews(selectedBuild);
      }
    } catch (error) {
      console.error('Failed to delete review:', error);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-400'
        }`}
      />
    ));
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
        <h2 className="text-2xl font-bold text-white">Build Reviews</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>New Review</span>
        </button>
      </div>

      {/* Build Selector */}
      {builds.length > 0 && (
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Select Build
          </label>
          <select
            value={selectedBuild || ''}
            onChange={(e) => setSelectedBuild(parseInt(e.target.value))}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            {builds.map((build) => (
              <option key={build.i} value={build.id}>
                {build.version} - {build.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Review Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-white mb-6">
              {editingReview ? 'Edit Review' : 'New Review'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Build
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
                  Rating
                </label>
                <div className="flex items-center space-x-2">
                  {Array.from({ length: 5 }, (_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: i + 1 })}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`h-8 w-8 ${
                          i < formData.rating
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-400 hover:text-yellow-400'
                        } transition-colors`}
                      />
                    </button>
                  ))}
                  <span className="text-white ml-4">{formData.rating}/5</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Feedback
                </label>
                <textarea
                  value={formData.feedback}
                  onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
                  required
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                  placeholder="Share your thoughts about this build..."
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
                  className="px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-lg transition-all"
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
        {reviews.length === 0 ? (
          <div className="text-center py-12">
            <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No reviews found for this build</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div
              key={review.id}
              className="bg-gray-700/30 rounded-lg p-6 border border-gray-600 hover:border-violet-500/50 transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="flex">{renderStars(review.rating)}</div>
                    <span className="text-gray-400">•</span>
                    <span className="text-violet-300 font-medium">{review.build_version}</span>
                  </div>
                  <p className="text-gray-300 mb-3">{review.feedback}</p>
                  <div className="text-sm text-gray-400">
                    By {review.reviewer_name} • {new Date(review.created_at).toLocaleDateString()}
                  </div>
                </div>
                
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => handleEdit(review)}
                    className="p-2 text-gray-400 hover:text-violet-400 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(review.id)}
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

export default Reviews;