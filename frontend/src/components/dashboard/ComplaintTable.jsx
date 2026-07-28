import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { getSeverityColor, getSeverityBorderColor, getStatusColor, formatTime } from '../../lib/utils.js';

const SEVERITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };

const ComplaintTable = ({ complaints, onComplaintClick }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Sort complaints in table order:
  // 1. Pending & Active complaints come FIRST (ordered by creation time descending - newest first)
  // 2. Resolved & False Alarm complaints come AT THE BOTTOM
  const sortedComplaints = [...complaints].sort((a, b) => {
    const isClosed = (status) => status === 'resolved' || status === 'false_alarm';
    const aClosed = isClosed(a.status);
    const bClosed = isClosed(b.status);

    if (aClosed !== bClosed) {
      return aClosed ? 1 : -1; // Resolved/false alarm moved to bottom
    }

    // Secondary sort: preserve order of appearance (newest first)
    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return timeB - timeA;
  });

  const totalPages = Math.ceil(sortedComplaints.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedComplaints = sortedComplaints.slice(startIndex, startIndex + itemsPerPage);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  if (sortedComplaints.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <p className="text-slate-600">No complaints found</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Time
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Issue Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Severity
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Assigned To
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedComplaints.map((complaint, index) => (
              <tr
                key={complaint.id}
                onClick={() => onComplaintClick(complaint)}
                className="hover:bg-blue-50/50 cursor-pointer transition-all duration-200"
              >
                <td className={`px-4 py-3.5 font-bold text-slate-900 border-l-[4px] ${getSeverityBorderColor(complaint.severity)}`}>
                  {startIndex + index + 1}
                </td>
                <td className="px-4 py-3.5 text-sm text-slate-500 font-mono">{formatTime(complaint.createdAt)}</td>
                <td className="px-4 py-3.5 text-sm text-slate-700 font-medium">{complaint.location}</td>
                <td className="px-4 py-3.5 text-sm text-slate-700">{complaint.issueType}</td>
                <td className="px-4 py-3.5">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getSeverityColor(complaint.severity)}`}>
                    {complaint.severity}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${getStatusColor(complaint.status)}`}>
                    {complaint.status || "-"}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-sm text-slate-700">
                  {complaint.assignedTo || <span className="text-slate-400 italic">Unassigned</span>}
                </td>
                <td className="px-4 py-3.5 text-sm">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onComplaintClick(complaint);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg font-semibold transition-all duration-300 text-xs border border-blue-200 hover:border-blue-600 shadow-sm hover:shadow"
                  >
                    <Eye size={13} />
                    <span>View</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between p-4 border-t border-slate-200 bg-slate-50">
        <div className="text-sm text-slate-600">
          Page {currentPage} of {totalPages} ({sortedComplaints.length} total)
        </div>
        <div className="flex gap-2">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className="p-2 text-slate-600 hover:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="p-2 text-slate-600 hover:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComplaintTable;
