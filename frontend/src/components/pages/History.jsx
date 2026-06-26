import React, { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import DashboardLayout from '../layout/DashboardLayout.jsx';
import ComplaintTable from '../dashboard/ComplaintTable.jsx';
import ComplaintModal from '../dashboard/ComplaintModal.jsx';
import { useComplaints } from '../../context/ComplaintContext.jsx';
import { COMPLAINT_STATUSES } from '../../lib/types.js';

const History = () => {
  const { updateComplaintStatus, assignComplaint, searchQuery, setSearchQuery, getHistoryComplaints } = useComplaints();
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);


  const filteredComplaints = getHistoryComplaints();

  const handleComplaintClick = (complaint) => {
    setSelectedComplaint(complaint);
    setIsModalOpen(true);
  };

  const handleUpdateStatus = (complaintId, newStatus) => {
    updateComplaintStatus(complaintId, newStatus);
    if (selectedComplaint && selectedComplaint.id === complaintId) {
      setSelectedComplaint({ ...selectedComplaint, status: newStatus });
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Incident History</h1>
          <p className="text-slate-600 mt-1">View all resolved and closed incidents</p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm font-semibold text-slate-600 uppercase">Total Closed</p>
            <p className="text-4xl font-bold text-green-600 mt-2">{filteredComplaints.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm font-semibold text-slate-600 uppercase">This Month</p>
            <p className="text-4xl font-bold text-blue-600 mt-2">
              {filteredComplaints.filter(
                (c) => new Date(c.createdAt).getMonth() === new Date().getMonth()
              ).length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm font-semibold text-slate-600 uppercase">Avg Resolution Time</p>
            <p className="text-4xl font-bold text-purple-600 mt-2">~24h</p>
          </div>
        </div>

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

        {/* History Table */}
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
        onAssignComplaint={assignComplaint}
        onInformComplaint={assignComplaint}
      />
    </DashboardLayout>
  );
};

export default History;
