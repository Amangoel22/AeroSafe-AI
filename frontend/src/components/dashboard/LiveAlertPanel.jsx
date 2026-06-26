import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const LiveAlertPanel = ({ latestComplaint }) => {
  if (!latestComplaint) {
    return (
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg p-4 border border-slate-200">
        <p className="text-slate-600 text-center py-2">No new alerts at this time</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-red-50 to-red-100 rounded-lg p-4 border-2 border-red-300"
    >
      <div className="flex items-start space-x-3">
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.6, repeat: Infinity }}
          className="flex-shrink-0"
        >
          <AlertTriangle className="text-red-600" size={24} />
        </motion.div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-red-900">New Alert Detected!</p>
          <p className="text-sm text-red-800 mt-1">
            {latestComplaint.issueType} at {latestComplaint.location}
          </p>
          <p className="text-xs text-red-700 mt-1">
            {latestComplaint.description}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default LiveAlertPanel;
