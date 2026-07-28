import React from 'react';

const TopNavbar = () => {
  return (
    <nav className="bg-gradient-to-r from-slate-800 to-blue-900 text-white shadow-xl">
      <div className="px-8 py-4 flex items-center justify-between gap-8">
        <div className="flex items-center flex-shrink-0">
          <img src="/aai_logo.png" alt="AAI Logo" className="h-20 w-20 rounded-full shadow-md" />
        </div>


        <div className="flex-1 text-center">
          <h1 className="text-3xl font-bold text-white tracking-wide">Airports Authority of India</h1>
          <p className="text-sm text-blue-100 font-semibold mt-1 tracking-wide">Regional Head Quarter, NATS Complex, New Delhi </p>
        </div>

        <div className="flex items-center flex-shrink-0">
          <img src="/aai_logo.png" alt="RAMS Logo" className="h-20 w-20 rounded-full shadow-md" />
        </div>
      </div>
    </nav>
  );
};

export default TopNavbar;