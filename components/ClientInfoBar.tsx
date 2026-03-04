'use client';

import { useScheduleStore } from '@/store/scheduleStore';
import { TRANSIT_HUB_OPTIONS } from '@/data/toolList';

export default function ClientInfoBar() {
  const { schedule, setClientName, setProjectName, setDate, setTransitHubAttachments } =
    useScheduleStore();

  return (
    <div className="flex flex-wrap items-center gap-3 px-4 py-2 bg-white border-b border-slate-200 text-sm">
      <div className="flex items-center gap-2">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Client</label>
        <input
          type="text"
          value={schedule.clientName}
          onChange={(e) => setClientName(e.target.value)}
          placeholder="Client name…"
          className="border border-slate-300 rounded px-2 py-1 text-sm w-40 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="flex items-center gap-2">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Project</label>
        <input
          type="text"
          value={schedule.projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder="Project / solution…"
          className="border border-slate-300 rounded px-2 py-1 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="flex items-center gap-2">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</label>
        <input
          type="date"
          value={schedule.date}
          onChange={(e) => setDate(e.target.value)}
          className="border border-slate-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="flex items-center gap-2 ml-auto">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Transit Hub</label>
        <select
          value={schedule.transitHubAttachments}
          onChange={(e) => setTransitHubAttachments(e.target.value)}
          className="border border-slate-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {TRANSIT_HUB_OPTIONS.map((opt) => (
            <option key={opt}>{opt}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
