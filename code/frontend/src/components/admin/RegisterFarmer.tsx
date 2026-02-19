import { useState } from 'react';
import { User, MapPin, Phone, IdCard, Save, Plus, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import { userAPI, farmAPI } from '../../services/api';

interface FarmData {
  farmName: string;
  crop: string;
  sizeInAcres: number | string;
  location: string;
}

interface FarmerFormData {
  firstName: string;
  lastName: string;
  nic: string;
  address: string;
  district: string;
  division: string;
  phone: string;
  email: string;
  password: string;
}

export function RegisterFarmer() {
  const [step, setStep] = useState(1); // 1: Farmer info, 2: Farm details
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null as string | null);
  const [success, setSuccess] = useState(false);
  
  const [farmerData, setFarmerData] = useState({
    firstName: '',
    lastName: '',
    nic: '',
    address: '',
    district: '',
    division: '',
    phone: '',
    email: '',
    password: '',
  } as FarmerFormData);

  const [farms, setFarms] = useState([
    { farmName: '', crop: '', sizeInAcres: '', location: '' }
  ] as FarmData[]);

  const [registeredFarmerId, setRegisteredFarmerId] = useState(null as string | null);

  const districts = ['Gampaha', 'Kurunegala', 'Anuradhapura', 'Polonnaruwa', 'Ampara', 'Hambantota'];
  const crops = ['Paddy', 'Corn', 'Wheat', 'Tomatoes', 'Onions', 'Carrots', 'Cabbage', 'Potatoes'];

  // Step 1: Register Farmer
  const handleRegisterFarmer = async (e: any) => {
    e.preventDefault();
    
    if (!farmerData.firstName || !farmerData.lastName || !farmerData.email) {
      setError('Please fill in all required farmer information');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Generate a temporary password if not provided
      const password = farmerData.password || `${farmerData.nic.slice(-4)}@2026`;

      const userData = {
        firstName: farmerData.firstName,
        lastName: farmerData.lastName,
        email: farmerData.email,
        password: password,
        phone: farmerData.phone,
        nic: farmerData.nic,
        address: farmerData.address,
        division: farmerData.division,
        district: farmerData.district,
        role: 'farmer' as const,
        isBlocked: false,
      };

      const response = await userAPI.register(userData);
      
      if (response.message === 'User Created Successfully') {
        setRegisteredFarmerId(farmerData.nic);
        setStep(2);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError('Failed to register farmer. Please try again.');
      }
    } catch (err: any) {
      console.error('Error registering farmer:', err);
      setError(err.response?.data?.message || 'Failed to register farmer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Update farm data in array
  const handleFarmChange = (index: number, field: keyof FarmData, value: string | number) => {
    const updatedFarms = [...farms];
    updatedFarms[index] = { ...updatedFarms[index], [field]: value };
    setFarms(updatedFarms);
  };

  // Add another farm
  const addFarm = () => {
    setFarms([...farms, { farmName: '', crop: '', sizeInAcres: '', location: '' }]);
  };

  // Remove farm
  const removeFarm = (index: number) => {
    if (farms.length > 1) {
      setFarms(farms.filter((farm: FarmData, i: number) => i !== index));
    }
  };

  // Submit all farms
  const handleSubmitFarms = async (e: any) => {
    e.preventDefault();

    const validFarms = farms.filter((farm: FarmData) => 
      farm.farmName && farm.crop && farm.sizeInAcres && farm.location
    );

    if (validFarms.length === 0) {
      setError('Please fill in at least one complete farm entry');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      for (const farm of validFarms) {
        await farmAPI.createFarm({
          farmName: farm.farmName,
          crop: farm.crop,
          sizeInAcres: Number(farm.sizeInAcres),
          location: farm.location,
          farmerNIC: registeredFarmerId || farmerData.nic,
          district: farmerData.district,
          status: 'active',
        });
      }

      setSuccess(true);
      setTimeout(() => {
        setFarmerData({
          firstName: '', lastName: '', nic: '', address: '',
          district: '', division: '', phone: '', email: '', password: ''
        });
        setFarms([{ farmName: '', crop: '', sizeInAcres: '', location: '' }]);
        setStep(1);
        setRegisteredFarmerId(null);
        setSuccess(false);
      }, 2000);
    } catch (err: any) {
      console.error('Error creating farms:', err);
      setError(err.response?.data?.message || 'Failed to create farms. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Register Farmer</h2>
        <p className="text-gray-600">Register a new farmer and add their farm details</p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-green-700 font-medium">
              {step === 2 ? 'Farmer registered successfully! Now add their farm details.' : 'Farm(s) registered successfully!'}
            </p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Step Indicators */}
      <div className="flex items-center gap-4">
        <div className={`flex items-center justify-center w-10 h-10 rounded-full font-medium ${
          step >= 1 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
        }`}>
          1
        </div>
        <div className={`flex-1 h-1 ${step >= 2 ? 'bg-green-600' : 'bg-gray-200'}`}></div>
        <div className={`flex items-center justify-center w-10 h-10 rounded-full font-medium ${
          step >= 2 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
        }`}>
          2
        </div>
      </div>

      {/* Step 1: Farmer Registration */}
      {step === 1 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Step 1: Farmer Information</h3>
          </div>

          <form onSubmit={handleRegisterFarmer} className="p-6 space-y-6">
            {/* Personal Information */}
            <div>
              <h4 className="text-md font-medium text-gray-800 mb-4">Personal Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={farmerData.firstName}
                      onChange={(e) => setFarmerData({...farmerData, firstName: e.target.value})}
                      placeholder="Enter first name"
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={farmerData.lastName}
                    onChange={(e) => setFarmerData({...farmerData, lastName: e.target.value})}
                    placeholder="Enter last name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    NIC Number *
                  </label>
                  <div className="relative">
                    <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={farmerData.nic}
                      onChange={(e) => setFarmerData({...farmerData, nic: e.target.value})}
                      placeholder="e.g., 199512345678"
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={farmerData.phone}
                      onChange={(e) => setFarmerData({...farmerData, phone: e.target.value})}
                      placeholder="077-1234567"
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={farmerData.email}
                    onChange={(e) => setFarmerData({...farmerData, email: e.target.value})}
                    placeholder="farmer@example.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password (Optional)
                  </label>
                  <input
                    type="password"
                    value={farmerData.password}
                    onChange={(e) => setFarmerData({...farmerData, password: e.target.value})}
                    placeholder="Leave empty for auto-generated"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div>
              <h4 className="text-md font-medium text-gray-800 mb-4">Location Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    District *
                  </label>
                  <select
                    value={farmerData.district}
                    onChange={(e) => setFarmerData({...farmerData, district: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  >
                    <option value="">Select District</option>
                    {districts.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Division *
                  </label>
                  <input
                    type="text"
                    value={farmerData.division}
                    onChange={(e) => setFarmerData({...farmerData, division: e.target.value})}
                    placeholder="e.g., Attanagalla"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <textarea
                      value={farmerData.address}
                      onChange={(e) => setFarmerData({...farmerData, address: e.target.value})}
                      placeholder="Enter full address"
                      rows={3}
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 bg-green-700 hover:bg-green-800 disabled:bg-gray-400 text-white font-medium rounded-lg flex items-center justify-center gap-2 transition-all"
              >
                <Save className="w-5 h-5" />
                {loading ? 'Registering...' : 'Next: Add Farms'}
              </button>
              <button
                type="button"
                onClick={() => setFarmerData({
                  firstName: '', lastName: '', nic: '', address: '',
                  district: '', division: '', phone: '', email: '', password: ''
                })}
                className="px-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg"
              >
                Clear
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Step 2: Farm Details */}
      {step === 2 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Step 2: Farm Details for {farmerData.firstName} {farmerData.lastName}</h3>
            <p className="text-sm text-gray-600 mt-1">Add one or more farms for this farmer</p>
          </div>

          <form onSubmit={handleSubmitFarms} className="p-6 space-y-6">
            {/* Farm entries */}
            {farms.map((farm, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium text-gray-800">Farm {index + 1}</h4>
                  {farms.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeFarm(index)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove farm"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Farm Name *
                    </label>
                    <input
                      type="text"
                      value={farm.farmName}
                      onChange={(e) => handleFarmChange(index, 'farmName', e.target.value)}
                      placeholder="e.g., Main Field"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Crop *
                    </label>
                    <select
                      value={farm.crop}
                      onChange={(e) => handleFarmChange(index, 'crop', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    >
                      <option value="">Select Crop</option>
                      {crops.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Size (Acres) *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={farm.sizeInAcres}
                      onChange={(e) => handleFarmChange(index, 'sizeInAcres', e.target.value ? parseFloat(e.target.value) : '')}
                      placeholder="e.g., 5"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location/Area *
                    </label>
                    <input
                      type="text"
                      value={farm.location}
                      onChange={(e) => handleFarmChange(index, 'location', e.target.value)}
                      placeholder="e.g., North field"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                </div>
              </div>
            ))}

            {/* Add Farm Button */}
            <button
              type="button"
              onClick={addFarm}
              className="w-full py-3 border-2 border-dashed border-gray-300 hover:border-green-500 text-gray-700 hover:text-green-600 font-medium rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Another Farm
            </button>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 bg-green-700 hover:bg-green-800 disabled:bg-gray-400 text-white font-medium rounded-lg flex items-center justify-center gap-2 transition-all"
              >
                <Save className="w-5 h-5" />
                {loading ? 'Registering Farms...' : 'Complete Registration'}
              </button>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg"
              >
                Back
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}