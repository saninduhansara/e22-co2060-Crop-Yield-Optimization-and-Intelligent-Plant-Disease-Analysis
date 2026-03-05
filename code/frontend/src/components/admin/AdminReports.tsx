import { Download, TrendingUp, Users, Wheat, FileText } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useState, useEffect } from 'react';
import { farmAPI } from '../../services/api';

export function AdminReports() {
  const [topFarmers, setTopFarmers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [seasonData, setSeasonData] = useState<any[]>([]);
  const [districtData, setDistrictData] = useState<any[]>([]);
  const [totals, setTotals] = useState({ farmers: 0, area: 0, points: 0 });

  const [selectedCrop, setSelectedCrop] = useState<string | null>(null);
  const [availableCrops, setAvailableCrops] = useState<string[]>([]);
  const [districtYear, setDistrictYear] = useState<string>(new Date().getFullYear().toString());
  const [districtSeason, setDistrictSeason] = useState<string>('Maha');

  useEffect(() => {
    const fetchCrops = async () => {
      try {
        const data = await farmAPI.getAllCrops();
        setAvailableCrops(data.crops || []);
      } catch (error) {
        console.error('Error fetching crops:', error);
      }
    };
    fetchCrops();
  }, []);

  useEffect(() => {
    const fetchReportsData = async () => {
      try {
        setLoading(true);
        const harvestData = await farmAPI.getHarvestHistory();
        let harvests = harvestData.harvests || [];

        // Filter by selected crop if one is selected
        if (selectedCrop) {
          harvests = harvests.filter((harvest: any) => {
            const harvestCrop = (harvest.crop || '').trim().toLowerCase();
            const selectedCropNormalized = selectedCrop.trim().toLowerCase();
            return harvestCrop === selectedCropNormalized;
          });
        }

        const farmerYields = new Map();
        harvests.forEach((h: any) => {
          const nic = h.farmerNIC || h.farmerName;
          if (!nic) return;

          if (!farmerYields.has(nic)) {
            farmerYields.set(nic, {
              name: h.farmerName || 'Unknown',
              district: h.district || 'Unknown',
              totalYield: 0,
              totalAcres: 0,
              totalPoints: 0,
            });
          }

          const data = farmerYields.get(nic);

          let qty = 0;
          if (typeof h.harvestQty === 'number') qty = h.harvestQty;
          else if (typeof h.harvestQty === 'string') qty = Number(h.harvestQty.replace(/,/g, '').replace(/[^\d.-]/g, '')) || 0;

          let acres = 0;
          if (typeof h.acres === 'number') acres = h.acres;
          else if (typeof h.acres === 'string') acres = Number(h.acres.replace(/,/g, '').replace(/[^\d.-]/g, '')) || 0;

          data.totalYield += qty;
          data.totalAcres += acres;
          data.totalPoints += (h.pointsEarned || 0);
        });

        const performers = Array.from(farmerYields.values())
          .map((data) => {
            const avgYield = data.totalAcres > 0 ? (data.totalYield / data.totalAcres) : 0;
            return {
              name: data.name,
              district: data.district,
              yield: Number(data.totalYield.toFixed(2)),
              avgYield: Number(avgYield.toFixed(2)),
              points: data.totalPoints
            };
          })
          .sort((a, b) => b.yield - a.yield)
          .map((p, index) => ({ ...p, rank: index + 1 }))
          .slice(0, 5); // top 5

        setTopFarmers(performers);

        // Aggregate Season Data (Yield, Farmers, Points)
        const seasonMap = new Map();
        harvests.forEach((h: any) => {
          const seasonKey = `${h.season} ${h.year}`;
          if (!seasonMap.has(seasonKey)) {
            seasonMap.set(seasonKey, { season: seasonKey, yield: 0, farmers: new Set(), points: 0 });
          }
          const s = seasonMap.get(seasonKey);
          let qty = Number(String(h.harvestQty).replace(/,/g, '').replace(/[^\d.-]/g, '')) || 0;
          s.yield += qty / 1000; // Convert to tons to match mock data scale
          s.farmers.add(h.farmerNIC || h.farmerName);
          s.points += (h.pointsEarned || 0);
        });

        const dynamicSeasonData = Array.from(seasonMap.values())
          .map(s => ({
            ...s,
            yield: Number(s.yield.toFixed(2)),
            farmers: s.farmers.size
          }))
          .sort((a, b) => a.season.localeCompare(b.season)); // Basic sort, could be improved

        setSeasonData(dynamicSeasonData);

        // Aggregate District Data
        const districtMap = new Map();

        // Filter harvests for district chart by selected year/season
        const districtFilteredHarvests = harvests.filter((h: any) => {
          const hYear = h.year?.toString() || '';
          const hSeason = h.season?.toString().toLowerCase() || '';

          const matchYear = districtYear ? hYear === districtYear : true;
          const matchSeason = districtSeason ? hSeason === districtSeason.toLowerCase() : true;

          return matchYear && matchSeason;
        });

        districtFilteredHarvests.forEach((h: any) => {
          const district = h.district || 'Unknown';
          if (!districtMap.has(district)) {
            districtMap.set(district, { district, farmers: new Set(), yield: 0 });
          }
          const d = districtMap.get(district);
          let qty = Number(String(h.harvestQty).replace(/,/g, '').replace(/[^\d.-]/g, '')) || 0;
          d.yield += qty / 1000; // Convert to tons
          d.farmers.add(h.farmerNIC || h.farmerName);
        });

        const dynamicDistrictData = Array.from(districtMap.values())
          .map(d => ({
            ...d,
            yield: Number(d.yield.toFixed(2)),
            farmers: d.farmers.size
          }))
          .sort((a, b) => b.yield - a.yield); // Sort by highest yield

        setDistrictData(dynamicDistrictData);

        // Calculate Totals for Summary Cards
        const allFarmsRes = await farmAPI.getAllFarms();
        let allFarms = allFarmsRes.farms || [];

        if (selectedCrop) {
          allFarms = allFarms.filter((f: any) => {
            const farmCrop = (f.crop || '').trim().toLowerCase();
            return farmCrop === selectedCrop.trim().toLowerCase();
          });
        }

        // Calculate Total Area (acres) from harvests
        const totalArea = harvests.reduce((sum: number, h: any) => {
          let acres = 0;
          if (typeof h.acres === 'number') acres = h.acres;
          else if (typeof h.acres === 'string') acres = Number(h.acres.replace(/,/g, '').replace(/[^\d.-]/g, '')) || 0;
          return sum + acres;
        }, 0);

        setTotals({
          farmers: new Set(allFarms.map((f: any) => f.farmerNIC)).size, // Unique farmers for this crop
          area: totalArea,
          points: dynamicSeasonData.reduce((sum, s) => sum + s.points, 0)
        });

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReportsData();
  }, [selectedCrop, districtYear, districtSeason]);

  const defaultCropOptions = [
    'Paddy',
    'Corn',
    'Wheat',
    'Tomatoes',
    'Onions',
    'Carrots',
    'Cabbage',
    'Potatoes'
  ];
  const cropOptions = Array.from(new Set([...defaultCropOptions, ...availableCrops]));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>

          <p className="text-gray-600">Comprehensive insights and data analysis</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Filter by Crop:</label>
            <select
              value={selectedCrop || ''}
              onChange={(e) => setSelectedCrop(e.target.value || null)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm bg-white min-w-[150px]"
            >
              <option value="">All Crops</option>
              {cropOptions.map((crop) => (
                <option key={crop} value={crop}>
                  {crop}
                </option>
              ))}
            </select>
          </div>
          <button className="px-6 py-3 bg-green-700 hover:bg-green-800 text-white rounded-lg flex items-center gap-2 transition-colors">
            <Download className="w-5 h-5" />
            Export All
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-gray-600 text-sm mb-1">Total Farmers</p>
              <p className="text-4xl font-bold text-gray-900">{totals.farmers}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-green-700" />
            </div>
          </div>
          <p className="text-sm text-green-600 flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            All Time Active
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-gray-600 text-sm mb-1">Total Area</p>
              <p className="text-4xl font-bold text-gray-900">
                {totals.area.toLocaleString(undefined, { maximumFractionDigits: 1 })} <span className="text-lg font-normal text-gray-600">acres</span>
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Wheat className="w-6 h-6 text-orange-700" />
            </div>
          </div>
          <p className="text-sm text-green-600 flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            Across all seasons
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-gray-600 text-sm mb-1">Avg Yield/Acre</p>
              <p className="text-4xl font-bold text-gray-900">
                {topFarmers.length > 0
                  ? (topFarmers.reduce((sum, f) => sum + f.avgYield, 0) / topFarmers.length).toFixed(2)
                  : '0.00'
                } <span className="text-lg font-normal text-gray-600">tons</span>
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-700" />
            </div>
          </div>
          <p className="text-sm text-gray-600">Top performers average</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-gray-600 text-sm mb-1">Total Points</p>
              <p className="text-4xl font-bold text-green-700">{totals.points.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-green-700" />
            </div>
          </div>
          <p className="text-sm text-green-600">Awarded to farmers</p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 gap-6">
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
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
            <h3 className="text-lg font-semibold text-gray-800">Yield by District</h3>
            <div className="flex gap-2">
              <select
                value={districtYear}
                onChange={(e) => setDistrictYear(e.target.value)}
                className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
              >
                <option value="">All Years</option>
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
              </select>
              <select
                value={districtSeason}
                onChange={(e) => setDistrictSeason(e.target.value)}
                className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
              >
                <option value="">All Seasons</option>
                <option value="Maha">Maha</option>
                <option value="Yala">Yala</option>
              </select>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={districtData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="district" />
              <YAxis />
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
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">Loading top performers...</td>
                </tr>
              ) : topFarmers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">No dynamic data available</td>
                </tr>
              ) : topFarmers.map((farmer: any) => (
                <tr key={farmer.rank} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${farmer.rank === 1 ? 'bg-yellow-100 text-yellow-700' :
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
    </div>
  );
}
