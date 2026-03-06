import { Download, TrendingUp, Users, Wheat, FileText, BarChart3, Link2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { useState, useEffect } from 'react';
import { farmAPI } from '../../services/api';
// hook shared with home dashboard for loading summary metrics (total farmers, harvest, yield)
import { useHomeDashboardData } from '../HomePage';
import { FarmerProfile } from './FarmerProfile';
import { formatNumber } from '../../utils/numberUtils';

export function AdminReports() {
  // fetch latest metrics used on home page as well
  const { totalFarmers, totalHarvest, yieldPerAcre, loading: metricsLoading, error: metricsError } = useHomeDashboardData();
  const [selectedFarmer, setSelectedFarmer] = useState<any | null>(null);
  const [loadingFarmerDetails, setLoadingFarmerDetails] = useState<boolean>(false);
  // control expansion of the top performers list (5 vs 10 entries)
  const [showAllPerformers, setShowAllPerformers] = useState(false);

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
  const [farms, setFarms] = useState<any[]>([]);
  const [loadingHarvests, setLoadingHarvests] = useState<boolean>(true);
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedSeason, setSelectedSeason] = useState<string>('');
  const [selectedCrop, setSelectedCrop] = useState<string | null>(null);
  const [availableCrops, setAvailableCrops] = useState<string[]>([]);
  const [districtYear, setDistrictYear] = useState<string>('');
  const [districtSeason, setDistrictSeason] = useState<string>('');

  // dropdown toggles (reuse patterns from AddHarvest)
  // dropdown open state no longer needed; using native <select> elements for
  // year and season to match the crop control appearance.
  // const [isYearOpen, setIsYearOpen] = useState(false);
  // const [isSeasonOpen, setIsSeasonOpen] = useState(false);

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

  const years = ['2024', '2025', '2026', '2027', '2028'];
  const seasons = ['Maha', 'Yala'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingHarvests(true);
        const harvestData = await farmAPI.getHarvestHistory();
        setHarvests(harvestData.harvests || []);
        
        const farmsData = await farmAPI.getAllFarms();
        setFarms(farmsData.farms || []);
        
        const cropsData = await farmAPI.getAllCrops();
        setAvailableCrops(cropsData.crops || []);
      } catch (err) {
        console.error('Failed to load data', err);
        setHarvests([]);
        setFarms([]);
        setAvailableCrops([]);
      } finally {
        setLoadingHarvests(false);
      }
    };
    fetchData();
  }, []);

  // compute filtered harvests when filters change
  const filteredHarvests = harvests.filter((h) => {
    const yearMatch = selectedYear ? String(h.year) === selectedYear : true;
    const seasonMatch = selectedSeason ? (String(h.season || '').toLowerCase() === selectedSeason.toLowerCase()) : true;
    const cropMatch = selectedCrop ? (String(h.crop || '').toLowerCase() === selectedCrop.toLowerCase()) : true;
    return yearMatch && seasonMatch && cropMatch;
  });

  // Count unique farmers from farms data (matching AdminDashboard logic)
  let farmersForCrop = farms;
  if (selectedCrop) {
    farmersForCrop = farms.filter((farm: any) => {
      const farmCrop = (farm.crop || '').trim().toLowerCase();
      const selectedCropNormalized = selectedCrop.trim().toLowerCase();
      return farmCrop === selectedCropNormalized;
    });
  }
  const filteredFarmersCount = new Set(farmersForCrop.map((farm: any) => farm.farmerNIC)).size;

  // Total harvest (tons) and average yield per acre (tons/acre) based on filtered harvests
  const totalHarvestKg = filteredHarvests.reduce((s, h) => s + (Number(h.harvestQty) || 0), 0);
  const totalAcres = filteredHarvests.reduce((s, h) => s + (Number(h.acres || h.farmSize || 0) || 0), 0);
  const totalHarvestTons = totalHarvestKg / 1000;
  const avgYieldPerAcre = totalAcres > 0 ? (totalHarvestTons / totalAcres) : 0;
  // totalPoints is derived from the values stored on each farm record in the
  // "All Farms" table.  When a crop filter is selected we only include farms
  // that match, and when year/season filters are active we further restrict to
  // farms that actually have harvest entries for that period (using the
  // existing `filteredHarvests` array).  This makes the summary card react to
  // every dropdown while still reading the point value from the farm object.
  const farmsWithFilteredHarvests = new Set(
    filteredHarvests.map((h) => h.farmId || h.farmerNIC)
  );

  const totalPoints = farms
    .filter((f: any) => {
      // crop-based filtering mirrors the farmers count logic above
      if (selectedCrop) {
        const farmCrop = String(f.crop || '').toLowerCase();
        if (farmCrop !== selectedCrop.toLowerCase()) return false;
      }

      // when year or season is selected, only include farms that appear in the
      // harvests that satisfy those same filters
      if (selectedYear || selectedSeason) {
        const key = f.farmId || f.farmerNIC;
        if (!farmsWithFilteredHarvests.has(key)) return false;
      }

      return true;
    })
    .reduce((s, f) => s + (Number(f.points) || 0), 0);

  // growth rate calculations based on previous season
  const smartPrevFilters = () => {
    if (!selectedYear || !selectedSeason) return null;
    let y = Number(selectedYear);
    let s = selectedSeason.toLowerCase();
    if (s === 'maha') {
      s = 'yala';
    } else if (s === 'yala') {
      s = 'maha';
      y = y - 1;
    } else {
      return null;
    }
    return { year: String(y), season: s };
  };
  const prevFilt = smartPrevFilters();
  const prevHarvests = prevFilt
    ? harvests.filter((h) => {
      const yearMatch = String(h.year) === prevFilt.year;
      const seasonMatch = String(h.season || '').toLowerCase() === prevFilt.season;
      const cropMatch = selectedCrop
        ? String(h.crop || '').toLowerCase() === selectedCrop.toLowerCase()
        : true;
      return yearMatch && seasonMatch && cropMatch;
    })
    : [];
  const prevFarmers = prevFilt ? new Set(prevHarvests.map((h) => h.farmerNIC)).size : 0;
  const prevHarvestKg = prevFilt
    ? prevHarvests.reduce((s, h) => s + (Number(h.harvestQty) || 0), 0)
    : 0;
  const prevAcres = prevFilt
    ? prevHarvests.reduce((s, h) => s + (Number(h.acres || h.farmSize || 0) || 0), 0)
    : 0;

  const farmerGrowth = prevFarmers > 0 ? ((totalFarmers - prevFarmers) / prevFarmers) * 100 : null;
  const harvestGrowth = prevHarvestKg > 0 ? ((totalHarvestKg - prevHarvestKg) / prevHarvestKg) * 100 : null;
  const yieldGrowth = prevAcres > 0 && prevHarvestKg > 0
    ? ((avgYieldPerAcre - (prevHarvestKg / 1000 / prevAcres)) /
      (prevHarvestKg / 1000 / prevAcres)) * 100
    : null;

  // formatted versions for summary cards
  const displayFarmersCount = selectedCrop ? filteredFarmersCount : totalFarmers;
  const formattedTotalFarmers = formatNumber(displayFarmersCount);
  const formattedTotalHarvest = formatNumber((selectedYear || selectedSeason || selectedCrop) ? totalHarvestTons : totalHarvest);
  const formattedAvgYield = formatNumber((selectedYear || selectedSeason || selectedCrop) ? avgYieldPerAcre : yieldPerAcre);
  const formattedTotalPoints = formatNumber(totalPoints);

  const farmersGrowthText = farmerGrowth !== null ? `${farmerGrowth.toFixed(1)}% from last season` : '';
  const harvestGrowthText = harvestGrowth !== null ? `${harvestGrowth.toFixed(1)}% from last season` : '';
  const yieldGrowthText = yieldGrowth !== null ? `${yieldGrowth.toFixed(1)}% from last season` : '';


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
      avgYield: p.totalAcres > 0 ? +((p.totalHarvestKg / 1000) / p.totalAcres).toFixed(2) : 0,
      totalAcres: p.totalAcres,
      points: p.points,
    }))
    // sort by average yield per acre instead of total yield
    .sort((a: any, b: any) => (b.avgYield || 0) - (a.avgYield || 0))
    .map((p: any, i: number) => ({ ...p, rank: i + 1 }))
    .slice(0, 10); // keep at most 10 for the view-more behaviour

  // Filter by crop only (NOT year or season) for yield by season chart
  const filteredHarvestsForSeasonChart = harvests.filter((h) => {
    const cropMatch = selectedCrop ? (String(h.crop || '').toLowerCase() === selectedCrop.toLowerCase()) : true;
    return cropMatch;
  });

  // Group by year and season to create season comparison data
  const yearSeasonMap: Record<string, { maha: number; yala: number }> = {};
  filteredHarvestsForSeasonChart.forEach((h) => {
    const year = h.year || 'Unknown';
    const season = String(h.season || '').toLowerCase();
    if (!yearSeasonMap[year]) {
      yearSeasonMap[year] = { maha: 0, yala: 0 };
    }
    const harvestTons = (Number(h.harvestQty) || 0) / 1000; // convert kg to tons
    if (season === 'maha') {
      yearSeasonMap[year].maha += harvestTons;
    } else if (season === 'yala') {
      yearSeasonMap[year].yala += harvestTons;
    }
  });

  const seasonData = Object.entries(yearSeasonMap)
    .map(([year, data]) => ({
      year,
      'Maha': Math.round(data.maha),
      'Yala': Math.round(data.yala),
    }))
    .sort((a, b) => {
      const yearA = Number(a.year);
      const yearB = Number(b.year);
      return yearA - yearB;
    });

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

  // Aggregate yield by district based on all active filters (year, season, crop)
  const districtMap: Record<string, number> = {};
  filteredHarvests.forEach((h) => {
    const district = h.district || 'Unknown';
    const qty = Number(h.harvestQty) || 0; // keep original units (kg)
    if (!districtMap[district]) districtMap[district] = 0;
    districtMap[district] += qty;
  });
  const districtData = Object.entries(districtMap)
    .map(([district, yieldVal]) => ({ district, yield: yieldVal }))
    .sort((a, b) => b.yield - a.yield);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
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
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-left hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">All Years</option>
                {years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            {/* Season */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Harvest Season</label>
              <select
                value={selectedSeason}
                onChange={(e) => setSelectedSeason(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-left hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">All Seasons</option>
                {seasons.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Crop - Using select like AdminDashboard */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Crop</label>
              <select
                value={selectedCrop || ''}
                onChange={(e) => setSelectedCrop(e.target.value || null)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-left hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">All Crops</option>
                {Array.from(new Set([...defaultCropOptions, ...availableCrops])).map((crop) => (
                  <option key={crop} value={crop}>
                    {crop}
                  </option>
                ))}
              </select>
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
              {metricsLoading ? '...' : metricsError ? 'Error' : formattedTotalFarmers}
            </p>
            <p className="text-xs sm:text-sm text-green-700 flex items-center gap-1 mt-2">
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
              {metricsLoading ? '...' : farmersGrowthText || '+0%'}
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
                {metricsLoading || loadingHarvests
                  ? '...'
                  : (selectedYear || selectedSeason || selectedCrop)
                    ? formattedTotalHarvest
                    : formattedTotalHarvest}
              </p>
              <span className="text-xs sm:text-sm font-medium text-gray-600 break-words">tons</span>
            </div>
            <p className="text-xs sm:text-sm text-green-700 flex items-center gap-1 mt-2">
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
              {metricsLoading ? '...' : harvestGrowthText || '+0%'}
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
                {metricsLoading || loadingHarvests
                  ? '...'
                  : (selectedYear || selectedSeason || selectedCrop)
                    ? formattedAvgYield
                    : formattedAvgYield}
              </p>
              <span className="text-xs sm:text-sm font-medium text-gray-600 break-words">tons</span>
            </div>
            <p className="text-xs sm:text-sm text-green-700 mt-2">
              {metricsLoading ? '...' : yieldGrowthText || 'Above target'}
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
              {metricsLoading || loadingHarvests ? '...' : (selectedYear || selectedSeason || selectedCrop) ? formattedTotalPoints : formattedTotalPoints}
            </p>
            <p className="text-xs sm:text-sm text-green-700 mt-2">
              {metricsLoading || loadingHarvests ? '...' : 'This season'}
            </p>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 gap-6">
        {/* Season Comparison */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Yield by Season {selectedCrop && `- ${selectedCrop}`}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={seasonData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Maha" fill="#16a34a" name="Maha (tons)" />
              <Bar dataKey="Yala" fill="#60a5fa" name="Yala (tons)" />
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
            {/* same format as yield-by-season chart */}
            <BarChart data={districtData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="district" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="yield" fill="#16a34a" name="Yield (kg)" />
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
              {topPerformers.slice(0, showAllPerformers ? 10 : 5).map((farmer) => (
                <tr
                  key={farmer.rank}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => handleSelectPerformer(farmer)}
                >
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
          {loadingFarmerDetails && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
              <span className="text-lg font-semibold">Loading farmer details...</span>
            </div>
          )}
          {/* toggle button for expanding/collapsing list */}
          {topPerformers.length > 5 && (
            <div className="p-4 border-t border-gray-200 flex justify-end">
              <button
                type="button"
                onClick={() => setShowAllPerformers((prev) => !prev)}
                className="text-green-600 hover:text-green-700 text-xs font-medium flex items-center gap-1"
              >
                {showAllPerformers ? 'View Less' : 'View More'}
                <Link2 className="w-3 h-3" />
              </button>
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
