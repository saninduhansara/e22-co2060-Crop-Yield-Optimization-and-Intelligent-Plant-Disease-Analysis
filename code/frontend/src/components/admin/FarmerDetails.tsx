import { ArrowLeft, User, MapPin, Phone, Mail, Calendar, Star, TrendingUp, Wheat, FileText, X } from 'lucide-react';

interface FarmerDetailsProps {
  farmer: any;
  onClose: () => void;
}

export function FarmerDetails({ farmer, onClose }: FarmerDetailsProps) {
  const cultivationRecords = farmer.harvests || [];

  const totalAcres = cultivationRecords.reduce((sum: number, record: any) => sum + (record.acres || 0), 0);
  const totalYield = cultivationRecords.reduce((sum: number, record: any) => sum + ((record.harvestQty || 0) / 1000), 0);
  const avgYieldPerAcre = totalAcres > 0 ? (totalYield / totalAcres).toFixed(2) : '0.00';

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center overflow-y-auto p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-700 to-green-800 text-white p-4 md:p-6 rounded-t-2xl">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-start gap-4 md:gap-6">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-2xl md:text-3xl font-bold">
                {farmer.name.split(' ').map((n: string) => n[0]).join('')}
              </span>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">{farmer.name}</h2>
              <div className="flex flex-wrap gap-3 md:gap-4">
                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs md:text-sm font-medium">
                  Farm ID: {farmer.id}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs md:text-sm font-medium ${farmer.status === 'Active'
                    ? 'bg-green-400 text-green-900'
                    : 'bg-yellow-400 text-yellow-900'
                  }`}>
                  {farmer.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 md:p-8 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
              <Star className="w-6 h-6 md:w-8 md:h-8 text-green-700 mb-2" />
              <p className="text-xs md:text-sm text-green-700 mb-1">Total Points</p>
              <p className="text-2xl md:text-3xl font-bold text-green-900">{Math.round(farmer.points)}</p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
              <MapPin className="w-6 h-6 md:w-8 md:h-8 text-blue-700 mb-2" />
              <p className="text-xs md:text-sm text-blue-700 mb-1">Total Farm Size</p>
              <p className="text-2xl md:text-3xl font-bold text-blue-900">{farmer.farmSize}</p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
              <Wheat className="w-6 h-6 md:w-8 md:h-8 text-orange-700 mb-2" />
              <p className="text-xs md:text-sm text-orange-700 mb-1">Total Yield</p>
              <p className="text-2xl md:text-3xl font-bold text-orange-900">{totalYield} <span className="text-sm md:text-base font-normal">tons</span></p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
              <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-purple-700 mb-2" />
              <p className="text-xs md:text-sm text-purple-700 mb-1">Avg Yield/Acre</p>
              <p className="text-2xl md:text-3xl font-bold text-purple-900">{avgYieldPerAcre}</p>
            </div>
          </div>

          {/* Personal Information */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
            <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 md:w-6 md:h-6 text-green-700" />
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <p className="text-xs md:text-sm text-gray-600 mb-1">Full Name</p>
                <p className="text-sm md:text-base font-medium text-gray-800">{farmer.name}</p>
              </div>
              <div>
                <p className="text-xs md:text-sm text-gray-600 mb-1">NIC Number</p>
                <p className="text-sm md:text-base font-medium text-gray-800">{farmer.nic}</p>
              </div>
              <div>
                <p className="text-xs md:text-sm text-gray-600 mb-1">Phone Number</p>
                <p className="text-sm md:text-base font-medium text-gray-800 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  {farmer.phone}
                </p>
              </div>
              <div>
                <p className="text-xs md:text-sm text-gray-600 mb-1">Email Address</p>
                <p className="text-sm md:text-base font-medium text-gray-800 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  {farmer.name.toLowerCase().replace(' ', '.')}@farmer.lk
                </p>
              </div>
              <div>
                <p className="text-xs md:text-sm text-gray-600 mb-1">Division</p>
                <p className="text-sm md:text-base font-medium text-gray-800">{farmer.division}</p>
              </div>
              <div>
                <p className="text-xs md:text-sm text-gray-600 mb-1">District</p>
                <p className="text-sm md:text-base font-medium text-gray-800">{farmer.district}</p>
              </div>
              <div>
                <p className="text-xs md:text-sm text-gray-600 mb-1">Primary Crop</p>
                <p className="text-sm md:text-base font-medium text-gray-800">{farmer.crop}</p>
              </div>
              <div>
                <p className="text-xs md:text-sm text-gray-600 mb-1">Registration Date</p>
                <p className="text-sm md:text-base font-medium text-gray-800 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  January 2024
                </p>
              </div>
            </div>
          </div>

          {/* Farm Information */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
            <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 md:w-6 md:h-6 text-green-700" />
              Farm Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <p className="text-xs md:text-sm text-gray-600 mb-1">Total Farm Size</p>
                <p className="text-sm md:text-base font-medium text-gray-800">{farmer.farmSize}</p>
              </div>
              <div>
                <p className="text-xs md:text-sm text-gray-600 mb-1">Cultivated Area</p>
                <p className="text-sm md:text-base font-medium text-gray-800">{totalAcres} acres</p>
              </div>
              <div>
                <p className="text-xs md:text-sm text-gray-600 mb-1">Number of Plots</p>
                <p className="text-sm md:text-base font-medium text-gray-800">{cultivationRecords.length} plots</p>
              </div>
              <div>
                <p className="text-xs md:text-sm text-gray-600 mb-1">Farm Location</p>
                <p className="text-sm md:text-base font-medium text-gray-800">{farmer.division}, {farmer.district}</p>
              </div>
            </div>
          </div>

          {/* Cultivation History */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-4 md:p-6 border-b border-gray-200">
              <h3 className="text-lg md:text-xl font-semibold text-gray-800 flex items-center gap-2">
                <FileText className="w-5 h-5 md:w-6 md:h-6 text-green-700" />
                Cultivation History
              </h3>
            </div>

            <div className="p-4 md:p-6 space-y-4">
              {cultivationRecords.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No harvest records found.</p>
              ) : (
                cultivationRecords.map((record: any) => (
                  <div key={record._id || record.id || Math.random()} className="border border-gray-200 rounded-xl p-4 md:p-6 hover:border-green-300 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 gap-2">
                      <div>
                        <h4 className="text-base md:text-lg font-semibold text-gray-800 mb-1">{record.season} {record.year}</h4>
                        <p className="text-xs md:text-sm text-gray-600">Recorded by: System</p>
                      </div>
                      <span className="inline-flex px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs md:text-sm font-medium w-fit">
                        Verified
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Date Recorded</p>
                        <p className="text-xs md:text-sm font-medium text-gray-800">
                          {record.createdDate ? new Date(record.createdDate).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Location</p>
                        <p className="text-xs md:text-sm font-medium text-gray-800">{record.location || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Acres Cultivated</p>
                        <p className="text-xs md:text-sm font-medium text-gray-800">{record.acres || 0} acres</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Paddy Variety</p>
                        <p className="text-xs md:text-sm font-medium text-gray-800">{record.crop || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Actual Yield</p>
                        <p className="text-xs md:text-sm font-medium text-gray-800">
                          {((record.harvestQty || 0) / 1000).toFixed(2)} tons
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <p className="text-xs md:text-sm text-gray-600">Points Earned</p>
                        <p className="text-lg md:text-xl font-bold text-green-600">+{Math.round(record.pointsEarned || 0)} points</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
            <button className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors text-sm md:text-base">
              Edit Farmer Details
            </button>
            <button className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-sm md:text-base">
              Add New Harvest Record
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors text-sm md:text-base"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
