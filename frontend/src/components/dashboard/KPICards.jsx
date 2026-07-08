import React from 'react';
import { AlertCircle, Clock, CheckCircle, Zap } from 'lucide-react';

const KPICard = ({ title, value, icon: Icon, bgColor, iconColor }) => (
  <div className={`${bgColor} rounded-lg shadow-md p-6 text-white`}>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium opacity-90">{title}</p>
        <p className="text-4xl font-bold mt-2">{value}</p>
      </div>
      <Icon className={`${iconColor}`} size={32} />
    </div>
  </div>
);

const KPICards = ({ statistics }) => {
  const kpiData = [
    {
      title: 'Total Alerts',
      value: statistics.total,
      icon: AlertCircle,
      bgColor: 'bg-gradient-to-br from-blue-500 to-blue-600',
      iconColor: 'text-blue-200',
    },
    {
      title: "Assigned",
      value: statistics.assigned,
      icon: Zap,
      bgColor: 'bg-gradient-to-br from-red-500 to-red-600',
      iconColor: 'text-red-200',
    },
    {
      title: 'Pending',
      value: statistics.pending,
      icon: Clock,
      bgColor: 'bg-gradient-to-br from-amber-500 to-amber-600',
      iconColor: 'text-amber-200',
    },
    {
      title: 'Resolved',
      value: statistics.resolved,
      icon: CheckCircle,
      bgColor: 'bg-gradient-to-br from-green-500 to-green-600',
      iconColor: 'text-green-200',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpiData.map((kpi, index) => (
        <KPICard key={index} {...kpi} />
      ))}
    </div>
  );
};

export default KPICards;
