import React, { useState } from 'react';
import DashboardLayout from '../layout/DashboardLayout.jsx';
import ComplaintTypeChart from '../analytics/ComplaintTypeChart.jsx';
import SeverityChart from '../analytics/SeverityChart.jsx';
import MonthlyTrendChart from '../analytics/MonthlyTrendChart.jsx';
import ResolutionTimeChart from '../analytics/ResolutionTimeChart.jsx';
import LocationBreakdownChart from '../analytics/LocationBreakdownChart.jsx';
import { useComplaints } from '../../context/ComplaintContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

const Analytics = () => {
  const { user, role } = useAuth();
  const { complaints } = useComplaints();
  const [viewMode, setViewMode] = useState('performance');
  const [timeRange, setTimeRange] = useState('all');
  
  const displayComplaints = (role === 'engineer' && viewMode === 'performance')
    ? complaints.filter(c => Number(c.assignedToId) === Number(user?.id))
    : complaints;
    
  const total = displayComplaints.length;
  const resolved = displayComplaints.filter(c => c.status?.toLowerCase() === 'resolved').length;
  const falseAlarms = displayComplaints.filter(c => c.status === 'false_alarm' || c.status?.toLowerCase() === 'false alarm').length;
  const criticalCount = displayComplaints.filter(c => c.severity === 'critical').length;
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 border-blue-600 pl-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Analytics Dashboard</h1>
            <p className="text-slate-600 mt-1">Comprehensive incident statistics and safety trends</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {role === 'engineer' && (
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  onClick={() => setViewMode('performance')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    viewMode === 'performance' 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  My Performance
                </button>
                <button
                  onClick={() => setViewMode('overview')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    viewMode === 'overview' 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Airport Overview
                </button>
              </div>
            )}

            <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
              {['all', '7d', '30d'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                    timeRange === range
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {range === 'all' ? 'All Time' : range === '7d' ? '7 Days' : '30 Days'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Statistics KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-indigo-500 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg">
            <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Total Incidents</p>
            <p className="text-4xl font-bold text-indigo-600 mt-2 tracking-tight">{total}</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg">
            <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Total Resolved</p>
            <p className="text-4xl font-bold text-green-600 mt-2 tracking-tight">{resolved}</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-amber-500 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg">
            <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">False Alarms</p>
            <p className="text-4xl font-bold text-amber-600 mt-2 tracking-tight">{falseAlarms}</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg">
            <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Resolution Rate</p>
            <p className="text-4xl font-bold text-blue-600 mt-2 tracking-tight">{resolutionRate}%</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg">
            <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Critical Hazards</p>
            <p className="text-4xl font-bold text-red-600 mt-2 tracking-tight">{criticalCount}</p>
          </div>
        </div>

        {/* Full-Width Stacked Charts List */}
        <div className="space-y-6">
          <LocationBreakdownChart complaints={displayComplaints} />
          <ComplaintTypeChart complaints={displayComplaints} />
          <SeverityChart complaints={displayComplaints} />
          <MonthlyTrendChart complaints={displayComplaints} />
          <ResolutionTimeChart complaints={displayComplaints} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
