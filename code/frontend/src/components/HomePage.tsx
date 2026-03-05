/**
 * Farmer Home Dashboard
 * Displays a personalized greeting, points summary, disease heat map,
 * and a floating AI chatbot interface.
 */
import { Star, HandIcon, SearchIcon, FileText, Bot, AlertTriangle, MapPin } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router';
import { userAPI, farmAPI } from '../services/api';
import { SummaryCard } from './SummaryCard';
import farmerImage from 'figma:asset/8d18ad2077654c1f65710d650ff192f7ba499f8c.png';
import { formatNumber } from '../utils/numberUtils';

// Hook used by Home dashboard (and others) to load summary metrics.
export function useHomeDashboardData() {
  const [totalFarmers, setTotalFarmers] = useState<number>(0);
  const [totalHarvest, setTotalHarvest] = useState<number>(0);
  const [yieldPerAcre, setYieldPerAcre] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        // fetch farms and count unique farmers
        const farmsResp = await farmAPI.getAllFarms();
        const farms = farmsResp?.farms || [];
        const uniqueFarmers = new Set(farms.map((f: any) => f.farmerNIC));
        const farmland = farms.reduce((sum: number, f: any) => {
          return sum + (f.farmSize || f.sizeInAcres || 0);
        }, 0);

        // fetch harvests to compute total harvest
        const harvestResp = await farmAPI.getHarvestHistory();
        const harvests = harvestResp?.harvests || [];
        const totalHarvestQty = harvests.reduce((sum: number, h: any) => {
          return sum + (h.harvestQty || 0);
        }, 0);

        setTotalFarmers(uniqueFarmers.size);
        setTotalHarvest(totalHarvestQty);
        setYieldPerAcre(farmland === 0 ? 0 : totalHarvestQty / farmland);
      } catch (err: any) {
        console.error('Error loading dashboard metrics', err);
        setError(err?.message || 'Failed to load metrics');
        setTotalFarmers(0);
        setTotalHarvest(0);
        setYieldPerAcre(0);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  const formattedTotalFarmers = formatNumber(totalFarmers);
  const formattedTotalHarvest = formatNumber(totalHarvest);
  const formattedYieldPerAcre = formatNumber(yieldPerAcre);

  return {
    totalFarmers, totalHarvest, yieldPerAcre, loading, error,
    formattedTotalFarmers, formattedTotalHarvest, formattedYieldPerAcre
  };
}

interface HomePageProps {
  onNavigate?: (page: string) => void;
}

