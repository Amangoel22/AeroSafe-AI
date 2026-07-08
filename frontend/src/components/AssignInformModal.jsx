import { X, Phone } from "lucide-react";
import React, { useEffect, useState } from "react";
import { getEngineers } from "../api/userApi";

const AssignInformModal = ({ isOpen, complaintId, onClose, onAssign }) => {
  const [selectedOfficer, setSelectedOfficer] = useState("");
  const [engineers, setEngineers] = useState([]);

  useEffect(() => {
  async function loadEngineers() {
    try {
      const data = await getEngineers();

      console.log("Engineers API:", data);

      setEngineers(data);
    } catch (err) {
      console.error(err);
    }
  }

  if (isOpen) {
    loadEngineers();
  }
}, [isOpen]);

  const handleSubmit = (e) => {
  e.preventDefault();
    console.log("STEP 1");

  console.log("===== HANDLE SUBMIT =====");
  console.log("Complaint ID:", complaintId);
  console.log("Selected Engineer:", selectedOfficer);

  if (!selectedOfficer) {
    alert("Please select an engineer");
    return;
  }
    console.log("STEP 2");


  console.log("Calling onAssign...");

  onAssign(
    complaintId,
    Number(selectedOfficer),
    "assign"
  );

  console.log("onAssign finished");

  setSelectedOfficer("");
  onClose();
};
if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold">Assign Engineer</h2>

          <button onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <label className="block text-sm font-semibold">Select Engineer</label>

          <select
            value={selectedOfficer}
            onChange={(e) => setSelectedOfficer(e.target.value)}
            className="w-full border rounded-lg p-2"
          >
            <option value="">-- Select Engineer --</option>

            {engineers.map((engineer) => (
              <option key={engineer.id} value={engineer.id}>
                {engineer.full_name}
              </option>
            ))}
          </select>

          {selectedOfficer && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Phone size={16} />
                Engineer will be notified.
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border rounded-lg py-2"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white rounded-lg py-2"
            >
              Assign
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignInformModal;
