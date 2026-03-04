'use client';

import { useScheduleStore } from '@/store/scheduleStore';
import { SERVICES } from '@/data/services';
import type { ToggleState } from '@/types/schedule';
import { Settings2, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';

const TOGGLE_OPTIONS: ToggleState[] = ['Mandatory', 'Included', 'Optional', 'Hidden'];

const toggleColors: Record<ToggleState, string> = {
  Mandatory: 'bg-blue-100 text-blue-800',
  Included:  'bg-green-100 text-green-800',
  Optional:  'bg-yellow-100 text-yellow-800',
  Hidden:    'bg-slate-100 text-slate-500',
};

export default function Configurator() {
  const { schedule, setNumTools, setServiceToggle, setAdditionalServiceName, setRates } = useScheduleStore();
  const [ratesOpen, setRatesOpen] = useState(false);

  // Group services by category for display, skip EPSS-calculated (paired with host)
  const displayServices = SERVICES.filter((s) => s.pricingType !== 'epss-calculated');

  return (
    <aside className="w-64 min-w-[256px] bg-white border-r border-slate-200 flex flex-col overflow-y-auto">
      <div className="px-4 py-3 border-b border-slate-200 flex items-center gap-2 bg-[#0F4C81] text-white">
        <Settings2 size={16} />
        <span className="font-semibold text-sm">Configurator</span>
      </div>

      {/* Number of Tools */}
      <div className="px-4 py-3 border-b border-slate-100">
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
          Number of Tools
        </label>
        <select
          value={schedule.numTools}
          onChange={(e) => setNumTools(Number(e.target.value))}
          className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {Array.from({ length: 8 }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>{n} Tool{n > 1 ? 's' : ''}</option>
          ))}
        </select>
      </div>

      {/* Service Toggles */}
      <div className="px-4 py-3 border-b border-slate-100 flex-1">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Services</p>
        <div className="space-y-2">
          {displayServices.map((svc) => {
            const toggle = schedule.serviceToggles[svc.id] ?? svc.defaultToggle;
            const name = svc.isCustomName ? schedule.additionalServiceName : svc.name;
            const isMandatory = toggle === 'Mandatory';

            return (
              <div key={svc.id} className="group">
                <div className="flex items-start justify-between gap-1">
                  <span className="text-xs text-slate-700 leading-tight flex-1 pt-0.5">
                    {name}
                  </span>
                  <select
                    value={toggle}
                    disabled={isMandatory}
                    onChange={(e) => setServiceToggle(svc.id, e.target.value as ToggleState)}
                    className={clsx(
                      'text-xs rounded px-1.5 py-0.5 border-0 font-medium cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-400',
                      toggleColors[toggle],
                      isMandatory && 'opacity-70 cursor-not-allowed'
                    )}
                  >
                    {TOGGLE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt} disabled={opt === 'Mandatory' && !isMandatory}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
                {/* Editable name for "Additional Service" */}
                {svc.isCustomName && toggle !== 'Hidden' && (
                  <input
                    type="text"
                    value={schedule.additionalServiceName}
                    onChange={(e) => setAdditionalServiceName(e.target.value)}
                    placeholder="Service name…"
                    className="mt-1 w-full text-xs border border-slate-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Configurable Rates */}
      <div className="border-t border-slate-200">
        <button
          onClick={() => setRatesOpen((o) => !o)}
          className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wide hover:bg-slate-50"
        >
          Configurable Rates
          {ratesOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        {ratesOpen && (
          <div className="px-4 pb-4 space-y-3">
            <div>
              <label className="block text-xs text-slate-500 mb-1">
                EPSS rate ($/host/month)
              </label>
              <input
                type="number"
                min={0}
                value={schedule.rates.epssPerHost}
                onChange={(e) => setRates({ epssPerHost: Number(e.target.value) })}
                className="w-full border border-slate-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">
                Implementation rate ($/hour)
              </label>
              <input
                type="number"
                min={0}
                value={schedule.rates.implPerHour}
                onChange={(e) => setRates({ implPerHour: Number(e.target.value) })}
                className="w-full border border-slate-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
