import { Download, TrendingUp, Users, Wheat, FileText, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { useState, useEffect } from 'react';
import { farmAPI } from '../../services/api';
// hook shared with home dashboard for loading summary metrics (total farmers, harvest, yield)
import { useHomeDashboardData } from '../HomePage';
import { FarmerProfile } from './FarmerProfile';

export function AdminReports() {
  // fetch latest metrics used on home page as well
  const { totalFarmers, totalHarvest, yieldPerAcre, loading: metricsLoading, error: metricsError } = useHomeDashboardData();
  const [selectedFarmer, setSelectedFarmer] = useState<any | null>(null);
  const [loadingFarmerDetails, setLoadingFarmerDetails] = useState<boolean>(false);

  const handleSelectPerformer = async (perf: any) => {
    if (!perf.farmId) {
      setSelectedFarmer(perf);
      return;
    }
    try {
      setLoadingFarmerDetails(true);
      const data = await farmAPI.getFarmById(perf.farmId);
      const farm = data.farm || data;
      setSelectedFarmer({
        ...perf,
        phone: farm.phone,
        division: farm.division,
        farmerName: farm.farmerName || perf.name,
        farmerNIC: farm.farmerNIC || perf.farmerNIC,
        crop: farm.crop || perf.crop,
        status: farm.status || perf.status,
        farmSize: farm.farmSize || farm.sizeInAcres || perf.totalAcres,
      });
    } catch (err) {
      console.error('Error loading farmer info', err);
      setSelectedFarmer(perf);
    } finally {
      setLoadingFarmerDetails(false);
    }
  };
  // state for harvests and filters
  const [harvests, setHarvests] = useState<any[]>([]);
  const [loadingHarvests, setLoadingHarvests] = useState<boolean>(true);
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedSeason, setSelectedSeason] = useState<string>('');
  const [selectedCrop, setSelectedCrop] = useState<string>('');

  // dropdown toggles (reuse patterns from AddHarvest)
  const [isYearOpen, setIsYearOpen] = useState(false);
  const [isSeasonOpen, setIsSeasonOpen] = useState(false);
  const [isCropOpen, setIsCropOpen] = useState(false);

  const years = ['2024', '2025', '2026', '2027', '2028'];
  const seasons = ['Maha', 'Yala'];
  const crops = ['Paddy','Corn','Wheat','Cabbage','Tomatoes','Onion','Carrots','Potatoes'];

  useEffect(() => {
    const fetchHarvests = async () => {
      try {
        setLoadingHarvests(true);
        const data = await farmAPI.getHarvestHistory();
        setHarvests(data.harvests || []);
      } catch (err) {
        console.error('Failed to load harvests', err);
        setHarvests([]);
      } finally {
        setLoadingHarvests(false);
      }
    };
    fetchHarvests();
  }, []);

  // compute filtered harvests when filters change
  const filteredHarvests = harvests.filter((h) => {
    const yearMatch = selectedYear ? String(h.year) === selectedYear : true;
    const seasonMatch = selectedSeason ? (String(h.season || '').toLowerCase() === selectedSeason.toLowerCase()) : true;
    const cropMatch = selectedCrop ? (String(h.crop || '').toLowerCase() === selectedCrop.toLowerCase()) : true;
    return yearMatch && seasonMatch && cropMatch;
  });

  // Total harvest (tons) and average yield per acre (tons/acre) based on filtered harvests
  const totalHarvestKg = filteredHarvests.reduce((s, h) => s + (Number(h.harvestQty) || 0), 0);
  const totalAcres = filteredHarvests.reduce((s, h) => s + (Number(h.acres || h.farmSize || 0) || 0), 0);
  const totalHarvestTons = totalHarvestKg / 1000;
  const avgYieldPerAcre = totalAcres > 0 ? (totalHarvestTons / totalAcres) : 0;
  const totalPoints = filteredHarvests.reduce((s, h) => s + (Number(h.points) || 0), 0);

  // Top performers aggregated by farmer (based on filtered harvests)
  const performersMap: Record<string, any> = {};
  filteredHarvests.forEach((h) => {
    const key = h.farmerNIC || h.farmerName || h.farmId || h.farmName;
    if (!performersMap[key]) {
      performersMap[key] = {
        farmerName: h.farmerName || h.name || 'Unknown',
        farmerNIC: h.farmerNIC,
        farmId: h.farmId,
        farmName: h.farmName,
        district: h.district,
        status: h.status || 'active',
        crop: h.crop || '',
        totalHarvestKg: 0,
        totalAcres: 0,
        points: 0,
      };
    }
    performersMap[key].totalHarvestKg += Number(h.harvestQty) || 0;
    performersMap[key].totalAcres += Number(h.acres || h.farmSize || 0) || 0;
    performersMap[key].points += Number(h.points || 0) || 0;
  });

  const topPerformers = Object.values(performersMap)
    .map((p: any, idx) => ({
      rank: idx + 1,
      name: p.farmerName,
      farmerNIC: p.farmerNIC,
      farmId: p.farmId,
      farmName: p.farmName,
      district: p.district,
      yield: +(p.totalHarvestKg / 1000).toFixed(2),
      avgYield: p.totalAcres > 0 ? +( (p.totalHarvestKg/1000) / p.totalAcres ).toFixed(2) : 0,
      totalAcres: p.totalAcres,
      points: p.points,
    }))
    .sort((a: any, b: any) => (b.yield || 0) - (a.yield || 0))
    .map((p: any, i: number) => ({ ...p, rank: i + 1 }))
    .slice(0, 10);

  const seasonData = [
    { season: 'Maha 24/25', yield: 1650, farmers: 235, points: 12500 },
    { season: 'Yala 2024', yield: 1200, farmers: 198, points: 9800 },
    { season: 'Maha 23/24', yield: 1580, farmers: 220, points: 11200 },
    { season: 'Yala 2023', yield: 1150, farmers: 185, points: 9200 },
    { season: 'Maha 25/26', yield: 1840, farmers: 247, points: 14800 },
  ];

  // Filter by year and season only (NOT crop) for variety distribution
  const filteredHarvestsForVariety = harvests.filter((h) => {
    const yearMatch = selectedYear ? String(h.year) === selectedYear : true;
    const seasonMatch = selectedSeason ? (String(h.season || '').toLowerCase() === selectedSeason.toLowerCase()) : true;
    return yearMatch && seasonMatch;
  });

  // Compute crop variety distribution
  const totalHarvestForVariety = filteredHarvestsForVariety.reduce((s, h) => s + (Number(h.harvestQty) || 0), 0);
  const cropVarietyMap: Record<string, number> = {};
  filteredHarvestsForVariety.forEach((h) => {
    const crop = h.crop || 'Unknown';
    if (!cropVarietyMap[crop]) {
      cropVarietyMap[crop] = 0;
    }
    cropVarietyMap[crop] += Number(h.harvestQty) || 0;
  });

  // Define colors for crops
  const cropColors: Record<string, string> = {
    'Paddy': '#16a34a',
    'Corn': '#22c55e',
    'Wheat': '#4ade80',
    'Cabbage': '#86efac',
    'Tomatoes': '#fbbf24',
    'Onion': '#f97316',
    'Carrots': '#fb923c',
    'Potatoes': '#f87171',
  };

  const varietyData = Object.entries(cropVarietyMap)
    .map(([name, qty]) => {
      const percentage = totalHarvestForVariety > 0 ? ((qty / totalHarvestForVariety) * 100) : 0;
      return {
        name,
        value: Math.round(percentage),
        color: cropColors[name] || '#bbf7d0',
      };
    })
    .sort((a, b) => b.value - a.value);

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
      {/* Filters - Year / Season / Crop (matching AddHarvest style) */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div>
          <h4 className="text-sm md:text-md font-semibold text-gray-800 mb-3">Primary Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Year */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsYearOpen(!isYearOpen)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-left flex items-center justify-between hover:bg-gray-100 transition-colors"
                >
                  <span className={selectedYear ? 'text-gray-800' : 'text-gray-400'}>{selectedYear || 'Select Year'}</span>
                  <svg className={`w-4 h-4 text-gray-600 transition-transform ${isYearOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
                </button>
                {isYearOpen && (
                  <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                    {years.map((y) => (
                      <button key={y} type="button" onClick={() => { setSelectedYear(y); setIsYearOpen(false); }} className={`w-full px-4 py-3 text-left hover:bg-green-50 ${selectedYear === y ? 'bg-green-100 text-green-700 font-medium' : 'text-gray-800'}`}>
                        {y}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Season */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Harvest Season</label>
              <div className="relative">
                <button type="button" onClick={() => setIsSeasonOpen(!isSeasonOpen)} className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-left flex items-center justify-between hover:bg-gray-100 transition-colors">
                  <span className={selectedSeason ? 'text-gray-800' : 'text-gray-400'}>{selectedSeason || 'Select Season'}</span>
                  <svg className={`w-4 h-4 text-gray-600 transition-transform ${isSeasonOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
                </button>
                {isSeasonOpen && (
                  <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                    {seasons.map((s) => (
                      <button key={s} type="button" onClick={() => { setSelectedSeason(s); setIsSeasonOpen(false); }} className={`w-full px-4 py-3 text-left hover:bg-green-50 ${selectedSeason === s ? 'bg-green-100 text-green-700 font-medium' : 'text-gray-800'}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Crop */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Crop</label>
              <div className="relative">
                <button type="button" onClick={() => setIsCropOpen(!isCropOpen)} className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-left flex items-center justify-between hover:bg-gray-100 transition-colors">
                  <span className={selectedCrop ? 'text-gray-800' : 'text-gray-400'}>{selectedCrop || 'Select Crop'}</span>
                  <svg className={`w-4 h-4 text-gray-600 transition-transform ${isCropOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
                </button>
                {isCropOpen && (
                  <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                    {crops.map((c) => (
                      <button key={c} type="button" onClick={() => { setSelectedCrop(c); setIsCropOpen(false); }} className={`w-full px-4 py-3 text-left hover:bg-green-50 ${selectedCrop === c ? 'bg-green-100 text-green-700 font-medium' : 'text-gray-800'}`}>
                        {c}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
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
                {metricsLoading || loadingHarvests ? '...' : (selectedYear || selectedSeason || selectedCrop) ? totalHarvestTons.toFixed(1).toLocaleString() : totalHarvest.toLocaleString()}
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
                {metricsLoading || loadingHarvests ? '...' : (selectedYear || selectedSeason || selectedCrop) ? avgYieldPerAcre.toFixed(2) : yieldPerAcre.toFixed(2)}
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
              {metricsLoading || loadingHarvests ? '...' : (selectedYear || selectedSeason || selectedCrop) ? totalPoints.toLocaleString() : '14,800'}
            </p>
            <p className="text-xs sm:text-sm text-green-700 mt-2">
              {metricsLoading || loadingHarvests ? '...' : 'This season'}
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
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Crop Variety Distribution</h3>
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
          <h3 className="text-lg font-semibold text-gray-800">Top Performing Farmers</h3>
        </div>
        <div className="overflow-x-auto relative">
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
              {topPerformers.map((farmer) => (
                <tr 
                  key={farmer.rank} 
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => handleSelectPerformer(farmer)}
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
          {loadingFarmerDetails && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
              <span className="text-lg font-semibold">Loading farmer details...</span>
            </div>
          )}
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
            farmSize: selectedFarmer.totalAcres || selectedFarmer.farmSize || 0,
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
