export const COMPLAINT_STATUSES = {
  PENDING: "pending",
  ASSIGNED: "assigned",
  IN_PROGRESS: "in_progress",
  RESOLVED: "resolved",
  FALSE_ALARM: "false_alarm",
};

export const SEVERITY_LEVELS = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
};

export const ISSUE_TYPES = {
  SAFETY_HAZARD: 'Safety Hazard',
  SECURITY_ISSUE: 'Security Issue',
  EQUIPMENT_MALFUNCTION: 'Equipment Malfunction',
  MAINTENANCE_REQUIRED: 'Maintenance Required',
  ENVIRONMENTAL_CONCERN: 'Environmental Concern',
  OTHER: 'Other',
};

export const LOCATIONS = ['Runway A', 'Runway B', 'Terminal 1', 'Terminal 2'];

export const OFFICERS = [
  { id: 1, name: "Admin" },
  { id: 2, name: "Rahul Sharma" },
  { id: 3, name: "Priya Singh" },
  { id: 4, name: "Arjun Mehta" },
];

export const CAMERA_NAMES = [
  'CAM-RWY-A-01',
  'CAM-RWY-A-02',
  'CAM-RWY-B-01',
  'CAM-RWY-B-02',
  'CAM-TERM1-01',
  'CAM-TERM1-02',
  'CAM-TERM2-01',
  'CAM-TERM2-02',
];
