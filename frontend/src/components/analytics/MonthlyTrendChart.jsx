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
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Monthly Trends</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="incidents" stroke="#ef4444" strokeWidth={2} />
          <Line type="monotone" dataKey="resolved" stroke="#22c55e" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MonthlyTrendChart;
