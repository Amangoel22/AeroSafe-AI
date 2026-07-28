import React, { useState } from 'react';
import DashboardLayout from '../layout/DashboardLayout.jsx';
import ComplaintTypeChart from '../analytics/ComplaintTypeChart.jsx';
import SeverityChart from '../analytics/SeverityChart.jsx';
import MonthlyTrendChart from '../analytics/MonthlyTrendChart.jsx';
import ResolutionTimeChart from '../analytics/ResolutionTimeChart.jsx';
import { useComplaints } from '../../context/ComplaintContext.jsx';

import { useAuth } from '../../context/AuthContext.jsx';

const Analytics = () => {
  const { user, role } = useAuth();
  const { complaints } = useComplaints();
  const [viewMode, setViewMode] = useState('performance');
  
  const displayComplaints = (role === 'engineer' && viewMode === 'performance')
    ? complaints.filter(c => Number(c.assignedToId) === Number(user?.id))
    : complaints;
    
  const total = displayComplaints.length;
  const resolved = displayComplaints.filter(c => c.status?.toLowerCase() === 'resolved').length;

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Analytics Dashboard</h1>
            <p className="text-slate-600 mt-1">Comprehensive incident statistics and trends</p>
          </div>
          
          {role === 'engineer' && (
            <div className="flex items-center bg-slate-100 p-1 rounded-full border border-slate-200 self-start sm:self-auto">
              <button
                onClick={() => setViewMode('performance')}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  viewMode === 'performance' 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                My Performance
              </button>
              <button
                onClick={() => setViewMode('overview')}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  viewMode === 'overview' 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Airport Overview
              </button>
            </div>
          )}
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm font-semibold text-slate-600 uppercase">Total Incidents</p>
            <p className="text-4xl font-bold text-slate-900 mt-2">{total}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm font-semibold text-slate-600 uppercase">Resolved</p>
            <p className="text-4xl font-bold text-green-600 mt-2">{resolved}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm font-semibold text-slate-600 uppercase">Resolution Rate</p>
            <p className="text-4xl font-bold text-blue-600 mt-2">
              {total > 0 ? Math.round((resolved / total) * 100) : 0}%
            </p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
