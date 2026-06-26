import React, { useState } from 'react';
import { X, User, Phone } from 'lucide-react';
import { OFFICERS } from '../lib/types.js';

const AssignInformModal = ({ isOpen, complaintId, onClose, onAssign, onInform }) => {
  const [selectedOfficer, setSelectedOfficer] = useState('');
  const [actionType, setActionType] = useState('assign');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedOfficer) {
      alert('Please select an officer');
      return;
    }

    if (actionType === 'assign') {
      onAssign(complaintId, selectedOfficer, 'assign');
    } else {
      onInform(complaintId, selectedOfficer, 'inform');
    }

    // Reset and close
    setSelectedOfficer('');
    setActionType('assign');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">Assign / Inform</h2>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Action Type Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-900">
              Select Action
            </label>
            <div className="space-y-2">
              <label className="flex items-center space-x-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                <input
                  type="radio"
                  name="actionType"
                  value="assign"
                  checked={actionType === 'assign'}
                  onChange={(e) => setActionType(e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <div>
                  <p className="font-medium text-slate-900">Assign</p>
                  <p className="text-xs text-slate-600">
                    Assign complaint to concerned authority
                  </p>
                </div>
              </label>

              <label className="flex items-center space-x-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                <input
                  type="radio"
                  name="actionType"
                  value="inform"
                  checked={actionType === 'inform'}
                  onChange={(e) => setActionType(e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <div>
                  <p className="font-medium text-slate-900">Inform</p>
                  <p className="text-xs text-slate-600">
                    Inform authority about the incident
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Officer Selection */}
          <div className="space-y-2">
            <label htmlFor="officer" className="block text-sm font-semibold text-slate-900">
              Select Officer/Authority
            </label>
            <select
              id="officer"
              value={selectedOfficer}
              onChange={(e) => setSelectedOfficer(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Choose an Officer --</option>
              {OFFICERS.map((officer) => (
                <option key={officer} value={officer}>
                  {officer}
                </option>
              ))}
            </select>
          </div>

          {/* Contact Info Display */}
          {selectedOfficer && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2 text-sm text-blue-900">
                <Phone size={16} />
                <span>Officer will be notified immediately</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-slate-900 border border-slate-300 rounded-lg hover:bg-slate-50 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
            >
              {actionType === 'assign' ? 'Assign' : 'Inform'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignInformModal;
