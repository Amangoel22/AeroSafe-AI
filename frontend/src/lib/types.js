// Complaint statuses: pending -> active/informed -> closed
export const COMPLAINT_STATUSES = {
  PENDING: 'pending',
  ACTIVE: 'active',
  INFORMED: 'informed',
  CLOSED: 'closed',
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
  'Engineer A',
  'Engineer B',
  'Officer C',
  'Officer D',
  'Officer E',
  'Officer F',
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
