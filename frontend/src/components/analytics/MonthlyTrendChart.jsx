import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { COMPLAINT_STATUSES } from "../../lib/types";

const MonthlyTrendChart = ({ complaints }) => {
  const monthlyData = {};
  
  // Initialize last 6 months (including current)
  const today = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const monthName = d.toLocaleDateString('en-US', { month: 'short' });
    monthlyData[monthName] = { month: monthName, incidents: 0, resolved: 0 };
  }

  // Populate with actual data
  complaints.forEach((c) => {
    if (c.createdAt) {
      const monthName = new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short' });
      if (monthlyData[monthName]) {
        monthlyData[monthName].incidents += 1;
        if (c.status === COMPLAINT_STATUSES.RESOLVED || c.status.toLowerCase() === 'resolved') {
          monthlyData[monthName].resolved += 1;
        }
      }
    }
  });

  const data = Object.values(monthlyData);

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6 transition-all duration-300 hover:shadow-md">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-slate-900">Monthly Incident & Resolution Trends</h3>
        <p className="text-xs text-slate-500">Historical trend comparing reported vs resolved complaints</p>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} />
          <YAxis stroke="#64748b" fontSize={12} tickLine={false} allowDecimals={false} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: 'none', color: '#fff' }}
          />
          <Legend verticalAlign="top" align="right" height={36} />
          <Line type="monotone" name="Reported Incidents" dataKey="incidents" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} />
          <Line type="monotone" name="Resolved Incidents" dataKey="resolved" stroke="#22c55e" strokeWidth={3} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MonthlyTrendChart;
