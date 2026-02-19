import { Users, TrendingUp, Wheat, AlertTriangle, BarChart3, MapIcon } from 'lucide-react';

export function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        
        <p className="text-sm md:text-base text-gray-600">Monitor and manage all farming activities</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 md:gap-6">
        <div className="bg-white rounded-xl p-5 md:p-6 border border-gray-200 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-gray-600 text-sm mb-1">Total Farmers</p>
              <p className="text-3xl md:text-4xl font-bold text-gray-900">247</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-green-700" />
            </div>
          </div>
          <p className="text-sm text-green-600 flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            +12% from last month
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 md:p-6 border border-gray-200 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-gray-600 text-sm mb-1">Total Harvest</p>
              <p className="text-3xl md:text-4xl font-bold text-gray-900">1,840 <span className="text-base md:text-lg font-normal text-gray-600">tons</span></p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Wheat className="w-6 h-6 text-orange-700" />
            </div>
          </div>
          <p className="text-sm text-green-600 flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            +8% from last season
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 md:p-6 border border-gray-200 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-gray-600 text-sm mb-1">Active Plots</p>
              <p className="text-3xl md:text-4xl font-bold text-gray-900">432</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Wheat className="w-6 h-6 text-blue-700" />
            </div>
          </div>
          <p className="text-sm text-gray-600">Across all regions</p>
        </div>

        <div className="bg-white rounded-xl p-5 md:p-6 border border-gray-200 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-gray-600 text-sm mb-1">Total Farmland</p>
              <p className="text-3xl md:text-4xl font-bold text-gray-900">2,845 <span className="text-base md:text-lg font-normal text-gray-600">acres</span></p>
            </div>
            <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
              <MapIcon className="w-6 h-6 text-teal-700" />
            </div>
          </div>
          <p className="text-sm text-gray-600">Under cultivation</p>
        </div>

        <div className="bg-white rounded-xl p-5 md:p-6 border border-gray-200 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-gray-600 text-sm mb-1">Yield per Acre</p>
              <p className="text-3xl md:text-4xl font-bold text-gray-900">4.26 <span className="text-base md:text-lg font-normal text-gray-600">tons</span></p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-purple-700" />
            </div>
          </div>
          <p className="text-sm text-green-600 flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            +5% from average
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 md:p-6 border border-gray-200 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-gray-600 text-sm mb-1">Disease Reports</p>
              <p className="text-3xl md:text-4xl font-bold text-gray-900">23</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-700" />
            </div>
          </div>
          <p className="text-sm text-red-600">Requires attention</p>
        </div>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Recent Farmers */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-4 md:p-6 border-b border-gray-200">
            <h3 className="text-base md:text-lg font-semibold text-gray-800">Recent Farmers</h3>
          </div>
          <div className="p-4 md:p-6 space-y-4">
            {[
              { name: 'Ahmed Hassan', location: 'Gampaha', date: '2026-02-15', status: 'Active' },
              { name: 'Priya Fernando', location: 'Kurunegala', date: '2026-02-14', status: 'Active' },
              { name: 'Ruwan Silva', location: 'Anuradhapura', date: '2026-02-13', status: 'Pending' },
              { name: 'Nimal Perera', location: 'Polonnaruwa', date: '2026-02-12', status: 'Active' },
            ].map((farmer, index) => (
              <div key={index} className="flex items-center justify-between pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-green-700">
                      {farmer.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-800 text-sm md:text-base truncate">{farmer.name}</p>
                    <p className="text-xs md:text-sm text-gray-600 truncate">{farmer.location} • {farmer.date}</p>
                  </div>
                </div>
                <span className={`px-2 md:px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ml-2 ${
                  farmer.status === 'Active' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {farmer.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Harvests */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-4 md:p-6 border-b border-gray-200">
            <h3 className="text-base md:text-lg font-semibold text-gray-800">Recent Harvests</h3>
          </div>
          <div className="p-4 md:p-6 space-y-4">
            {[
              { farmer: 'Ahmed Hassan', variety: 'BG 300', yield: '4.2 tons', date: '2026-02-15' },
              { farmer: 'Priya Fernando', variety: 'BG 352', yield: '3.8 tons', date: '2026-02-14' },
              { farmer: 'Ruwan Silva', variety: 'AT 362', yield: '2.5 tons', date: '2026-02-13' },
              { farmer: 'Nimal Perera', variety: 'BG 300', yield: '5.1 tons', date: '2026-02-12' },
            ].map((harvest, index) => (
              <div key={index} className="pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                <div className="flex items-start justify-between mb-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-800 text-sm md:text-base truncate">{harvest.farmer}</p>
                    <p className="text-xs md:text-sm text-gray-600">{harvest.variety}</p>
                  </div>
                  <span className="text-sm font-semibold text-green-700 whitespace-nowrap ml-2">{harvest.yield}</span>
                </div>
                <p className="text-xs text-gray-500">{harvest.date}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}