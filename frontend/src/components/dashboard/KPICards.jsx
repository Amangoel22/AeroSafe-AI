import React from 'react';
import { AlertCircle, Clock, CheckCircle, Zap } from 'lucide-react';
import { COMPLAINT_STATUSES } from '../../lib/types.js';

const KPICard = ({ title, value, icon: Icon, bgColor, iconColor, onClick, isActive }) => (
  <div 
    onClick={onClick}
    className={`${bgColor} rounded-xl shadow-md p-6 text-white transition-all duration-300 transform hover:-translate-y-1.5 hover:shadow-lg hover:scale-[1.02] cursor-pointer group relative ${
      isActive ? 'ring-4 ring-offset-2 ring-blue-500 scale-[1.02]' : ''
    }`}
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium opacity-90">{title}</p>
        <p className="text-4xl font-bold mt-2 tracking-tight">{value}</p>
      </div>
      <Icon className={`${iconColor} transition-transform duration-300 group-hover:scale-110`} size={32} />
    </div>
  </div>
);

const KPICards = ({ statistics, currentFilter, onSelectFilter }) => {
  const kpiData = [
    {
      id: 'all',
      title: 'Total Alerts',
      value: statistics.total,
      icon: AlertCircle,
      bgColor: 'bg-gradient-to-br from-blue-500 to-blue-600',
      iconColor: 'text-blue-200',
    },
    {
      id: COMPLAINT_STATUSES.ACTIVE,
      title: 'Active',
      value: statistics.active,
      icon: Zap,
      bgColor: 'bg-gradient-to-br from-red-500 to-red-600',
      iconColor: 'text-red-200',
    },
    {
      id: COMPLAINT_STATUSES.PENDING,
      title: 'Pending',
      value: statistics.pending,
      icon: Clock,
      bgColor: 'bg-gradient-to-br from-amber-500 to-amber-600',
      iconColor: 'text-amber-200',
    },
    {
      id: COMPLAINT_STATUSES.RESOLVED,
      title: 'Resolved',
      value: statistics.resolved,
      icon: CheckCircle,
      bgColor: 'bg-gradient-to-br from-green-500 to-green-600',
      iconColor: 'text-green-200',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpiData.map((kpi) => (
        <KPICard 
          key={kpi.id} 
          {...kpi} 
          onClick={() => onSelectFilter && onSelectFilter(kpi.id)}
          isActive={currentFilter === kpi.id}
        />
      ))}
    </div>
  );
};

export default KPICards;
