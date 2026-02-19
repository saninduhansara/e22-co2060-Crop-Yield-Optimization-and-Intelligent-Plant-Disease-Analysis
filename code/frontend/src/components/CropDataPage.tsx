import { MapPin, Wheat, TrendingUp, Calendar } from 'lucide-react';

export function CropDataPage() {
  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div>
        
        <p className="text-sm md:text-base text-gray-600">View your paddy cultivation data entered by district officers</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
        <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-200">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-gray-600 text-xs md:text-sm mb-1">Total Yield</p>
              <p className="text-2xl md:text-4xl font-bold text-gray-900">11.5 <span className="text-sm md:text-lg font-normal text-gray-600">tons</span></p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Wheat className="w-5 h-5 md:w-6 md:h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-200">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-gray-600 text-xs md:text-sm mb-1">Total Acres</p>
              <p className="text-2xl md:text-4xl font-bold text-gray-900">10</p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-200">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-gray-600 text-xs md:text-sm mb-1">Avg Yield/Acre</p>
              <p className="text-2xl md:text-4xl font-bold text-gray-900">1.15 <span className="text-sm md:text-lg font-normal text-gray-600">tons</span></p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-200">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-gray-600 text-xs md:text-sm mb-1">Total Records</p>
              <p className="text-2xl md:text-4xl font-bold text-gray-900">3</p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Cultivation Records */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 md:p-6 border-b border-gray-200">
          <h3 className="text-base md:text-lg font-semibold text-gray-800">Cultivation Records</h3>
        </div>

        <div className="p-4 md:p-6 space-y-4">
          {/* Record 1 */}
          <div className="border border-gray-200 rounded-xl p-4 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 gap-2">
              <div>
                <h4 className="text-base md:text-lg font-semibold text-gray-800 mb-1">Maha 2025/26</h4>
                <p className="text-xs md:text-sm text-gray-600">Recorded by: D.O. Silva</p>
              </div>
              <span className="inline-flex px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs md:text-sm font-medium w-fit">
                Verified
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
              <div>
                <p className="text-xs text-gray-600 mb-1">Date Recorded</p>
                <p className="text-xs md:text-sm font-medium text-gray-800">1/15/2026</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Location</p>
                <p className="text-xs md:text-sm font-medium text-gray-800">Plot A - Attanagalla</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Acres Cultivated</p>
                <p className="text-xs md:text-sm font-medium text-gray-800">3.5 acres</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Paddy Variety</p>
                <p className="text-xs md:text-sm font-medium text-gray-800">BG 300</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Expected Yield</p>
                <p className="text-xs md:text-sm font-medium text-gray-800">4.2 tons</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <p className="text-xs md:text-sm text-gray-600">Points Earned</p>
                <p className="text-lg md:text-xl font-bold text-green-600">+175 points</p>
              </div>
            </div>
          </div>

          {/* Record 2 */}
          <div className="border border-gray-200 rounded-xl p-4 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 gap-2">
              <div>
                <h4 className="text-base md:text-lg font-semibold text-gray-800 mb-1">Maha 2024/25</h4>
                <p className="text-xs md:text-sm text-gray-600">Recorded by: D.O. Silva</p>
              </div>
              <span className="inline-flex px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs md:text-sm font-medium w-fit">
                Verified
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
              <div>
                <p className="text-xs text-gray-600 mb-1">Date Recorded</p>
                <p className="text-xs md:text-sm font-medium text-gray-800">11/20/2025</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Location</p>
                <p className="text-xs md:text-sm font-medium text-gray-800">Plot B - Attanagalla</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Acres Cultivated</p>
                <p className="text-xs md:text-sm font-medium text-gray-800">4.0 acres</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Paddy Variety</p>
                <p className="text-xs md:text-sm font-medium text-gray-800">BG 352</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Expected Yield</p>
                <p className="text-xs md:text-sm font-medium text-gray-800">4.8 tons</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <p className="text-xs md:text-sm text-gray-600">Points Earned</p>
                <p className="text-lg md:text-xl font-bold text-green-600">+200 points</p>
              </div>
            </div>
          </div>

          {/* Record 3 */}
          <div className="border border-gray-200 rounded-xl p-4 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 gap-2">
              <div>
                <h4 className="text-base md:text-lg font-semibold text-gray-800 mb-1">Yala 2024</h4>
                <p className="text-xs md:text-sm text-gray-600">Recorded by: D.O. Perera</p>
              </div>
              <span className="inline-flex px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs md:text-sm font-medium w-fit">
                Pending
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
              <div>
                <p className="text-xs text-gray-600 mb-1">Date Recorded</p>
                <p className="text-xs md:text-sm font-medium text-gray-800">8/10/2025</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Location</p>
                <p className="text-xs md:text-sm font-medium text-gray-800">Plot C - Gampaha</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Acres Cultivated</p>
                <p className="text-xs md:text-sm font-medium text-gray-800">2.5 acres</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Paddy Variety</p>
                <p className="text-xs md:text-sm font-medium text-gray-800">AT 362</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Expected Yield</p>
                <p className="text-xs md:text-sm font-medium text-gray-800">2.5 tons</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <p className="text-xs md:text-sm text-gray-600">Points Earned</p>
                <p className="text-base md:text-xl font-bold text-gray-400">Pending verification</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}