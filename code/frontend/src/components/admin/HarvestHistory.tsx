import { Search, Filter, Calendar, Download } from 'lucide-react';
import { useState } from 'react';

export function HarvestHistory() {
  const [searchTerm, setSearchTerm] = useState('');

  const harvests = [
    {
      id: 1,
      farmer: 'Ahmed Hassan',
      nic: '198512345V',
      season: 'Maha 2025/26',
      plot: 'Plot A - Attanagalla',
      acres: 3.5,
      variety: 'BG 300',
      plantDate: '2025-10-15',
      harvestDate: '2026-02-10',
      expectedYield: 4.2,
      actualYield: 4.5,
      yieldPerAcre: 1.29,
      quality: 'Excellent',
      points: 65,
      status: 'Verified'
    },
    {
      id: 2,
      farmer: 'Priya Fernando',
      nic: '199023456V',
      season: 'Maha 2025/26',
      plot: 'Plot B - Wariyapola',
      acres: 4.0,
      variety: 'BG 352',
      plantDate: '2025-10-20',
      harvestDate: '2026-02-15',
      expectedYield: 4.8,
      actualYield: 4.8,
      yieldPerAcre: 1.20,
      quality: 'Good',
      points: 60,
      status: 'Verified'
    },
    {
      id: 3,
      farmer: 'Ruwan Silva',
      nic: '198834567V',
      season: 'Yala 2024',
      plot: 'Plot C - Medawachchiya',
      acres: 2.5,
      variety: 'AT 362',
      plantDate: '2024-05-10',
      harvestDate: '2024-08-20',
      expectedYield: 2.5,
      actualYield: 2.8,
      yieldPerAcre: 1.12,
      quality: 'Good',
      points: 56,
      status: 'Verified'
    },
    {
      id: 4,
      farmer: 'Nimal Perera',
      nic: '199245678V',
      season: 'Maha 2024/25',
      plot: 'Plot A - Hingurakgoda',
      acres: 5.0,
      variety: 'BG 300',
      plantDate: '2024-10-12',
      harvestDate: '2025-02-18',
      expectedYield: 6.0,
      actualYield: 6.5,
      yieldPerAcre: 1.30,
      quality: 'Excellent',
      points: 65,
      status: 'Verified'
    },
    {
      id: 5,
      farmer: 'Kamala Dissanayake',
      nic: '198956789V',
      season: 'Maha 2025/26',
      plot: 'Plot A - Uhana',
      acres: 3.0,
      variety: 'BG 366',
      plantDate: '2025-11-01',
      harvestDate: '2026-02-12',
      expectedYield: 3.6,
      actualYield: 3.3,
      yieldPerAcre: 1.10,
      quality: 'Average',
      points: 55,
      status: 'Pending'
    },
  ];

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          
          <p className="text-sm md:text-base text-gray-600">View all recorded harvest data and points</p>
        </div>
        <button className="px-6 py-3 bg-green-700 hover:bg-green-800 text-white rounded-lg flex items-center justify-center gap-2 transition-colors whitespace-nowrap">
          <Download className="w-5 h-5" />
          Export Data
        </button>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by farmer name, NIC, or plot..."
              className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm md:text-base"
            />
          </div>
          <div className="flex gap-2 sm:gap-4">
            <button className="flex-1 sm:flex-none px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center justify-center gap-2 transition-colors">
              <Filter className="w-5 h-5" />
              <span className="text-sm md:text-base">Filter</span>
            </button>
            <button className="flex-1 sm:flex-none px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center justify-center gap-2 transition-colors">
              <Calendar className="w-5 h-5" />
              <span className="text-sm md:text-base">Season</span>
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-xs md:text-sm text-gray-600 mb-1">Total Records</p>
          <p className="text-2xl md:text-3xl font-bold text-gray-900">{harvests.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-xs md:text-sm text-gray-600 mb-1">Total Yield</p>
          <p className="text-2xl md:text-3xl font-bold text-gray-900">
            {harvests.reduce((sum, h) => sum + h.actualYield, 0).toFixed(1)} <span className="text-sm md:text-lg font-normal text-gray-600">tons</span>
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-xs md:text-sm text-gray-600 mb-1">Avg Yield/Acre</p>
          <p className="text-2xl md:text-3xl font-bold text-gray-900">
            {(harvests.reduce((sum, h) => sum + h.yieldPerAcre, 0) / harvests.length).toFixed(2)} <span className="text-sm md:text-lg font-normal text-gray-600">tons</span>
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-xs md:text-sm text-gray-600 mb-1">Total Points Awarded</p>
          <p className="text-2xl md:text-3xl font-bold text-green-700">
            {harvests.reduce((sum, h) => sum + h.points, 0)}
          </p>
        </div>
      </div>

      {/* Harvest History Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap">
                  Farmer
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap">
                  Season
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap">
                  Plot
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap">
                  Variety
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap">
                  Acres
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap">
                  Actual Yield
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap">
                  Yield/Acre
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap">
                  Quality
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap">
                  Points
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {harvests.map((harvest) => (
                <tr key={harvest.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 py-3">
                    <div>
                      <p className="font-medium text-gray-800 text-sm whitespace-nowrap">{harvest.farmer}</p>
                      <p className="text-xs text-gray-600 whitespace-nowrap">{harvest.nic}</p>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-xs text-gray-700 whitespace-nowrap">{harvest.season}</td>
                  <td className="px-3 py-3 text-xs text-gray-700 whitespace-nowrap">{harvest.plot}</td>
                  <td className="px-3 py-3 text-xs text-gray-700 whitespace-nowrap">{harvest.variety}</td>
                  <td className="px-3 py-3 text-xs text-gray-700 whitespace-nowrap">{harvest.acres}</td>
                  <td className="px-3 py-3 text-xs font-medium text-gray-800 whitespace-nowrap">{harvest.actualYield} tons</td>
                  <td className="px-3 py-3 text-xs font-medium text-gray-800 whitespace-nowrap">{harvest.yieldPerAcre} tons</td>
                  <td className="px-3 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                      harvest.quality === 'Excellent' 
                        ? 'bg-green-100 text-green-700'
                        : harvest.quality === 'Good'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {harvest.quality}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-sm font-semibold text-green-700 whitespace-nowrap">{harvest.points}</td>
                  <td className="px-3 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                      harvest.status === 'Verified' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {harvest.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}