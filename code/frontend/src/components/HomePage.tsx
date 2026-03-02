/**
 * Farmer Home Dashboard
 * Displays a personalized greeting, points summary, disease heat map,
 * and a floating AI chatbot interface.
 */
import { Star, HandIcon, SearchIcon, FileText, Bot, AlertTriangle, MapPin } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router';
import { userAPI } from '../services/api';

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
        <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-200">
          <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-4">Points Summary</h3>
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
            <p className="text-2xl md:text-3xl font-bold text-gray-800 mt-1">
              {loading ? '...' : Math.floor((userProfile?.points || 0) * 0.3)} {/* Mocking recent points */}
            </p>
          </div>
        </div>
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
            {/* Temperature Scale */}
            <div className="flex flex-col justify-between text-xs text-gray-600 w-16 md:w-20 flex-shrink-0">
              <div>
                <p className="text-gray-700 font-medium mb-2">Tends to Invert</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-3 bg-green-200 rounded"></div>
                <span>2°C</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-3 bg-green-300 rounded"></div>
                <span>27°C</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-3 bg-yellow-200 rounded"></div>
                <span>13°C</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-3 bg-yellow-300 rounded"></div>
                <span>73°C</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-3 bg-yellow-400 rounded"></div>
                <span>8</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-3 bg-orange-400 rounded"></div>
                <span>73°C</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-3 bg-orange-500 rounded"></div>
                <span>7°C</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-3 bg-red-500 rounded"></div>
                <span>7</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-3 bg-red-700 rounded"></div>
                <span>13°C</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-3 bg-red-900 rounded"></div>
                <span>23°C</span>
              </div>
            </div>

            {/* Map Visualization */}
            <div className="flex-1 relative bg-gray-50 rounded-lg overflow-hidden min-h-[280px]">
              <svg viewBox="0 0 400 280" className="w-full h-full">
                <defs>
                  <radialGradient id="heatGradient" cx="50%" cy="50%">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
                    <stop offset="40%" stopColor="#f97316" stopOpacity="0.6" />
                    <stop offset="70%" stopColor="#eab308" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity="0.3" />
                  </radialGradient>
                </defs>

                {/* Base land shape - Sri Lanka-like shape */}
                <path
                  d="M 80 60 Q 150 40, 240 80 L 300 140 Q 310 200, 270 250 L 180 270 Q 100 260, 70 200 L 60 120 Z"
                  fill="#86efac"
                  opacity="0.7"
                />

                {/* Additional land masses */}
                <ellipse cx="320" cy="180" rx="30" ry="25" fill="#86efac" opacity="0.7" />
                <ellipse cx="340" cy="220" rx="20" ry="18" fill="#86efac" opacity="0.7" />

                {/* Heat overlays - disease hotspots */}
                <ellipse cx="220" cy="120" rx="50" ry="45" fill="url(#heatGradient)" />
                <ellipse cx="160" cy="180" rx="40" ry="35" fill="#ef4444" opacity="0.6" />
                <ellipse cx="260" cy="200" rx="35" ry="30" fill="#f97316" opacity="0.5" />

                {/* Disease markers - red dots */}
                <circle cx="220" cy="110" r="6" fill="#ef4444" />
                <circle cx="230" cy="130" r="5" fill="#ef4444" />
                <circle cx="205" cy="125" r="5" fill="#ef4444" />
                <circle cx="160" cy="180" r="6" fill="#ef4444" />
                <circle cx="170" cy="195" r="5" fill="#ef4444" />
                <circle cx="150" cy="190" r="4" fill="#f97316" />
                <circle cx="260" cy="200" r="5" fill="#f97316" />
                <circle cx="270" cy="210" r="4" fill="#f97316" />
                <circle cx="250" cy="195" r="4" fill="#eab308" />

                {/* Location markers - Plot A, B, C, D, E, F with circles */}
                <g>
                  <circle cx="120" cy="100" r="10" fill="white" stroke="#22c55e" strokeWidth="2" />
                  <text x="120" y="105" textAnchor="middle" className="text-xs font-semibold" fill="#22c55e" fontSize="12">A</text>
                </g>
                <g>
                  <circle cx="180" cy="130" r="10" fill="white" stroke="#22c55e" strokeWidth="2" />
                  <text x="180" y="135" textAnchor="middle" className="text-xs font-semibold" fill="#22c55e" fontSize="12">B</text>
                </g>
                <g>
                  <circle cx="240" cy="160" r="10" fill="white" stroke="#22c55e" strokeWidth="2" />
                  <text x="240" y="165" textAnchor="middle" className="text-xs font-semibold" fill="#22c55e" fontSize="12">C</text>
                </g>
                <g>
                  <circle cx="200" cy="200" r="10" fill="white" stroke="#22c55e" strokeWidth="2" />
                  <text x="200" y="205" textAnchor="middle" className="text-xs font-semibold" fill="#22c55e" fontSize="12">D</text>
                </g>
                <g>
                  <circle cx="140" cy="230" r="10" fill="white" stroke="#22c55e" strokeWidth="2" />
                  <text x="140" y="235" textAnchor="middle" className="text-xs font-semibold" fill="#22c55e" fontSize="12">E</text>
                </g>
                <g>
                  <circle cx="280" cy="180" r="10" fill="white" stroke="#22c55e" strokeWidth="2" />
                  <text x="280" y="185" textAnchor="middle" className="text-xs font-semibold" fill="#22c55e" fontSize="12">F</text>
                </g>
              </svg>
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