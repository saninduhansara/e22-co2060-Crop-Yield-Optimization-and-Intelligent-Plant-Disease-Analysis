import { useState } from 'react';
import { Upload, MapPin, Loader2, CheckCircle, AlertCircle, Send } from 'lucide-react';

export function DiseasePage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [reportSent, setReportSent] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setAnalysisResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = () => {
    if (!selectedImage) return;
    
    setIsAnalyzing(true);
    // Simulate AI analysis
    setTimeout(() => {
      setAnalysisResult({
        disease: 'Leaf Blast',
        confidence: 92.5,
        severity: 'High',
        riskLevel: 'high',
        description: 'Leaf blast is a fungal disease caused by Pyricularia oryzae. It affects leaves, nodes, and panicles.',
        treatment: 'Apply Tricyclazole 75% WP at 0.6g/L. Spray every 7-10 days until symptoms reduce.',
        prevention: 'Use resistant varieties, maintain proper spacing, avoid excessive nitrogen fertilization.',
      });
      setIsAnalyzing(false);
    }, 2500);
  };

  const handleSendReport = () => {
    if (!analysisResult) return;
    // Simulate sending report
    setTimeout(() => {
      setReportSent(true);
    }, 1500);
  };

  // Temperature scale data for heat map
  const tempScale = [
    { temp: '5°C', color: 'bg-green-200' },
    { temp: '10°C', color: 'bg-green-300' },
    { temp: '15°C', color: 'bg-yellow-300' },
    { temp: '20°C', color: 'bg-yellow-400' },
    { temp: '25°C', color: 'bg-orange-400' },
    { temp: '30°C', color: 'bg-orange-500' },
    { temp: '35°C', color: 'bg-red-500' },
    { temp: '40°C', color: 'bg-red-700' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
      {/* Left Column - Disease Report Form */}
      <div className="lg:col-span-2 space-y-4 md:space-y-6">
        {/* Image Upload */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
          {!selectedImage ? (
            <label className="flex flex-col items-center justify-center w-full h-64 md:h-80 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-all">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-12 h-12 md:w-16 md:h-16 text-gray-400 mb-4" />
                <p className="mb-2 text-xs md:text-sm text-gray-600 font-medium text-center px-4">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-500">PNG, JPG or JPEG (MAX. 10MB)</p>
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
              />
            </label>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={selectedImage}
                  alt="Selected crop"
                  className="w-full h-64 md:h-80 object-cover rounded-xl"
                />
                <button
                  onClick={() => {
                    setSelectedImage(null);
                    setAnalysisResult(null);
                  }}
                  className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Location Input */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
          <label className="block mb-3">
            <span className="text-gray-700 font-medium mb-2 block text-sm md:text-base">Location / Plot Details</span>
            <div className="relative">
              <MapPin className="absolute left-3 top-2.5 md:top-3 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Plot A - Section 2"
                className="w-full pl-9 md:pl-11 pr-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm md:text-base"
              />
            </div>
          </label>
        </div>

        {/* Additional Notes */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
          <label className="block">
            <span className="text-gray-700 font-medium mb-2 block text-sm md:text-base">Additional Notes (Optional)</span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe symptoms, when noticed, affected area size, etc."
              rows={4}
              className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none text-sm md:text-base"
            />
          </label>
        </div>

        {/* Analyze Button */}
        <button
          onClick={handleAnalyze}
          disabled={!selectedImage || isAnalyzing}
          className="w-full py-3 md:py-4 bg-orange-400 hover:bg-orange-500 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl font-medium flex items-center justify-center gap-3 transition-all text-sm md:text-base"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
              Analyzing Disease...
            </>
          ) : (
            <>
              <AlertCircle className="w-4 h-4 md:w-5 md:h-5" />
              Analyze Disease
            </>
          )}
        </button>

        {/* Analysis Results */}
        {analysisResult && (
          <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 space-y-4">
            <div className="flex items-start gap-3 md:gap-4 pb-4 border-b border-gray-200">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-6 h-6 md:w-7 md:h-7 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-1">Analysis Complete</h3>
                <p className="text-xs md:text-sm text-gray-600">AI model has identified the disease</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs md:text-sm text-gray-600 mb-1">Detected Disease</p>
                <p className="text-xl md:text-2xl font-bold text-gray-900">{analysisResult.disease}</p>
              </div>

              <div className="flex gap-4 md:gap-6">
                <div>
                  <p className="text-xs md:text-sm text-gray-600 mb-1">Confidence</p>
                  <p className="text-base md:text-lg font-semibold text-green-600">{analysisResult.confidence}%</p>
                </div>
                <div>
                  <p className="text-xs md:text-sm text-gray-600 mb-1">Severity</p>
                  <span className={`inline-flex px-2 md:px-3 py-0.5 md:py-1 rounded-full text-xs md:text-sm font-medium ${
                    analysisResult.severity === 'High' 
                      ? 'bg-red-100 text-red-700'
                      : analysisResult.severity === 'Medium'
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {analysisResult.severity}
                  </span>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 md:p-4">
                <h4 className="font-semibold text-gray-800 mb-2 text-xs md:text-sm">Description</h4>
                <p className="text-xs md:text-sm text-gray-700">{analysisResult.description}</p>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 md:p-4">
                <h4 className="font-semibold text-gray-800 mb-2 text-xs md:text-sm">Recommended Treatment</h4>
                <p className="text-xs md:text-sm text-gray-700">{analysisResult.treatment}</p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-3 md:p-4">
                <h4 className="font-semibold text-gray-800 mb-2 text-xs md:text-sm">Prevention</h4>
                <p className="text-xs md:text-sm text-gray-700">{analysisResult.prevention}</p>
              </div>
            </div>

            {/* Send Report Button */}
            <button
              onClick={handleSendReport}
              disabled={reportSent}
              className="w-full py-3 md:py-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl font-medium flex items-center justify-center gap-3 transition-all text-sm md:text-base"
            >
              {reportSent ? (
                <>
                  <CheckCircle className="w-4 h-4 md:w-5 md:h-5" />
                  Report Sent to Agricultural Officer
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 md:w-5 md:h-5" />
                  Send Report to Agricultural Officer
                </>
              )}
            </button>

            {reportSent && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 md:p-4">
                <p className="text-xs md:text-sm text-green-800">
                  ✓ Your disease report has been successfully sent to your assigned agricultural officer. They will review it and contact you soon.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Column - Heat Map */}
      <div className="space-y-4 md:space-y-6">
        {/* Temperature Scale */}
        <div className="bg-white rounded-xl border border-gray-200 p-3 md:p-4">
          <h3 className="text-sm md:text-base font-semibold text-gray-800 mb-3">Temperature Scale</h3>
          <div className="space-y-2">
            {tempScale.map((item, index) => (
              <div key={index} className="flex items-center gap-2 md:gap-3">
                <div className={`w-6 h-4 md:w-8 md:h-5 ${item.color} rounded`}></div>
                <span className="text-xs md:text-sm text-gray-700">{item.temp}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Heat Map Visualization */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
          <h3 className="text-sm md:text-base font-semibold text-gray-800 mb-3">Disease Heat Map</h3>
          <div className="relative">
            {/* Leaf Shape Heat Map */}
            <svg viewBox="0 0 200 280" className="w-full h-auto">
              {/* Gradient definitions */}
              <defs>
                <radialGradient id="heatGradient1" cx="50%" cy="30%">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="40%" stopColor="#f97316" />
                  <stop offset="70%" stopColor="#eab308" />
                  <stop offset="100%" stopColor="#22c55e" />
                </radialGradient>
                <radialGradient id="heatGradient2" cx="60%" cy="60%">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="50%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#84cc16" />
                </radialGradient>
              </defs>
              
              {/* Leaf shape with gradient */}
              <ellipse 
                cx="100" 
                cy="140" 
                rx="80" 
                ry="120" 
                fill="url(#heatGradient1)"
                opacity="0.9"
              />
              
              {/* Disease markers */}
              <circle cx="85" cy="100" r="5" fill="white" stroke="#ef4444" strokeWidth="2" />
              <circle cx="120" cy="130" r="5" fill="white" stroke="#ef4444" strokeWidth="2" />
              <circle cx="95" cy="170" r="5" fill="white" stroke="#f97316" strokeWidth="2" />
              <circle cx="110" cy="200" r="5" fill="white" stroke="#eab308" strokeWidth="2" />
              <circle cx="75" cy="220" r="5" fill="white" stroke="#22c55e" strokeWidth="2" />
            </svg>
          </div>
        </div>

        {/* Advisory */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
          <h3 className="font-semibold text-gray-800 mb-3 text-sm md:text-base">Advisory & Tips</h3>
          <ul className="space-y-2 text-xs md:text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-orange-500 mt-1">•</span>
              <span>High disease risk in northern plots</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-500 mt-1">•</span>
              <span>Regular monitoring recommended</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-1">•</span>
              <span>Southern area showing improvement</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}