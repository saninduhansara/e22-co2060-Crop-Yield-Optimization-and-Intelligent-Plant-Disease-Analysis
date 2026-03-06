import { useState, useEffect } from 'react';
import { Search, Calendar, Wheat, TrendingUp, Save, ChevronDown, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import { farmAPI } from '../../services/api';
import { toast } from 'sonner';

interface Farm {
  farmId: string;
  farmName: string;
  farmerName: string;
  farmerNIC: string;
  farmSize: number;
  crop: string;
  district: string;
}

interface HarvestResult {
  farmYield: number;
  averageYield: number;
  maxYieldAcrossDistricts: number;
  pointsEarned: number;
}

export function AddHarvest() {
  const [formData, setFormData] = useState({
    year: '',
    season: '',
    farmId: '',
    farmerName: '',
    harvestQuantity: '',
    acres: '',
    notes: '',
  });

  const [isYearOpen, setIsYearOpen] = useState(false);
  const [isSeasonOpen, setIsSeasonOpen] = useState(false);
  const [isFarmIdOpen, setIsFarmIdOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [farms, setFarms] = useState([] as Farm[]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null as string | null);
  const [result, setResult] = useState(null as HarvestResult | null);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    fetchFarms();
  }, []);

  const fetchFarms = async () => {
    try {
      setLoading(true);
      const data = await farmAPI.getAllFarms();
      setFarms(data.farms || []);
    } catch (err: any) {
      console.error('Error fetching farms:', err);
      toast.error('Failed to load farms');
      setError('Failed to load farms');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setResult(null);
    setShowResult(false);

    try {
      const response = await farmAPI.addHarvestAndPoints({
        farmId: formData.farmId,
        season: formData.season,
        year: formData.year,
        harvestQty: parseFloat(formData.harvestQuantity),
      });

      setResult({
        farmYield: response.farmYield,
        averageYield: response.averageYield,
        maxYieldAcrossDistricts: response.maxYieldAcrossDistricts,
        pointsEarned: response.pointsEarned,
      });
      setShowResult(true);
      toast.success('Harvest recorded successfully!');

      // Reset form after 5 seconds
      setTimeout(() => {
        setFormData({
          year: '',
          season: '',
          farmId: '',
          farmerName: '',
          harvestQuantity: '',
          acres: '',
          notes: '',
        });
        setShowResult(false);
        setResult(null);
      }, 5000);
    } catch (err: any) {
      const errMessage = err.response?.data?.message || 'Failed to record harvest. Please try again.';
      setError(errMessage);
      toast.error(errMessage);
      console.error('Error recording harvest:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const years = ['2024', '2025', '2026', '2027', '2028'];
  const seasons = ['Maha', 'Yala'];

  const filteredFarmers = farms.filter((farm: Farm) =>
    farm.farmId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    farm.farmerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    farm.farmerNIC.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFarmerSelect = (farm: Farm) => {
    setFormData({ ...formData, farmId: farm.farmId, farmerName: farm.farmerName, acres: farm.farmSize.toString() });
    setIsFarmIdOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      {/* Header */}
      <div>
        <p className="text-sm md:text-base text-gray-600">Record harvest data and calculate farmer points</p>
      </div>

      {/* Success Result Modal */}
      {showResult && result && (
        <div className="bg-green-50 border-2 border-green-500 rounded-xl p-6 shadow-lg">
          <div className="flex items-start gap-4">
            <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-xl font-bold text-green-900 mb-4">Harvest Recorded Successfully!</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <p className="text-sm text-gray-600 mb-1">Farm Yield per Acre</p>
                  <p className="text-2xl font-bold text-gray-900">{result.farmYield.toFixed(2)} kg</p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <p className="text-sm text-gray-600 mb-1">District Average Yield</p>
                  <p className="text-2xl font-bold text-gray-900">{result.averageYield.toFixed(2)} kg</p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <p className="text-sm text-gray-600 mb-1">Maximum Yield (All Districts)</p>
                  <p className="text-2xl font-bold text-gray-900">{result.maxYieldAcrossDistricts.toFixed(2)} kg</p>
                </div>
                <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-lg p-4 border-2 border-green-400">
                  <p className="text-sm text-green-800 mb-1 font-semibold">Points Earned</p>
                  <p className="text-3xl font-bold text-green-900">{Math.round(result.pointsEarned)} pts</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Add Harvest Form */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-6">
          {/* Primary Information */}
          <div>
            <h4 className="text-sm md:text-md font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Primary Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Year Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year *
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsYearOpen(!isYearOpen)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-left flex items-center justify-between hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <span className={formData.year ? 'text-gray-800' : 'text-gray-400'}>
                      {formData.year || 'Select Year'}
                    </span>
                    <ChevronDown className={`w-5 h-5 text-gray-600 transition-transform ${isYearOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isYearOpen && (
                    <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                      {years.map((year) => (
                        <button
                          key={year}
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, year });
                            setIsYearOpen(false);
                          }}
                          className={`w-full px-4 py-3 text-left hover:bg-green-50 transition-colors ${formData.year === year ? 'bg-green-100 text-green-700 font-medium' : 'text-gray-800'
                            }`}
                        >
                          {year}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Harvest Season Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Harvest Season *
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsSeasonOpen(!isSeasonOpen)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-left flex items-center justify-between hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <span className={formData.season ? 'text-gray-800' : 'text-gray-400'}>
                      {formData.season || 'Select Season'}
                    </span>
                    <ChevronDown className={`w-5 h-5 text-gray-600 transition-transform ${isSeasonOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isSeasonOpen && (
                    <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                      {seasons.map((season) => (
                        <button
                          key={season}
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, season });
                            setIsSeasonOpen(false);
                          }}
                          className={`w-full px-4 py-3 text-left hover:bg-green-50 transition-colors ${formData.season === season ? 'bg-green-100 text-green-700 font-medium' : 'text-gray-800'
                            }`}
                        >
                          {season}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Farm ID Searchable Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Farm ID *
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsFarmIdOpen(!isFarmIdOpen)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-left flex items-center justify-between hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <span className={formData.farmId ? 'text-gray-800' : 'text-gray-400'}>
                      {formData.farmId || 'Select Farm ID'}
                    </span>
                    <ChevronDown className={`w-5 h-5 text-gray-600 transition-transform ${isFarmIdOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isFarmIdOpen && (
                    <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                      {/* Search Input */}
                      <div className="p-2 border-b border-gray-200">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search Farm ID, Name, NIC..."
                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </div>

                      {/* Farmer List */}
                      <div className="max-h-60 overflow-y-auto">
                        {loading ? (
                          <div className="px-4 py-8 text-center">
                            <Loader className="w-5 h-5 animate-spin text-green-600 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">Loading farms...</p>
                          </div>
                        ) : filteredFarmers.length > 0 ? (
                          filteredFarmers.map((farm: Farm) => (
                            <button
                              key={farm.farmId}
                              type="button"
                              onClick={() => handleFarmerSelect(farm)}
                              className={`w-full px-4 py-3 text-left hover:bg-green-50 transition-colors border-b border-gray-100 last:border-0 ${formData.farmId === farm.farmId ? 'bg-green-100 text-green-700' : 'text-gray-800'
                                }`}
                            >
                              <div className="font-medium">{farm.farmId} - {farm.farmerName}</div>
                              <div className="text-xs text-gray-600">{farm.farmerNIC} | {farm.farmSize} acres | {farm.crop}</div>
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-sm text-gray-500">No farms found</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Farmer Name Display */}
            {formData.farmerName && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Selected Farmer:</span> {formData.farmerName} ({formData.farmId}) - {formData.acres} acres
                </p>
              </div>
            )}
          </div>

          {/* Harvest Details */}
          <div>
            <h4 className="text-md font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Harvest Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Harvest Quantity (kg) *
                </label>
                <div className="relative">
                  <Wheat className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    step="0.01"
                    value={formData.harvestQuantity}
                    onChange={(e: any) => setFormData({ ...formData, harvestQuantity: e.target.value })}
                    placeholder="e.g., 4500"
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Total harvest in kilograms for this season
                </p>
              </div>
            </div>
          </div>

          {/* Yield Preview */}
          {formData.harvestQuantity && formData.acres && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-700 mb-1">Yield per Acre</p>
                  <p className="text-2xl font-bold text-blue-700">
                    {(parseFloat(formData.harvestQuantity) / parseFloat(formData.acres)).toFixed(2)} kg/acre
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Total harvest: {parseFloat(formData.harvestQuantity).toFixed(2)} kg
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-700">Farm Size</p>
                  <p className="text-xl font-semibold text-gray-800">
                    {formData.acres} acres
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Points will be calculated based on district average
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={submitting || !formData.farmId || !formData.season || !formData.year || !formData.harvestQuantity}
              className="flex-1 py-3 bg-green-700 hover:bg-green-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg flex items-center justify-center gap-2 transition-all"
            >
              {submitting ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Recording Harvest...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Record Harvest & Award Points
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setFormData({
                  year: '',
                  season: '',
                  farmId: '',
                  farmerName: '',
                  harvestQuantity: '',
                  acres: '',
                  notes: '',
                });
                setError(null);
                setResult(null);
                setShowResult(false);
              }}
              disabled={submitting}
              className="px-8 py-3 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:cursor-not-allowed text-gray-700 font-medium rounded-lg transition-all"
            >
              Clear
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}