import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ResolutionTimeChart = ({ complaints }) => {
  const data = [
    { range: '0-15 min', count: 8 },
    { range: '15-30 min', count: 12 },
    { range: '30-60 min', count: 6 },
    { range: '60+ min', count: 4 },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6 transition-all duration-300 hover:shadow-md">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-slate-900">Resolution Time Distribution</h3>
        <p className="text-xs text-slate-500">Breakdown of time required by engineers to resolve safety alerts</p>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="range" stroke="#64748b" fontSize={12} tickLine={false} />
          <YAxis stroke="#64748b" fontSize={12} tickLine={false} allowDecimals={false} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: 'none', color: '#fff' }}
          />
          <Area type="monotone" dataKey="count" fill="#3b82f6" fillOpacity={0.2} stroke="#2563eb" strokeWidth={3} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ResolutionTimeChart;
