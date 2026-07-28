import React from 'react';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';

const ComplaintTypeChart = ({ complaints }) => {
  // Dynamically group complaints by their actual issueType
  const typeCounts = {};
  complaints.forEach((c) => {
    const type = c.issueType || 'Unknown';
    typeCounts[type] = (typeCounts[type] || 0) + 1;
  });

  const data = Object.keys(typeCounts).map(key => ({
    name: key,
    value: typeCounts[key]
  }));

  const COLORS = ['#4f46e5', '#0d9488', '#0284c7', '#7c3aed', '#c026d3', '#059669', '#0891b2', '#475569'];

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6 transition-all duration-300 hover:shadow-md">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-slate-900">Complaints by Issue Type</h3>
        <p className="text-xs text-slate-500">Categorical breakdown of reported hazards</p>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={true}
            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: 'none', color: '#fff' }}
          />
          <Legend verticalAlign="bottom" height={36} iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ComplaintTypeChart;
