import { COMPLAINT_STATUSES, SEVERITY_LEVELS, ISSUE_TYPES, LOCATIONS, OFFICERS, CAMERA_NAMES } from './types.js';

export const SEVERITY_COLORS = {
  critical: 'bg-red-600 text-white',
  high: 'bg-orange-500 text-white',
  medium: 'bg-amber-400 text-black',
  low: 'bg-slate-400 text-white',
};

export const SEVERITY_BORDER_COLORS = {
  critical: 'border-l-red-600',
  high: 'border-l-orange-500',
  medium: 'border-l-amber-400',
  low: 'border-l-slate-300',
};

export const STATUS_COLORS = {
  pending: "bg-gray-400 text-white",
  active: "bg-blue-600 text-white",
  resolved: "bg-green-600 text-white",
  false_alarm: "bg-yellow-500 text-black",
};

export const STATUS_LABELS = {
  pending: "Pending",
  active: "Active",
  resolved: "Resolved",
  false_alarm: "False Alarm",
};

export const formatStatusLabel = (status) => {
  if (!status) return "Pending";
  const normalized = status.toLowerCase().replace(" ", "_");
  return STATUS_LABELS[normalized] || status.replace("_", " ");
};
