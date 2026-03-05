import { Home, Users, UserPlus, Wheat, History, FileText, Shield, LogOut, Menu, X, Mail } from 'lucide-react';
import { useState, useEffect } from 'react';
import { userAPI } from '../../services/api';

interface AdminSidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

interface AdminProfile {
  firstName: string;
  lastName: string;
  email: string;
  image?: string;
}

export function AdminSidebar({ currentPage, onNavigate, onLogout }: AdminSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const menuItems = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'inquiries', label: 'Inquiries', icon: Mail },
    { id: 'farmers', label: 'All Farmers', icon: Users },
    { id: 'register', label: 'Register Farmer', icon: UserPlus },
    { id: 'harvest', label: 'Add Harvest', icon: Wheat },
    { id: 'history', label: 'Harvest History', icon: History },
    { id: 'reports', label: 'Reports', icon: FileText },
  ];

  // Fetch admin profile on component mount
  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        setLoadingProfile(true);
        const response = await userAPI.fetchProfile();

        // Handle both response.user and response.data.user formats
        const userData = response.user || response.data?.user || response;

        if (userData) {
          setAdminProfile({
            firstName: userData.firstName || 'Admin',
            lastName: userData.lastName || 'User',
            email: userData.email || 'admin@agriconnect.lk',
            image: userData.image,
          });
        }
      } catch (error) {
        console.error('Error fetching admin profile:', error);
        // Fallback to default admin data if fetch fails
        setAdminProfile({
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@agriconnect.lk',
        });
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchAdminProfile();
  }, []);

  const handleNavigate = (page: string) => {
    onNavigate(page);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-green-700 text-white rounded-lg shadow-lg"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40
        w-72 bg-gradient-to-b from-green-800 to-green-700 text-white flex flex-col h-screen
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-green-600/30">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-white/15 p-2 rounded-lg backdrop-blur-sm">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-semibold text-xl">AgriConnect</h1>
              <p className="text-sm text-green-200">Admin Portal</p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-6 py-4 transition-all ${isActive
                  ? 'bg-green-600/50 text-white border-r-4 border-white'
                  : 'text-green-50 hover:bg-green-600/30'
                  }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Admin Info & Logout */}
        <div className="p-6 border-t border-green-600/30">
          {/* Admin Profile Button */}
          <button
            onClick={() => handleNavigate('profile')}
            className="w-full flex items-center gap-3 mb-4 p-3 rounded-lg hover:bg-green-600/30 transition-all"
          >
            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
              {adminProfile?.image ? (
                <img
                  src={adminProfile.image}
                  alt="Admin Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-sm font-semibold">
                  {adminProfile?.firstName?.charAt(0)}{adminProfile?.lastName?.charAt(0)}
                </span>
              )}
            </div>
            <div className="text-left flex-1 min-w-0">
              <p className="text-sm font-medium">
                {loadingProfile ? 'Loading...' : (adminProfile ? `${adminProfile.firstName || 'Admin'} ${adminProfile.lastName || 'User'}` : 'Admin User')}
              </p>
              <p className="text-xs text-green-200 truncate">
                {adminProfile?.email || 'admin@agriconnect.lk'}
              </p>
            </div>
          </button>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 transition-all text-green-50 hover:bg-green-600/50 rounded-lg border border-green-600/30"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
}