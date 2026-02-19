import { useState } from 'react';
import { LoginPage } from './components/LoginPage';
import { AdminPortal } from './components/admin/AdminPortal';
import { Sidebar } from './components/Sidebar';
import { HomePage } from './components/HomePage';
import { CropDataPage } from './components/CropDataPage';
import { DiseasePage } from './components/DiseasePage';
import { ProfilePage } from './components/ProfilePage';
import { ReportsPage } from './components/ReportsPage';
import { MessagesPage } from './components/MessagesPage';
import { Bell } from 'lucide-react';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState<'farmer' | 'admin' | null>(null);
  const [currentPage, setCurrentPage] = useState('home');

  const handleLogin = (type: 'farmer' | 'admin') => {
    setUserType(type);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserType(null);
    setCurrentPage('home');
  };

  // Show login page if not logged in
  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // Show admin portal if admin
  if (userType === 'admin') {
    return <AdminPortal onLogout={handleLogout} />;
  }

  // Show farmer dashboard
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} onLogout={handleLogout} />
      
      <div className="flex-1 w-full lg:ml-64">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 md:px-8 py-4 flex items-center justify-between sticky top-0 z-20">
          <h1 className="text-gray-800 text-lg md:text-xl font-medium ml-12 lg:ml-0">
            {currentPage === 'home' && 'Home'}
            {currentPage === 'crop' && 'Crop Data'}
            {currentPage === 'disease' && 'Disease'}
            {currentPage === 'profile' && 'My Profile'}
            {currentPage === 'reports' && 'Reports'}
            {currentPage === 'notes' && 'Contact Admin'}
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
          {currentPage === 'home' && <HomePage onNavigate={setCurrentPage} />}
          {currentPage === 'crop' && <CropDataPage />}
          {currentPage === 'disease' && <DiseasePage />}
          {currentPage === 'profile' && <ProfilePage />}
          {currentPage === 'reports' && <ReportsPage />}
          {currentPage === 'notes' && <MessagesPage />}
        </main>
      </div>
    </div>
  );
}