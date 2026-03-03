import { Download, TrendingUp, Users, Wheat, FileText, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { useState } from 'react';
// hook shared with home dashboard for loading summary metrics (total farmers, harvest, yield)
import { useHomeDashboardData } from '../HomePage';
import { FarmerProfile } from './FarmerProfile';

export function AdminReports() {
  // fetch latest metrics used on home page as well
  const { totalFarmers, totalHarvest, yieldPerAcre, loading: metricsLoading, error: metricsError } = useHomeDashboardData();
  const [selectedFarmer, setSelectedFarmer] = useState<any | null>(null);

  // Mock top performers data (can be replaced with actual API data)
  const topPerformersData = [
    { 
      rank: 1, 
      farmId: 'F001',
      farmName: 'Perera Farm',
      name: 'Nimal Perera', 
      farmerNIC: 'XX1234567V',
      phone: '0701234567',
      division: 'Central',
      district: 'Polonnaruwa', 
      farmSize: 5,
      crop: 'Paddy',
      status: 'active',
      yield: 6.5, 
      avgYield: 1.30, 
      points: 325 
    },
    { 
      rank: 2, 
      farmId: 'F002',
      farmName: 'Hassan Farm',
      name: 'Ahmed Hassan', 
      farmerNIC: 'XX2234567V',
      phone: '0712234567',
      division: 'Western',
      district: 'Gampaha', 
      farmSize: 3.5,
      crop: 'Paddy',
      status: 'active',
      yield: 4.5, 
      avgYield: 1.29, 
      points: 227 
    },
    { 
      rank: 3, 
      farmId: 'F003',
      farmName: 'Fernando Farm',
      name: 'Priya Fernando', 
      farmerNIC: 'XX3234567V',
      phone: '0713234567',
      division: 'North Central',
      district: 'Kurunegala', 
      farmSize: 4,
      crop: 'Paddy',
      status: 'active',
      yield: 4.8, 
      avgYield: 1.20, 
      points: 240 
    },
    { 
      rank: 4, 
      farmId: 'F004',
      farmName: 'Silva Farm',
      name: 'Ruwan Silva', 
      farmerNIC: 'XX4234567V',
      phone: '0714234567',
      division: 'North Central',
      district: 'Anuradhapura', 
      farmSize: 3.3,
      crop: 'Paddy',
      status: 'active',
      yield: 3.9, 
      avgYield: 1.18, 
      points: 196 
    },
    { 
      rank: 5, 
      farmId: 'F005',
      farmName: 'Dissanayake Farm',
      name: 'Kamala Dissanayake', 
      farmerNIC: 'XX5234567V',
      phone: '0715234567',
      division: 'Eastern',
      district: 'Ampara', 
      farmSize: 3,
      crop: 'Paddy',
      status: 'active',
      yield: 3.3, 
      avgYield: 1.10, 
      points: 165 
    },
  ];

  const seasonData = [
    { season: 'Maha 24/25', yield: 1650, farmers: 235, points: 12500 },
    { season: 'Yala 2024', yield: 1200, farmers: 198, points: 9800 },
    { season: 'Maha 23/24', yield: 1580, farmers: 220, points: 11200 },
    { season: 'Yala 2023', yield: 1150, farmers: 185, points: 9200 },
    { season: 'Maha 25/26', yield: 1840, farmers: 247, points: 14800 },
  ];

  const varietyData = [
    { name: 'BG 300', value: 35, color: '#16a34a' },
    { name: 'BG 352', value: 25, color: '#22c55e' },
    { name: 'BG 366', value: 18, color: '#4ade80' },
    { name: 'AT 362', value: 15, color: '#86efac' },
    { name: 'Others', value: 7, color: '#bbf7d0' },
  ];

  const districtData = [
    { district: 'Gampaha', farmers: 52, yield: 380 },
    { district: 'Kurunegala', farmers: 48, yield: 365 },
    { district: 'Anuradhapura', farmers: 65, yield: 520 },
    { district: 'Polonnaruwa', farmers: 38, yield: 295 },
    { district: 'Ampara', farmers: 28, yield: 190 },
    { district: 'Hambantota', farmers: 16, yield: 90 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          
          <p className="text-gray-600">Comprehensive insights and data analysis</p>
        </div>
        <button className="px-6 py-3 bg-green-700 hover:bg-green-800 text-white rounded-lg flex items-center gap-2 transition-colors">
          <Download className="w-5 h-5" />
          Export All Reports
        </button>
      </div>

      {/* Summary Cards - matching AdminDashboard styling */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Total Farmers Card */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-5 sm:p-6 shadow-md border-l-4 border-l-green-500 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:cursor-pointer group">
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">Total Farmers</p>
              <Users className="w-5 h-5 text-green-600 opacity-70 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-3xl sm:text-2xl lg:text-3xl font-bold text-gray-900 my-2 break-words min-w-0">
              {metricsLoading ? '...' : metricsError ? 'Error' : totalFarmers.toLocaleString()}
            </p>
            <p className="text-xs sm:text-sm text-green-700 flex items-center gap-1 mt-2">
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
              {metricsLoading ? '...' : '+12% this season'}
            </p>
          </div>
        </div>

        {/* Total Harvest Card */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-5 sm:p-6 shadow-md border-l-4 border-l-green-500 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:cursor-pointer group">
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">Total Harvest</p>
              <Wheat className="w-5 h-5 text-green-600 opacity-70 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="flex min-w-0 flex-wrap items-baseline gap-1 sm:gap-2 my-2">
              <p className="text-3xl sm:text-2xl lg:text-3xl font-bold text-gray-900 break-words min-w-0">
                {metricsLoading ? '...' : totalHarvest.toLocaleString()}
              </p>
              <span className="text-xs sm:text-sm font-medium text-gray-600 break-words">tons</span>
            </div>
            <p className="text-xs sm:text-sm text-green-700 flex items-center gap-1 mt-2">
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
              {metricsLoading ? '...' : '+16% from last season'}
            </p>
          </div>
        </div>

        {/* Avg Yield/Acre Card */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-5 sm:p-6 shadow-md border-l-4 border-l-green-500 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:cursor-pointer group">
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">Avg Yield/Acre</p>
              <TrendingUp className="w-5 h-5 text-green-600 opacity-70 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="flex min-w-0 flex-wrap items-baseline gap-1 sm:gap-2 my-2">
              <p className="text-3xl sm:text-2xl lg:text-3xl font-bold text-gray-900 break-words min-w-0">
                {metricsLoading ? '...' : yieldPerAcre.toFixed(2)}
              </p>
              <span className="text-xs sm:text-sm font-medium text-gray-600 break-words">tons</span>
            </div>
            <p className="text-xs sm:text-sm text-green-700 mt-2">
              {metricsLoading ? '...' : 'Above target'}
            </p>
          </div>
        </div>

        {/* Total Points Card */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-5 sm:p-6 shadow-md border-l-4 border-l-green-500 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:cursor-pointer group">
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">Total Points</p>
              <FileText className="w-5 h-5 text-green-600 opacity-70 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-3xl sm:text-2xl lg:text-3xl font-bold text-gray-900 my-2 break-words min-w-0">
              {metricsLoading ? '...' : '14,800'}
            </p>
            <p className="text-xs sm:text-sm text-green-700 mt-2">
              {metricsLoading ? '...' : 'This season'}
            </p>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Season Comparison */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Yield by Season</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={seasonData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="season" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="yield" fill="#16a34a" name="Yield (tons)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Variety Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Paddy Variety Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={varietyData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {varietyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Farmer Growth */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Farmer Participation Growth</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={seasonData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="season" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="farmers" stroke="#16a34a" strokeWidth={2} name="Farmers" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* District Performance */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Yield by District</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={districtData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="district" type="category" width={100} />
              <Tooltip />
              <Legend />
              <Bar dataKey="yield" fill="#f97316" name="Yield (tons)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Performers */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Top Performing Farmers (Current Season)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Rank</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Farmer</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">District</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Total Yield</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Avg Yield/Acre</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {topPerformersData.map((farmer) => (
                <tr 
                  key={farmer.rank} 
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => setSelectedFarmer(farmer)}
                >
                  <td className="px-6 py-4">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      farmer.rank === 1 ? 'bg-yellow-100 text-yellow-700' :
                      farmer.rank === 2 ? 'bg-gray-100 text-gray-700' :
                      farmer.rank === 3 ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-50 text-gray-600'
                    }`}>
                      {farmer.rank}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-800">{farmer.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{farmer.district}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-800">{farmer.yield} tons</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-800">{farmer.avgYield} tons</td>
                  <td className="px-6 py-4 text-sm font-semibold text-green-700">{farmer.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Farmer Details Modal */}
      {selectedFarmer && (
        <FarmerProfile 
          farm={{
            farmId: selectedFarmer.farmId,
            farmName: selectedFarmer.farmName,
            farmerName: selectedFarmer.name,
            farmerNIC: selectedFarmer.farmerNIC,
            phone: selectedFarmer.phone,
            division: selectedFarmer.division,
            district: selectedFarmer.district,
            farmSize: selectedFarmer.farmSize,
            crop: selectedFarmer.crop,
            status: selectedFarmer.status,
            points: selectedFarmer.points,
          }} 
          onClose={() => setSelectedFarmer(null)} 
        />
      )}
    </div>
  );
}
