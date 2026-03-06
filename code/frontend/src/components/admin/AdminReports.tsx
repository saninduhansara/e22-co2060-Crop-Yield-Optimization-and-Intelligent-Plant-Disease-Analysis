import { Download, TrendingUp, Users, Wheat, FileText, BarChart3, Link2, MapPin, Layers } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { useState, useEffect } from 'react';
import { farmAPI } from '../../services/api';
import { FarmerProfile } from './FarmerProfile';
import { formatNumber } from '../../utils/numberUtils';

export function AdminReports() {
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
  const [districtCrop, setDistrictCrop] = useState<string>('');

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

  const years = ['2026', '2025', '2024'];
  const seasons = ['Maha', 'Yala'];

  const parseNumber = (val: any): number => {
    if (typeof val === 'number') return Number.isFinite(val) ? val : 0;
    if (typeof val === 'string') {
      const parsed = Number(val.replace(/,/g, '').replace(/[^\d.-]/g, ''));
      return Number.isFinite(parsed) ? parsed : 0;
    }
    return 0;
  };

  const normalizeSeason = (val: any) => {
    const s = String(val || '').toLowerCase().trim();
    return s.includes('maha') ? 'maha' : s.includes('yala') ? 'yala' : s;
  };

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
    const seasonMatch = selectedSeason ? normalizeSeason(h.season) === selectedSeason.toLowerCase() : true;
    const cropMatch = selectedCrop ? (String(h.crop || '').toLowerCase() === selectedCrop.toLowerCase()) : true;
    return yearMatch && seasonMatch && cropMatch;
  });

  // Unique farmers matching the filter
  const activeNICs = new Set(filteredHarvests.map(h => h.farmerNIC).filter(Boolean));
  const periodFarmsList = farms.filter(f => activeNICs.has(f.farmerNIC));

  if (selectedCrop) {
    // Only apply if we want to filter farms, but the harvests are already filtered by crop.
    // The metric display doesn't strictly need this unless farm points calculation demands it.
  }

  const displayFarmersCount = activeNICs.size;
  const activePlotsCount = periodFarmsList.length;

  // Total harvest (tons) and average yield per acre (tons/acre) based on filtered harvests
  const totalHarvestKg = filteredHarvests.reduce((s, h) => s + parseNumber(h.harvestQty), 0);

  const farmAcresMap = new Map<string, number>();
  filteredHarvests.forEach((h: any) => {
    const key = h.farmId || h.farmerNIC;
    if (key) {
      const currentAcres = farmAcresMap.get(key) || 0;
      const harvestAcres = parseNumber(h.acres || h.farmSize || 0);
      if (harvestAcres > currentAcres) {
        farmAcresMap.set(key, harvestAcres);
      }
    }
  });
  const activeFarmlandAcres = Array.from(farmAcresMap.values()).reduce((sum, acres) => sum + acres, 0);

  const totalHarvestTons = totalHarvestKg / 1000;
  const avgYieldPerAcre = activeFarmlandAcres > 0 ? (totalHarvestKg / activeFarmlandAcres) : 0; // standard yield is in kg/acre

  // Total points for the matched farms
  const totalPoints = periodFarmsList.reduce((s, f) => s + parseNumber(f.points), 0);

  // growth rate calculations based on previous logical period
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
      const seasonMatch = normalizeSeason(h.season) === prevFilt.season;
      const cropMatch = selectedCrop
        ? String(h.crop || '').toLowerCase() === selectedCrop.toLowerCase()
        : true;
      return yearMatch && seasonMatch && cropMatch;
    })
    : [];

  const prevFarmers = prevFilt ? new Set(prevHarvests.map((h) => h.farmerNIC)).size : 0;
  // Also calculate prev plots and prev farmland
  const prevNICs = new Set(prevHarvests.map((h: any) => h.farmerNIC).filter(Boolean));
  const prevPeriodFarmsList = prevFilt ? farms.filter((f: any) => prevNICs.has(f.farmerNIC)) : [];
  if (selectedCrop) {
    // filter prevPeriodFarmsList by crop as well if needed, similar to top level logic
  }
  const prevPlotsCount = prevFilt ? prevPeriodFarmsList.length : 0;

  const prevFarmAcresMap = new Map<string, number>();
  if (prevFilt) {
    prevHarvests.forEach((h: any) => {
      const key = h.farmId || h.farmerNIC;
      if (key) {
        const currentAcres = prevFarmAcresMap.get(key) || 0;
        const harvestAcres = parseNumber(h.acres || h.farmSize || 0);
        if (harvestAcres > currentAcres) {
          prevFarmAcresMap.set(key, harvestAcres);
        }
      }
    });
  }
  const prevFarmlandAcres = Array.from(prevFarmAcresMap.values()).reduce((sum, acres) => sum + acres, 0);

  const prevHarvestKg = prevFilt
    ? prevHarvests.reduce((s, h) => s + parseNumber(h.harvestQty), 0)
    : 0;

  const farmerGrowth = prevFarmers > 0 ? ((displayFarmersCount - prevFarmers) / prevFarmers) * 100 : null;
  const harvestGrowth = prevHarvestKg > 0 ? ((totalHarvestKg - prevHarvestKg) / prevHarvestKg) * 100 : null;
  const plotsGrowth = prevPlotsCount > 0 ? ((activePlotsCount - prevPlotsCount) / prevPlotsCount) * 100 : null;
  const farmlandGrowth = prevFarmlandAcres > 0 ? ((activeFarmlandAcres - prevFarmlandAcres) / prevFarmlandAcres) * 100 : null;

  const prevYieldPerAcre = prevFarmlandAcres > 0 ? (prevHarvestKg / prevFarmlandAcres) : 0;
  const yieldGrowth = prevYieldPerAcre > 0
    ? ((avgYieldPerAcre - prevYieldPerAcre) / prevYieldPerAcre) * 100
    : null;

  // formatted versions for summary cards
  const formattedTotalFarmers = formatNumber(displayFarmersCount);
  const formattedActivePlots = formatNumber(activePlotsCount);
  const formattedActiveFarmland = formatNumber(activeFarmlandAcres);
  const formattedTotalHarvest = (totalHarvestTons).toLocaleString(undefined, { maximumFractionDigits: 1 });
  const formattedAvgYield = (avgYieldPerAcre).toLocaleString(undefined, { maximumFractionDigits: 0 }); // kg/acre
  const formattedTotalPoints = formatNumber(totalPoints);

  const getGrowthText = (val: number | null, label: string) => {
    if (val === null) return `N/A from ${label}`;
    if (val === 0) return `0.0% from ${label}`;
    const capped = Math.min(Math.max(val, -9999.9), 9999.9);
    const sign = capped > 0 ? '+' : '';
    return `${sign}${capped.toFixed(1)}% from ${label}`;
  };

  const lastLabel = (!selectedYear || !selectedSeason) ? 'all time' : 'last season';
  const farmersGrowthText = getGrowthText(farmerGrowth, lastLabel);
  const plotsGrowthText = getGrowthText(plotsGrowth, lastLabel);
  const farmlandGrowthText = getGrowthText(farmlandGrowth, lastLabel);
  const harvestGrowthText = getGrowthText(harvestGrowth, lastLabel);
  const yieldGrowthText = getGrowthText(yieldGrowth, lastLabel);

  // Create a map of farmerNIC to total points from farms data
  const farmerPointsMap = new Map<string, number>();
  farms.forEach((farm) => {
    if (farm.farmerNIC) {
      farmerPointsMap.set(farm.farmerNIC, farm.points || 0);
    }
  });

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
    performersMap[key].totalHarvestKg += parseNumber(h.harvestQty);
    performersMap[key].totalAcres += parseNumber(h.acres || h.farmSize);
    // Use the farmer's total points from the User model instead of accumulating from harvests
    performersMap[key].points = farmerPointsMap.get(h.farmerNIC) || 0;
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
      avgYield: p.totalAcres > 0 ? +(p.totalHarvestKg / p.totalAcres).toFixed(0) : 0, // kg/acre
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

  // Group by year and season to create season comparison data AND farmer growth
  const yearSeasonMap: Record<string, { maha: number; yala: number; mahaFarmers: Set<string>; yalaFarmers: Set<string> }> = {};
  filteredHarvestsForSeasonChart.forEach((h) => {
    const year = h.year || 'Unknown';
    const season = normalizeSeason(h.season);
    if (!yearSeasonMap[year]) {
      yearSeasonMap[year] = { maha: 0, yala: 0, mahaFarmers: new Set(), yalaFarmers: new Set() };
    }
    const harvestTons = parseNumber(h.harvestQty) / 1000; // convert kg to tons
    if (season === 'maha') {
      yearSeasonMap[year].maha += harvestTons;
      if (h.farmerNIC) yearSeasonMap[year].mahaFarmers.add(h.farmerNIC);
    } else if (season === 'yala') {
      yearSeasonMap[year].yala += harvestTons;
      if (h.farmerNIC) yearSeasonMap[year].yalaFarmers.add(h.farmerNIC);
    }
  });

  const seasonData = Object.entries(yearSeasonMap)
    .map(([year, data]) => ({
      year,
      'Maha': Math.round(data.maha),
      'Yala': Math.round(data.yala),
    }))
    .sort((a, b) => Number(a.year) - Number(b.year));

  // For the farmer growth line chart, we need a flat linear timeline
  const farmerTimelineData: any[] = [];
  Object.entries(yearSeasonMap).sort((a, b) => Number(a[0]) - Number(b[0])).forEach(([year, data]) => {
    farmerTimelineData.push({
      season: `${year} Maha`,
      farmers: data.mahaFarmers.size
    });
    farmerTimelineData.push({
      season: `${year} Yala`,
      farmers: data.yalaFarmers.size
    });
  });

  // Filter by year and season only (NOT crop) for variety distribution
  const filteredHarvestsForVariety = harvests.filter((h) => {
    const yearMatch = selectedYear ? String(h.year) === selectedYear : true;
    const seasonMatch = selectedSeason ? normalizeSeason(h.season) === selectedSeason.toLowerCase() : true;
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

  // Aggregate yield by district based on LOCAL filters (districtYear, districtSeason, districtCrop)
  // We use the base 'harvests' array instead of 'filteredHarvests' which uses global filters.
  const filteredHarvestsForDistrict = harvests.filter((h) => {
    const yearMatch = districtYear ? String(h.year) === districtYear : true;
    const seasonMatch = districtSeason ? normalizeSeason(h.season) === districtSeason.toLowerCase() : true;
    const cropMatch = districtCrop ? (String(h.crop || '').toLowerCase() === districtCrop.toLowerCase()) : true;
    return yearMatch && seasonMatch && cropMatch;
  });

  const districtMap: Record<string, number> = {};
  filteredHarvestsForDistrict.forEach((h) => {
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
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 md:gap-5 lg:gap-6">
        {/* Active Farmers Card */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-5 sm:p-6 shadow-md border-l-4 border-l-green-500 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:cursor-pointer group">
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">Active Farmers</p>
              <Users className="w-5 h-5 text-green-600 opacity-70 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-3xl sm:text-2xl lg:text-3xl font-bold text-gray-900 my-2 break-words min-w-0">
              {loadingHarvests ? '...' : formattedTotalFarmers}
            </p>
            <p className="text-xs sm:text-sm text-green-700 flex items-center gap-1 mt-2">
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
              {loadingHarvests ? '...' : farmersGrowthText}
            </p>
          </div>
        </div>

        {/* Active Plots Card */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-5 sm:p-6 shadow-md border-l-4 border-l-green-500 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:cursor-pointer group">
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">Active Plots</p>
              <MapPin className="w-5 h-5 text-green-600 opacity-70 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-3xl sm:text-2xl lg:text-3xl font-bold text-gray-900 my-2 break-words min-w-0">
              {loadingHarvests ? '...' : formattedActivePlots}
            </p>
            <p className="text-xs sm:text-sm text-gray-600 mt-2">
              Calculated from harvest records
            </p>
          </div>
        </div>

        {/* Active Farmland Card */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-5 sm:p-6 shadow-md border-l-4 border-l-green-500 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:cursor-pointer group">
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">Active Farmland</p>
              <Layers className="w-5 h-5 text-green-600 opacity-70 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="flex min-w-0 flex-wrap items-baseline gap-1 sm:gap-2 my-2">
              <p className="text-3xl sm:text-2xl lg:text-3xl font-bold text-gray-900 break-words min-w-0">
                {loadingHarvests ? '...' : formattedActiveFarmland}
              </p>
              <span className="text-xs sm:text-sm font-medium text-gray-600 break-words">acres</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 mt-2">
              Calculated from harvest records
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
                {loadingHarvests ? '...' : formattedTotalHarvest}
              </p>
              <span className="text-xs sm:text-sm font-medium text-gray-600 break-words">tons</span>
            </div>
            <p className="text-xs sm:text-sm text-green-700 flex items-center gap-1 mt-2">
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
              {loadingHarvests ? '...' : harvestGrowthText}
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
                {loadingHarvests ? '...' : formattedAvgYield}
              </p>
              <span className="text-xs sm:text-sm font-medium text-gray-600 break-words">kg</span>
            </div>
            <p className="text-xs sm:text-sm text-green-700 flex items-center gap-1 mt-2">
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
              {loadingHarvests ? '...' : yieldGrowthText}
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
              {loadingHarvests ? '...' : formattedTotalPoints}
            </p>
            <p className="text-xs sm:text-sm text-green-700 mt-2">
              {loadingHarvests ? '...' : 'Aggregated'}
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
            <LineChart data={farmerTimelineData}>
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
            <div className="flex gap-2 flex-wrap">
              <select
                value={districtYear}
                onChange={(e) => setDistrictYear(e.target.value)}
                className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-green-500 min-w-[90px]"
              >
                <option value="">All Years</option>
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
              </select>
              <select
                value={districtSeason}
                onChange={(e) => setDistrictSeason(e.target.value)}
                className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-green-500 min-w-[90px]"
              >
                <option value="">All Seasons</option>
                <option value="Maha">Maha</option>
                <option value="Yala">Yala</option>
              </select>
              <select
                value={districtCrop}
                onChange={(e) => setDistrictCrop(e.target.value)}
                className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-green-500 min-w-[90px]"
              >
                <option value="">All Crops</option>
                {Array.from(new Set([...defaultCropOptions, ...availableCrops])).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
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
                  <td className="px-6 py-4 text-sm font-medium text-gray-800">{farmer.avgYield} kg</td>
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
