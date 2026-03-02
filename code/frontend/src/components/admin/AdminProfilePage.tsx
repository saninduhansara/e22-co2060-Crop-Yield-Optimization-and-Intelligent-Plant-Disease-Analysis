import { User, Mail, Phone, MapPin, Calendar, Save, Edit2, Shield } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export function AdminProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: 'Admin User',
    email: 'admin@agriconnect.lk',
    phone: '077-1234567',
    role: 'System Administrator',
    location: 'Department of Agriculture, Colombo',
    district: 'Colombo',
    province: 'Western Province',
    joinDate: '2024-01-15',
  });

  const handleSave = () => {
    // Save logic here
    setIsEditing(false);
    toast.success('Profile updated successfully!');
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-8 text-white shadow-lg">
        <div className="flex items-start gap-6">
          <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border-4 border-white/30">
            <Shield className="w-12 h-12" />
          </div>
          <div className="flex-1">
            <h1 className="text-white text-3xl font-semibold mb-2">{formData.name}</h1>
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
            <label className="text-sm text-gray-600 mb-1 block">Full Name</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            ) : (
              <p className="text-gray-800 font-medium">{formData.name}</p>
            )}
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1 block">Role</label>
            <p className="text-gray-800 font-medium">{formData.role}</p>
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1 block flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email Address
            </label>
            {isEditing ? (
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            ) : (
              <p className="text-gray-800 font-medium">{formData.email}</p>
            )}
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
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Office Location</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            ) : (
              <p className="text-gray-800 font-medium">{formData.location}</p>
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
            <label className="text-sm text-gray-600 mb-1 block">Province</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.province}
                onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            ) : (
              <p className="text-gray-800 font-medium">{formData.province}</p>
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
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-700 hover:bg-green-800 text-white font-medium rounded-xl transition-colors"
          >
            <Save className="w-5 h-5" />
            Save Changes
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
