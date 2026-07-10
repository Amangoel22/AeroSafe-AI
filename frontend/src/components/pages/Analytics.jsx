import React from 'react';
import DashboardLayout from '../layout/DashboardLayout.jsx';
import ComplaintTypeChart from '../analytics/ComplaintTypeChart.jsx';
import SeverityChart from '../analytics/SeverityChart.jsx';
import MonthlyTrendChart from '../analytics/MonthlyTrendChart.jsx';
import ResolutionTimeChart from '../analytics/ResolutionTimeChart.jsx';
import { useComplaints } from '../../context/ComplaintContext.jsx';

const Analytics = () => {
  const { complaints } = useComplaints();
  const { total, resolved } = useComplaints().getStatistics();

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Analytics Dashboard</h1>
          <p className="text-slate-600 mt-1">Comprehensive incident statistics and trends</p>
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
          <ComplaintTypeChart complaints={complaints} />
          <SeverityChart complaints={complaints} />
          <MonthlyTrendChart complaints={complaints} />
          <ResolutionTimeChart complaints={complaints} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
