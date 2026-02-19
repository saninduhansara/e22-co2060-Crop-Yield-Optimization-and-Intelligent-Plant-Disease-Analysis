import { Search, Filter, Eye, Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { FarmerDetails } from './FarmerDetails';

export function AllFarmers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFarmer, setSelectedFarmer] = useState<any>(null);

  const farmers = [
    { id: 'F001', name: 'Ahmed Hassan', nic: '198512345V', phone: '077-1234567', division: 'Attanagalla', district: 'Gampaha', farmSize: '10 acres', crop: 'Paddy', status: 'Active', points: 245 },
    { id: 'F002', name: 'Priya Fernando', nic: '199023456V', phone: '076-2345678', division: 'Wariyapola', district: 'Kurunegala', farmSize: '7 acres', crop: 'Paddy', status: 'Active', points: 189 },
    { id: 'F003', name: 'Ruwan Silva', nic: '198834567V', phone: '075-3456789', division: 'Medawachchiya', district: 'Anuradhapura', farmSize: '15 acres', crop: 'Paddy', status: 'Pending', points: 0 },
    { id: 'F004', name: 'Nimal Perera', nic: '199245678V', phone: '077-4567890', division: 'Hingurakgoda', district: 'Polonnaruwa', farmSize: '12 acres', crop: 'Paddy', status: 'Active', points: 312 },
    { id: 'F005', name: 'Kamala Dissanayake', nic: '198956789V', phone: '076-5678901', division: 'Uhana', district: 'Ampara', farmSize: '8 acres', crop: 'Paddy', status: 'Active', points: 156 },
    { id: 'F006', name: 'Sunil Wickramasinghe', nic: '199167890V', phone: '075-6789012', division: 'Tissamaharama', district: 'Hambantota', farmSize: '18 acres', crop: 'Paddy', status: 'Active', points: 421 },
  ];

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      {/* Header */}
      <div>
        
        <p className="text-sm md:text-base text-gray-600">Manage and view all registered farmers</p>
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
              placeholder="Search by Farm ID, name, NIC..."
              className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm md:text-base"
            />
          </div>
          <button className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center justify-center gap-2 transition-colors">
            <Filter className="w-5 h-5" />
            <span className="text-sm md:text-base">Filter</span>
          </button>
        </div>
      </div>

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
                  Name
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
              {farmers.map((farmer) => (
                <tr 
                  key={farmer.id} 
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => setSelectedFarmer(farmer)}
                >
                  <td className="px-3 py-3 whitespace-nowrap">
                    <span className="font-medium text-green-700 text-sm">{farmer.id}</span>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-semibold text-green-700">
                          {farmer.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 text-sm">{farmer.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-xs text-gray-700 whitespace-nowrap">{farmer.nic}</td>
                  <td className="px-3 py-3 text-xs text-gray-700 whitespace-nowrap">{farmer.phone}</td>
                  <td className="px-3 py-3 text-xs text-gray-700 whitespace-nowrap">{farmer.division}</td>
                  <td className="px-3 py-3 text-xs text-gray-700 whitespace-nowrap">{farmer.district}</td>
                  <td className="px-3 py-3 text-xs font-medium text-gray-800 whitespace-nowrap">{farmer.farmSize}</td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      {farmer.crop}
                    </span>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      farmer.status === 'Active' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {farmer.status}
                    </span>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <span className="font-semibold text-green-700 text-sm">{farmer.points}</span>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" title="View" onClick={() => setSelectedFarmer(farmer)}>
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
        {farmers.map((farmer) => (
          <div 
            key={farmer.id} 
            className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setSelectedFarmer(farmer)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-semibold text-green-700">
                    {farmer.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-800 truncate">{farmer.name}</p>
                  <p className="text-sm text-green-600 font-medium">{farmer.id}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ml-2 ${
                farmer.status === 'Active' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {farmer.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm mb-3">
              <div>
                <p className="text-gray-500 text-xs mb-1">Phone</p>
                <p className="text-gray-800 font-medium">{farmer.phone}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-1">Farm Size</p>
                <p className="text-gray-800 font-medium">{farmer.farmSize}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-1">Division</p>
                <p className="text-gray-800 font-medium truncate">{farmer.division}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-1">District</p>
                <p className="text-gray-800 font-medium truncate">{farmer.district}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                  {farmer.crop}
                </span>
                <span className="text-sm font-semibold text-green-700">{farmer.points} pts</span>
              </div>
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="View" onClick={() => setSelectedFarmer(farmer)}>
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

      {/* Farmer Details Modal */}
      {selectedFarmer && (
        <FarmerDetails farmer={selectedFarmer} onClose={() => setSelectedFarmer(null)} />
      )}
    </div>
  );
}