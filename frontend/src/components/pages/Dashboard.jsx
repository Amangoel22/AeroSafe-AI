import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import DashboardLayout from '../layout/DashboardLayout.jsx';
import KPICards from '../dashboard/KPICards.jsx';
import LiveAlertPanel from '../dashboard/LiveAlertPanel.jsx';
import FilterTabs from '../dashboard/FilterTabs.jsx';
import ComplaintTable from '../dashboard/ComplaintTable.jsx';
import ComplaintModal from '../dashboard/ComplaintModal.jsx';
import { useComplaints } from '../../context/ComplaintContext.jsx';
import { createRandomAlert } from '../../lib/alert-simulator.js';
import { COMPLAINT_STATUSES } from '../../lib/types.js';

const Dashboard = () => {
  const {
    complaints,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    updateComplaintStatus,
    assignComplaint,
    addComplaint,
    getFilteredComplaints,
    getStatistics,
  } = useComplaints();

  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [latestComplaint, setLatestComplaint] = useState(null);

  // Start alert simulator
  useEffect(() => {
    const unsubscribe = createRandomAlert((newComplaint) => {
      addComplaint(newComplaint);
      setLatestComplaint(newComplaint);
    });

    return () => unsubscribe();
  }, [addComplaint]);

  // Clear latest complaint notification after 5 seconds
  useEffect(() => {
    if (latestComplaint) {
      const timeout = setTimeout(() => setLatestComplaint(null), 5000);
      return () => clearTimeout(timeout);
    }
  }, [latestComplaint]);

  const handleComplaintClick = (complaint) => {
    setSelectedComplaint(complaint);
    setIsModalOpen(true);
  };

  const handleUpdateStatus = (complaintId, newStatus) => {
    updateComplaintStatus(complaintId, newStatus);
    // Update the modal to show new status
    if (selectedComplaint && selectedComplaint.id === complaintId) {
      setSelectedComplaint({ ...selectedComplaint, status: newStatus });
    }
  };

  const handleAssignComplaint = (complaintId, officer, actionType) => {
    assignComplaint(complaintId, officer, actionType);
    // Update the modal
    if (selectedComplaint && selectedComplaint.id === complaintId) {
      const newStatus = actionType === 'assign' ? COMPLAINT_STATUSES.ACTIVE : COMPLAINT_STATUSES.INFORMED;
      setSelectedComplaint({
        ...selectedComplaint,
        assignedTo: officer,
        status: newStatus,
      });
    }
  };

  const filteredComplaints = getFilteredComplaints();
  const statistics = getStatistics();

  return (
    <DashboardLayout showNewAlerts={true}>
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Real-time Runway Management</h1>
          <p className="text-slate-600 mt-1">Monitor and manage airport runway incidents</p>
        </div>

        {/* KPI Cards */}
        <KPICards statistics={statistics} />

        {/* Live Alert Panel */}
        {latestComplaint && (
          <LiveAlertPanel latestComplaint={latestComplaint} />
        )}

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-3 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search by location, description, or type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filter Tabs */}
        <FilterTabs
          currentFilter={filter}
          onFilterChange={setFilter}
          statistics={statistics}
        />

        {/* Complaints Table */}
        <ComplaintTable
          complaints={filteredComplaints}
          onComplaintClick={handleComplaintClick}
        />
      </div>

      {/* Complaint Detail Modal */}
      <ComplaintModal
        isOpen={isModalOpen}
        complaint={selectedComplaint}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedComplaint(null);
        }}
        onUpdateStatus={handleUpdateStatus}
        onAssignComplaint={handleAssignComplaint}
        onInformComplaint={handleAssignComplaint}
      />
    </DashboardLayout>
  );
};

export default Dashboard;
