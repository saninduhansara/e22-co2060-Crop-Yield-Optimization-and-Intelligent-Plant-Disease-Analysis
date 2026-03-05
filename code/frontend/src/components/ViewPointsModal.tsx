import { X, Star, TrendingUp, Calendar, Award } from 'lucide-react';

interface ViewPointsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ViewPointsModal({ isOpen, onClose }: ViewPointsModalProps) {
  const pointsHistory = [
    {
      id: 1,
      date: '2026-02-03',
      description: 'Crop Data Entry - 3.0 acres BG 300',
      points: 150,
      season: 'Maha',
      status: 'Verified',
    },
    {
      id: 2,
      date: '2026-01-20',
      description: 'Crop Data Entry - 1.5 acres BG 352',
      points: 75,
      season: 'Maha',
      status: 'Verified',
    },
    {
      id: 3,
      date: '2025-12-15',
      description: 'Crop Data Entry - 2.0 acres AT 362',
      points: 100,
      season: 'Maha',
      status: 'Pending',
    },
    {
      id: 4,
      date: '2025-11-28',
      description: 'Bonus Points - Quality Yield',
      points: 50,
      season: 'Maha',
      status: 'Verified',
    },
    {
      id: 5,
      date: '2025-11-10',
      description: 'Crop Data Entry - 2.5 acres BG 352',
      points: 125,
      season: 'Maha',
      status: 'Verified',
    },
  ];

  const totalPoints = 1250;
  const seasonPoints = 420;
  const verifiedPoints = 500;
  const pendingPoints = 100;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-amber-500 to-amber-600 p-6 rounded-t-2xl flex items-center justify-between text-white">
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Star className="w-6 h-6 fill-white" />
              Points Summary
            </h2>
            <p className="text-amber-100 text-sm mt-1">View your points history and rewards</p>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Points Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl p-5 text-white shadow-lg">
              <Award className="w-8 h-8 mb-2 opacity-80" />
              <p className="text-yellow-100 text-sm mb-1">Total Points</p>
              <p className="text-3xl font-bold">{totalPoints}</p>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white shadow-lg">
              <TrendingUp className="w-8 h-8 mb-2 opacity-80" />
              <p className="text-green-100 text-sm mb-1">This Season</p>
              <p className="text-3xl font-bold">{seasonPoints}</p>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white shadow-lg">
              <Star className="w-8 h-8 mb-2 opacity-80" />
              <p className="text-blue-100 text-sm mb-1">Verified</p>
              <p className="text-3xl font-bold">{verifiedPoints}</p>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-5 text-white shadow-lg">
              <Calendar className="w-8 h-8 mb-2 opacity-80" />
              <p className="text-orange-100 text-sm mb-1">Pending</p>
              <p className="text-3xl font-bold">{pendingPoints}</p>
            </div>
          </div>

          {/* Points Breakdown */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h3 className="font-semibold text-gray-800 mb-3">How Points Work</h3>
            <div className="space-y-2 text-sm text-gray-700">
              <p>• <strong>Dynamic Calculation:</strong> Points are uniquely calculated against last year's actual average yield for the same crop and season.</p>
              <p>• <strong>Calculation Formula:</strong> Max Score (1,000) × √[(Your Yield - Avg Yield) / (20,000 - Avg Yield)]</p>
              <p>• <strong>Maximum Yield Cap:</strong> Theoretical maximum yield capped strictly at 20,000 kg/acre.</p>
              <p>• <strong>Redemption:</strong> Points can be redeemed for agricultural supplies and equipment.</p>
            </div>
          </div>

          {/* Points History */}
          <div>
            <h3 className="text-gray-800 font-semibold mb-4">Points History</h3>
            <div className="space-y-3">
              {pointsHistory.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                          <Star className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                          <h4 className="text-gray-800 font-medium">{item.description}</h4>
                          <p className="text-gray-600 text-sm flex items-center gap-2">
                            <Calendar className="w-3 h-3" />
                            {new Date(item.date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                            <span className="text-gray-400">•</span>
                            Season: {item.season}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <span className="text-2xl font-bold text-amber-600">
                        +{item.points}
                      </span>
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${item.status === 'Verified'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                        }`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rewards Section */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-xl p-6">
            <h3 className="text-gray-800 font-semibold mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-green-600" />
              Available Rewards
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <p className="text-gray-600 text-sm mb-1">Fertilizer Pack</p>
                <p className="text-green-600 font-bold text-lg">200 points</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <p className="text-gray-600 text-sm mb-1">Seeds Voucher</p>
                <p className="text-green-600 font-bold text-lg">350 points</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <p className="text-gray-600 text-sm mb-1">Tool Kit</p>
                <p className="text-green-600 font-bold text-lg">500 points</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm mt-4">
              Contact your district officer to redeem points for rewards.
            </p>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}