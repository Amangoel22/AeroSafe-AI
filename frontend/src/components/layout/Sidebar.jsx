import React from 'react';
import { LayoutDashboard, BarChart3, History, Settings, LogOut } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

const Sidebar = () => {
  const { logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/history', icon: History, label: 'History' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="w-64 bg-white text-slate-800 h-screen flex flex-col shadow-xl border-r-4 border-blue-600">
      {/* Header*/}
      <div className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 border-b-2 border-blue-600">
        <h1 className="text-2xl font-bold text-blue-600">AAI Runway</h1>
        <p className="text-xs text-blue-600 font-semibold mt-1 uppercase tracking-wide">Alert Management</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive(item.path)
                  ? 'bg-blue-600 text-white shadow-md font-semibold'
                  : 'text-slate-700 hover:bg-blue-50 hover:text-blue-600 font-medium'
              }`}
            >
              <Icon size={20} />
              <span className="text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t-2 border-blue-200">
        <button
          onClick={logout}
          className="flex items-center space-x-3 w-full px-4 py-3 text-slate-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all font-semibold"
        >
          <LogOut size={20} />
          <span className="text-sm">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;