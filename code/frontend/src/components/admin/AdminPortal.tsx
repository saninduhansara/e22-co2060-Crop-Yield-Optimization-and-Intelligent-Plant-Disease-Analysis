import { useState } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { AdminDashboard } from './AdminDashboard';
import { AllFarmers } from './AllFarmers';
import { RegisterFarmer } from './RegisterFarmer';
import { AddHarvest } from './AddHarvest';
import { HarvestHistory } from './HarvestHistory';
import { AdminReports } from './AdminReports';
import { AdminProfilePage } from './AdminProfilePage';
import { Bell } from 'lucide-react';

interface AdminPortalProps {
  onLogout: () => void;
}

export function AdminPortal({ onLogout }: AdminPortalProps) {
  const [currentPage, setCurrentPage] = useState('dashboard');

  return (
    <div className="flex min-h-screen bg-gray-50 overflow-x-hidden">
      <AdminSidebar 
        currentPage={currentPage} 
        onNavigate={setCurrentPage} 
        onLogout={onLogout}
      />
      
      <div className="flex-1 w-full lg:ml-72 min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 md:px-8 py-4 flex items-center justify-between sticky top-0 z-20">
          <h1 className="text-gray-800 text-lg md:text-xl font-medium ml-12 lg:ml-0">
            {currentPage === 'dashboard' && 'Home'}
            {currentPage === 'farmers' && 'All Farmers'}
            {currentPage === 'register' && 'Register Farmer'}
            {currentPage === 'harvest' && 'Add Harvest'}
            {currentPage === 'history' && 'Harvest History'}
            {currentPage === 'reports' && 'Reports'}
            {currentPage === 'profile' && 'My Profile'}
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
          {currentPage === 'dashboard' && <AdminDashboard />}
          {currentPage === 'farmers' && <AllFarmers />}
          {currentPage === 'register' && <RegisterFarmer />}
          {currentPage === 'harvest' && <AddHarvest />}
          {currentPage === 'history' && <HarvestHistory />}
          {currentPage === 'reports' && <AdminReports />}
          {currentPage === 'profile' && <AdminProfilePage />}
        </main>
      </div>
    </div>
  );
}