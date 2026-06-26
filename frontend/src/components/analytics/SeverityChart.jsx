import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const SeverityChart = ({ complaints }) => {
  const data = [
    { name: 'Critical', value: complaints.filter((c) => c.severity === 'critical').length },
    { name: 'High', value: complaints.filter((c) => c.severity === 'high').length },
    { name: 'Medium', value: complaints.filter((c) => c.severity === 'medium').length },
    { name: 'Low', value: complaints.filter((c) => c.severity === 'low').length },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Incidents by Severity</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#ef4444" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SeverityChart;
