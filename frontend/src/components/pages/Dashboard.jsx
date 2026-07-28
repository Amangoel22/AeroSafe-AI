import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import DashboardLayout from "../layout/DashboardLayout.jsx";
import KPICards from "../dashboard/KPICards.jsx";
import LiveAlertPanel from "../dashboard/LiveAlertPanel.jsx";
import FilterTabs from "../dashboard/FilterTabs.jsx";
import ComplaintTable from "../dashboard/ComplaintTable.jsx";
import ComplaintModal from "../dashboard/ComplaintModal.jsx";
import { useComplaints } from "../../context/ComplaintContext.jsx";
// import { createRandomAlert } from '../../lib/alert-simulator.js';
import { COMPLAINT_STATUSES } from "../../lib/types.js";

const Dashboard = () => {
  const {
    complaints,
    filter,
    setFilter,
    severityFilter,
    setSeverityFilter,
    updateComplaintStatus,
    assignComplaint,
    // addComplaint,
    getFilteredComplaints,
    getStatistics,
  } = useComplaints();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [latestComplaint, setLatestComplaint] = useState(null);

  // Start alert simulator
  // useEffect(() => {
  //   const unsubscribe = createRandomAlert((newComplaint) => {
  //     addComplaint(newComplaint);
  //     setLatestComplaint(newComplaint);
  //   });

  //   return () => unsubscribe();
  // }, [addComplaint]);

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

  const handleUpdateStatus = (complaintId, newStatus, feedbackVal) => {
    updateComplaintStatus(complaintId, newStatus, feedbackVal);
    // Update the modal to show new status
    if (selectedComplaint && selectedComplaint.id === complaintId) {
      setSelectedComplaint({ ...selectedComplaint, status: newStatus, feedback: feedbackVal || selectedComplaint.feedback });
    }
  };

  const handleAssignComplaint = async (complaintId, officer) => {
    await assignComplaint(complaintId, officer);

    const updated = complaints.find((c) => c.id === complaintId);

    if (updated) {
      setSelectedComplaint(updated);
    }
  };

  useEffect(() => {
    if (!selectedComplaint) return;

    const latest = complaints.find((c) => c.id === selectedComplaint.id);

    if (latest) {
      setSelectedComplaint(latest);
    }
  }, [complaints]);

  const filteredComplaints = getFilteredComplaints(searchQuery);
  const statistics = getStatistics();

  return (
    <DashboardLayout showNewAlerts={true}>
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div className="border-l-4 border-blue-600 pl-4">
          <h1 className="text-3xl font-bold text-slate-900">
            AeroSafe AI
          </h1>
          <p className="text-slate-600 mt-1">
            Monitor and manage airport runway incidents
          </p>
        </div>

        {/* KPI Cards */}
        <KPICards 
          statistics={statistics} 
          currentFilter={filter}
          onSelectFilter={setFilter} 
        />

        {/* Live Alert Panel */}
        {latestComplaint && (
          <LiveAlertPanel latestComplaint={latestComplaint} />
        )}

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm transition-all duration-300 hover:shadow-md">
          <div>
            <label className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block mb-3">Status Filter</label>
            <FilterTabs
              currentFilter={filter}
              onFilterChange={setFilter}
              statistics={statistics}
            />
          </div>
          <div>
            <label className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block mb-3">Severity Filter</label>
            <div className="flex flex-wrap gap-2">
              {['all', 'critical', 'high', 'medium', 'low'].map((sev) => (
                <button
                  key={sev}
                  onClick={() => setSeverityFilter(sev)}
                  className={`px-4 h-[34px] rounded-lg font-bold transition-all duration-300 transform active:scale-95 capitalize text-xs tracking-wide flex items-center justify-center ${
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
