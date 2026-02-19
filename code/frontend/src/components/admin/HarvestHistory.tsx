import { Search, Filter, Calendar, Download, Loader } from 'lucide-react';
import { useState, useEffect } from 'react';
import { farmAPI } from '../../services/api';

interface Harvest {
  harvestId: string;
  farmId: string;
  farmName: string;
  farmerName: string;
  farmerNIC: string;
  season: string;
  year: number;
  crop: string;
  location: string;
  district: string;
  acres: number;
  harvestQty: number;
  yieldPerAcre: number;
  harvestDate: string;
}

export function HarvestHistory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [harvests, setHarvests] = useState([] as Harvest[]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null as string | null);

  useEffect(() => {
    fetchHarvestHistory();
  }, []);

  const fetchHarvestHistory = async () => {
    try {
      setLoading(true);
      const data = await farmAPI.getHarvestHistory();
      setHarvests(data.harvests || []);
    } catch (err: any) {
      console.error('Error fetching harvest history:', err);
      setError('Failed to load harvest history');
    } finally {
      setLoading(false);
    }
  };

  const filteredHarvests = harvests.filter((harvest: Harvest) =>
    harvest.farmerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    harvest.farmerNIC.toLowerCase().includes(searchTerm.toLowerCase()) ||
    harvest.farmName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    harvest.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalYield = filteredHarvests.reduce((sum, h) => sum + h.harvestQty, 0) / 1000; // Convert to tons
  const avgYieldPerAcre = filteredHarvests.length > 0
    ? filteredHarvests.reduce((sum, h) => sum + h.yieldPerAcre, 0) / filteredHarvests.length
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

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
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-xs md:text-sm text-gray-600 mb-1">Total Records</p>
          <p className="text-2xl md:text-3xl font-bold text-gray-900">{filteredHarvests.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-xs md:text-sm text-gray-600 mb-1">Total Yield</p>
          <p className="text-2xl md:text-3xl font-bold text-gray-900">
            {totalYield.toFixed(1)} <span className="text-sm md:text-lg font-normal text-gray-600">tons</span>
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-xs md:text-sm text-gray-600 mb-1">Avg Yield/Acre</p>
          <p className="text-2xl md:text-3xl font-bold text-gray-900">
            {avgYieldPerAcre.toFixed(2)} <span className="text-sm md:text-lg font-normal text-gray-600">kg</span>
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
                  Farm Name
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap">
                  Location
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap">
                  Season
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap">
                  Year
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap">
                  Crop
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap">
                  Acres
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap">
                  Harvest Qty
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap">
                  Yield/Acre
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredHarvests.map((harvest) => (
                <tr key={harvest.harvestId} className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 py-3">
                    <div>
                      <p className="font-medium text-gray-800 text-sm whitespace-nowrap">{harvest.farmerName}</p>
                      <p className="text-xs text-gray-600 whitespace-nowrap">{harvest.farmerNIC}</p>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-xs text-gray-700 whitespace-nowrap">{harvest.farmName}</td>
                  <td className="px-3 py-3 text-xs text-gray-700 whitespace-nowrap">{harvest.location}</td>
                  <td className="px-3 py-3 text-xs text-gray-700 whitespace-nowrap">{harvest.season}</td>
                  <td className="px-3 py-3 text-xs text-gray-700 whitespace-nowrap">{harvest.year}</td>
                  <td className="px-3 py-3 text-xs text-gray-700 whitespace-nowrap">{harvest.crop}</td>
                  <td className="px-3 py-3 text-xs text-gray-700 whitespace-nowrap">{harvest.acres}</td>
                  <td className="px-3 py-3 text-xs font-medium text-gray-800 whitespace-nowrap">{harvest.harvestQty} kg</td>
                  <td className="px-3 py-3 text-xs font-medium text-gray-800 whitespace-nowrap">{harvest.yieldPerAcre.toFixed(2)} kg</td>
                  <td className="px-3 py-3 text-xs text-gray-700 whitespace-nowrap">
                    {new Date(harvest.harvestDate).toLocaleDateString()}
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