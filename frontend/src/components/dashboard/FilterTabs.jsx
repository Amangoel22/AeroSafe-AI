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
      id: COMPLAINT_STATUSES.ACTIVE,
      label: "Active",
      count: statistics.active,
    },
    {
      id: COMPLAINT_STATUSES.RESOLVED,
      label: "Resolved",
      count: statistics.resolved,
    },
    {
      id: COMPLAINT_STATUSES.FALSE_ALARM,
      label: "False Alarm",
      count: statistics.falseAlarm,
    },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onFilterChange(tab.id)}
          className={`px-4 h-[34px] rounded-lg font-bold transition-all duration-300 transform active:scale-95 text-xs tracking-wide flex items-center gap-2 ${
            currentFilter === tab.id
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
              : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
          }`}
        >
          <span>{tab.label}</span>
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-extrabold transition-colors duration-300 ${
              currentFilter === tab.id
                ? "bg-blue-700/80 text-white"
                : "bg-slate-200 text-slate-600"
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
