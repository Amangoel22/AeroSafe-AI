import React from 'react';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';

const ComplaintTypeChart = ({ complaints }) => {
  const data = [
    { name: 'Safety Hazard', value: complaints.filter((c) => c.issueType === 'Safety Hazard').length },
    { name: 'Security Issue', value: complaints.filter((c) => c.issueType === 'Security Issue').length },
    { name: 'Equipment Malfunction', value: complaints.filter((c) => c.issueType === 'Equipment Malfunction').length },
    { name: 'Maintenance', value: complaints.filter((c) => c.issueType === 'Maintenance Required').length },
    { name: 'Environmental', value: complaints.filter((c) => c.issueType === 'Environmental Concern').length },
    { name: 'Other', value: complaints.filter((c) => c.issueType === 'Other').length },
  ].filter((item) => item.value > 0);

  const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6'];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Complaints by Type</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ComplaintTypeChart;
