import React, { useState, useEffect } from 'react';
import { ToggleLeft, ToggleRight, Plus, Edit, Trash2 } from 'lucide-react';

interface FeatureToggle {
  id: number;
  feature_name: string;
  description: string;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

const FeatureToggles: React.FC = () => {
  const [features, setFeatures] = useState<FeatureToggle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingFeature, setEditingFeature] = useState<FeatureToggle | null>(null);
  const [formData, setFormData] = useState({
    feature_name: '',
    description: '',
    is_enabled: false
  });

  useEffect(() => {
    fetchFeatures();
  }, []);

  const fetchFeatures = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/features', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setFeatures(data);
      }
    } catch (error) {
      console.error('Failed to fetch features:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingFeature 
        ? `http://localhost:5000/api/admin/features/${editingFeature.id}`
        : 'http://localhost:5000/api/admin/features';
      
      const response = await fetch(url, {
        method: editingFeature ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        fetchFeatures();
        setShowForm(false);
        setEditingFeature(null);
        setFormData({ feature_name: '', description: '', is_enabled: false });
      }
    } catch (error) {
      console.error('Failed to save feature:', error);
    }
  };

  const handleToggle = async (id: number, currentState: boolean) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/features/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ is_enabled: !currentState }),
      });

      if (response.ok) {
        fetchFeatures();
      }
    } catch (error) {
      console.error('Failed to toggle feature:', error);
    }
  };

  const handleEdit = (feature: FeatureToggle) => {
    setEditingFeature(feature);
    setFormData({
      feature_name: feature.feature_name,
      description: feature.description,
      is_enabled: feature.is_enabled
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this feature toggle?')) return;

    try {
      const response = await fetch(`http://localhost:5000/api/admin/features/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        fetchFeatures();
      }
    } catch (error) {
      console.error('Failed to delete feature:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Feature Toggles</h2>
          <p className="text-gray-400">Control experimental features and system flags</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>New Feature</span>
        </button>
      </div>

      {/* Feature Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-8 max-w-2xl w-full">
            <h3 className="text-2xl font-bold text-white mb-6">
              {editingFeature ? 'Edit Feature Toggle' : 'New Feature Toggle'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Feature Name
                </label>
                <input
                  type="text"
                  value={formData.feature_name}
                  onChange={(e) => setFormData({ ...formData, feature_name: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="e.g., new_ui_design"
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
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Describe what this feature toggle controls..."
                />
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="is_enabled"
                  checked={formData.is_enabled}
                  onChange={(e) => setFormData({ ...formData, is_enabled: e.target.checked })}
                  className="w-4 h-4 text-amber-600 bg-gray-700 border-gray-600 rounded focus:ring-amber-500"
                />
                <label htmlFor="is_enabled" className="text-gray-300">
                  Enable this feature by default
                </label>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingFeature(null);
                    setFormData({ feature_name: '', description: '', is_enabled: false });
                  }}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-lg transition-all"
                >
                  {editingFeature ? 'Update' : 'Create'} Feature
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Features List */}
      <div className="space-y-4">
        {features.length === 0 ? (
          <div className="text-center py-12">
            <ToggleLeft className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No feature toggles found</p>
          </div>
        ) : (
          features.map((feature) => (
            <div
              key={feature.id}
              className="bg-gray-700/30 rounded-lg p-6 border border-gray-600 hover:border-amber-500/50 transition-all"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-white">{feature.feature_name}</h3>
                    <button
                      onClick={() => handleToggle(feature.id, feature.is_enabled)}
                      className={`p-1 rounded transition-colors ${
                        feature.is_enabled
                          ? 'text-green-400 hover:text-green-300'
                          : 'text-gray-400 hover:text-gray-300'
                      }`}
                    >
                      {feature.is_enabled ? (
                        <ToggleRight className="h-6 w-6" />
                      ) : (
                        <ToggleLeft className="h-6 w-6" />
                      )}
                    </button>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      feature.is_enabled
                        ? 'text-green-400 bg-green-900/30'
                        : 'text-gray-400 bg-gray-900/30'
                    }`}>
                      {feature.is_enabled ? 'ENABLED' : 'DISABLED'}
                    </span>
                  </div>
                  
                  {feature.description && (
                    <p className="text-gray-300 mb-3">{feature.description}</p>
                  )}
                  
                  <div className="text-sm text-gray-400">
                    Created {new Date(feature.created_at).toLocaleDateString()}
                    {feature.updated_at !== feature.created_at && (
                      <span> • Updated {new Date(feature.updated_at).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => handleEdit(feature)}
                    className="p-2 text-gray-400 hover:text-amber-400 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(feature.id)}
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

export default FeatureToggles;