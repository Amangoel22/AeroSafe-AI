import React, { createContext, useState, useContext, useEffect } from "react";
import { COMPLAINT_STATUSES } from "../lib/types.js";
import { getComplaints, updateComplaint } from "../api/complaintApi";

const ComplaintContext = createContext();

export const ComplaintProvider = ({ children }) => {
  const [complaints, setComplaints] = useState([]);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const loadComplaints = async () => {
    try {
      const data = await getComplaints();

      const formatted = data.map((item) => ({
        id: item.id,
        location: item.location,
        issueType: item.issue_type,
        description: item.description ?? "",
        severity: item.severity?.toLowerCase() ?? "low",
        status:
          item.status === "Pending"
            ? COMPLAINT_STATUSES.PENDING
            : item.status === "Assigned"
              ? COMPLAINT_STATUSES.ASSIGNED
              : item.status === "In Progress"
                ? COMPLAINT_STATUSES.IN_PROGRESS
                : item.status === "Resolved"
                  ? COMPLAINT_STATUSES.RESOLVED
                  : COMPLAINT_STATUSES.FALSE_ALARM,
        assignedTo: item.assigned_to,
        image: item.image_url,
        createdAt: new Date(item.created_at),
      }));

      setComplaints(formatted);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, []);

  // Update complaint status
  const updateComplaintStatus = async (complaintId, newStatus) => {
    try {
      await updateComplaint(complaintId, {
        status_val: newStatus,
      });

      await loadComplaints();
    } catch (err) {
      console.error(err);
    }
  };

  // Assign or inform about complaint
  console.log("STEP 5");
  const assignComplaint = async (complaintId, officer, actionType) => {
    try {
      console.log("STEP 6");
      await updateComplaint(complaintId, {
        assigned_to: officer,
        status_val: actionType === "assign" ? "Assigned" : "In Progress",
      });
      console.log("STEP 7");

      await loadComplaints();
    } catch (err) {
      console.error(err);
    }
  };

  // Add new complaint (from alert simulator)
  const addComplaint = (newComplaint) => {
    setComplaints((prevComplaints) => [newComplaint, ...prevComplaints]);
  };

  const getFilteredComplaints = () => {
    let filtered = [...complaints];

    // Filter by status
    if (filter !== "all") {
      filtered = filtered.filter((complaint) => complaint.status === filter);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (complaint) =>
          complaint.location.toLowerCase().includes(query) ||
          complaint.issueType.toLowerCase().includes(query) ||
          complaint.description.toLowerCase().includes(query),
      );
    }

    return filtered;
  };

  // Get history complaints (only closed/resolved)
  const getHistoryComplaints = () => {
    let filtered = complaints.filter(
      (complaint) => complaint.status === COMPLAINT_STATUSES.RESOLVED,
    );

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (complaint) =>
          complaint.location.toLowerCase().includes(query) ||
          complaint.issueType.toLowerCase().includes(query) ||
          complaint.description.toLowerCase().includes(query) ||
          complaint.id.toString().includes(query),
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

    const pending = complaints.filter(
      (c) => c.status === COMPLAINT_STATUSES.PENDING,
    ).length;

    const assigned = complaints.filter(
      (c) =>
        c.status === COMPLAINT_STATUSES.ASSIGNED ||
        c.status === COMPLAINT_STATUSES.IN_PROGRESS,
    ).length;

    const resolved = complaints.filter(
      (c) => c.status === COMPLAINT_STATUSES.RESOLVED,
    ).length;

    const critical = complaints.filter((c) => c.severity === "critical").length;

    return {
      total,
      assigned,
      pending,
      resolved,
      critical,
    };
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
    loadComplaints,
  };

  return (
    <ComplaintContext.Provider value={value}>
      {children}
    </ComplaintContext.Provider>
  );
};

export const useComplaints = () => {
  const context = useContext(ComplaintContext);
  if (!context) {
    throw new Error("useComplaints must be used within ComplaintProvider");
  }
  return context;
};
