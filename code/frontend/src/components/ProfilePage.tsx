import { User, MapPin, Phone, Mail, Calendar, FileText } from 'lucide-react';
import { useState, useEffect } from 'react';
import { userAPI } from '../services/api';

interface FarmerProfile {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  district: string;
  division: string;
  createdAt?: string;
  nic: string;
}

export function ProfilePage() {
  const [profile, setProfile] = useState<FarmerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const getProfile = async () => {
      try {
        const response = await userAPI.fetchProfile();
        setProfile(response.user);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    getProfile();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading profile data...</div>;
  }

  if (error || !profile) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg">
        {error || 'Profile not found'}
      </div>
    );
  }

  const fullName = `${profile.firstName || ''} ${profile.lastName || ''}`.trim();
  const regDate = profile.createdAt ? new Date(profile.createdAt) : new Date();

  return (
    <div className="max-w-4xl space-y-6">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-8 text-white shadow-lg">
        <div className="flex items-start gap-6">
          <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border-4 border-white/30">
            <User className="w-12 h-12" />
          </div>
          <div className="flex-1">
            <h1 className="text-white text-3xl font-semibold mb-2">{fullName || 'Farmer'}</h1>
            <p className="text-green-100 mb-1">NIC: {profile.nic || 'N/A'}</p>
            <span className="inline-flex px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
              Active Member
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
            <label className="text-sm text-gray-600 mb-1 block">Full Name</label>
            <p className="text-gray-800 font-medium">{fullName}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">NIC</label>
            <p className="text-gray-800 font-medium">{profile.nic}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Phone Number
            </label>
            <p className="text-gray-800 font-medium">{profile.phone || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email Address
            </label>
            <p className="text-gray-800 font-medium">{profile.email || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Registered Date
            </label>
            <p className="text-gray-800 font-medium">
              {regDate.toLocaleDateString('en-US', {
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
            <label className="text-sm text-gray-600 mb-1 block">Address</label>
            <p className="text-gray-800 font-medium">{profile.address || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Division</label>
            <p className="text-gray-800 font-medium">{profile.division || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">District</label>
            <p className="text-gray-800 font-medium">{profile.district || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Assigned Officer */}
      <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
        <h2 className="text-gray-800 mb-6">Assigned District Officer</h2>
        <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg border border-green-100">
          <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-6 h-6 text-green-700" />
          </div>
          <div className="flex-1">
            <h3 className="text-gray-800 font-medium mb-2">District Office: {profile.district || 'N/A'}</h3>
            <p className="text-gray-600 text-sm flex items-center gap-2 mb-1">
              Contact your local agrarian service center for updates to your profile.
            </p>
            <p className="text-gray-600 text-sm">
              Your officer manages crop data entry and provides agricultural guidance.
            </p>
          </div>
        </div>
      </div>

      {/* Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-blue-800 text-sm">
          <strong>Note:</strong> To update any profile information, please contact your district officer
          or visit your nearest agricultural office.
        </p>
      </div>
    </div>
  );
}