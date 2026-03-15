import { Home, Users, UserPlus, Wheat, History, FileText, Shield, LogOut, Menu, X, Mail, LandPlot } from 'lucide-react';
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
  const [adminUser, setAdminUser] = useState<any>(null);

  useEffect(() => {
    const loadAdminUser = async () => {
      // First try to load from local storage for immediate render
      const authData = localStorage.getItem('agriconnect_auth');
      if (authData) {
        try {
          const parsed = JSON.parse(authData);
          if (parsed.user) {
            setAdminUser(parsed.user);
          }
        } catch (e) {
          console.error("Failed to parse auth data", e);
        }
      }

      // Then fetch fresh data from backend
      try {
        const response = await userAPI.fetchProfile();
        if (response && response.user) {
          setAdminUser(response.user);
          // Update local storage invisibly
          if (authData) {
            const parsed = JSON.parse(authData);
            parsed.user = { ...parsed.user, ...response.user };
            localStorage.setItem('agriconnect_auth', JSON.stringify(parsed));
          }
        }
      } catch (err) {
        console.error("Failed to fetch fresh admin profile for sidebar", err);
      }
    };

    loadAdminUser();

    // Listen for storage events (which we trigger manually on profile save)
    window.addEventListener('storage', loadAdminUser);

    return () => {
      window.removeEventListener('storage', loadAdminUser);
    };
  }, []);

  const menuItems = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'inquiries', label: 'Inquiries', icon: Mail },
    { id: 'farmers', label: 'All Farms', icon: LandPlot },
    { id: 'register', label: 'Register Farmer', icon: UserPlus },
    { id: 'harvest', label: 'Add Harvest', icon: Wheat },
    { id: 'history', label: 'Harvest History', icon: History },
    { id: 'reports', label: 'Reports', icon: FileText },
  ];



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
        <div className="p-6" style={{
          borderBottom: '1px solid rgba(255,255,255,0.15)',
          paddingBottom: '16px',
          marginBottom: '8px'
        }}>
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
                className={`w-full flex items-center gap-3 px-6 py-4 ${isActive ? 'text-white' : 'text-green-50 group hover:text-white'}`}
                style={isActive ? {
                  background: 'rgba(255,255,255,0.2)',
                  borderLeft: '3px solid white',
                  borderRadius: '0 8px 8px 0',
                  fontWeight: '600',
                  transition: 'all 0.15s ease'
                } : {
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                    e.currentTarget.style.borderRadius = '8px';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <Icon className="w-5 h-5" style={isActive ? { color: 'white' } : { transition: 'color 0.15s ease' }} />
                <span className="text-sm" style={isActive ? { color: 'white', fontWeight: '600' } : { transition: 'color 0.15s ease' }}>{item.label}</span>
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
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: '#DCFCE7',
              color: '#15803D',
              fontSize: '13px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              {adminUser ? (
                `${adminUser.firstName?.charAt(0) || 'A'}${adminUser.lastName?.charAt(0) || 'D'}`
              ) : (
                'AD'
              )}
            </div>
            <div className="text-left overflow-hidden">
              <p style={{
                fontSize: '14px',
                fontWeight: '600',
                color: 'white'
              }} className="truncate">
                {adminUser ? `${adminUser.firstName} ${adminUser.lastName}` : 'Admin User'}
              </p>
              <p style={{
                fontSize: '12px',
                color: 'rgba(255,255,255,0.6)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '140px'
              }}>
                {adminUser?.email || 'admin@agriconnect.lk'}
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