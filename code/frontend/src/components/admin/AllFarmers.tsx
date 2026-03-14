import { Search, Filter, Eye, Edit, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { FarmerProfile } from './FarmerProfile';
import { EditFarmModal } from './EditFarmModal';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';
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
  farmerImage?: string;
  harvests?: any[];
  location: string;
}

// Helper function to get crop badge colors
const getCropBadgeColor = (crop: string): { background: string; color: string } => {
  const cropColors: { [key: string]: { background: string; color: string } } = {
    'Paddy': { background: '#FEF08A', color: '#713F12' },
    'Corn': { background: '#FED7AA', color: '#9A3412' },
    'Wheat': { background: '#FDE68A', color: '#92400E' },
    'Tomatoes': { background: '#FECACA', color: '#991B1B' },
    'Onions': { background: '#E9D5FF', color: '#6B21A8' },
    'Carrots': { background: '#FFEDD5', color: '#C2410C' },
    'Cabbage': { background: '#BBF7D0', color: '#166534' },
    'Potatoes': { background: '#D6D3D1', color: '#44403C' }
  };
  return cropColors[crop] || { background: '#D1D5DB', color: '#374151' };
};

// All farmers is changed to All Farms in the UI (admin sidebar)
export function AllFarmers() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFarmer, setSelectedFarmer] = useState<Farm | null>(null);
  const [farmToEdit, setFarmToEdit] = useState<Farm | null>(null);
  const [farmToDelete, setFarmToDelete] = useState<Farm | null>(null);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch farms on component mount
  useEffect(() => {
    fetchFarms();
  }, []);

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
              <div className="hidden lg:block bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead style={{
                      position: 'sticky',
                      top: 0,
                      zIndex: 10,
                      background: '#F3F4F6',
                      borderBottom: '2px solid #E5E7EB'
                    }}>
                      <tr>
                        <th className="px-4 py-3 text-left" style={{ fontSize: '12px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                          Farm ID
                        </th>
                        <th className="px-4 py-3 text-left" style={{ fontSize: '12px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                          Farmer Name
                        </th>
                        <th className="px-4 py-3 text-left" style={{ fontSize: '12px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                          NIC
                        </th>
                        <th className="px-4 py-3 text-left" style={{ fontSize: '12px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                          Phone
                        </th>
                        <th className="px-4 py-3 text-left" style={{ fontSize: '12px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                          Division
                        </th>
                        <th className="px-4 py-3 text-left" style={{ fontSize: '12px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                          District
                        </th>
                        <th className="px-4 py-3 text-left" style={{ fontSize: '12px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                          Farm Size
                        </th>
                        <th className="px-4 py-3 text-left" style={{ fontSize: '12px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                          Crop
                        </th>
                        <th className="px-4 py-3 text-left" style={{ fontSize: '12px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                          Status
                        </th>
                        <th className="px-4 py-3 text-left" style={{ fontSize: '12px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                          Points
                        </th>
                        <th className="px-4 py-3 text-left" style={{ fontSize: '12px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredFarms.map((farm, index) => (
                        <tr
                          key={farm.farmId}
                          style={{
                            cursor: 'pointer',
                            borderLeft: '3px solid transparent',
                            background: index % 2 === 0 ? '#FFFFFF' : '#F9FAFB',
                            height: '52px',
                            transition: 'all 0.15s ease'
                          }}
                          onClick={() => navigate(`/admin/farmer-profile/${farm.farmId}`, { state: { farm } })}
                          onMouseEnter={(e) => {
                            const row = e.currentTarget;
                            row.style.background = '#F0FDF4';
                            row.style.borderLeft = '3px solid #16A34A';
                          }}
                          onMouseLeave={(e) => {
                            const row = e.currentTarget;
                            row.style.background = index % 2 === 0 ? '#FFFFFF' : '#F9FAFB';
                            row.style.borderLeft = '3px solid transparent';
                          }}
                        >
                          <td style={{ padding: '12px 16px', fontSize: '14px', color: '#374151', cursor: 'default', whiteSpace: 'nowrap' }}>
                            <span className="font-medium" style={{ color: '#374151' }}>{farm.farmId}</span>
                          </td>
                          <td style={{ padding: '12px 16px', fontSize: '14px', color: '#374151' }}>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden bg-green-100 border border-green-200">
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
                                <span className={`text-xs font-semibold text-green-700 ${farm.farmerImage ? 'hidden' : ''}`}>
                                  {farm.farmerName.split(' ').map(n => n[0]).join('')}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium" style={{ fontSize: '14px', color: '#374151' }}>{farm.farmerName}</p>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '12px 16px', fontSize: '14px', color: '#374151', whiteSpace: 'nowrap' }}>{farm.farmerNIC}</td>
                          <td style={{ padding: '12px 16px', fontSize: '14px', color: '#374151', whiteSpace: 'nowrap' }}>{farm.phone}</td>
                          <td style={{ padding: '12px 16px', fontSize: '14px', color: '#374151', whiteSpace: 'nowrap' }}>{farm.division}</td>
                          <td style={{ padding: '12px 16px', fontSize: '14px', color: '#374151', whiteSpace: 'nowrap' }}>{farm.district}</td>
                          <td style={{ padding: '12px 16px', fontSize: '14px', color: '#374151', fontWeight: '500', whiteSpace: 'nowrap' }}>{farm.farmSize} acres</td>
                          <td style={{ padding: '12px 16px', fontSize: '14px', color: '#374151', whiteSpace: 'nowrap' }}>
                            {(() => {
                              const cropColor = getCropBadgeColor(farm.crop);
                              return (
                                <span style={{
                                  padding: '3px 10px',
                                  borderRadius: '999px',
                                  fontSize: '12px',
                                  fontWeight: '600',
                                  background: cropColor.background,
                                  color: cropColor.color
                                }}>
                                  {farm.crop}
                                </span>
                              );
                            })()}
                          </td>
                          <td style={{ padding: '12px 16px', fontSize: '14px', color: '#374151', whiteSpace: 'nowrap' }}>
                            {(() => {
                              const statusMap: { [key: string]: { bg: string; color: string; border: string } } = {
                                'active': { bg: '#DCFCE7', color: '#166534', border: '1px solid #86EFAC' },
                                'abandoned': { bg: '#FEE2E2', color: '#991B1B', border: '1px solid #FCA5A5' },
                                'inactive': { bg: '#F3F4F6', color: '#4B5563', border: '1px solid #D1D5DB' }
                              };
                              const status = farm.status.toLowerCase();
                              const statusStyle = statusMap[status] || statusMap['inactive'];
                              return (
                                <span style={{
                                  padding: '3px 10px',
                                  borderRadius: '999px',
                                  fontSize: '12px',
                                  fontWeight: '600',
                                  background: statusStyle.bg,
                                  color: statusStyle.color,
                                  border: statusStyle.border,
                                  display: 'inline-block'
                                }}>
                                  {farm.status.charAt(0).toUpperCase() + farm.status.slice(1)}
                                </span>
                              );
                            })()}
                          </td>
                          <td style={{ padding: '12px 16px', fontSize: '14px', whiteSpace: 'nowrap', textAlign: 'right' }}>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              fontWeight: farm.points >= 10000 ? '700' : farm.points >= 1000 ? '600' : '400',
                              color: farm.points >= 10000 ? '#B45309' : farm.points >= 1000 ? '#374151' : '#9CA3AF'
                            }}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ opacity: 0.8 }}>
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                              </svg>
                              {Math.round(farm.points)}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px', fontSize: '14px', color: '#374151', whiteSpace: 'nowrap' }} onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center gap-1">
                              <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" title="View" onClick={() => setSelectedFarmer(farm)}>
                                <Eye className="w-4 h-4 text-gray-600" />
                              </button>
                              <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" title="Edit" onClick={() => setFarmToEdit(farm)}>
                                <Edit className="w-4 h-4 text-gray-600" />
                              </button>
                              <button className="p-1.5 hover:bg-red-50 rounded-lg transition-colors" title="Delete" onClick={() => setFarmToDelete(farm)}>
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
                    onClick={() => navigate(`/admin/farmer-profile/${farm.farmId}`, { state: { farm } })}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden bg-green-100 border-2 border-green-200">
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
                          <span className={`text-sm font-semibold text-green-700 ${farm.farmerImage ? 'hidden' : ''}`}>
                            {farm.farmerName.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-gray-800 truncate">{farm.farmerName}</p>
                          <p className="text-sm text-green-600 font-medium">{farm.farmId}</p>
                        </div>
                      </div>
                      <span style={{
                        padding: '3px 10px',
                        borderRadius: '999px',
                        fontSize: '12px',
                        fontWeight: '600',
                        whiteSpace: 'nowrap',
                        marginLeft: '8px',
                        display: 'inline-block',
                        ...(farm.status.toLowerCase() === 'active' 
                          ? { background: '#DCFCE7', color: '#166534', border: '1px solid #86EFAC' }
                          : farm.status.toLowerCase() === 'abandoned'
                          ? { background: '#FEE2E2', color: '#991B1B', border: '1px solid #FCA5A5' }
                          : { background: '#F3F4F6', color: '#4B5563', border: '1px solid #D1D5DB' })
                      }}>
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
                        {(() => {
                          const cropColor = getCropBadgeColor(farm.crop);
                          return (
                            <span style={{
                              padding: '3px 10px',
                              borderRadius: '999px',
                              fontSize: '12px',
                              fontWeight: '600',
                              background: cropColor.background,
                              color: cropColor.color
                            }}>
                              {farm.crop}
                            </span>
                          );
                        })()}
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '14px',
                          fontWeight: farm.points >= 10000 ? '700' : farm.points >= 1000 ? '600' : '400',
                          color: farm.points >= 10000 ? '#B45309' : farm.points >= 1000 ? '#374151' : '#9CA3AF'
                        }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ opacity: 0.8 }}>
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                          {Math.round(farm.points)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="View" onClick={() => setSelectedFarmer(farm)}>
                          <Eye className="w-4 h-4 text-gray-600" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Edit" onClick={() => setFarmToEdit(farm)}>
                          <Edit className="w-4 h-4 text-gray-600" />
                        </button>
                        <button className="p-2 hover:bg-red-50 rounded-lg transition-colors" title="Delete" onClick={() => setFarmToDelete(farm)}>
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

      {/* Farmer Profile Modal */}
      {selectedFarmer && (
        <FarmerProfile farm={selectedFarmer} onClose={() => setSelectedFarmer(null)} />
      )}

      {/* Edit Farm Modal */}
      {farmToEdit && (
        <EditFarmModal
          farm={farmToEdit}
          onClose={() => setFarmToEdit(null)}
          onSuccess={() => {
            fetchFarms();
            setSearchTerm('');
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {farmToDelete && (
        <DeleteConfirmationModal
          farmId={farmToDelete.farmId}
          farmName={farmToDelete.farmName}
          onClose={() => setFarmToDelete(null)}
          onSuccess={() => {
            fetchFarms();
            setSearchTerm('');
          }}
        />
      )}
    </div>
  );
}