import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const MonthlyTrendChart = ({ complaints }) => {
  const data = [
    { month: 'Jan', incidents: 12, resolved: 10 },
    { month: 'Feb', incidents: 15, resolved: 12 },
    { month: 'Mar', incidents: 18, resolved: 14 },
    { month: 'Apr', incidents: 22, resolved: 18 },
    { month: 'May', incidents: 25, resolved: 20 },
    { month: 'Jun', incidents: complaints.length, resolved: complaints.filter((c) => c.status === 'closed').length },
  ];

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
