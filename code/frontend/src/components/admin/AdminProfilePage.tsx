import { User, Mail, Phone, MapPin, Calendar, Shield, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { userAPI } from '../../services/api';
import { toast } from 'sonner';

export function AdminProfilePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileData, setProfileData] = useState({
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

        setProfileData({
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
            {profileData.image ? (
              <img src={profileData.image} alt="Admin Profile" className="w-full h-full object-cover" />
            ) : (
              <Shield className="w-12 h-12" />
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-white text-3xl font-semibold mb-2">{profileData.firstName} {profileData.lastName}</h1>
            <p className="text-green-100 mb-1">{profileData.role}</p>
            <span className="inline-flex px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
              Active Administrator
            </span>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
        <h2 className="text-gray-800 mb-6 flex items-center gap-2">
          <User className="w-5 h-5 text-green-600" />
          Personal Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm text-gray-600 mb-1 block">First Name</label>
            <p className="text-gray-800 font-medium">{profileData.firstName}</p>
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1 block">Last Name</label>
            <p className="text-gray-800 font-medium">{profileData.lastName}</p>
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1 block flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email Address
            </label>
            <p className="text-gray-800 font-medium">{profileData.email}</p>
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1 block flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Phone Number
            </label>
            <p className="text-gray-800 font-medium">{profileData.phone}</p>
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1 block flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Member Since
            </label>
            <p className="text-gray-800 font-medium">
              {new Date(profileData.joinDate).toLocaleDateString('en-US', {
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
            <p className="text-gray-800 font-medium">{profileData.address}</p>
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1 block">District</label>
            <p className="text-gray-800 font-medium">{profileData.district}</p>
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1 block">DS Division</label>
            <p className="text-gray-800 font-medium">{profileData.division}</p>
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
            <p className="text-gray-800 font-medium">{profileData.role}</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg border border-green-100">
            <p className="text-green-800 text-sm">
              <strong>Access Level:</strong> Full administrative access to manage farmers,
              harvest data, reports, and system settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
