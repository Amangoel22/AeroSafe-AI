import React, { createContext, useState, useContext, useEffect } from 'react';
import { DUMMY_COMPLAINTS } from '../lib/constants.js';
import { COMPLAINT_STATUSES } from '../lib/types.js';

const ComplaintContext = createContext();

export const ComplaintProvider = ({ children }) => {
  const [complaints, setComplaints] = useState(DUMMY_COMPLAINTS);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Update complaint status
  const updateComplaintStatus = (complaintId, newStatus) => {

    setComplaints((prevComplaints) =>
      prevComplaints.map((complaint) =>
        complaint.id === complaintId
          ? { ...complaint, status: newStatus }
          : complaint
      )
    );
  };

  // Assign or inform about complaint
  const assignComplaint = (complaintId, officer, actionType) => {

    setComplaints((prevComplaints) =>
      prevComplaints.map((complaint) =>
        complaint.id === complaintId
          ? {
              ...complaint,
              assignedTo: officer,
              status: actionType === 'assign' ? COMPLAINT_STATUSES.ACTIVE : COMPLAINT_STATUSES.INFORMED,
            }
          : complaint
      )
    );
  };

  // Add new complaint (from alert simulator)
  const addComplaint = (newComplaint) => {

    setComplaints((prevComplaints) => [newComplaint, ...prevComplaints]);
  };

const getFilteredComplaints = () => {
  let filtered = complaints.filter((complaint) => complaint.status !== COMPLAINT_STATUSES.CLOSED);

  // Filter by status
  if (filter !== 'all') {
    filtered = filtered.filter((complaint) => complaint.status === filter);
  }

  // Filter by search query
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(
      (complaint) =>
        complaint.location.toLowerCase().includes(query) ||
        complaint.issueType.toLowerCase().includes(query) ||
        complaint.description.toLowerCase().includes(query)
    );
  }

  return filtered;
};

// Get history complaints (only closed/resolved)
const getHistoryComplaints = () => {
  let filtered = complaints.filter((complaint) => complaint.status === COMPLAINT_STATUSES.CLOSED);

  // Filter by search query
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(
      (complaint) =>
        complaint.location.toLowerCase().includes(query) ||
        complaint.issueType.toLowerCase().includes(query) ||
        complaint.description.toLowerCase().includes(query) ||
        complaint.id.toLowerCase().includes(query)
    );
  }

  return filtered;
};
  // Get complaint by ID
  const getComplaintById = (id) => {
    return complaints.find((complaint) => complaint.id === id);
  };

  // Get statistics
  const getStatistics = () => {
    const total = complaints.length;
    const active = complaints.filter((c) => c.status === COMPLAINT_STATUSES.ACTIVE).length;
    const pending = complaints.filter((c) => c.status === COMPLAINT_STATUSES.PENDING).length;
    const closed = complaints.filter((c) => c.status === COMPLAINT_STATUSES.CLOSED).length;
    const critical = complaints.filter((c) => c.severity === 'critical').length;

    return { total, active, pending, closed, critical };
  };

const value = {
  complaints,
  filter,
  setFilter,
  searchQuery,
  setSearchQuery,
  updateComplaintStatus,
  assignComplaint,
  addComplaint,
  getFilteredComplaints,
  getHistoryComplaints,
  getComplaintById,
  getStatistics,
};

  return <ComplaintContext.Provider value={value}>{children}</ComplaintContext.Provider>;
};

export const useComplaints = () => {
  const context = useContext(ComplaintContext);
  if (!context) {
    throw new Error('useComplaints must be used within ComplaintProvider');
  }
  return context;
};
