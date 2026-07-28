import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const LocationBreakdownChart = ({ complaints }) => {
  const locCounts = {};
  complaints.forEach((c) => {
    const loc = c.location || 'Unknown Location';
    locCounts[loc] = (locCounts[loc] || 0) + 1;
  });

  const data = Object.keys(locCounts).map((key) => ({
    location: key,
    incidents: locCounts[key],
  }));

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6 transition-all duration-300 hover:shadow-md">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-slate-900">Runway & Location Breakdown</h3>
        <p className="text-xs text-slate-500">Distribution of safety incidents across airport zones</p>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="location" stroke="#64748b" fontSize={12} tickLine={false} />
          <YAxis stroke="#64748b" fontSize={12} tickLine={false} allowDecimals={false} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: 'none', color: '#fff' }}
            itemStyle={{ color: '#60a5fa' }}
          />
          <Bar dataKey="incidents" fill="#2563eb" radius={[6, 6, 0, 0]} maxBarSize={50} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LocationBreakdownChart;
