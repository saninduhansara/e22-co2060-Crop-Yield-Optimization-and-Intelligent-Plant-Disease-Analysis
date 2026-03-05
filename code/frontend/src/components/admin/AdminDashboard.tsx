import { Users, TrendingUp, Wheat, AlertTriangle, BarChart3, MapPin, Layers, Scale, Link2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { farmAPI, userAPI } from '../../services/api';
import { FarmerProfile } from './FarmerProfile';

export function AdminDashboard() {
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

  const [totalFarmers, setTotalFarmers] = useState(0);
  const [totalHarvest, setTotalHarvest] = useState(0);
  const [activeFarms, setActiveFarms] = useState(0);
  const [totalFarmland, setTotalFarmland] = useState(0);
  const [farmersLastMonthPercentage, setFarmersLastMonthPercentage] = useState(0);
  const [harvestLastSeasonText, setHarvestLastSeasonText] = useState('0.0% from last season');
  const [yieldLastSeasonText, setYieldLastSeasonText] = useState('0.0% from last season');
  const [loading, setLoading] = useState(true);
  const [recentFarmers, setRecentFarmers] = useState<any[]>([]);
  const [recentHarvests, setRecentHarvests] = useState<any[]>([]);
  const [farmsForProfile, setFarmsForProfile] = useState<any[]>([]);
  const [selectedFarmerProfile, setSelectedFarmerProfile] = useState<any | null>(null);
  const [selectedCrop, setSelectedCrop] = useState<string | null>(null);
  const [availableCrops, setAvailableCrops] = useState<string[]>([]);
  const [showMoreFarmers, setShowMoreFarmers] = useState(false);
  const [showMoreHarvests, setShowMoreHarvests] = useState(false);

  useEffect(() => {
    fetchCrops();
  }, []);

  useEffect(() => {
    if (availableCrops.length > 0 || selectedCrop === null) {
      fetchDashboardData();
    }
  }, [selectedCrop, availableCrops.length]);

  const fetchCrops = async () => {
    try {
      const data = await farmAPI.getAllCrops();
      setAvailableCrops(data.crops || []);
      // Set the first crop as default if no crop is selected
      if (!selectedCrop && (data.crops || []).length > 0) {
        setSelectedCrop(null); // Show all crops by default
      }
    } catch (error) {
      console.error('Error fetching crops:', error);
      setAvailableCrops([]);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch farms data for farmer count and active farms
      const farmsData = await farmAPI.getAllFarms();
      let farms = farmsData.farms || [];
      
      // Filter by selected crop if one is selected (case-insensitive)
      if (selectedCrop) {
        farms = farms.filter((farm: any) => {
          const farmCrop = (farm.crop || '').trim().toLowerCase();
          const selectedCropNormalized = selectedCrop.trim().toLowerCase();
          return farmCrop === selectedCropNormalized;
        });
      }

      setFarmsForProfile(farms);
      
      const uniqueFarmers = new Set(farms.map((farm: any) => farm.farmerNIC));
      setTotalFarmers(uniqueFarmers.size);

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const farmers30DaysAgo = new Set(
        farms
          .filter((farm: any) => {
            if (!farm.farmerNIC) return false;
            if (!farm.createdDate) return true;

            const createdDate = new Date(farm.createdDate);
            if (isNaN(createdDate.getTime())) return true;

            return createdDate <= thirtyDaysAgo;
          })
          .map((farm: any) => farm.farmerNIC)
      ).size;

      const calculatedPercentage =
        farmers30DaysAgo === 0
          ? uniqueFarmers.size > 0
            ? 100
            : 0
          : (uniqueFarmers.size / farmers30DaysAgo) * 100;

      setFarmersLastMonthPercentage(calculatedPercentage);
      
      // Calculate active farms (status === 'Active')
      const activeFarmsCount = farms.filter((farm: any) => 
        farm.status && farm.status.toLowerCase() === 'active'
      ).length;
      setActiveFarms(activeFarmsCount);
      
      // Calculate total farmland in acres
      const totalAcres = farms.reduce((sum: number, farm: any) => {
        return sum + (farm.farmSize || farm.sizeInAcres || 0);
      }, 0);
      setTotalFarmland(totalAcres);
      
      // Fetch harvest data for total harvest
      const harvestData = await farmAPI.getHarvestHistory();
      let harvests = harvestData.harvests || [];
      
      // Filter by selected crop if one is selected (case-insensitive)
      if (selectedCrop) {
        harvests = harvests.filter((harvest: any) => {
          const harvestCrop = (harvest.crop || '').trim().toLowerCase();
          const selectedCropNormalized = selectedCrop.trim().toLowerCase();
          return harvestCrop === selectedCropNormalized;
        });
      }
      
      const totalHarvestQty = harvests.reduce((sum: number, harvest: any) => {
        return sum + (harvest.harvestQty || 0);
      }, 0);
      setTotalHarvest(totalHarvestQty);

      const seasonOrder: Record<string, number> = {
        yala: 1,
        maha: 2,
      };

      const parseHarvestQty = (value: any): number => {
        if (typeof value === 'number') {
          return Number.isFinite(value) ? value : 0;
        }

        if (typeof value === 'string') {
          const normalized = value.replace(/,/g, '').replace(/[^\d.-]/g, '');
          const parsed = Number(normalized);
          return Number.isFinite(parsed) ? parsed : 0;
        }

        return 0;
      };

      const normalizeSeason = (value: any): string => {
        const seasonRaw = (value || '').toString().trim().toLowerCase();
        if (seasonRaw.includes('maha')) return 'maha';
        if (seasonRaw.includes('yala')) return 'yala';
        return seasonRaw;
      };

      const seasonMap = new Map<string, number>();
      const seasonAcresMap = new Map<string, number>();
      harvests.forEach((harvest: any) => {
        const seasonName = normalizeSeason(harvest.season);
        const seasonYear = Number(harvest.year);
        const quantity = parseHarvestQty(harvest.harvestQty);
        const acres = parseHarvestQty(harvest.acres);

        if (!seasonName || Number.isNaN(seasonYear)) return;

        const key = `${seasonYear}|${seasonName}`;
        seasonMap.set(key, (seasonMap.get(key) || 0) + quantity);
        seasonAcresMap.set(key, (seasonAcresMap.get(key) || 0) + acres);
      });

      const orderedSeasons = Array.from(seasonMap.entries()).sort(([a], [b]) => {
        const [yearA, seasonA] = a.split('|');
        const [yearB, seasonB] = b.split('|');

        const yearDiff = Number(yearB) - Number(yearA);
        if (yearDiff !== 0) return yearDiff;

        const seasonAOrder = seasonOrder[(seasonA || '').toLowerCase()] || 0;
        const seasonBOrder = seasonOrder[(seasonB || '').toLowerCase()] || 0;
        return seasonBOrder - seasonAOrder;
      });

      const thisSeasonTotal = orderedSeasons[0]?.[1] || 0;
      const lastSeasonTotal = orderedSeasons[1]?.[1] || 0;
      const thisSeasonKey = orderedSeasons[0]?.[0] || '';
      const lastSeasonKey = orderedSeasons[1]?.[0] || '';
      const thisSeasonAcres = seasonAcresMap.get(thisSeasonKey) || 0;
      const lastSeasonAcres = seasonAcresMap.get(lastSeasonKey) || 0;

      let harvestSeasonText = 'N/A from last season';
      if (orderedSeasons.length < 2) {
        harvestSeasonText = 'N/A from last season';
      } else if (lastSeasonTotal <= 0.0001) {
        harvestSeasonText = thisSeasonTotal > 0 ? 'N/A from last season' : '0.0% from last season';
      } else {
        const harvestPercentage = (thisSeasonTotal / lastSeasonTotal) * 100;
        const cappedPercentage = Math.min(harvestPercentage, 9999.9);
        harvestSeasonText = `${cappedPercentage.toFixed(1)}% from last season`;
      }

      setHarvestLastSeasonText(harvestSeasonText);

      let yieldSeasonText = 'N/A from last season';
      if (orderedSeasons.length < 2) {
        yieldSeasonText = 'N/A from last season';
      } else if (thisSeasonAcres <= 0.0001 || lastSeasonAcres <= 0.0001) {
        yieldSeasonText = 'N/A from last season';
      } else {
        const thisSeasonYieldPerAcre = thisSeasonTotal / thisSeasonAcres;
        const lastSeasonYieldPerAcre = lastSeasonTotal / lastSeasonAcres;

        if (lastSeasonYieldPerAcre <= 0.0001) {
          yieldSeasonText = 'N/A from last season';
        } else {
          const yieldPercentage = (thisSeasonYieldPerAcre / lastSeasonYieldPerAcre) * 100;
          const cappedYieldPercentage = Math.min(yieldPercentage, 9999.9);
          yieldSeasonText = `${cappedYieldPercentage.toFixed(1)}% from last season`;
        }
      }

      setYieldLastSeasonText(yieldSeasonText);

      // Get recent farmers from the filtered farms data
      // Extract unique farmers and sort by farm creation date
      const farmerMap = new Map();
      farms.forEach((farm: any) => {
        const farmerKey = farm.farmerNIC;
        if (farmerKey && farm.farmerName && !farmerMap.has(farmerKey)) {
          const nameParts = farm.farmerName.trim().split(' ');
          farmerMap.set(farmerKey, {
            _id: farmerKey,
            name: farm.farmerName,
            firstName: nameParts[0] || 'Unknown',
            lastName: nameParts[1] || '',
            location: farm.district || farm.division || 'Unknown',
            district: farm.district,
            division: farm.division,
            date: farm.createdDate || new Date(),
            image: farm.farmerImage,
            nic: farm.farmerNIC,
            status: 'Active'
          });
        }
      });

      // Convert map to array and sort by date (most recent first)
      const recentFarmersArray = Array.from(farmerMap.values())
        .sort((a: any, b: any) => {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          return dateB - dateA;
        })
        .slice(0, 10);

      setRecentFarmers(recentFarmersArray);

      // Store harvests for recent harvests section (using first 10)
      if (harvests.length > 0) {
        setRecentHarvests(harvests.slice(0, 10));
      } else {
        setRecentHarvests([]);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setTotalFarmers(0);
      setTotalHarvest(0);
      setActiveFarms(0);
      setTotalFarmland(0);
      setFarmersLastMonthPercentage(0);
      setHarvestLastSeasonText('0.0% from last season');
      setYieldLastSeasonText('0.0% from last season');
      setRecentFarmers([]);
      setRecentHarvests([]);
      setFarmsForProfile([]);
    } finally {
      setLoading(false);
    }
  };

  const toFarmerProfileData = (farm: any) => ({
    farmId: farm.farmId || farm._id || 'N/A',
    farmName: farm.farmName || 'Unknown Farm',
    farmerName: farm.farmerName || 'Unknown',
    farmerNIC: farm.farmerNIC || 'N/A',
    phone: farm.phone || 'N/A',
    division: farm.division || 'Unknown',
    district: farm.district || 'Unknown',
    farmSize: farm.farmSize || farm.sizeInAcres || 0,
    crop: farm.crop || 'Unknown',
    status: farm.status || 'active',
    points: farm.points || 0,
    farmerImage: farm.farmerImage,
  });

  const openFarmerProfileByNic = (nic: string) => {
    const matchedFarm = farmsForProfile.find((farm) => farm.farmerNIC === nic);
    if (matchedFarm) {
      setSelectedFarmerProfile(toFarmerProfileData(matchedFarm));
    }
  };

  const openFarmerProfileByName = (farmerName: string) => {
    const normalizedName = (farmerName || '').trim().toLowerCase();
    const matchedFarm = farmsForProfile.find(
      (farm) => (farm.farmerName || '').trim().toLowerCase() === normalizedName
    );
    if (matchedFarm) {
      setSelectedFarmerProfile(toFarmerProfileData(matchedFarm));
    }
  };

  // Format number based on magnitude
  const formatNumber = (num: number): string => {
    if (num < 10000) {
      // Display with one decimal place if necessary
      return num % 1 === 0 ? num.toString() : num.toFixed(1);
    } else if (num < 1000000) {
      // Round to nearest 100, divide by 1000, show with K
      const rounded = Math.round(num / 100) * 100;
      const inK = rounded / 1000;
      return inK % 1 === 0 ? `${inK}K` : `${inK.toFixed(1)}K`;
    } else {
      // Round to nearest lakh (100,000), divide by 1,000,000, show with M
      const rounded = Math.round(num / 100000) * 100000;
      const inM = rounded / 1000000;
      return inM % 1 === 0 ? `${inM}M` : `${inM.toFixed(1)}M`;
    }
  };

  // Helper functions to determine font size based on formatted string length
  const getFontSizeForFormatted = (formattedStr: string): string => {
    const length = formattedStr.length;
    
    if (length <= 4) return 'text-3xl md:text-4xl'; // e.g., "123" or "9.5K"
    if (length <= 6) return 'text-2xl md:text-3xl'; // e.g., "123.4K"
    if (length <= 8) return 'text-xl md:text-2xl';  // e.g., "123.4M"
    return 'text-lg md:text-xl';
  };

  // Format date to be more readable
  const formatDate = (dateString: string | Date | undefined): string => {
    if (!dateString) {
      return 'Unknown';
    }
    
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    
    if (isNaN(date.getTime())) {
      return 'Unknown';
    }
    
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());

    if (dateOnly.getTime() === todayOnly.getTime()) {
      return 'Today';
    } else if (dateOnly.getTime() === yesterdayOnly.getTime()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  // Calculate yield per acre
  const getYieldPerAcre = () => {
    if (totalFarmland === 0) return 0;
    return totalHarvest / totalFarmland;
  };

  // Get formatted values
  const formattedFarmers = formatNumber(totalFarmers);
  const formattedHarvest = formatNumber(totalHarvest / 1000);
  const formattedActiveFarms = formatNumber(activeFarms);
  const formattedFarmland = formatNumber(totalFarmland);
  const formattedYield = formatNumber(getYieldPerAcre() / 1000);
  const cropOptions = Array.from(new Set([...defaultCropOptions, ...availableCrops]));
  const visibleRecentFarmers = recentFarmers.slice(0, showMoreFarmers ? 10 : 5);
  const visibleRecentHarvests = recentHarvests.slice(0, showMoreHarvests ? 10 : 4);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <p className="text-sm md:text-base text-gray-600">Monitor and manage all farming activities</p>
        </div>
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
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-5 lg:gap-6">
        {/* Total Farmers Card */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-5 sm:p-6 shadow-md border-l-4 border-l-green-500 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:cursor-pointer group">
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">Total Farmers</p>
              <Users className="w-5 h-5 text-green-600 opacity-70 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-3xl sm:text-2xl lg:text-3xl font-bold text-gray-900 my-2 break-words min-w-0">
              {loading ? '...' : formattedFarmers}
            </p>
            <p className="text-xs sm:text-sm text-green-700 flex items-center gap-1 mt-2">
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
              {loading ? '...' : `${farmersLastMonthPercentage.toFixed(1)}% from last month`}
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
                {loading ? '...' : formattedHarvest}
              </p>
              <span className="text-xs sm:text-sm font-medium text-gray-600 break-words">tons</span>
            </div>
            <p className="text-xs sm:text-sm text-green-700 flex items-center gap-1 mt-2">
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
              {loading ? '...' : harvestLastSeasonText}
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
              {loading ? '...' : formattedActiveFarms}
            </p>
            <p className="text-xs sm:text-sm text-gray-600 mt-2">Across all regions</p>
          </div>
        </div>

        {/* Total Farmland Card */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-5 sm:p-6 shadow-md border-l-4 border-l-green-500 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:cursor-pointer group">
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">Total Farmland</p>
              <Layers className="w-5 h-5 text-green-600 opacity-70 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="flex min-w-0 flex-wrap items-baseline gap-1 sm:gap-2 my-2">
              <p className="text-3xl sm:text-2xl lg:text-3xl font-bold text-gray-900 break-words min-w-0">
                {loading ? '...' : formattedFarmland}
              </p>
              <span className="text-xs sm:text-sm font-medium text-gray-600 break-words">acres</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 mt-2">Under cultivation</p>
          </div>
        </div>

        {/* Yield Per Acre Card */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-5 sm:p-6 shadow-md border-l-4 border-l-green-500 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:cursor-pointer group">
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">Yield per Acre</p>
              <TrendingUp className="w-5 h-5 text-green-600 opacity-70 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="flex min-w-0 flex-wrap items-baseline gap-1 sm:gap-2 my-2">
              <p className="text-3xl sm:text-2xl lg:text-3xl font-bold text-gray-900 break-words min-w-0">
                {loading ? '...' : formattedYield}
              </p>
              <span className="text-xs sm:text-sm font-medium text-gray-600 break-words">tons</span>
            </div>
            <p className="text-xs sm:text-sm text-green-700 flex items-center gap-1 mt-2">
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
              {loading ? '...' : yieldLastSeasonText}
            </p>
          </div>
        </div>

        {/* Disease Reports Card */}
        <div className="bg-gradient-to-br from-red-50 to-orange-100 rounded-2xl p-5 sm:p-6 shadow-md border-l-4 border-l-red-500 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:cursor-pointer group">
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">Disease Reports</p>
              <AlertTriangle className="w-5 h-5 text-red-600 opacity-70 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-3xl sm:text-2xl lg:text-3xl font-bold text-gray-900 my-2 break-words min-w-0">23</p>
            <p className="text-xs sm:text-sm text-red-700 mt-2 font-medium">Requires attention</p>
          </div>
        </div>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Farmers */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-4 md:p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-base md:text-lg font-semibold text-gray-800">Recent Farmers</h3>
            <button
              type="button"
              onClick={() => setShowMoreFarmers((prev) => !prev)}
              className="text-green-600 hover:text-green-700 text-xs font-medium flex items-center gap-1"
            >
              {showMoreFarmers ? 'View Less' : 'View More'}
              <Link2 className="w-3 h-3" />
            </button>
          </div>
          <div className="divide-y divide-gray-100">
            {loading ? (
              <div className="flex justify-center py-8 px-4 md:px-6">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
              </div>
            ) : visibleRecentFarmers.length > 0 ? (
              visibleRecentFarmers.map((farmer, index) => (
                <div
                  key={index}
                  className="px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer flex items-center justify-between"
                  onClick={() => openFarmerProfileByNic(farmer.nic)}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 bg-green-100 text-green-700 font-bold rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm">
                        {farmer.firstName.charAt(0)}{farmer.lastName.charAt(0)}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-800 text-sm truncate">{farmer.name}</p>
                      <p className="text-xs text-gray-400 truncate flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {farmer.location} • {formatDate(farmer.date)}
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ml-2 bg-green-100 text-green-700">
                    Active
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 px-4 md:px-6 text-gray-500">
                <p className="text-sm">No farmers found</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Harvests */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-4 md:p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-base md:text-lg font-semibold text-gray-800">Recent Harvests</h3>
            <button
              type="button"
              onClick={() => setShowMoreHarvests((prev) => !prev)}
              className="text-green-600 hover:text-green-700 text-xs font-medium flex items-center gap-1"
            >
              {showMoreHarvests ? 'View Less' : 'View More'}
              <Link2 className="w-3 h-3" />
            </button>
          </div>
          <div className="divide-y divide-gray-100">
            {loading ? (
              <div className="flex justify-center py-8 px-4 md:px-6">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
              </div>
            ) : visibleRecentHarvests.length > 0 ? (
              visibleRecentHarvests.map((harvest, index) => {
                // Determine crop badge color
                const cropName = (harvest.crop || '').toLowerCase();
                let cropBgColor = 'bg-blue-100';
                let cropTextColor = 'text-blue-700';
                
                if (cropName.includes('paddy') || cropName.includes('rice')) {
                  cropBgColor = 'bg-yellow-100';
                  cropTextColor = 'text-yellow-700';
                } else if (cropName.includes('green gram') || cropName.includes('mung')) {
                  cropBgColor = 'bg-green-100';
                  cropTextColor = 'text-green-700';
                }
                
                return (
                  <div
                    key={index}
                    className="px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer flex items-start justify-between"
                    onClick={() => openFarmerProfileByName(harvest.farmerName)}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-800 text-sm truncate">{harvest.farmerName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cropBgColor} ${cropTextColor}`}>
                          {harvest.crop}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{formatDate(harvest.harvestDate)}</p>
                    </div>
                    <div className="flex items-center gap-1 font-bold text-sm text-green-700 whitespace-nowrap ml-2 flex-shrink-0">
                      {harvest.harvestQty} kg
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 px-4 md:px-6 text-gray-500">
                <p className="text-sm">No harvests found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedFarmerProfile && (
        <FarmerProfile
          farm={selectedFarmerProfile}
          onClose={() => setSelectedFarmerProfile(null)}
        />
      )}
    </div>
  );
}