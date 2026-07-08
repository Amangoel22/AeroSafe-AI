import React, { useState } from "react";
import {
  X,
  Camera,
  Calendar,
  MapPin,
  AlertCircle,
  User,
} from "lucide-react";
import {
  getSeverityColor,
  getStatusColor,
  formatDateTime,
} from "../../lib/utils.js";
import { COMPLAINT_STATUSES } from "../../lib/types.js";
import AssignInformModal from "../AssignInformModal.jsx";

const ComplaintModal = ({
  isOpen,
  complaint,
  onClose,
  onUpdateStatus,
  onAssignComplaint,
  onInformComplaint,
}) => {
  const [showAssignModal, setShowAssignModal] = useState(false);

  if (!isOpen || !complaint) return null;

  // Status Change
  const handleStatusChange = (newStatus) => {
    onUpdateStatus(complaint.id, newStatus);
  };

  //Assign task
  const handleAssignClick = () => {
    setShowAssignModal(true);
  };

  const handleAssign = (complaintId, officer, actionType) => {
  console.log("STEP 3", complaintId, officer, actionType);

  onAssignComplaint(complaintId, officer, actionType);
};

  //dev
  console.log("Modal complaint:", complaint);
  console.log("Status:", complaint.status);
  console.log(COMPLAINT_STATUSES);

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 flex items-center justify-between p-6 border-b border-slate-200 bg-white">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Incident Details
              </h2>
              <p className="text-sm text-slate-600">ID: {complaint.id}</p>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Severity Alert*/}
            <div
              className={`p-4 border-l-4 rounded-lg ${getSeverityColor(complaint.severity)}`}
            >
              <div className="flex items-start space-x-3">
                <AlertCircle
                  className="mt-1 flex-shrink-0 text-white"
                  size={20}
                />
                <div>
                  <p className="font-semibold text-white">
                    Severity: {complaint.severity.toUpperCase()}
                  </p>
                  <p className="text-sm text-white opacity-90">
                    Incident priority level
                  </p>
                </div>
              </div>
            </div>

            {/* CCTV Footage*/}
            <div className="p-4 bg-gradient-to-br from-slate-200 to-slate-300 rounded-lg">
              <p className="text-xs font-semibold text-slate-700 uppercase mb-3">
                CCTV Footage
              </p>
              <div className="aspect-video bg-slate-400 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Camera size={48} className="text-slate-600 mx-auto mb-2" />
                  <p className="text-slate-700 font-medium">
                    {complaint.cameraId}
                  </p>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-sm font-semibold text-slate-600 uppercase">
                Status
              </span>
              <span
                className={`px-4 py-1 rounded-lg font-semibold text-sm ${getStatusColor(
                  complaint.status,
                )}`}
              >
                {complaint.status?.toUpperCase() ?? "-"}
              </span>
            </div>

            {/* Camera Information */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <Camera className="text-blue-600 mt-1" size={20} />
                <div>
                  <p className="font-semibold text-blue-900">Camera</p>
                  <p className="text-sm text-blue-800">
                    {complaint.cameraId}
                  </p>
                </div>
              </div>
            </div>

            {/* Information Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-xs font-semibold text-slate-600 uppercase">
                  Date & Time
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  <Calendar size={16} className="text-slate-600" />
                  <p className="font-medium text-slate-900">
                    {formatDateTime(complaint.createdAt)}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-xs font-semibold text-slate-600 uppercase">
                  Location
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  <MapPin size={16} className="text-slate-600" />
                  <p className="font-medium text-slate-900">
                    {complaint.location}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-xs font-semibold text-slate-600 uppercase">
                  Issue Type
                </p>
                <p className="font-medium text-slate-900 mt-2">
                  {complaint.issueType}
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-xs font-semibold text-slate-600 uppercase">
                  Assigned To
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  <User size={16} className="text-slate-600" />
                  <p className="font-medium text-slate-900">
                    {complaint.assignedTo || "Unassigned"}
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-xs font-semibold text-slate-600 uppercase mb-2">
                Description
              </p>
              <p className="text-slate-900">{complaint.description}</p>
            </div>

            {/* Actions Section */}
            <div className="space-y-3 border-t border-slate-200 pt-4">
              {complaint.status === COMPLAINT_STATUSES.PENDING && (
                <button
                  onClick={handleAssignClick}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                >
                  Assign Engineer
                </button>
              )}

              {(complaint.status === COMPLAINT_STATUSES.ASSIGNED ||
                complaint.status === COMPLAINT_STATUSES.IN_PROGRESS) && (
                <button
                  onClick={() =>
                    handleStatusChange(COMPLAINT_STATUSES.RESOLVED)
                  }
                  className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
                >
                  Mark as Resolved
                </button>
              )}

              {complaint.status === COMPLAINT_STATUSES.RESOLVED && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-900">
                    This incident has been resolved.
                  </p>
                </div>
              )}

              {complaint.status === COMPLAINT_STATUSES.FALSE_ALARM && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-900">
                    This incident was marked as a false alarm.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 p-4 border-t border-slate-200 bg-slate-50 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-slate-900 border border-slate-300 rounded-lg hover:bg-slate-100 font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Assign/Inform Modal */}
      <AssignInformModal
        isOpen={showAssignModal}
        complaintId={complaint.id}
        onClose={() => setShowAssignModal(false)}
        onAssign={handleAssign}
      />
    </>
  );
};

export default ComplaintModal;
