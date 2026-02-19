import { Search, Filter, Eye, Edit, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { FarmerDetails } from './FarmerDetails';
import { farmAPI } from '../../services/api';

interface Farm {
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
}

export function AllFarmers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFarmer, setSelectedFarmer] = useState<Farm | null>(null);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch farms on component mount
  useEffect(() => {
    const fetchFarms = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await farmAPI.getAllFarms();
        setFarms(data.farms || []);
      } catch (err: any) {
        console.error('Error fetching farms:', err);
        setError('Failed to load farms. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchFarms();
  }, []);

  // Filter farms based on search term
  const filteredFarms = farms.filter((farm) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      farm.farmId.toLowerCase().includes(searchLower) ||
      farm.farmerName.toLowerCase().includes(searchLower) ||
      farm.farmerNIC.toLowerCase().includes(searchLower) ||
      farm.phone.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">All Farms</h2>
        <p className="text-sm md:text-base text-gray-600">Manage and view all registered farms and farmers</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <div className="inline-block">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
          <p className="text-gray-600 mt-4">Loading farms...</p>
        </div>
      ) : (
        <>
          {/* Search & Filter */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by Farm ID, farmer name, NIC, or phone..."
                  className="w-full pl-11 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm md:text-base"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    title="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>
              <button className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center justify-center gap-2 transition-colors">
                <Filter className="w-5 h-5" />
                <span className="text-sm md:text-base">Filter</span>
              </button>
            </div>

            {/* Search Results Info */}
            {searchTerm && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  <span className="font-semibold">{filteredFarms.length}</span> result{filteredFarms.length !== 1 ? 's' : ''} found for "<span className="font-semibold">{searchTerm}</span>" (searching by Farm ID, name, NIC, or phone)
                </p>
              </div>
            )}
          </div>

          {/* Empty State */}
          {filteredFarms.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <p className="text-gray-600">No farms found. {searchTerm && 'Try adjusting your search.'}</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap">
                          Farm ID
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap">
                          Farmer Name
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap">
                          NIC
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap">
                          Phone
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap">
                          Division
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap">
                          District
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap">
                          Farm Size
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap">
                          Crop
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap">
                          Status
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap">
                          Points
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider whitespace-nowrap">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredFarms.map((farm) => (
                        <tr 
                          key={farm.farmId} 
                          className="hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={() => setSelectedFarmer(farm)}
                        >
                          <td className="px-3 py-3 whitespace-nowrap">
                            <span className="font-medium text-green-700 text-sm">{farm.farmId}</span>
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-xs font-semibold text-green-700">
                                  {farm.farmerName.split(' ').map(n => n[0]).join('')}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-gray-800 text-sm">{farm.farmerName}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-3 text-xs text-gray-700 whitespace-nowrap">{farm.farmerNIC}</td>
                          <td className="px-3 py-3 text-xs text-gray-700 whitespace-nowrap">{farm.phone}</td>
                          <td className="px-3 py-3 text-xs text-gray-700 whitespace-nowrap">{farm.division}</td>
                          <td className="px-3 py-3 text-xs text-gray-700 whitespace-nowrap">{farm.district}</td>
                          <td className="px-3 py-3 text-xs font-medium text-gray-800 whitespace-nowrap">{farm.farmSize} acres</td>
                          <td className="px-3 py-3 whitespace-nowrap">
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                              {farm.crop}
                            </span>
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              farm.status === 'active' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {farm.status.charAt(0).toUpperCase() + farm.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap">
                            <span className="font-semibold text-green-700 text-sm">{Math.round(farm.points)}</span>
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center gap-1">
                              <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" title="View" onClick={() => setSelectedFarmer(farm)}>
                                <Eye className="w-4 h-4 text-gray-600" />
                              </button>
                              <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" title="Edit">
                                <Edit className="w-4 h-4 text-gray-600" />
                              </button>
                              <button className="p-1.5 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden space-y-4">
                {filteredFarms.map((farm) => (
                  <div 
                    key={farm.farmId} 
                    className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedFarmer(farm)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-semibold text-green-700">
                            {farm.farmerName.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-gray-800 truncate">{farm.farmerName}</p>
                          <p className="text-sm text-green-600 font-medium">{farm.farmId}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ml-2 ${
                        farm.status === 'active' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {farm.status.charAt(0).toUpperCase() + farm.status.slice(1)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                      <div>
                        <p className="text-gray-500 text-xs mb-1">Phone</p>
                        <p className="text-gray-800 font-medium">{farm.phone}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs mb-1">Farm Size</p>
                        <p className="text-gray-800 font-medium">{farm.farmSize} acres</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs mb-1">Division</p>
                        <p className="text-gray-800 font-medium truncate">{farm.division}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs mb-1">District</p>
                        <p className="text-gray-800 font-medium truncate">{farm.district}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          {farm.crop}
                        </span>
                        <span className="text-sm font-semibold text-green-700">{Math.round(farm.points)} pts</span>
                      </div>
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="View" onClick={() => setSelectedFarmer(farm)}>
                          <Eye className="w-4 h-4 text-gray-600" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Edit">
                          <Edit className="w-4 h-4 text-gray-600" />
                        </button>
                        <button className="p-2 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Results Count */}
              <div className="text-sm text-gray-600 text-center">
                Showing {filteredFarms.length} of {farms.length} farms
              </div>
            </>
          )}
        </>
      )}

      {/* Farmer Details Modal */}
      {selectedFarmer && (
        <FarmerDetails farmer={selectedFarmer as any} onClose={() => setSelectedFarmer(null)} />
      )}
    </div>
  );
}