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
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Resolution Time Distribution</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="range" />
          <YAxis />
          <Tooltip />
          <Area type="monotone" dataKey="count" fill="#3b82f6" stroke="#1e40af" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ResolutionTimeChart;
