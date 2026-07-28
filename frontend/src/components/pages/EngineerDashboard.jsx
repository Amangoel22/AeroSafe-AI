import React, { useState, useEffect } from "react";
import { Search, Eye, CheckCircle, Play, Download } from "lucide-react";
import DashboardLayout from "../layout/DashboardLayout.jsx";
import ComplaintModal from "../dashboard/ComplaintModal.jsx";
import EngineerFeedbackModal from "../dashboard/EngineerFeedbackModal.jsx";
import { useComplaints } from "../../context/ComplaintContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { COMPLAINT_STATUSES } from "../../lib/types.js";
import { getSeverityColor, getSeverityBorderColor, formatTime, getStatusColor } from "../../lib/utils.js";
import { exportComplaintsToExcel } from "../../utils/exportToExcel.js";

const EngineerDashboard = () => {
  const { user } = useAuth();
  const {
    complaints,
    updateComplaintStatus,
    loadComplaints,
  } = useComplaints();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [resolvingComplaintId, setResolvingComplaintId] = useState(null);

  const [statusFilter, setStatusFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");

  // Get only complaints assigned to this logged-in engineer
  const myComplaints = complaints.filter(
    (c) => Number(c.assignedToId) === Number(user?.id)
  );

  const handleExportExcel = () => {
    exportComplaintsToExcel(filtered, "engineer_assigned_incidents");
  };
  
  console.log("EngineerDashboard - user?.id:", user?.id);
  console.log("EngineerDashboard - complaints assignedToId list:", complaints.map(c => c.assignedToId).filter(id => id !== null));
  console.log("EngineerDashboard - myComplaints length:", myComplaints.length);

  // Statistics
  const totalAssigned = myComplaints.length;
  const totalPending = myComplaints.filter((c) => c.status === COMPLAINT_STATUSES.PENDING).length;
  const totalActive = myComplaints.filter((c) => c.status === COMPLAINT_STATUSES.ACTIVE).length;
  const totalResolved = myComplaints.filter((c) => c.status === COMPLAINT_STATUSES.RESOLVED).length;

  // Filter logic
  let filtered = [...myComplaints];

  if (statusFilter !== "all") {
    filtered = filtered.filter((c) => c.status === statusFilter);
  }

  if (severityFilter !== "all") {
    filtered = filtered.filter((c) => c.severity === severityFilter);
  }

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(
      (c) =>
        c.location.toLowerCase().includes(q) ||
        c.issueType.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
    );
  }

  const handleComplaintClick = (complaint) => {
    setSelectedComplaint(complaint);
    setIsDetailModalOpen(true);
  };

  const handleAccept = async (complaintId) => {
    try {
      await updateComplaintStatus(complaintId, COMPLAINT_STATUSES.ACTIVE);
      if (selectedComplaint && selectedComplaint.id === complaintId) {
        setSelectedComplaint((prev) => ({ ...prev, status: COMPLAINT_STATUSES.ACTIVE }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolveClick = (complaintId) => {
    setResolvingComplaintId(complaintId);
    setIsResolveModalOpen(true);
  };

  const handleResolveSubmit = async (feedbackText) => {
    // Close modals immediately for snappy UI
    setIsResolveModalOpen(false);
    setIsDetailModalOpen(false);
    const targetId = resolvingComplaintId;
    setResolvingComplaintId(null);
    
    if (selectedComplaint && selectedComplaint.id === targetId) {
      setSelectedComplaint((prev) => ({
        ...prev,
        status: COMPLAINT_STATUSES.RESOLVED,
        feedback: feedbackText,
      }));
    }

    try {
      const { updateComplaint } = await import("../../api/complaintApi");
      await updateComplaint(targetId, {
        status_val: "Resolved",
        feedback: feedbackText,
      });
      await loadComplaints();
    } catch (err) {
      console.error(err);
      // In a robust app, we might revert the state if this fails
    }
  };

  return (
    <DashboardLayout showNewAlerts={false}>
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 border-blue-600 pl-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Engineer Dashboard
            </h1>
            <p className="text-slate-600 mt-1">
              Manage and resolve your assigned safety incidents
            </p>
          </div>
          <button
            onClick={handleExportExcel}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform active:scale-95"
          >
            <Download size={18} />
            <span>Export to Excel</span>
          </button>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md p-6 text-white">
            <p className="text-sm font-semibold opacity-90 uppercase">Total Assigned</p>
            <p className="text-4xl font-bold mt-2">{totalAssigned}</p>
          </div>
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg shadow-md p-6 text-white">
            <p className="text-sm font-semibold opacity-90 uppercase">Pending Acceptance</p>
            <p className="text-4xl font-bold mt-2">{totalPending}</p>
          </div>
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-md p-6 text-white">
            <p className="text-sm font-semibold opacity-90 uppercase">Active Tasks</p>
            <p className="text-4xl font-bold mt-2">{totalActive}</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-md p-6 text-white">
            <p className="text-sm font-semibold opacity-90 uppercase">Resolved Tasks</p>
            <p className="text-4xl font-bold mt-2">{totalResolved}</p>
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
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider min-w-[110px]">Status Filter</span>
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: "all", label: "All", count: totalAssigned },
                { id: COMPLAINT_STATUSES.PENDING, label: "Pending", count: totalPending },
                { id: COMPLAINT_STATUSES.ACTIVE, label: "Active", count: totalActive },
                { id: COMPLAINT_STATUSES.RESOLVED, label: "Resolved", count: totalResolved },
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
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider min-w-[110px]">Severity Filter</span>
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

        {/* Complaints Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-100 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Time</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Location</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Issue Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Severity</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                      No complaints found matching current filters
                    </td>
                  </tr>
                ) : (
                  filtered.map((complaint, index) => (
                    <tr
                      key={complaint.id}
                      onClick={() => handleComplaintClick(complaint)}
                      className="hover:bg-blue-50 cursor-pointer transition-colors"
                    >
                      <td className={`px-4 py-3 font-semibold text-slate-900 border-l-[4px] ${getSeverityBorderColor(complaint.severity)}`}>
                        {index + 1}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 font-mono">{formatTime(complaint.createdAt)}</td>
                      <td className="px-4 py-3 text-sm text-slate-700">{complaint.location}</td>
                      <td className="px-4 py-3 text-sm text-slate-700">{complaint.issueType}</td>
                      <td className="px-4 py-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getSeverityColor(complaint.severity)}`}>
                          {complaint.severity}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${getStatusColor(complaint.status)}`}>
                          {complaint.status || "-"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm flex gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleComplaintClick(complaint)}
                          className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg font-medium transition-all text-xs border border-slate-200"
                        >
                          <Eye size={13} />
                          <span>View</span>
                        </button>
                        {complaint.status === COMPLAINT_STATUSES.PENDING && (
                          <button
                            onClick={() => handleAccept(complaint.id)}
                            className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg font-medium transition-all text-xs border border-blue-200 hover:border-blue-600"
                          >
                            <Play size={13} />
                            <span>Accept</span>
                          </button>
                        )}
                        {complaint.status === COMPLAINT_STATUSES.ACTIVE && (
                          <button
                            onClick={() => handleResolveClick(complaint.id)}
                            className="flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-600 hover:bg-green-600 hover:text-white rounded-lg font-medium transition-all text-xs border border-green-200 hover:border-green-600"
                          >
                            <CheckCircle size={13} />
                            <span>Resolve</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <ComplaintModal
        isOpen={isDetailModalOpen}
        complaint={selectedComplaint}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedComplaint(null);
        }}
        onUpdateStatus={updateComplaintStatus}
        onAssignComplaint={() => {}}
        onInformComplaint={() => {}}
        onResolveClick={(complaintId) => {
          setIsDetailModalOpen(false);
          setResolvingComplaintId(complaintId);
          setIsResolveModalOpen(true);
        }}
      />

      {/* Resolve Feedback Input Modal */}
      <EngineerFeedbackModal
        isOpen={isResolveModalOpen}
        onClose={() => {
          setIsResolveModalOpen(false);
          setResolvingComplaintId(null);
        }}
        onSubmit={handleResolveSubmit}
      />
    </DashboardLayout>
  );
};

export default EngineerDashboard;
