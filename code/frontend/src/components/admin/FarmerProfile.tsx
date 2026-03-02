import React from 'react';
import { X, User, MapPin, Phone, Star, Wheat, Home, Award } from 'lucide-react';

interface FarmerProfileProps {
  farm: {
    farmId: string;
    farmName: string;
    farmerName: string;
    farmerNIC: string;
    phone: string;
    division: string;
    district: string;
    farmSize: number;
    crop: string;
    status: string;
    points: number;
    farmerImage?: string;
  };
  onClose: () => void;
}

export function FarmerProfile({ farm, onClose }: FarmerProfileProps) {
  const initials = farm.farmerName.split(' ').map(n => n[0]).join('');

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center overflow-y-auto p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-700 to-green-800 text-white p-3 rounded-t-lg flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 border-2 border-white/30">
              {farm.farmerImage ? (
                <img 
                  src={farm.farmerImage} 
                  alt={farm.farmerName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).nextElementSibling!.classList.remove('hidden');
                  }}
                />
              ) : null}
              <span className={`text-lg font-bold ${farm.farmerImage ? 'hidden' : ''}`}>{initials}</span>
            </div>
            <div>
              <h2 className="text-xl font-bold mb-1">{farm.farmerName}</h2>
              <p className="text-green-100 text-xs">NIC: {farm.farmerNIC}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded p-3 border border-green-200">
              <Star className="w-4 h-4 text-green-700 mb-1.5" />
              <p className="text-xs text-green-700 mb-0.5">Total Points</p>
              <p className="text-lg font-bold text-green-900">{Math.round(farm.points)}</p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded p-3 border border-blue-200">
              <Wheat className="w-4 h-4 text-blue-700 mb-1.5" />
              <p className="text-xs text-blue-700 mb-0.5">Farm Size</p>
              <p className="text-lg font-bold text-blue-900">{farm.farmSize} acres</p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded p-3 border border-orange-200">
              <Award className="w-4 h-4 text-orange-700 mb-1.5" />
              <p className="text-xs text-orange-700 mb-0.5">Crop Type</p>
              <p className="text-sm font-bold text-orange-900">{farm.crop}</p>
            </div>

            <div className={`bg-gradient-to-br rounded p-3 border ${
              farm.status === 'active'
                ? 'from-blue-50 to-blue-100 border-blue-200'
                : 'from-yellow-50 to-yellow-100 border-yellow-200'
            }`}>
              <Home className={`w-4 h-4 mb-1.5 ${
                farm.status === 'active' ? 'text-blue-700' : 'text-yellow-700'
              }`} />
              <p className={`text-xs mb-0.5 ${
                farm.status === 'active' ? 'text-blue-700' : 'text-yellow-700'
              }`}>
                Farm Status
              </p>
              <p className={`text-sm font-bold ${
                farm.status === 'active' ? 'text-blue-900' : 'text-yellow-900'
              }`}>
                {farm.status.charAt(0).toUpperCase() + farm.status.slice(1)}
              </p>
            </div>
          </div>

          {/* Farmer Contact Information */}
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
            <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-green-700" />
              Contact Info
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-600 mb-0.5">Full Name</p>
                <p className="text-xs font-medium text-gray-800 flex items-center gap-2">
                  <User className="w-3 h-3 text-gray-500" />
                  {farm.farmerName}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-0.5">NIC Number</p>
                <p className="text-xs font-medium text-gray-800">{farm.farmerNIC}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-xs text-gray-600 mb-0.5">Phone Number</p>
                <p className="text-xs font-medium text-gray-800 flex items-center gap-2">
                  <Phone className="w-3 h-3 text-gray-500" />
                  {farm.phone}
                </p>
              </div>
            </div>
          </div>

          {/* Farm Details */}
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
            <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Wheat className="w-4 h-4 text-green-700" />
              Farm Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-600 mb-0.5">Farm ID</p>
                <p className="text-xs font-medium text-gray-800 bg-green-100 px-2 py-1.5 rounded text-green-700">
                  {farm.farmId}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-0.5">Farm Name</p>
                <p className="text-xs font-medium text-gray-800">{farm.farmName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-0.5">Division</p>
                <p className="text-xs font-medium text-gray-800 flex items-center gap-2">
                  <MapPin className="w-3 h-3 text-gray-500" />
                  {farm.division}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-0.5">District</p>
                <p className="text-xs font-medium text-gray-800 flex items-center gap-2">
                  <MapPin className="w-3 h-3 text-gray-500" />
                  {farm.district}
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="text-xs text-gray-600 mb-0.5">Crop Type</p>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium flex items-center gap-1">
                    <Wheat className="w-3 h-3" />
                    {farm.crop}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex justify-end pt-3 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-medium rounded transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
