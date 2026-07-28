import React from "react";
import {
  LayoutDashboard,
  BarChart3,
  History,
  Settings,
  LogOut,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

const Sidebar = () => {
  const { logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/analytics", icon: BarChart3, label: "Analytics" },
    { path: "/history", icon: History, label: "History" },
    { path: "/settings", icon: Settings, label: "Settings" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="w-64 h-full bg-white border-r border-slate-200 shadow-lg flex flex-col transition-all duration-300">
      {/* Mini Elegant Header */}
      <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-2.5">
        <div className="h-2.5 w-2.5 rounded-full bg-blue-600 animate-pulse shadow-sm shadow-blue-500" />
        <span className="text-xs font-black text-slate-700 uppercase tracking-widest">
          AeroSafe AI Portal
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 pt-4 space-y-2.5">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 transform hover:translate-x-1 ${isActive(item.path)
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20 font-semibold"
                  : "text-slate-600 hover:bg-blue-50 hover:text-blue-600 hover:shadow-sm font-medium"
                }`}
            >
              <Icon size={20} className={`transition-transform duration-300 ${isActive(item.path) ? "scale-110" : "group-hover:scale-110"}`} />
              <span className="text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="mt-auto p-4 border-t border-slate-100 bg-slate-50/50">
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-300 transform hover:translate-x-1 font-semibold"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;