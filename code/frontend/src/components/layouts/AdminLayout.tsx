import { Outlet, useNavigate } from 'react-router';
import { AdminSidebar } from '../admin/AdminSidebar';
import { Bell } from 'lucide-react';

export function AdminLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('agriconnect_auth');
    navigate('/');
  };

  // Get current page from URL
  const getCurrentPage = () => {
    const path = window.location.pathname;
    if (path.includes('/dashboard')) return 'dashboard';
    if (path.includes('/inquiries')) return 'inquiries';
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
      inquiries: '/admin/inquiries',
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
            {getCurrentPage() === 'inquiries' && 'Farmer Inquiries'}
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
