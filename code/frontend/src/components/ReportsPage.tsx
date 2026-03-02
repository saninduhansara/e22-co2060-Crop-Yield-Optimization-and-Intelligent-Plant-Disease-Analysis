import { Download, TrendingUp, BarChart3, PieChart } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart as RePieChart, Pie, Cell } from 'recharts';

export function ReportsPage() {
  const pointsData = [
    { month: 'Aug', points: 80 },
    { month: 'Sep', points: 95 },
    { month: 'Oct', points: 125 },
    { month: 'Nov', points: 150 },
    { month: 'Dec', points: 100 },
    { month: 'Jan', points: 75 },
  ];

  const cropVarietyData = [
    { name: 'BG 352', value: 40, acres: 4.0 },
    { name: 'BG 300', value: 33, acres: 3.0 },
    { name: 'AT 362', value: 22, acres: 2.0 },
  ];

  const diseaseData = [
    { name: 'Brown Spot', value: 40 },
    { name: 'Leaf Blast', value: 35 },
    { name: 'Bacterial Blight', value: 25 },
  ];

  const COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#ef4444'];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
          <TrendingUp className="w-8 h-8 mb-3 opacity-80" />
          <p className="text-green-100 text-sm mb-1">Total Points</p>
          <p className="text-3xl font-bold">1,250</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <BarChart3 className="w-8 h-8 mb-3 opacity-80" />
          <p className="text-blue-100 text-sm mb-1">Total Acres</p>
          <p className="text-3xl font-bold">9.0</p>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-6 text-white shadow-lg">
          <PieChart className="w-8 h-8 mb-3 opacity-80" />
          <p className="text-amber-100 text-sm mb-1">Crop Varieties</p>
          <p className="text-3xl font-bold">3</p>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white shadow-lg">
          <BarChart3 className="w-8 h-8 mb-3 opacity-80" />
          <p className="text-red-100 text-sm mb-1">Disease Reports</p>
          <p className="text-3xl font-bold">12</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Points Trend */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-gray-800">Points Trend (Last 6 Months)</h3>
            <button className="text-green-600 hover:text-green-700 flex items-center gap-2 text-sm">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={pointsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
              <Line type="monotone" dataKey="points" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Crop Variety Distribution */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-gray-800">Crop Variety Distribution</h3>
            <button className="text-green-600 hover:text-green-700 flex items-center gap-2 text-sm">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <RePieChart>
              <Pie
                data={cropVarietyData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {cropVarietyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </RePieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Performance */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-gray-800">Monthly Points Performance</h3>
          <button className="text-green-600 hover:text-green-700 flex items-center gap-2 text-sm">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={pointsData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" stroke="#666" />
            <YAxis stroke="#666" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
            />
            <Legend />
            <Bar dataKey="points" fill="#10b981" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Crop Varieties Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-gray-800">Crop Varieties Summary</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Variety</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Acres</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Percentage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {cropVarietyData.map((variety) => (
                  <tr key={variety.name} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-800">{variety.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-800">{variety.acres}</td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: `${variety.value}%` }}
                          ></div>
                        </div>
                        <span className="text-gray-700">{variety.value}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Disease Summary Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-gray-800">Disease Reports Summary</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Disease Type</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Percentage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {diseaseData.map((disease) => (
                  <tr key={disease.name} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-800">{disease.name}</td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                          <div 
                            className="bg-red-500 h-2 rounded-full" 
                            style={{ width: `${disease.value}%` }}
                          ></div>
                        </div>
                        <span className="text-gray-700">{disease.value}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Download Reports */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-gray-800 mb-4">Download Reports</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center gap-3 p-4 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all">
            <Download className="w-5 h-5 text-green-600" />
            <span className="text-gray-700 font-medium">Crop Data Report</span>
          </button>
          <button className="flex items-center justify-center gap-3 p-4 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all">
            <Download className="w-5 h-5 text-green-600" />
            <span className="text-gray-700 font-medium">Points Summary</span>
          </button>
          <button className="flex items-center justify-center gap-3 p-4 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all">
            <Download className="w-5 h-5 text-green-600" />
            <span className="text-gray-700 font-medium">Disease Reports</span>
          </button>
        </div>
      </div>
    </div>
  );
}
