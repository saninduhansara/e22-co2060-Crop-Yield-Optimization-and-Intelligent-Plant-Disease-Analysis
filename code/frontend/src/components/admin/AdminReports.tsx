import { Download, TrendingUp, Users, Wheat, FileText, BarChart3, MapPin, Layers, Trophy, Star, RefreshCw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { farmAPI } from '../../services/api';
import { FarmerProfile } from './FarmerProfile';
import { formatNumber } from '../../utils/numberUtils';
import { downloadReportAsPDF } from '../../utils/pdfDownload';
import { AdminReportFilters } from './AdminReportFilters';

export function AdminReports() {
  const reportContentRef = useRef<HTMLDivElement>(null);
  const pdfContentRef = useRef<HTMLDivElement>(null);
  const lastUpdatedTime = new Date().toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
  const [selectedFarmer, setSelectedFarmer] = useState<any | null>(null);
  const [loadingFarmerDetails, setLoadingFarmerDetails] = useState<boolean>(false);
  // control expansion of the top performers list (5 vs 10 entries)
  const [showAllPerformers, setShowAllPerformers] = useState(false);
  const [activeInsightsTab, setActiveInsightsTab] = useState<'growth' | 'variety'>('growth');
  const [activeYieldTab, setActiveYieldTab] = useState<'season' | 'district'>('season');
  
  // Handle PDF download
  const handleDownloadReport = async () => {
    if (!pdfContentRef.current) {
      alert('Report content not found');
      return;
    }
    
    try {
      // Make PDF content visible temporarily
      if (pdfContentRef.current) {
        pdfContentRef.current.style.display = 'block';
      }
      
      await downloadReportAsPDF(pdfContentRef.current, 'AgriConnect_Report');
      
      // Hide PDF content again
      if (pdfContentRef.current) {
        pdfContentRef.current.style.display = 'none';
      }
      
      toast.success('Report downloaded successfully.');
    } catch (error) {
      // Hide PDF content on error too
      if (pdfContentRef.current) {
        pdfContentRef.current.style.display = 'none';
      }
      alert(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleRefreshReport = async () => {
    try {
      setLoadingHarvests(true);
      const harvestData = await farmAPI.getHarvestHistory();
      setHarvests(harvestData.harvests || []);

      const farmsData = await farmAPI.getAllFarms();
      setFarms(farmsData.farms || []);

      const cropsData = await farmAPI.getAllCrops();
      setAvailableCrops(cropsData.crops || []);
      toast.success('Report refreshed successfully.');
    } catch (err) {
      console.error('Failed to refresh data', err);
      toast.error('Failed to refresh report.');
    } finally {
      setLoadingHarvests(false);
    }
  };

  // Helper function to handle download button click

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
  const [varietyYear, setVarietyYear] = useState<string>('');
  const [varietySeason, setVarietySeason] = useState<string>('');
  const [districtYear, setDistrictYear] = useState<string>('');
  const [districtSeason, setDistrictSeason] = useState<string>('');
  const [districtCrop, setDistrictCrop] = useState<string>('');
  const [focusedFilter, setFocusedFilter] = useState<string | null>(null);

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
    // Handle single letters and numbers
    if (s === 'm' || s === '1') return 'maha';
    if (s === 'y' || s === '2') return 'yala';
    // Handle full names and partial matches
    if (s.includes('maha')) return 'maha';
    if (s.includes('yala')) return 'yala';
    return s;
  };

  const formatDistrictYAxisTick = (value: number | string) => {
    const n = Number(value);
    if (!Number.isFinite(n)) return String(value);

    if (n >= 1_000_000) {
      const m = n / 1_000_000;
      return `${Number.isInteger(m) ? m : Number(m.toFixed(1))}M`;
    }

    return String(value); // below 1,000,000 stays as-is
  };

  const getCompactFilterStyle = (isActive: boolean) => ({
    background: isActive ? '#DCFCE7' : '#F3F4F6',
    border: `1px solid ${isActive ? '#86EFAC' : '#E5E7EB'}`,
    borderRadius: '999px',
    padding: '4px 12px',
    fontSize: '12px',
    fontWeight: 500,
    color: isActive ? '#15803D' : '#374151',
    cursor: 'pointer',
    minWidth: '105px',
    outline: 'none',
    transition: 'all 0.2s ease',
  });

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
    const seasonMatch = selectedSeason ? normalizeSeason(h.season) === normalizeSeason(selectedSeason) : true;
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

  // Total points for the matched farms (rounded to nearest integer)
  const totalPoints = Math.round(periodFarmsList.reduce((s, f) => s + parseNumber(f.points), 0));

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
  const formattedTotalHarvest = formatNumber(totalHarvestTons);
  const formattedAvgYield = formatNumber(avgYieldPerAcre); // kg/acre
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

  // Create a map of farmerNIC to total points from farms data (rounded to integers)
  const farmerPointsMap = new Map<string, number>();
  farms.forEach((farm) => {
    if (farm.farmerNIC) {
      farmerPointsMap.set(farm.farmerNIC, Math.round(farm.points || 0));
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
    const yearMatch = varietyYear ? String(h.year) === varietyYear : true;
    const seasonMatch = varietySeason ? normalizeSeason(h.season) === normalizeSeason(varietySeason) : true;
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

  // Define colors for crops - variations of green with clear visible differences
  const cropColors: Record<string, string> = {
    'Paddy': '#7FFF00',        // Chartreuse (bright lime green)
    'Corn': '#32CD32',         // Lime Green (bright green)
    'Wheat': '#00FF00',        // Pure Bright Green
    'Tomatoes': '#228B22',     // Forest Green (dark green)
    'Onion': '#2E8B57',        // Sea Green (teal-green)
    'Carrots': '#3CB371',      // Medium Sea Green
    'Cabbage': '#6B8E23',      // Olive Green
    'Potatoes': '#20B2AA',     // Light Sea Green (blue-green)
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
    const seasonMatch = districtSeason ? normalizeSeason(h.season) === normalizeSeason(districtSeason) : true;
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

  const getRankBadgeStyle = (rank: number) => {
    if (rank === 1) {
      return {
        background: '#FEF9C3',
        color: '#B45309',
        border: '1px solid #FDE68A',
      };
    }
    if (rank === 2) {
      return {
        background: '#F3F4F6',
        color: '#6B7280',
        border: '1px solid #D1D5DB',
      };
    }
    if (rank === 3) {
      return {
        background: '#FFEDD5',
        color: '#C2410C',
        border: '1px solid #FED7AA',
      };
    }
    return {
      background: '#F9FAFB',
      color: '#9CA3AF',
      border: '1px solid #E5E7EB',
    };
  };

  const getPointsTextStyle = (points: number) => {
    if (points >= 100000) {
      return {
        color: '#B45309',
        fontWeight: 700,
      };
    }
    if (points >= 10000) {
      return {
        color: '#374151',
        fontWeight: 600,
      };
    }
    return {
      color: '#9CA3AF',
      fontWeight: 500,
    };
  };

  return (
    <div ref={reportContentRef} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

          <p className="text-gray-600">Comprehensive insights and data analysis</p>
          <span style={{ fontSize: '12px', color: '#9CA3AF', marginLeft: '12px' }}>
            Last updated: today at {lastUpdatedTime}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'nowrap' }}>
          <button
            type="button"
            onClick={handleRefreshReport}
            style={{
              padding: '10px 16px',
              background: '#E0F2FE',
              border: '1px solid #BAE6FD',
              color: '#075985',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontWeight: 500,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = '#BAE6FD';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = '#E0F2FE';
            }}
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>

          <button
            type="button"
            onClick={handleDownloadReport}
            style={{
              padding: '10px 16px',
              background: '#16A34A',
              border: '1px solid #15803D',
              color: '#FFFFFF',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontWeight: 500,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = '#15803D';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = '#16A34A';
            }}
          >
            <Download className="w-5 h-5" />
            Download Report
          </button>
        </div>
      </div>
      {/* Filters - Year / Season / Crop */}
      <AdminReportFilters
        selectedYear={selectedYear}
        selectedSeason={selectedSeason}
        selectedCrop={selectedCrop}
        years={years}
        seasons={seasons}
        availableCrops={availableCrops}
        defaultCropOptions={defaultCropOptions}
        onYearChange={setSelectedYear}
        onSeasonChange={setSelectedSeason}
        onCropChange={setSelectedCrop}
      />

      {/* Summary Cards - matching AdminDashboard styling */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 md:gap-5 lg:gap-6">
        {/* Active Farmers Card */}
        <div
          style={{
            background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)',
            borderRadius: '14px',
            padding: '16px 20px',
            boxShadow: '0 8px 16px -2px rgba(0, 0, 0, 0.15), 0 4px 8px -1px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.2s ease',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)';
            (e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 28px rgba(0,0,0,0.12)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
            (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 16px -2px rgba(0, 0, 0, 0.15), 0 4px 8px -1px rgba(0, 0, 0, 0.1)';
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                <Users style={{ width: '18px', height: '18px', color: '#16A34A' }} />
              </div>
            </div>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Active Farmers</p>
            <p style={{ fontSize: '28px', fontWeight: 700, color: '#111827', margin: '0', marginBottom: '4px' }} title={loadingHarvests ? '...' : formattedTotalFarmers}>
              {loadingHarvests ? '...' : formattedTotalFarmers}
            </p>
            <p style={{ fontSize: '11px', color: '#9CA3AF', fontStyle: 'normal', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <TrendingUp style={{ width: '12px', height: '12px' }} />
              {loadingHarvests ? '...' : farmersGrowthText}
            </p>
          </div>
        </div>

        {/* Active Plots Card */}
        <div
          style={{
            background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)',
            borderRadius: '14px',
            padding: '16px 20px',
            boxShadow: '0 8px 16px -2px rgba(0, 0, 0, 0.15), 0 4px 8px -1px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.2s ease',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)';
            (e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 28px rgba(0,0,0,0.12)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
            (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 16px -2px rgba(0, 0, 0, 0.15), 0 4px 8px -1px rgba(0, 0, 0, 0.1)';
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                <MapPin style={{ width: '18px', height: '18px', color: '#059669' }} />
              </div>
            </div>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Active Plots</p>
            <p style={{ fontSize: '28px', fontWeight: 700, color: '#111827', margin: '0', marginBottom: '4px' }} title={loadingHarvests ? '...' : formattedActivePlots}>
              {loadingHarvests ? '...' : formattedActivePlots}
            </p>
            <p style={{ fontSize: '11px', color: '#9CA3AF', fontStyle: 'normal', marginTop: '4px' }}>
              Calculated from harvest records
            </p>
          </div>
        </div>

        {/* Active Farmland Card */}
        <div
          style={{
            background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)',
            borderRadius: '14px',
            padding: '16px 20px',
            boxShadow: '0 8px 16px -2px rgba(0, 0, 0, 0.15), 0 4px 8px -1px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.2s ease',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)';
            (e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 28px rgba(0,0,0,0.12)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
            (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 16px -2px rgba(0, 0, 0, 0.15), 0 4px 8px -1px rgba(0, 0, 0, 0.1)';
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#DCEDD5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                <Layers style={{ width: '18px', height: '18px', color: '#4D7C0F' }} />
              </div>
            </div>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Active Farmland</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '4px' }}>
              <p style={{ fontSize: '28px', fontWeight: 700, color: '#111827', margin: '0' }} title={loadingHarvests ? '...' : formattedActiveFarmland}>
                {loadingHarvests ? '...' : formattedActiveFarmland}
              </p>
              <span style={{ fontSize: '11px', fontWeight: 500, color: '#6B7280' }}>acres</span>
            </div>
            <p style={{ fontSize: '11px', color: '#9CA3AF', fontStyle: 'normal', marginTop: '4px' }}>
              Calculated from harvest records
            </p>
          </div>
        </div>

        {/* Total Harvest Card */}
        <div
          style={{
            background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)',
            borderRadius: '14px',
            padding: '16px 20px',
            boxShadow: '0 8px 16px -2px rgba(0, 0, 0, 0.15), 0 4px 8px -1px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.2s ease',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)';
            (e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 28px rgba(0,0,0,0.12)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
            (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 16px -2px rgba(0, 0, 0, 0.15), 0 4px 8px -1px rgba(0, 0, 0, 0.1)';
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#C8E6C9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                <Wheat style={{ width: '18px', height: '18px', color: '#15803D' }} />
              </div>
            </div>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Total Harvest</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '4px' }}>
              <p style={{ fontSize: '28px', fontWeight: 700, color: '#111827', margin: '0' }} title={loadingHarvests ? '...' : formattedTotalHarvest}>
                {loadingHarvests ? '...' : formattedTotalHarvest}
              </p>
              <span style={{ fontSize: '11px', fontWeight: 500, color: '#6B7280' }}>tons</span>
            </div>
            <p style={{ fontSize: '11px', color: '#9CA3AF', fontStyle: 'normal', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <TrendingUp style={{ width: '12px', height: '12px' }} />
              {loadingHarvests ? '...' : harvestGrowthText}
            </p>
          </div>
        </div>

        {/* Avg Yield/Acre Card */}
        <div
          style={{
            background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)',
            borderRadius: '14px',
            padding: '16px 20px',
            boxShadow: '0 8px 16px -2px rgba(0, 0, 0, 0.15), 0 4px 8px -1px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.2s ease',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)';
            (e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 28px rgba(0,0,0,0.12)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
            (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 16px -2px rgba(0, 0, 0, 0.15), 0 4px 8px -1px rgba(0, 0, 0, 0.1)';
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#D5F5E3', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                <TrendingUp style={{ width: '18px', height: '18px', color: '#10B981' }} />
              </div>
            </div>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Avg Yield/Acre</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '4px' }}>
              <p style={{ fontSize: '28px', fontWeight: 700, color: '#111827', margin: '0' }} title={loadingHarvests ? '...' : formattedAvgYield}>
                {loadingHarvests ? '...' : formattedAvgYield}
              </p>
              <span style={{ fontSize: '11px', fontWeight: 500, color: '#6B7280' }}>kg</span>
            </div>
            <p style={{ fontSize: '11px', color: '#9CA3AF', fontStyle: 'normal', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <TrendingUp style={{ width: '12px', height: '12px' }} />
              {loadingHarvests ? '...' : yieldGrowthText}
            </p>
          </div>
        </div>

        {/* Total Points Card */}
        <div
          style={{
            background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)',
            borderRadius: '14px',
            padding: '16px 20px',
            boxShadow: '0 8px 16px -2px rgba(0, 0, 0, 0.15), 0 4px 8px -1px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.2s ease',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)';
            (e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 28px rgba(0,0,0,0.12)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
            (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 16px -2px rgba(0, 0, 0, 0.15), 0 4px 8px -1px rgba(0, 0, 0, 0.1)';
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#FEF9C3', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                <FileText style={{ width: '18px', height: '18px', color: '#B45309' }} />
              </div>
            </div>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Total Points</p>
            <p style={{ fontSize: '28px', fontWeight: 700, color: '#111827', margin: '0', marginBottom: '4px' }} title={loadingHarvests ? '...' : formattedTotalPoints}>
              {loadingHarvests ? '...' : formattedTotalPoints}
            </p>
            <p style={{ fontSize: '11px', color: '#9CA3AF', fontStyle: 'normal', marginTop: '4px' }}>
              {loadingHarvests ? '...' : 'Aggregated'}
            </p>
          </div>
        </div>
      </div>

      {/* Yield Tabs */}
      <div style={{
        background: 'white',
        border: '1px solid #E5E7EB',
        borderRadius: '14px',
        padding: '20px 24px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
          <button
            type="button"
            onClick={() => setActiveYieldTab('season')}
            style={{
              padding: '8px 14px',
              borderRadius: '999px',
              border: activeYieldTab === 'season' ? '1px solid #15803D' : '1px solid #D1D5DB',
              background: activeYieldTab === 'season' ? '#DCFCE7' : '#FFFFFF',
              color: activeYieldTab === 'season' ? '#166534' : '#374151',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Yield by Season
          </button>
          <button
            type="button"
            onClick={() => setActiveYieldTab('district')}
            style={{
              padding: '8px 14px',
              borderRadius: '999px',
              border: activeYieldTab === 'district' ? '1px solid #15803D' : '1px solid #D1D5DB',
              background: activeYieldTab === 'district' ? '#DCFCE7' : '#FFFFFF',
              color: activeYieldTab === 'district' ? '#166534' : '#374151',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Yield by District
          </button>
        </div>

        {activeYieldTab === 'season' ? (
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827' }}>
              Yield by Season {selectedCrop && `- ${selectedCrop}`}
            </h3>
            <p style={{ fontSize: '12px', color: '#9CA3AF', margin: 0, marginTop: '2px' }}>
              Total yield in tons by harvest season
            </p>
            <div style={{ padding: '12px', background: '#FAFAFA', borderRadius: '8px', marginTop: '12px' }}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={seasonData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="Maha" fill="#16a34a" name="Maha (tons)" />
                  <Bar dataKey="Yala" fill="#60a5fa" name="Yala (tons)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#F3F4F6',
                padding: '4px 12px',
                borderRadius: '999px',
                fontSize: '12px',
                fontWeight: 500,
                color: '#374151',
                marginRight: '8px'
              }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#15803D' }} />
                Maha (tons)
              </div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#F3F4F6',
                padding: '4px 12px',
                borderRadius: '999px',
                fontSize: '12px',
                fontWeight: 500,
                color: '#374151',
                marginRight: '8px'
              }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3B82F6' }} />
                Yala (tons)
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#111827' }}>Yield by District</h3>
                <p style={{ fontSize: '12px', color: '#9CA3AF', margin: '2px 0 0 0' }}>
                  Total crop yield in kilograms across districts
                </p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <select
                  value={districtYear}
                  onChange={(e) => setDistrictYear(e.target.value)}
                  onFocus={() => setFocusedFilter('districtYear')}
                  onBlur={() => setFocusedFilter(null)}
                  style={getCompactFilterStyle(focusedFilter === 'districtYear' || districtYear !== '')}
                >
                  <option value="">All Years</option>
                  <option value="2026">2026</option>
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                </select>
                <select
                  value={districtSeason}
                  onChange={(e) => setDistrictSeason(e.target.value)}
                  onFocus={() => setFocusedFilter('districtSeason')}
                  onBlur={() => setFocusedFilter(null)}
                  style={getCompactFilterStyle(focusedFilter === 'districtSeason' || districtSeason !== '')}
                >
                  <option value="">All Seasons</option>
                  <option value="Maha">Maha</option>
                  <option value="Yala">Yala</option>
                </select>
                <select
                  value={districtCrop}
                  onChange={(e) => setDistrictCrop(e.target.value)}
                  onFocus={() => setFocusedFilter('districtCrop')}
                  onBlur={() => setFocusedFilter(null)}
                  style={getCompactFilterStyle(focusedFilter === 'districtCrop' || districtCrop !== '')}
                >
                  <option value="">All Crops</option>
                  {Array.from(new Set([...defaultCropOptions, ...availableCrops])).map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ padding: '12px', background: '#FAFAFA', borderRadius: '8px', marginTop: '12px' }}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={districtData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="district" />
                  <YAxis tickFormatter={formatDistrictYAxisTick} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="yield" fill="#16a34a" name="Yield (kg)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Insights Tabs */}
      <div style={{
        background: 'white',
        border: '1px solid #E5E7EB',
        borderRadius: '14px',
        padding: '20px 24px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
          <button
            type="button"
            onClick={() => setActiveInsightsTab('growth')}
            style={{
              padding: '8px 14px',
              borderRadius: '999px',
              border: activeInsightsTab === 'growth' ? '1px solid #15803D' : '1px solid #D1D5DB',
              background: activeInsightsTab === 'growth' ? '#DCFCE7' : '#FFFFFF',
              color: activeInsightsTab === 'growth' ? '#166534' : '#374151',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Farmer Participation Growth
          </button>
          <button
            type="button"
            onClick={() => setActiveInsightsTab('variety')}
            style={{
              padding: '8px 14px',
              borderRadius: '999px',
              border: activeInsightsTab === 'variety' ? '1px solid #15803D' : '1px solid #D1D5DB',
              background: activeInsightsTab === 'variety' ? '#DCFCE7' : '#FFFFFF',
              color: activeInsightsTab === 'variety' ? '#166534' : '#374151',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Crop Variety Distribution
          </button>
        </div>

        {activeInsightsTab === 'growth' ? (
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#111827' }}>Farmer Participation Growth</h3>
            <p style={{ fontSize: '12px', color: '#9CA3AF', margin: '2px 0 0 0' }}>
              Number of participating farmers across each harvest season
            </p>
            <div style={{ padding: '12px', background: '#FAFAFA', borderRadius: '8px', marginTop: '12px' }}>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={farmerTimelineData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="season" />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(label: any) => `Season: ${label}`}
                    formatter={(value: any) => [`${value}`, 'Farmers']}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="farmers"
                    stroke="#15803D"
                    strokeWidth={3}
                    dot={{ r: 6 }}
                    activeDot={{ r: 6 }}
                    name="Farmers"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#111827' }}>Crop Variety Distribution</h3>
                <p style={{ fontSize: '12px', color: '#9CA3AF', margin: '2px 0 0 0' }}>
                  Distribution of crop varieties in tons
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <select
                  value={varietyYear}
                  onChange={(e) => setVarietyYear(e.target.value)}
                  onFocus={() => setFocusedFilter('varietyYear')}
                  onBlur={() => setFocusedFilter(null)}
                  style={getCompactFilterStyle(focusedFilter === 'varietyYear' || varietyYear !== '')}
                >
                  <option value="">All Years</option>
                  {years.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
                <select
                  value={varietySeason}
                  onChange={(e) => setVarietySeason(e.target.value)}
                  onFocus={() => setFocusedFilter('varietySeason')}
                  onBlur={() => setFocusedFilter(null)}
                  style={getCompactFilterStyle(focusedFilter === 'varietySeason' || varietySeason !== '')}
                >
                  <option value="">All Seasons</option>
                  {seasons.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '32px', marginTop: '16px', flexWrap: 'wrap' }}>
              <div style={{ flex: '0 0 auto', maxWidth: '260px' }}>
                <ResponsiveContainer width={260} height={280}>
                  <PieChart>
                    <Pie
                      data={varietyData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={false}
                      outerRadius={80}
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
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '220px' }}>
                {varietyData.map((item, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '10px'
                  }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '3px',
                      background: item.color,
                      flexShrink: 0
                    }} />
                    <span style={{
                      fontSize: '13px',
                      fontWeight: 500,
                      color: '#374151',
                      flex: 1
                    }}>
                      {item.name}
                    </span>
                    <span style={{
                      fontSize: '13px',
                      fontWeight: 700,
                      color: '#111827',
                      marginLeft: 'auto'
                    }}>
                      {item.value}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Top Performers */}
      <div style={{
        background: 'white',
        border: '1px solid #E5E7EB',
        borderRadius: '14px',
        padding: '20px 24px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Trophy style={{ color: '#B45309', width: '18px', height: '18px' }} />
            Top Performing Farmers
          </h3>
          {topPerformers.length > 5 && (
            <button
              type="button"
              onClick={() => setShowAllPerformers((prev) => !prev)}
              style={{
                background: 'white',
                border: '1px solid #16A34A',
                color: '#16A34A',
                borderRadius: '8px',
                padding: '6px 14px',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = '#F0FDF4';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = 'white';
              }}
            >
              {showAllPerformers ? 'View Less' : 'View More'}
            </button>
          )}
        </div>
        <div className="overflow-x-auto relative">
          <table className="w-full" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead style={{ background: '#F9FAFB' }}>
              <tr>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '2px solid #E5E7EB' }}>Rank</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '2px solid #E5E7EB' }}>Farmer</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '2px solid #E5E7EB' }}>District</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '2px solid #E5E7EB' }}>Total Yield</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '2px solid #E5E7EB' }}>Avg Yield/Acre</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '2px solid #E5E7EB' }}>Points</th>
              </tr>
            </thead>
            <tbody>
              {topPerformers.slice(0, showAllPerformers ? 10 : 5).map((farmer, idx) => (
                <tr
                  key={farmer.rank}
                  style={{
                    background: idx % 2 === 0 ? '#FFFFFF' : '#F9FAFB',
                    borderLeft: '3px solid transparent',
                    transition: 'all 0.15s ease',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLTableRowElement).style.background = '#F0FDF4';
                    (e.currentTarget as HTMLTableRowElement).style.borderLeft = '3px solid #16A34A';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLTableRowElement).style.background = idx % 2 === 0 ? '#FFFFFF' : '#F9FAFB';
                    (e.currentTarget as HTMLTableRowElement).style.borderLeft = '3px solid transparent';
                  }}
                  onClick={() => handleSelectPerformer(farmer)}
                >
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '13px',
                      fontWeight: 700,
                      ...getRankBadgeStyle(farmer.rank)
                    }}>
                      {farmer.rank}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: 500, color: '#1F2937' }}>{farmer.name}</td>
                  <td style={{ padding: '12px 16px', fontSize: '14px', color: '#374151' }}>{farmer.district}</td>
                  <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: 500, color: '#1F2937' }}>{farmer.yield} tons</td>
                  <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: 500, color: '#1F2937' }}>{farmer.avgYield} kg</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '14px', ...getPointsTextStyle(Math.round(farmer.points)) }}>
                      <Star style={{ width: '12px', height: '12px' }} />
                      {Math.round(farmer.points)}
                    </span>
                  </td>
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

      {/* PDF-specific content (hidden, only used for PDF generation) */}
      <div ref={pdfContentRef} style={{ display: 'none', backgroundColor: '#ffffff', padding: '40px', width: '210mm' }}>
        {/* PAGE 1: Two Cards + Yield by Season + Crop Variety Distribution */}
        {/* Two Cards Row - Reduced Size */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
          {/* Left Card: Applied Filters */}
          <div style={{ border: '2px solid #16a34a', borderRadius: '10px', padding: '12px', backgroundColor: '#f0fdf4' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#15803d', marginBottom: '10px', borderBottom: '2px solid #16a34a', paddingBottom: '6px' }}>
              Applied Filters
            </h3>
            <div style={{ fontSize: '14px', color: '#374151', lineHeight: '1.8' }}>
              <div style={{ marginBottom: '8px' }}>
                <strong style={{ color: '#15803d' }}>Year:</strong> {selectedYear || 'All Years'}
              </div>
              <div style={{ marginBottom: '8px' }}>
                <strong style={{ color: '#15803d' }}>Season:</strong> {selectedSeason || 'All Seasons'}
              </div>
              <div>
                <strong style={{ color: '#15803d' }}>Crop:</strong> {selectedCrop || 'All Crops'}
              </div>
            </div>
          </div>

          {/* Right Card: Statistics */}
          <div style={{ border: '2px solid #16a34a', borderRadius: '10px', padding: '12px', backgroundColor: '#f0fdf4' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#15803d', marginBottom: '10px', borderBottom: '2px solid #16a34a', paddingBottom: '6px' }}>
              Summary Statistics
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px', color: '#374151' }}>
              <div>
                <strong style={{ color: '#15803d' }}>Active Farmers:</strong>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827', marginTop: '2px' }}>
                  {formattedTotalFarmers}
                </div>
              </div>
              <div>
                <strong style={{ color: '#15803d' }}>Active Plots:</strong>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827', marginTop: '2px' }}>
                  {formattedActivePlots}
                </div>
              </div>
              <div>
                <strong style={{ color: '#15803d' }}>Active Farmland:</strong>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827', marginTop: '2px' }}>
                  {formattedActiveFarmland} acres
                </div>
              </div>
              <div>
                <strong style={{ color: '#15803d' }}>Total Harvest:</strong>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827', marginTop: '2px' }}>
                  {formattedTotalHarvest} tons
                </div>
              </div>
              <div>
                <strong style={{ color: '#15803d' }}>Avg Yield/Acre:</strong>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827', marginTop: '2px' }}>
                  {formattedAvgYield} kg
                </div>
              </div>
              <div>
                <strong style={{ color: '#15803d' }}>Total Points:</strong>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827', marginTop: '2px' }}>
                  {formattedTotalPoints}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Season Comparison Chart */}
        <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '15px', backgroundColor: '#ffffff', marginBottom: '20px' }}>
          <h4 style={{ fontSize: '15px', fontWeight: '600', color: '#374151', marginBottom: '10px' }}>
            Yield by Season {selectedCrop && `- ${selectedCrop}`}
          </h4>
          <ResponsiveContainer width="100%" height={280}>
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

        {/* Crop Variety Distribution */}
        <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '15px', backgroundColor: '#ffffff', marginBottom: '150px' }}>
          <h4 style={{ fontSize: '15px', fontWeight: '600', color: '#374151', marginBottom: '10px' }}>
            Crop Variety Distribution
          </h4>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={varietyData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.value}%`}
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

        {/* PAGE 2: Farmer Participation Growth + Yield by District */}
        {/* Farmer Growth Chart */}
        <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '20px', backgroundColor: '#ffffff', marginBottom: '30px' }}>
          <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>
            Farmer Participation Growth
          </h4>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={farmerTimelineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="season" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip
                labelFormatter={(label: any) => `Season: ${label}`}
                formatter={(value: any) => [`${value}`, 'Farmers']}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="farmers"
                stroke="#15803D"
                strokeWidth={2}
                dot={{ r: 6 }}
                activeDot={{ r: 6 }}
                name="Active Farmers"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Yield by District Chart */}
        <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '20px', backgroundColor: '#ffffff', marginBottom: '150px' }}>
          <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>
            Yield by District
          </h4>
          <ResponsiveContainer width="100%" height={350}>
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

        {/* PAGE 3: Top 10 Performing Farmers */}
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#15803d', marginBottom: '16px' }}>
            Top 10 Performing Farmers
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e5e7eb' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #16a34a' }}>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151', borderRight: '1px solid #e5e7eb' }}>
                  Rank
                </th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151', borderRight: '1px solid #e5e7eb' }}>
                  Farmer Name
                </th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151', borderRight: '1px solid #e5e7eb' }}>
                  District
                </th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151', borderRight: '1px solid #e5e7eb' }}>
                  Total Yield
                </th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151', borderRight: '1px solid #e5e7eb' }}>
                  Avg Yield/Acre
                </th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151' }}>
                  Points
                </th>
              </tr>
            </thead>
            <tbody>
              {topPerformers.slice(0, 10).map((farmer, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9fafb' }}>
                  <td style={{ padding: '10px', fontSize: '14px', color: '#374151', borderRight: '1px solid #e5e7eb' }}>
                    <span style={{ 
                      display: 'inline-block', 
                      width: '28px', 
                      height: '28px', 
                      borderRadius: '50%', 
                      textAlign: 'center', 
                      lineHeight: '28px',
                      fontWeight: 'bold',
                      backgroundColor: farmer.rank === 1 ? '#fef08a' : farmer.rank === 2 ? '#e5e7eb' : farmer.rank === 3 ? '#fed7aa' : '#f3f4f6',
                      color: farmer.rank === 1 ? '#713f12' : farmer.rank === 2 ? '#374151' : farmer.rank === 3 ? '#9a3412' : '#6b7280'
                    }}>
                      {farmer.rank}
                    </span>
                  </td>
                  <td style={{ padding: '10px', fontSize: '14px', fontWeight: '500', color: '#111827', borderRight: '1px solid #e5e7eb' }}>
                    {farmer.name}
                  </td>
                  <td style={{ padding: '10px', fontSize: '14px', color: '#374151', borderRight: '1px solid #e5e7eb' }}>
                    {farmer.district || 'N/A'}
                  </td>
                  <td style={{ padding: '10px', fontSize: '14px', fontWeight: '500', color: '#111827', borderRight: '1px solid #e5e7eb' }}>
                    {farmer.yield} tons
                  </td>
                  <td style={{ padding: '10px', fontSize: '14px', fontWeight: '500', color: '#111827', borderRight: '1px solid #e5e7eb' }}>
                    {farmer.avgYield} kg
                  </td>
                  <td style={{ padding: '10px', fontSize: '14px', fontWeight: '600', color: '#16a34a' }}>
                    {Math.round(farmer.points)}
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
