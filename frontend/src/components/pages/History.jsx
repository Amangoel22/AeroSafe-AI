import React, { useState } from 'react';
import { Search, Filter, Download } from 'lucide-react';
import DashboardLayout from '../layout/DashboardLayout.jsx';
import ComplaintTable from '../dashboard/ComplaintTable.jsx';
import ComplaintModal from '../dashboard/ComplaintModal.jsx';
import { useComplaints } from '../../context/ComplaintContext.jsx';
import { COMPLAINT_STATUSES } from '../../lib/types.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { exportComplaintsToExcel } from '../../utils/exportToExcel.js';

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

  const handleExportExcel = () => {
    exportComplaintsToExcel(filteredComplaints, `${role}_incident_history`);
  };

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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 border-blue-600 pl-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Incident History</h1>
            <p className="text-slate-600 mt-1">View all active, pending, or resolved complaints</p>
          </div>
          <button
            onClick={handleExportExcel}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform active:scale-95"
          >
            <Download size={18} />
            <span>Export to Excel</span>
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div 
            onClick={() => setStatusFilter('all')}
            className={`bg-white rounded-xl shadow-md p-6 border-l-4 border-indigo-500 transition-all duration-300 transform hover:-translate-y-1.5 hover:shadow-lg cursor-pointer ${
              statusFilter === 'all' ? 'ring-2 ring-indigo-500 shadow-md scale-[1.02]' : ''
            }`}
          >
            <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Total Complaints</p>
            <p className="text-4xl font-bold text-indigo-600 mt-2 tracking-tight">{displayComplaints.length}</p>
          </div>
          <div 
            onClick={() => setStatusFilter(COMPLAINT_STATUSES.RESOLVED)}
            className={`bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500 transition-all duration-300 transform hover:-translate-y-1.5 hover:shadow-lg cursor-pointer ${
              statusFilter === COMPLAINT_STATUSES.RESOLVED ? 'ring-2 ring-green-500 shadow-md scale-[1.02]' : ''
            }`}
          >
            <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Total Closed / Resolved</p>
            <p className="text-4xl font-bold text-green-600 mt-2 tracking-tight">{totalClosed}</p>
          </div>
          <div 
            onClick={() => setStatusFilter(COMPLAINT_STATUSES.ACTIVE)}
            className={`bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500 transition-all duration-300 transform hover:-translate-y-1.5 hover:shadow-lg cursor-pointer ${
              statusFilter === COMPLAINT_STATUSES.ACTIVE ? 'ring-2 ring-blue-500 shadow-md scale-[1.02]' : ''
            }`}
          >
            <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Total Active</p>
            <p className="text-4xl font-bold text-blue-600 mt-2 tracking-tight">{totalActive}</p>
          </div>
          <div 
            onClick={() => setStatusFilter(COMPLAINT_STATUSES.PENDING)}
            className={`bg-white rounded-xl shadow-md p-6 border-l-4 border-amber-500 transition-all duration-300 transform hover:-translate-y-1.5 hover:shadow-lg cursor-pointer ${
              statusFilter === COMPLAINT_STATUSES.PENDING ? 'ring-2 ring-amber-500 shadow-md scale-[1.02]' : ''
            }`}
          >
            <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Total Pending</p>
            <p className="text-4xl font-bold text-amber-500 mt-2 tracking-tight">{totalPending}</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative group">
          <Search className="absolute left-3.5 top-3.5 text-slate-400 group-hover:text-blue-500 transition-colors duration-300" size={20} />
          <input
            type="text"
            placeholder="Search by location, description, or type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md bg-white"
          />
        </div>

        {/* Filters Group */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider min-w-[110px]">Status Filter</span>
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: 'all', label: 'All', count: displayComplaints.length },
                { id: COMPLAINT_STATUSES.PENDING, label: 'Pending', count: totalPending },
                { id: COMPLAINT_STATUSES.ACTIVE, label: 'Active', count: totalActive },
                { id: COMPLAINT_STATUSES.RESOLVED, label: 'Resolved', count: totalClosed },
                { id: COMPLAINT_STATUSES.FALSE_ALARM, label: 'False Alarm', count: totalFalseAlarms },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-3.5 py-1.5 rounded-lg font-bold transition-all duration-200 transform active:scale-95 text-xs tracking-wide flex items-center gap-2 ${
                    statusFilter === tab.id
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                      : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold transition-colors duration-300 ${
                    statusFilter === tab.id
                      ? "bg-blue-700/80 text-white"
                      : "bg-slate-200 text-slate-600"
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3 flex flex-col md:flex-row md:items-center gap-3">
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider min-w-[110px]">Severity Filter</span>
            <div className="flex flex-wrap items-center gap-2">
              {['all', 'critical', 'high', 'medium', 'low'].map((sev) => (
                <button
                  key={sev}
                  onClick={() => setSeverityFilter(sev)}
                  className={`px-4 py-1.5 rounded-lg font-bold transition-all duration-200 transform active:scale-95 capitalize text-xs tracking-wide flex items-center justify-center ${
                    severityFilter === sev
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200'
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