export function HomePage({ onNavigate: onNavigateProp }: HomePageProps) {
  const [showChatbot, setShowChatbot] = useState(false);
  const [chatMessage, setChatMessage] = useState('');

  // Dynamic User State
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const outletContext = useOutletContext<{ onNavigate: (page: string) => void }>();
  const onNavigate = onNavigateProp || outletContext?.onNavigate || (() => { });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await userAPI.fetchProfile();
        if (data && data.user) {
          setUserProfile(data.user);
        }
      } catch (error) {
        console.error("Failed to load user profile:", error);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  // use shared hook to load metrics (total farmers/harvest/yield) for dashboard
  const { totalFarmers, totalHarvest, yieldPerAcre, loading: metricsLoading, error: metricsError } = useHomeDashboardData();

  // metrics are not currently shown in HomePage UI but hook ensures data is fetched

  return (
    <div className="space-y-4 md:space-y-6 pb-20">
      {/* Top Section - Welcome & Points */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Welcome Card */}
        <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-200">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-2">
                Welcome, {loading ? '...' : (userProfile?.firstName || 'Farmer')}
              </h2>
              <p className="text-xs md:text-sm text-gray-600">
                Account Status: <span className="text-cyan-600 font-medium">Active</span>
              </p>
              <p className="text-xs md:text-sm text-gray-600 mt-1">
                <span className="font-medium">Season:</span> {loading ? '...' : 'Maha'}
              </p>
              <p className="text-xs md:text-sm text-gray-600 mt-1">
                <span className="font-medium">Location:</span> {loading ? '...' : `${userProfile?.district || 'Unknown District'} / ${userProfile?.division || 'Unknown Division'}`}
              </p>
            </div>
            <img
              src={userProfile?.image || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'}
              alt="Farmer Profile"
              className="w-12 h-12 md:w-16 md:h-16 rounded-full object-cover border-2 border-gray-200"
            />
          </div>
        </div>

        {/* Points Summary Card */}
        <SummaryCard
          hoverable={false}
          className="w-full"
          title="Points Summary"
          subtext={
            <span className="text-xs text-teal-600 flex items-center gap-1">
              This season
            </span>
          }
        >
          <div className="flex items-center gap-3 md:gap-4 mb-4">
            <Star className="w-10 h-10 md:w-12 md:h-12 text-yellow-400 fill-yellow-400" />
            <div>
              <p className="text-xs md:text-sm text-gray-600">Total Points:</p>
              <p className="text-3xl md:text-4xl font-bold text-gray-800">
                {loading ? '...' : (userProfile?.points || 0)}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs md:text-sm text-gray-600">Season: Maha</p>
            <p className="text-xs md:text-sm text-gray-600 mt-1">Points This Season</p>
            <p className="text-2xl md:text-3xl font-bold text-gray-800 mt-1">420</p>
          </div>
        </SummaryCard>
      </div>

      {/* Middle Section - Alerts & Heat Map */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Alerts & Warnings */}
        <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-200">
          <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-4">Alerts & Warnings</h3>
          <div className="space-y-3 md:space-y-4">
            <div className="bg-gradient-to-br from-green-700 to-green-800 rounded-xl p-3 md:p-4 text-white">
              <HandIcon className="w-6 h-6 md:w-8 md:h-8 mb-2" />
              <p className="text-xs md:text-sm font-medium">Flood Risk Expected In</p>
              <p className="text-xs md:text-sm">in Your Area</p>
            </div>
            <div className="bg-gradient-to-br from-green-700 to-green-800 rounded-xl p-3 md:p-4 text-white relative">
              <div className="absolute top-2 right-2 w-4 h-4 md:w-5 md:h-5 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-xs">1</span>
              </div>
              <AlertTriangle className="w-6 h-6 md:w-8 md:h-8 mb-2" />
              <p className="text-xs md:text-sm font-medium">Possible Disease</p>
              <p className="text-xs md:text-sm">Outbreak Nearby</p>
            </div>
          </div>
        </div>

        {/* Disease Heat Map */}
        <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-200 lg:col-span-2">
          <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-4">Disease Heat Map</h3>
          <div className="flex gap-2 md:gap-4 overflow-x-auto">
            {/* Activity Scale */}
            <div className="flex flex-col justify-between text-xs text-gray-600 w-16 md:w-24 flex-shrink-0">
              <div>
                <p className="text-gray-700 font-medium mb-2">Report Frequency</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-3 bg-red-900 rounded"></div>
                <span>Critical</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-3 bg-red-700 rounded"></div>
                <span>Very High</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-3 bg-red-500 rounded"></div>
                <span>High</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-3 bg-orange-500 rounded"></div>
                <span>Elevated</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-3 bg-orange-400 rounded"></div>
                <span>Moderate</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-3 bg-yellow-400 rounded"></div>
                <span>Alert</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-3 bg-yellow-300 rounded"></div>
                <span>Warning</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-3 bg-yellow-200 rounded"></div>
                <span>Low</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-3 bg-green-300 rounded"></div>
                <span>Very Low</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-3 bg-green-200 rounded"></div>
                <span>None</span>
              </div>
            </div>

            {/* Map Visualization */}
            <div className="flex-1 relative bg-gray-50 rounded-lg overflow-hidden min-h-[280px] flex items-center justify-center">
              <img src="/src/assets/sri_lanka_heatmap.png" alt="Sri Lanka Disease Heatmap" className="w-full h-full object-contain mix-blend-multiply opacity-90" />
            </div>

            {/* Advisory */}
            <div className="w-32 text-xs">
              <h4 className="font-semibold text-gray-800 mb-3">Advisory & Tips</h4>
              <ul className="space-y-2 text-gray-600">
                <li>Nearthy Leaf Blast</li>
                <li>Early morning humidity</li>
                <li>High Risk Zone</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* AI Chatbot Button */}
      <button
        onClick={() => setShowChatbot(!showChatbot)}
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 z-50"
      >
        <Bot className="w-7 h-7 md:w-8 md:h-8" />
      </button>

      {/* AI Chatbot Window */}
      {showChatbot && (
        <div className="fixed bottom-24 right-4 md:bottom-28 md:right-8 w-[calc(100vw-2rem)] sm:w-96 h-[calc(100vh-200px)] sm:h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50">
          {/* Chatbot Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bot className="w-6 h-6" />
              <div>
                <h3 className="font-semibold">AgriBot Assistant</h3>
                <p className="text-xs opacity-90">Online</p>
              </div>
            </div>
            <button
              onClick={() => setShowChatbot(false)}
              className="hover:bg-white/20 p-1 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Chatbot Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            <div className="flex gap-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="bg-gray-100 rounded-2xl rounded-tl-sm p-3 max-w-[80%]">
                <p className="text-sm text-gray-800">
                  Hello! I'm AgriBot, your AI farming assistant. How can I help you today?
                </p>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button className="text-xs px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                Crop disease tips
              </button>
              <button className="text-xs px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                Weather forecast
              </button>
              <button className="text-xs px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                Fertilizer advice
              </button>
            </div>
          </div>

          {/* Chatbot Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ask me anything..."
                value={chatMessage}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setChatMessage(e.target.value)}
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === 'Enter' && chatMessage.trim()) {
                    setChatMessage(''); // Reset state for now
                    // TODO: dispatch message to AI backend
                  }
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              <button
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                onClick={() => {
                  if (chatMessage.trim()) {
                    setChatMessage('');
                    // TODO: dispatch message to AI backend
                  }
                }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}