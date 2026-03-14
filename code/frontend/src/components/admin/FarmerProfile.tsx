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
        <div className="bg-gradient-to-r from-green-700 to-green-800 text-white rounded-t-lg relative" style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div 
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                border: '2px solid rgba(255,255,255,0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                overflow: 'hidden'
              }}
            >
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
              <span 
                style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: 'white',
                  display: farm.farmerImage ? 'none' : 'block'
                }}
              >
                {initials}
              </span>
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'white', marginBottom: '6px' }}>
                {farm.farmerName}
              </h2>
              <span 
                style={{
                  display: 'inline-block',
                  background: 'rgba(255,255,255,0.15)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  color: 'rgba(255,255,255,0.9)',
                  padding: '2px 10px',
                  borderRadius: '999px',
                  fontSize: '12px',
                  fontWeight: '600'
                }}
              >
                NIC · {farm.farmerNIC}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '20px',
              right: '24px',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.25)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.15)';
            }}
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
          <div style={{ background: '#F9FAFB', borderRadius: '0.5rem', border: '1px solid #E5E7EB', padding: '12px 16px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '10px', paddingBottom: '8px', fontSize: '0.875rem', fontWeight: '600', color: '#111827', borderBottom: '1px solid #F9FAFB' }}>
              <User className="w-4 h-4 text-green-700" />
              Contact Info
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
              <div style={{ padding: '6px 0', borderBottom: '1px solid #F9FAFB', paddingRight: '8px' }}>
                <p style={{ fontSize: '11px', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '1px' }}>Full Name</p>
                <p style={{ fontSize: '13px', fontWeight: '500', color: '#111827', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <User style={{ width: '13px', height: '13px', color: '#9CA3AF' }} />
                  {farm.farmerName}
                </p>
              </div>
              <div style={{ padding: '6px 0', borderBottom: '1px solid #F9FAFB', paddingLeft: '8px' }}>
                <p style={{ fontSize: '11px', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '1px' }}>NIC Number</p>
                <p style={{ fontSize: '13px', fontWeight: '500', color: '#111827' }}>{farm.farmerNIC}</p>
              </div>
              <div style={{ padding: '6px 0', borderBottom: '1px solid #F9FAFB', gridColumn: '1 / -1' }}>
                <p style={{ fontSize: '11px', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '1px' }}>Phone Number</p>
                <p style={{ fontSize: '13px', fontWeight: '500', color: '#111827', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Phone style={{ width: '13px', height: '13px', color: '#9CA3AF' }} />
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
