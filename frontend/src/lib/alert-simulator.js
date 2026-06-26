import { COMPLAINT_STATUSES, SEVERITY_LEVELS, ISSUE_TYPES, LOCATIONS, CAMERA_NAMES } from './types.js';
import { shuffleArray } from './utils.js';

let complaintCounter = 1016;

export const generateNewComplaint = () => {
  const severities = Object.values(SEVERITY_LEVELS);
  const issueTypes = Object.values(ISSUE_TYPES);
  
  complaintCounter++;
  
  return {
    id: `C${String(complaintCounter).padStart(3, '0')}`,
    date: new Date().toLocaleDateString(),
    time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    location: shuffleArray(LOCATIONS)[0],
    issueType: shuffleArray(issueTypes)[0],
    description: `New incident detected at ${new Date().toLocaleTimeString()}`,
    severity: shuffleArray(severities)[0],
    status: COMPLAINT_STATUSES.PENDING,
    assignedTo: null,
    cameraNumber: shuffleArray(CAMERA_NAMES)[0],
    createdAt: new Date(),
  };
};

export const createRandomAlert = (onNewComplaint) => {
  let timeoutId;

  const scheduleAlert = () => {
    const delay = Math.random() * 10000 + 5000; // 5-15 sec alerts

    timeoutId = setTimeout(() => {
      const complaint = generateNewComplaint();

      onNewComplaint(complaint);

      playAlertSound();

      scheduleAlert();
    }, delay);
  };

  scheduleAlert();

  return () => {
    clearTimeout(timeoutId);
  };
};

export const playAlertSound = () => {
  // Create audio context for web audio API alert sound
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Create alert beep pattern: 3 beeps
    const now = audioContext.currentTime;
    oscillator.frequency.setValueAtTime(800, now);
    gainNode.gain.setValueAtTime(0.3, now);
    
    // 3 beeps with gaps
    for (let i = 0; i < 3; i++) {
      gainNode.gain.setValueAtTime(0.3, now + i * 0.4);
      gainNode.gain.setValueAtTime(0, now + i * 0.4 + 0.15);
    }
    
    oscillator.start(now);
    oscillator.stop(now + 1.2);
  } catch (e) {
    console.log('[v0] Audio context not available, skipping sound alert');
  }
};
