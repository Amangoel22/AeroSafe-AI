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

  // Global audio context instance unlocked on first user interaction
  const audioContextRef = React.useRef(null);
  const isInitialLoadRef = React.useRef(true);
  const knownComplaintIdsRef = React.useRef(new Set());

  // Unlock Web Audio API context on first user click/keydown anywhere on page
  useEffect(() => {
    const unlockAudio = () => {
      if (!audioContextRef.current) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          audioContextRef.current = new AudioCtx();
        }
      }
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }
    };

    window.addEventListener('click', unlockAudio);
    window.addEventListener('keydown', unlockAudio);

    return () => {
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
  }, []);

  const triggerAudioBeep = () => {
    try {
      let ctx = audioContextRef.current;
      if (!ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          ctx = new AudioCtx();
          audioContextRef.current = ctx;
        }
      }
      if (!ctx) return;

      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;
      const beepDuration = 0.12; // short crisp burst
      const gap = 0.08;          // small space between beeps
      const freq = 1200;         // 1200 Hz urgent alert pitch

      [0, 1, 2].forEach((index) => {
        const startTime = now + index * (beepDuration + gap);
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'square'; // sharp alert tone
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.7, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + beepDuration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + beepDuration);
      });

    } catch (e) {
      console.warn("Audio Context playback error:", e);
    }
  };

  const loadComplaints = async () => {
    try {
      const [data, engineersList] = await Promise.all([
        getComplaints(),
        getEngineers().catch(() => []),
      ]);

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
          createdAt: item.created_at ? new Date(item.created_at) : null,
          reportedAt: item.reported_at ? new Date(item.reported_at) : null,
          resolvedAt: item.resolved_at ? new Date(item.resolved_at) : null,
        };
      });

      if (isInitialLoadRef.current) {
        // Mark all existing complaint IDs as known on initial page load (DO NOT BEEP)
        formatted.forEach(c => knownComplaintIdsRef.current.add(c.id));
        isInitialLoadRef.current = false;
      } else {
        // Detect genuinely new PENDING complaints that were not known before
        const newlyAddedPending = formatted.filter(
          c => !knownComplaintIdsRef.current.has(c.id) && c.status === COMPLAINT_STATUSES.PENDING
        );

        if (newlyAddedPending.length > 0) {
          triggerAudioBeep();
          if (window.onNewIncidentDetected) {
            window.onNewIncidentDetected(newlyAddedPending[0]);
          }
        }

        // Update known IDs set
        formatted.forEach(c => knownComplaintIdsRef.current.add(c.id));
      }

      setComplaints(formatted);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadComplaints();
      const interval = setInterval(loadComplaints, 3000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  // Update complaint status
  const updateComplaintStatus = async (complaintId, newStatus, feedbackVal) => {
    try {
      const payload = {
        status_val: statusMap[newStatus],
      };
      if (feedbackVal) {
        payload.feedback = feedbackVal;
      }
      await updateComplaint(complaintId, payload);

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

    const falseAlarm = complaints.filter(
      (c) => c.status === COMPLAINT_STATUSES.FALSE_ALARM,
    ).length;

    const critical = complaints.filter((c) => c.severity === "critical").length;

    return {
      total,
      pending,
      active,
      resolved,
      falseAlarm,
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
