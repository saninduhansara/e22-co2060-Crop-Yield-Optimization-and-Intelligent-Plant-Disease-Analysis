import { User, Mail, Phone, MapPin, Calendar, Save, Edit2, Shield, AlertCircle, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { userAPI } from '../../services/api';

export function AdminProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'System Administrator',
    address: '',
    district: '',
    division: '',
    image: '',
    joinDate: '',
  });

  // Fetch profile on component mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const response = await userAPI.fetchProfile();
        const userData = response.user || response;
        
        setFormData({
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          email: userData.email || '',
          phone: userData.phone || 'Not provided',
          role: userData.role === 'admin' ? 'System Administrator' : userData.role,
          address: userData.address || 'Not provided',
          district: userData.district || 'Not provided',
          division: userData.division || 'Not provided',
          image: userData.image || '',
          joinDate: userData.createdAt || new Date().toISOString(),
        });
      } catch (err: any) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      
      await userAPI.updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        address: formData.address,
        district: formData.district,
        division: formData.division,
        image: formData.image,
      });
      
      setSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl space-y-6">
        <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100 text-center">
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-green-700 font-medium">Profile updated successfully!</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      )}

      {/* Profile Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-8 text-white shadow-lg">
        <div className="flex items-start gap-6">
          <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border-4 border-white/30 overflow-hidden">
            {formData.image ? (
              <img src={formData.image} alt="Admin Profile" className="w-full h-full object-cover" />
            ) : (
              <Shield className="w-12 h-12" />
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-white text-3xl font-semibold mb-2">{formData.firstName} {formData.lastName}</h1>
            <p className="text-green-100 mb-1">{formData.role}</p>
            <span className="inline-flex px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
              Active Administrator
            </span>
          </div>
        </div>
      </div>

      {/* Edit Button */}
      {!isEditing && (
        <button
          onClick={() => setIsEditing(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white hover:bg-gray-50 text-green-700 font-medium rounded-xl transition-colors shadow-sm border border-gray-200"
        >
          <Edit2 className="w-5 h-5" />
          Edit Profile
        </button>
      )}

      {/* Personal Information */}
      <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
        <h2 className="text-gray-800 mb-6 flex items-center gap-2">
          <User className="w-5 h-5 text-green-600" />
          Personal Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm text-gray-600 mb-1 block">First Name</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            ) : (
              <p className="text-gray-800 font-medium">{formData.firstName}</p>
            )}
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1 block">Last Name</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            ) : (
              <p className="text-gray-800 font-medium">{formData.lastName}</p>
            )}
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1 block flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email Address
            </label>
            <p className="text-gray-800 font-medium">{formData.email}</p>
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1 block flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Phone Number
            </label>
            {isEditing ? (
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            ) : (
              <p className="text-gray-800 font-medium">{formData.phone}</p>
            )}
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1 block flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Member Since
            </label>
            <p className="text-gray-800 font-medium">
              {new Date(formData.joinDate).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Location Information */}
      <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
        <h2 className="text-gray-800 mb-6 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-green-600" />
          Location Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="text-sm text-gray-600 mb-1 block">Address</label>
            {isEditing ? (
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              />
            ) : (
              <p className="text-gray-800 font-medium">{formData.address}</p>
            )}
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1 block">District</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            ) : (
              <p className="text-gray-800 font-medium">{formData.district}</p>
            )}
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1 block">DS Division</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.division}
                onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            ) : (
              <p className="text-gray-800 font-medium">{formData.division}</p>
            )}
          </div>
        </div>
      </div>

      {/* Role Information */}
      <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
        <h2 className="text-gray-800 mb-6 flex items-center gap-2">
          <Shield className="w-5 h-5 text-green-600" />
          Role & Permissions
        </h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Role</label>
            <p className="text-gray-800 font-medium">{formData.role}</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg border border-green-100">
            <p className="text-green-800 text-sm">
              <strong>Access Level:</strong> Full administrative access to manage farmers, 
              harvest data, reports, and system settings.
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {isEditing && (
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-700 hover:bg-green-800 disabled:bg-gray-400 text-white font-medium rounded-xl transition-colors"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            onClick={() => setIsEditing(false)}
            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
