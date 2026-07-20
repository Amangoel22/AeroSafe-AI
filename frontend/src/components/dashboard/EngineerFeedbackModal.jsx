import React, { useState } from "react";
import { X, CheckCircle } from "lucide-react";

const EngineerFeedbackModal = ({ isOpen, onClose, onSubmit }) => {
  const [feedback, setFeedback] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!feedback.trim()) {
      alert("Please provide feedback before resolving the incident.");
      return;
    }
    onSubmit(feedback);
    setFeedback("");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900">
            <CheckCircle className="text-green-600" size={24} />
            Resolve Incident
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Action Taken / Resolution Feedback <span className="text-red-500">*</span>
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Provide details about the resolution (e.g. Cleared debris, repaired runway surface...)"
              className="w-full border border-slate-300 rounded-lg p-3 h-32 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              required
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-slate-300 text-slate-700 rounded-lg py-2 font-medium hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-lg py-2 font-semibold transition-colors"
            >
              Submit Resolution
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EngineerFeedbackModal;
