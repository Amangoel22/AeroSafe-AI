import React from 'react';
import Sidebar from './Sidebar.jsx';
import Header from './Header.jsx';
import TopNavbar from './TopNavbar.jsx';
import { useComplaints } from '../../context/ComplaintContext.jsx';
import { COMPLAINT_STATUSES } from '../../lib/types.js';

const DashboardLayout = ({ children, showNewAlerts = true }) => {
  const { complaints } = useComplaints();
  
  const newAlertsCount = complaints.filter(
    (c) => c.status === COMPLAINT_STATUSES.PENDING
  ).length;

  return (
    <div className="flex flex-col h-screen bg-white">
      <TopNavbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header newAlertsCount={showNewAlerts ? newAlertsCount : 0} />
          <main className="flex-1 overflow-auto bg-slate-50">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;