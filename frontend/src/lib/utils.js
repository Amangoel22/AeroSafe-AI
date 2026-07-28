import { SEVERITY_COLORS, SEVERITY_BORDER_COLORS, STATUS_COLORS } from './constants.js';

export const getSeverityColor = (severity) => {
  return SEVERITY_COLORS[severity] || SEVERITY_COLORS.low;
};

export const getSeverityBorderColor = (severity) => {
  return SEVERITY_BORDER_COLORS[severity] || SEVERITY_BORDER_COLORS.low;
};

export const getStatusColor = (status) => {
  if (!status) return STATUS_COLORS.pending;
  const normalized = status.toLowerCase().replace(" ", "_");
  return STATUS_COLORS[normalized] || STATUS_COLORS.pending;
};

export const formatDateTime = (date) => {
  if (!(date instanceof Date)) {
    date = new Date(date);
  }
  const options = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  };
  return date.toLocaleDateString('en-US', options);
};

export const formatTime = (date) => {
  if (!(date instanceof Date)) {
    date = new Date(date);
  }
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

export const calculateDaysSince = (date) => {
  if (!(date instanceof Date)) {
    date = new Date(date);
  }
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};
