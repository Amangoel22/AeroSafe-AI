import React, { createContext, useState, useContext, useEffect } from "react";
import { COMPLAINT_STATUSES } from "../lib/types.js";
import { getComplaints, updateComplaint } from "../api/complaintApi";
import { getEngineers } from "../api/userApi";

const ComplaintContext = createContext();
import { useAuth } from "./AuthContext.jsx";

export const ComplaintProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [filter, setFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const statusMap = {
    pending: "Pending",
    active: "Active",
    resolved: "Resolved",
    false_alarm: "False Alarm",
  };

  const loadComplaints = async () => {
    try {
      const [data, engineersList] = await Promise.all([
        getComplaints(),
        getEngineers().catch(() => []),
      ]);
      console.log("Raw Complaints from API:", data);

      const engMap = {};
      engineersList.forEach((eng) => {
        engMap[eng.id] = eng.full_name;
      });

      const formatted = data.map((item) => {
        let statusVal = COMPLAINT_STATUSES.PENDING;
        if (item.status === "Resolved") {
          statusVal = COMPLAINT_STATUSES.RESOLVED;
        } else if (item.status === "False Alarm") {
          statusVal = COMPLAINT_STATUSES.FALSE_ALARM;
        } else if (item.status === "Active") {
          statusVal = COMPLAINT_STATUSES.ACTIVE;
        }

        return {
          id: item.id,
          location: item.location,
          issueType: item.issue_type,
          description: item.description ?? "",
          severity: item.severity?.toLowerCase() ?? "low",
          status: statusVal,
          assignedTo: engMap[item.assigned_to] || (item.assigned_to ? `ID: ${item.assigned_to}` : null),
          assignedToId: item.assigned_to,
          feedback: item.feedback ?? "",
          image: item.image_url,
          createdAt: new Date(item.created_at),
        };
      });

      setComplaints(formatted);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadComplaints();
    }
  }, [isAuthenticated]);

  // Update complaint status
  const updateComplaintStatus = async (complaintId, newStatus) => {
    try {
      await updateComplaint(complaintId, {
        status_val: statusMap[newStatus],
      });

      await loadComplaints();
    } catch (err) {
      console.error(err);
    }
  };

  // Assign or inform about complaint
  const assignComplaint = async (complaintId, officer, actionType) => {
    try {
      await updateComplaint(complaintId, {
        assigned_to: officer,
        status_val: "Pending",
      });

      await loadComplaints();
    } catch (err) {
      console.error(err);
    }
  };

  // Add new complaint (from alert simulator)
  const addComplaint = (newComplaint) => {
    setComplaints((prevComplaints) => [newComplaint, ...prevComplaints]);
  };

  const getFilteredComplaints = (search = "") => {
    let filtered = [...complaints];

    // Filter by status
    if (filter !== "all") {
      filtered = filtered.filter((complaint) => complaint.status === filter);
    } else {
      // Exclude resolved and false alarm by default on dashboard
      filtered = filtered.filter(
        (complaint) =>
          complaint.status !== COMPLAINT_STATUSES.RESOLVED &&
          complaint.status !== COMPLAINT_STATUSES.FALSE_ALARM
      );
    }

    // Filter by severity
    if (severityFilter !== "all") {
      filtered = filtered.filter((complaint) => complaint.severity === severityFilter);
    }

    // Filter by search query
    if (search) {
      const query = search.toLowerCase();
      filtered = filtered.filter(
        (complaint) =>
          complaint.location.toLowerCase().includes(query) ||
          complaint.issueType.toLowerCase().includes(query) ||
          complaint.description.toLowerCase().includes(query),
      );
    }

    return filtered;
  };

  // Get history complaints (all complaints, filtered by status/severity)
  const getHistoryComplaints = (statusFilter = "all", sevFilter = "all", search = "") => {
    let filtered = [...complaints];

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((complaint) => complaint.status === statusFilter);
    }

    // Filter by severity
    if (sevFilter !== "all") {
      filtered = filtered.filter((complaint) => complaint.severity === sevFilter);
    }

    // Filter by search query
    if (search) {
      const query = search.toLowerCase();
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

    const active = complaints.filter(
      (c) => c.status === COMPLAINT_STATUSES.ACTIVE,
    ).length;

    const resolved = complaints.filter(
      (c) => c.status === COMPLAINT_STATUSES.RESOLVED,
    ).length;

    const critical = complaints.filter((c) => c.severity === "critical").length;

    return {
      total,
      pending,
      active,
      resolved,
      critical,
    };
  };

  const value = {
    complaints,
    filter,
    setFilter,
    severityFilter,
    setSeverityFilter,
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
