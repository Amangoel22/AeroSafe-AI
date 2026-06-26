import React from 'react';
import { useAuth } from '../../context/AuthContext.jsx';

const Header = () => {
  const { user } = useAuth();

  return (
    <header className="bg-white border-b-2 border-blue-200 shadow-sm">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-slate-900">
            Welcome, <span className="text-blue-600">{user?.name || 'Admin'}</span>!
          </h2>
        </div>
      </div>
    </header>
  );
};

export default Header;