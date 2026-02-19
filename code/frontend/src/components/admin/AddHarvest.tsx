import { useState } from 'react';
import { Search, Calendar, Wheat, TrendingUp, Save, ChevronDown } from 'lucide-react';

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Calculate points based on yield per acre
    const yieldInTons = parseFloat(formData.harvestQuantity) / 1000; // Convert kg to tons
    const pointsPerAcre = formData.harvestQuantity && formData.acres 
      ? Math.round((yieldInTons / parseFloat(formData.acres)) * 50)
      : 0;
    alert(`Harvest recorded successfully! Farmer earned ${pointsPerAcre} points per acre.`);
  };

  const years = ['2024/25', '2025/26', '2026/27', '2027/28'];
  const seasons = ['Maha', 'Yala'];
  
  const farmers = [
    { id: 'F001', name: 'Ahmed Hassan', nic: '198512345V', acres: '10' },
    { id: 'F002', name: 'Priya Fernando', nic: '199023456V', acres: '7' },
    { id: 'F003', name: 'Ruwan Silva', nic: '198834567V', acres: '15' },
    { id: 'F004', name: 'Nimal Perera', nic: '199245678V', acres: '12' },
    { id: 'F005', name: 'Kamala Dissanayake', nic: '198956789V', acres: '8' },
    { id: 'F006', name: 'Sunil Wickramasinghe', nic: '199167890V', acres: '18' },
  ];

  const filteredFarmers = farmers.filter(farmer => 
    farmer.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    farmer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    farmer.nic.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFarmerSelect = (farmer: typeof farmers[0]) => {
    setFormData({...formData, farmId: farmer.id, farmerName: farmer.name, acres: farmer.acres});
    setIsFarmIdOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      {/* Header */}
      <div>
        
        <p className="text-sm md:text-base text-gray-600">Record harvest data and calculate farmer points</p>
      </div>

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
                            setFormData({...formData, year});
                            setIsYearOpen(false);
                          }}
                          className={`w-full px-4 py-3 text-left hover:bg-green-50 transition-colors ${
                            formData.year === year ? 'bg-green-100 text-green-700 font-medium' : 'text-gray-800'
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
                            setFormData({...formData, season});
                            setIsSeasonOpen(false);
                          }}
                          className={`w-full px-4 py-3 text-left hover:bg-green-50 transition-colors ${
                            formData.season === season ? 'bg-green-100 text-green-700 font-medium' : 'text-gray-800'
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
                        {filteredFarmers.length > 0 ? (
                          filteredFarmers.map((farmer) => (
                            <button
                              key={farmer.id}
                              type="button"
                              onClick={() => handleFarmerSelect(farmer)}
                              className={`w-full px-4 py-3 text-left hover:bg-green-50 transition-colors border-b border-gray-100 last:border-0 ${
                                formData.farmId === farmer.id ? 'bg-green-100 text-green-700' : 'text-gray-800'
                              }`}
                            >
                              <div className="font-medium">{farmer.id} - {farmer.name}</div>
                              <div className="text-xs text-gray-600">{farmer.nic}</div>
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-sm text-gray-500">No farmers found</div>
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
                    onChange={(e) => setFormData({...formData, harvestQuantity: e.target.value})}
                    placeholder="e.g., 4500"
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Points Calculation Preview */}
          {formData.harvestQuantity && formData.acres && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-700 mb-1">Estimated Points</p>
                  <p className="text-2xl font-bold text-green-700">
                    {Math.round((parseFloat(formData.harvestQuantity) / 1000 / parseFloat(formData.acres)) * 50)} points
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    ({(parseFloat(formData.harvestQuantity) / 1000 / parseFloat(formData.acres)).toFixed(2)} tons per acre × 50)
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-700">Yield per Acre</p>
                  <p className="text-xl font-semibold text-gray-800">
                    {(parseFloat(formData.harvestQuantity) / 1000 / parseFloat(formData.acres)).toFixed(2)} tons
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Total: {(parseFloat(formData.harvestQuantity) / 1000).toFixed(2)} tons
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Additional Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Any additional observations or notes..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4 border-t border-gray-200">
            <button
              type="submit"
              className="flex-1 py-3 bg-green-700 hover:bg-green-800 text-white font-medium rounded-lg flex items-center justify-center gap-2 transition-all"
            >
              <Save className="w-5 h-5" />
              Record Harvest & Award Points
            </button>
            <button
              type="button"
              className="px-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}