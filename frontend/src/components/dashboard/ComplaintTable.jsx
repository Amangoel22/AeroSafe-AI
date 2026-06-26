import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getSeverityColor, getStatusColor, formatTime } from '../../lib/utils.js';

const SEVERITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };
const STATUS_ORDER = { pending: 0, active: 1, informed: 2, closed: 3 };

const ComplaintTable = ({ complaints, onComplaintClick }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Sort complaints in table order
  const sortedComplaints = [...complaints].sort((a, b) => {
    // Unassigned (assignedTo === null) comes first
    const aIsUnassigned = a.assignedTo === null ? 0 : 1;
    const bIsUnassigned = b.assignedTo === null ? 0 : 1;

    if (aIsUnassigned !== bIsUnassigned) {
      return aIsUnassigned - bIsUnassigned;
    }

    // Then sort by severity (critical first)
    return (SEVERITY_ORDER[a.severity] || 4) - (SEVERITY_ORDER[b.severity] || 4);
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
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-100 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">
                ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">
                Time
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">
                Location
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">
                Issue Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">
                Severity
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">
                Assigned To
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {paginatedComplaints.map((complaint) => (
              <tr
                key={complaint.id}
                onClick={() => onComplaintClick(complaint)}
                className="hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <td className="px-4 py-3 font-semibold text-slate-900">{complaint.id}</td>
                <td className="px-4 py-3 text-sm text-slate-700">{formatTime(complaint.createdAt)}</td>
                <td className="px-4 py-3 text-sm text-slate-700">{complaint.location}</td>
                <td className="px-4 py-3 text-sm text-slate-700">{complaint.issueType}</td>
                <td className="px-4 py-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getSeverityColor(complaint.severity)}`}>
                    {complaint.severity}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm font-medium text-slate-900">
                  {complaint.status.toUpperCase()}
                </td>
                <td className="px-4 py-3 text-sm text-slate-700">
                  {complaint.assignedTo || <span className="text-slate-400 italic">Unassigned</span>}
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
