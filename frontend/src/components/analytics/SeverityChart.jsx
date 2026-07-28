import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const SeverityChart = ({ complaints }) => {
  const data = [
    { name: 'Critical', value: complaints.filter((c) => c.severity === 'critical').length, color: '#dc2626' },
    { name: 'High', value: complaints.filter((c) => c.severity === 'high').length, color: '#ea580c' },
    { name: 'Medium', value: complaints.filter((c) => c.severity === 'medium').length, color: '#d97706' },
    { name: 'Low', value: complaints.filter((c) => c.severity === 'low').length, color: '#2563eb' },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6 transition-all duration-300 hover:shadow-md">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-slate-900">Incidents by Severity Level</h3>
        <p className="text-xs text-slate-500">Distribution of incidents categorized by danger severity</p>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
          <YAxis stroke="#64748b" fontSize={12} tickLine={false} allowDecimals={false} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: 'none', color: '#fff' }}
          />
          <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={60}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SeverityChart;
