import React, { useState, useEffect } from "react";
import { Search, Eye, CheckCircle, Play } from "lucide-react";
import DashboardLayout from "../layout/DashboardLayout.jsx";
import ComplaintModal from "../dashboard/ComplaintModal.jsx";
import { useComplaints } from "../../context/ComplaintContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { COMPLAINT_STATUSES } from "../../lib/types.js";
import { getSeverityColor, getSeverityBorderColor, formatTime, getStatusColor } from "../../lib/utils.js";

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

  const [statusFilter, setStatusFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");

  // Get only complaints assigned to this logged-in engineer
  const myComplaints = complaints.filter(
    (c) => Number(c.assignedToId) === Number(user?.id)
  );
  
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

  const handleResolveClick = async (complaintId, feedbackText) => {
    try {
      const { updateComplaint } = await import("../../api/complaintApi");
      await updateComplaint(complaintId, {
        status_val: "Resolved",
        feedback: feedbackText,
      });
      await loadComplaints();

      setIsDetailModalOpen(false);
      if (selectedComplaint && selectedComplaint.id === complaintId) {
        setSelectedComplaint((prev) => ({
          ...prev,
          status: COMPLAINT_STATUSES.RESOLVED,
          feedback: feedbackText,
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <DashboardLayout showNewAlerts={false}>
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div className="border-l-4 border-blue-600 pl-4">
          <h1 className="text-3xl font-bold text-slate-900">
            Engineer Dashboard
          </h1>
          <p className="text-slate-600 mt-1">
            Manage and resolve your assigned safety incidents
          </p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Status Filter</label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: "all", label: "All", count: totalAssigned },
                { id: COMPLAINT_STATUSES.PENDING, label: "Pending", count: totalPending },
                { id: COMPLAINT_STATUSES.ACTIVE, label: "Active", count: totalActive },
                { id: COMPLAINT_STATUSES.RESOLVED, label: "Resolved", count: totalResolved },
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
                  filtered.map((complaint) => (
                    <tr
                      key={complaint.id}
                      onClick={() => handleComplaintClick(complaint)}
                      className="hover:bg-blue-50 cursor-pointer transition-colors"
                    >
                      <td className={`px-4 py-3 font-semibold text-slate-900 border-l-[4px] ${getSeverityBorderColor(complaint.severity)}`}>
                        {complaint.id}
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
        onResolveClick={(complaintId, feedback) => handleResolveClick(complaintId, feedback)}
      />
    </DashboardLayout>
  );
};

export default EngineerDashboard;
