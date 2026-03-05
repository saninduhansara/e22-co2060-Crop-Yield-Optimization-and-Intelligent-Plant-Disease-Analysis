import { Outlet, useNavigate } from 'react-router';
import { AdminSidebar } from '../admin/AdminSidebar';
import { Bell, AlertCircle } from 'lucide-react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useInactivityTimeout } from '../../utils/useInactivityTimeout';
import { clearAuthData } from '../../utils/authUtils';

export function AdminLayout() {
  const navigate = useNavigate();
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(60);

  const TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes
  const WARNING_TIME_MS = 14 * 60 * 1000; // Show warning 1 minute before logout

  const handleLogout = useCallback(() => {
    clearAuthData();
    navigate('/');
  }, [navigate]);

  // Session timeout due to inactivity (15 minutes)
  useInactivityTimeout({
    timeout: TIMEOUT_MS,
    onTimeout: handleLogout,
  });

  // Warning dialog before auto-logout
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);

  const resetWarningTimer = useCallback(() => {
    // Hide warning when activity detected
    setShowWarning(false);
    
    // Clear existing warning timer
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
    }

    // Set new warning timer
    warningTimerRef.current = setTimeout(() => {
      setShowWarning(true);
      setCountdown(60);
    }, WARNING_TIME_MS);
  }, [WARNING_TIME_MS]);

  useEffect(() => {
    resetWarningTimer();

    return () => {
      if (warningTimerRef.current) {
        clearTimeout(warningTimerRef.current);
      }
    };
  }, [resetWarningTimer]);

  // Countdown timer for warning
  useEffect(() => {
    if (showWarning && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [showWarning, countdown]);

  // Hide warning and reset timer on user activity
  useEffect(() => {
    const handleActivity = () => {
      resetWarningTimer();
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'click'];
    events.forEach((event) => {
      document.addEventListener(event, handleActivity);
    });

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [resetWarningTimer]);

  // Get current page from URL
  const getCurrentPage = () => {
    const path = window.location.pathname;
    if (path.includes('/dashboard')) return 'dashboard';
    if (path.includes('/farmers')) return 'farmers';
    if (path.includes('/register-farmer')) return 'register';
    if (path.includes('/add-harvest')) return 'harvest';
    if (path.includes('/harvest-history')) return 'history';
    if (path.includes('/reports')) return 'reports';
    if (path.includes('/profile')) return 'profile';
    return 'dashboard';
  };

  const handleNavigate = (page: string) => {
    const routes: Record<string, string> = {
      dashboard: '/admin/dashboard',
      farmers: '/admin/farmers',
      register: '/admin/register-farmer',
      harvest: '/admin/add-harvest',
      history: '/admin/harvest-history',
      reports: '/admin/reports',
      profile: '/admin/profile',
    };
    navigate(routes[page] || '/admin/dashboard');
  };

  return (
    <div className="flex min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Session Timeout Warning */}
      {showWarning && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full animate-in fade-in zoom-in duration-200">
            <div className="flex items-start gap-4">
              <div className="bg-yellow-100 rounded-full p-3 flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Session Timeout Warning
                </h3>
                <p className="text-gray-600 mb-4">
                  Your session will expire in <span className="font-bold text-red-600">{countdown}</span> seconds due to inactivity. 
                  Move your mouse or press any key to stay logged in.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowWarning(false);
                      setCountdown(60);
                    }}
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Stay Logged In
                  </button>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors"
                  >
                    Logout Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <AdminSidebar 
        currentPage={getCurrentPage()} 
        onNavigate={handleNavigate} 
        onLogout={handleLogout}
      />
      
      <div className="flex-1 w-full lg:ml-72 min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 md:px-8 py-4 flex items-center justify-between sticky top-0 z-20">
          <h1 className="text-gray-800 text-lg md:text-xl font-medium ml-12 lg:ml-0">
            {getCurrentPage() === 'dashboard' && 'Home'}
            {getCurrentPage() === 'farmers' && 'All Farmers'}
            {getCurrentPage() === 'register' && 'Register Farmer'}
            {getCurrentPage() === 'harvest' && 'Add Harvest'}
            {getCurrentPage() === 'history' && 'Harvest History'}
            {getCurrentPage() === 'reports' && 'Reports'}
            {getCurrentPage() === 'profile' && 'My Profile'}
          </h1>
          
          {/* Notifications Only */}
          <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0">
            <Bell className="w-5 h-5 md:w-6 md:h-6 text-gray-600" />
            <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 md:w-5 md:h-5 flex items-center justify-center text-[10px] md:text-xs">
              3
            </span>
          </button>
        </header>

        {/* Main Content */}
        <main className="p-4 md:p-8 max-w-full overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
