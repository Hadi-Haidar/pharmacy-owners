import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, LogOut, Store, Package, Building2, MessageCircle } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { owner, pharmacy, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const menuItems = [
    {
      name: 'All Medicines',
      path: '/medicines',
      icon: Package,
    },
    {
      name: 'My Pharmacy',
      path: '/my-inventory',
      icon: Building2,
    },
    {
      name: 'Messages',
      path: '/chat',
      icon: MessageCircle,
    },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-screen bg-white border-r border-gray-200 
          transform transition-all duration-300 ease-in-out flex flex-col
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          w-64`}
      >
        {/* Logo */}
        <div className="h-16 border-b border-gray-200 flex items-center justify-between px-4">
          <Link to="/medicines" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
              <Store className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <h1 className="font-bold text-gray-900 text-sm">
              Pharmacy Portal
            </h1>
          </Link>
          
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Pharmacy Info */}
        <div className="px-4 py-4 border-b border-gray-200 bg-gradient-to-br from-blue-50 to-cyan-50">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center" style={{ width: '43.2px', height: '43.2px', borderRadius: '30%' }}>
              <span className="text-white font-bold text-lg">
                {pharmacy?.title?.charAt(0).toUpperCase() || 'P'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-extrabold truncate tracking-wide" style={{ color: '#06B6D4', fontFamily: 'Georgia, "Times New Roman", serif' }}>
                {pharmacy?.title || 'Pharmacy'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                      ${active 
                        ? 'bg-blue-50 text-blue-700 font-medium' 
                        : 'text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    <Icon className={`w-5 h-5 transition-colors
                      ${active ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'}`} 
                    />
                    <span className="text-sm">{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="border-t border-gray-200 p-3">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg 
              bg-red-50 text-red-700 hover:bg-red-100 transition-all duration-200 text-sm font-medium"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
        {/* Top Navbar */}
        <header className="bg-white border-b border-gray-200 z-30 sticky top-0">
          <div className="flex items-center justify-between h-16 px-4 lg:px-6">
            {/* Left Section - Mobile Menu */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Right Section - User Info */}
            <div className="flex items-center gap-3 ml-auto">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-medium text-gray-900">
                  {owner?.name || 'Owner'}
                </span>
                <span className="text-xs" style={{ color: '#22C55E' }}>
                  {pharmacy?.title || 'Pharmacy'}
                </span>
              </div>
              
              <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {owner?.name?.charAt(0).toUpperCase() || 'O'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-6 max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;

