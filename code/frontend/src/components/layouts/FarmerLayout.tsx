import { Outlet, useNavigate } from 'react-router';
import { Sidebar } from '../Sidebar';
import { Bell } from 'lucide-react';
import { useEffect } from 'react';

export function FarmerLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('agriconnect_auth');
    navigate('/');
  };

  // Get current page from URL
  const getCurrentPage = () => {
    const path = window.location.pathname;
    if (path.includes('/home')) return 'home';
    if (path.includes('/crop-data')) return 'crop';
    if (path.includes('/disease')) return 'disease';
    if (path.includes('/profile')) return 'profile';
    if (path.includes('/reports')) return 'reports';
    if (path.includes('/contact-admin')) return 'notes';
    return 'home';
  };

  const handleNavigate = (page: string) => {
    const routes: Record<string, string> = {
      home: '/farmer/home',
      crop: '/farmer/crop-data',
      disease: '/farmer/disease',
      profile: '/farmer/profile',
      reports: '/farmer/reports',
      notes: '/farmer/contact-admin',
    };
    navigate(routes[page] || '/farmer/home');
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar 
        currentPage={getCurrentPage()} 
        onNavigate={handleNavigate} 
        onLogout={handleLogout} 
      />
      
      <div className="flex-1 w-full lg:ml-64">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 md:px-8 py-4 flex items-center justify-between sticky top-0 z-20">
          <h1 className="text-gray-800 text-lg md:text-xl font-medium ml-12 lg:ml-0">
            {getCurrentPage() === 'home' && 'Home'}
            {getCurrentPage() === 'crop' && 'Crop Data'}
            {getCurrentPage() === 'disease' && 'Disease'}
            {getCurrentPage() === 'profile' && 'My Profile'}
            {getCurrentPage() === 'reports' && 'Reports'}
            {getCurrentPage() === 'notes' && 'Contact Admin'}
          </h1>
          
          {/* Notifications Only */}
          <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="w-5 h-5 md:w-6 md:h-6 text-gray-600" />
            <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 md:w-5 md:h-5 flex items-center justify-center text-[10px] md:text-xs">
              2
            </span>
          </button>
        </header>

        {/* Main Content */}
        <main className="p-4 md:p-8">
          <Outlet context={{ onNavigate: handleNavigate }} />
        </main>
      </div>
    </div>
  );
}
