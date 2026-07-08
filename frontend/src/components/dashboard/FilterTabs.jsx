import React from "react";
import { COMPLAINT_STATUSES } from "../../lib/types.js";

const FilterTabs = ({ currentFilter, onFilterChange, statistics }) => {
  const tabs = [
    {
      id: "all",
      label: "All",
      count: statistics.total,
    },
    {
      id: COMPLAINT_STATUSES.PENDING,
      label: "Pending",
      count: statistics.pending,
    },
    {
      id: COMPLAINT_STATUSES.ASSIGNED,
      label: "Assigned",
      count: statistics.assigned,
    },
    {
      id: COMPLAINT_STATUSES.RESOLVED,
      label: "Resolved",
      count: statistics.resolved,
    },
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onFilterChange(tab.id)}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            currentFilter === tab.id
              ? "bg-blue-600 text-white shadow-md"
              : "bg-white text-slate-700 border border-slate-200 hover:border-blue-300"
          }`}
        >
          {tab.label}
          <span
            className={`ml-2 px-2 py-0.5 rounded text-sm font-semibold ${
              currentFilter === tab.id
                ? "bg-blue-700"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            {tab.count}
          </span>
        </button>
      ))}
    </div>
  );
};

export default FilterTabs;
