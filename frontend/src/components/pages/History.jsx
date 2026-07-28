import React, { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import DashboardLayout from '../layout/DashboardLayout.jsx';
import ComplaintTable from '../dashboard/ComplaintTable.jsx';
import ComplaintModal from '../dashboard/ComplaintModal.jsx';
import { useComplaints } from '../../context/ComplaintContext.jsx';
import { COMPLAINT_STATUSES } from '../../lib/types.js';

import { useAuth } from '../../context/AuthContext.jsx';

const History = () => {
  const { user, role } = useAuth();
  const { complaints, updateComplaintStatus, assignComplaint, getHistoryComplaints } = useComplaints();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");

  const baseHistory = getHistoryComplaints(statusFilter, severityFilter, searchQuery);
  const filteredComplaints = role === 'engineer' 
    ? baseHistory.filter(c => Number(c.assignedToId) === Number(user?.id))
    : baseHistory;

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

  // Get local statistics based on all complaints in the database
  const displayComplaints = role === 'engineer' 
    ? complaints.filter(c => Number(c.assignedToId) === Number(user?.id))
    : complaints;
    
  const totalClosed = displayComplaints.filter((c) => c.status === COMPLAINT_STATUSES.RESOLVED).length;
  const totalActive = displayComplaints.filter((c) => c.status === COMPLAINT_STATUSES.ACTIVE).length;
  const totalPending = displayComplaints.filter((c) => c.status === COMPLAINT_STATUSES.PENDING).length;
  const totalFalseAlarms = displayComplaints.filter((c) => c.status === COMPLAINT_STATUSES.FALSE_ALARM).length;

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div className="border-l-4 border-blue-600 pl-4">
          <h1 className="text-3xl font-bold text-slate-900">Incident History</h1>
          <p className="text-slate-600 mt-1">View all active, pending, or resolved complaints</p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <p className="text-sm font-semibold text-slate-600 uppercase">Total Closed / Resolved</p>
            <p className="text-4xl font-bold text-green-600 mt-2">{totalClosed}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <p className="text-sm font-semibold text-slate-600 uppercase">Total Active</p>
            <p className="text-4xl font-bold text-blue-600 mt-2">{totalActive}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-amber-500">
            <p className="text-sm font-semibold text-slate-600 uppercase">Total Pending</p>
            <p className="text-4xl font-bold text-amber-500 mt-2">{totalPending}</p>
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

        {/* Filters Group */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Status Filter</label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'all', label: 'All', count: complaints.length },
                { id: COMPLAINT_STATUSES.PENDING, label: 'Pending', count: totalPending },
                { id: COMPLAINT_STATUSES.ACTIVE, label: 'Active', count: totalActive },
                { id: COMPLAINT_STATUSES.RESOLVED, label: 'Resolved', count: totalClosed },
                { id: COMPLAINT_STATUSES.FALSE_ALARM, label: 'False Alarm', count: totalFalseAlarms },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all text-sm flex items-center ${
                    statusFilter === tab.id
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-white text-slate-700 border border-slate-200 hover:border-blue-300"
                  }`}
                >
                  {tab.label}
                  <span className={`ml-2 px-1.5 py-0.5 rounded text-xs font-semibold ${
                    statusFilter === tab.id
                      ? "bg-blue-700 text-white"
                      : "bg-slate-100 text-slate-700"
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Severity Filter</label>
            <div className="flex flex-wrap gap-2">
              {['all', 'critical', 'high', 'medium', 'low'].map((sev) => (
                <button
                  key={sev}
                  onClick={() => setSeverityFilter(sev)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all capitalize text-sm ${
                    severityFilter === sev
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white text-slate-700 border border-slate-200 hover:border-blue-300'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>
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
