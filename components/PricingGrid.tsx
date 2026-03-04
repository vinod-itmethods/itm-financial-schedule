'use client';

import { useScheduleStore } from '@/store/scheduleStore';
import { SERVICES, CATEGORY_LABELS } from '@/data/services';
import { DEVOPS_TOOLS, USER_TIERS } from '@/data/toolList';
import {
  resolvedCellValue,
  rowTotals,
  isServiceVisible,
  fmtUSD,
} from '@/lib/calculations';
import type { ServiceDefinition, ToggleState, Tool } from '@/types/schedule';
import { useState } from 'react';
import clsx from 'clsx';
import { ChevronDown, ChevronRight } from 'lucide-react';

const CATEGORY_ORDER = ['platform', 'cloud', 'professional', 'license'] as const;

export default function PricingGrid() {
  const store = useScheduleStore();
  const { schedule, setPrice, setToolName, setToolTier } = store;
  const [optionalOpen, setOptionalOpen] = useState(false);

  const visibleTools = schedule.tools.filter((t) => t.visible);

  // Split services: included (Mandatory/Included) vs optional
  const includedServices = SERVICES.filter((s) => {
    const toggle = (schedule.serviceToggles[s.id] ?? s.defaultToggle) as ToggleState;
    return toggle === 'Mandatory' || toggle === 'Included';
  });
  const optionalServices = SERVICES.filter((s) => {
    const toggle = (schedule.serviceToggles[s.id] ?? s.defaultToggle) as ToggleState;
    return toggle === 'Optional';
  });

  const renderToolHeaders = () => (
    <tr>
      <th className="sticky left-0 z-20 bg-[#0F4C81] text-white px-3 py-2 text-left text-xs font-semibold w-36 min-w-[9rem]">
        Category
      </th>
      <th className="bg-[#0F4C81] text-white px-3 py-2 text-left text-xs font-semibold min-w-[200px]">
        Service
      </th>
      <th className="bg-[#0F4C81] text-white px-2 py-2 text-center text-xs font-semibold w-20">
        Type
      </th>
      {visibleTools.map((tool) => (
        <th
          key={tool.id}
          className="bg-[#0F4C81] text-white px-2 py-1 text-center text-xs min-w-[130px] w-[130px]"
        >
          {tool.id === 'transit-hub' ? (
            <div className="text-center">
              <div className="font-semibold text-xs">Transit Hub</div>
              <div className="text-blue-200 text-xs">{tool.tier}</div>
            </div>
          ) : (
            <div className="flex flex-col gap-0.5">
              <input
                list={`tool-names-${tool.id}`}
                value={tool.name}
                onChange={(e) => setToolName(tool.id, e.target.value)}
                placeholder="-- Select or type tool --"
                className="bg-[#1a5a91] text-white text-xs rounded px-1 py-0.5 border border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-300 w-full placeholder-blue-300"
              />
              <datalist id={`tool-names-${tool.id}`}>
                {DEVOPS_TOOLS.map((t) => <option key={t} value={t} />)}
              </datalist>
              <input
                list={`user-tiers-${tool.id}`}
                value={tool.tier}
                onChange={(e) => setToolTier(tool.id, e.target.value)}
                placeholder="Users / Nodes / Storage..."
                className="bg-[#1a5a91] text-blue-100 text-xs rounded px-1 py-0.5 border border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-300 w-full placeholder-blue-300"
              />
              <datalist id={`user-tiers-${tool.id}`}>
                <option value="50 Users" />
                <option value="100 Users" />
                <option value="250 Users" />
                <option value="500 Users" />
                <option value="1000 Users" />
                <option value="2000 Users" />
                <option value="5000 Users" />
                <option value="10000 Users" />
                <option value="Unlimited Users" />
                <option value="Storage-based" />
                <option value="Instance-based" />
                <option value="Node-based" />
                <option value="Custom" />
              </datalist>
            </div>
          )}
        </th>
      ))}
      <th className="bg-[#0a5c2e] text-white px-2 py-2 text-center text-xs font-semibold w-28">
        One-Time ($)
      </th>
      <th className="bg-[#0a5c2e] text-white px-2 py-2 text-center text-xs font-semibold w-28">
        Monthly ($)
      </th>
      <th className="bg-[#0a5c2e] text-white px-2 py-2 text-center text-xs font-semibold w-28">
        Annual ($)
      </th>
    </tr>
  );

  const renderServiceRows = (services: ServiceDefinition[]) => {
    const grouped = CATEGORY_ORDER.map((cat) => ({
      cat,
      rows: services.filter((s) => s.category === cat),
    })).filter((g) => g.rows.length > 0);

    return grouped.map(({ cat, rows }) => (
      <tbody key={cat}>
        {/* Category divider */}
        <tr>
          <td
            colSpan={3 + visibleTools.length + 3}
            className="bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-500"
          >
            {CATEGORY_LABELS[cat]}
          </td>
        </tr>
        {rows.map((svc) => (
          <ServiceRow key={svc.id} svc={svc} visibleTools={visibleTools} />
        ))}
      </tbody>
    ));
  };

  return (
    <div className="overflow-auto flex-1" id="pricing-grid">
      <table className="w-full border-collapse text-sm">
        <thead>{renderToolHeaders()}</thead>

        {/* Included services */}
        {renderServiceRows(includedServices)}

        {/* Optional services accordion */}
        {optionalServices.length > 0 && (
          <tbody>
            <tr>
              <td
                colSpan={3 + visibleTools.length + 3}
                className="bg-amber-50 border-t-2 border-amber-300 px-3 py-2 cursor-pointer hover:bg-amber-100"
                onClick={() => setOptionalOpen((o) => !o)}
              >
                <div className="flex items-center gap-2 text-sm font-semibold text-amber-800">
                  {optionalOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  Optional Services ({optionalServices.length})
                </div>
              </td>
            </tr>
          </tbody>
        )}
        {optionalOpen && renderServiceRows(optionalServices)}
      </table>
    </div>
  );
}

// ─── Service Row ─────────────────────────────────────────────────────────────

function ServiceRow({
  svc,
  visibleTools,
}: {
  svc: ServiceDefinition;
  visibleTools: Tool[];
}) {
  const { schedule, setPrice, setImplMode, setRates } = useScheduleStore();
  const toggle = schedule.serviceToggles[svc.id] ?? svc.defaultToggle;
  const name = svc.isCustomName ? schedule.additionalServiceName : svc.name;
  const totals = rowTotals(schedule, svc);
  const isReadOnly = svc.pricingType === 'epss-calculated';
  const isImpl = svc.pricingType === 'days-input';
  const isHoursMode = isImpl && schedule.implMode === 'hours';

  const rowBg = toggle === 'Mandatory' ? 'bg-blue-50/40' : 'bg-white';

  const IMPL_MODES = [
    { value: 'hours',  label: 'Hours',    placeholder: 'hrs' },
    { value: 'direct', label: 'Direct $', placeholder: '$'   },
  ] as const;

  const implPlaceholder = isImpl
    ? (IMPL_MODES.find((m) => m.value === schedule.implMode)?.placeholder ?? 'hrs')
    : '0';

  return (
    <tr className={clsx('border-b border-slate-100 hover:bg-blue-50/20 group', rowBg)}>
      {/* Category (empty — shown in category divider row) */}
      <td className="sticky left-0 bg-inherit px-3 py-1.5 text-xs text-slate-400" />

      {/* Service name */}
      <td className="px-3 py-1.5">
        <div className="flex flex-col gap-1">
          <span className="text-sm text-slate-700 font-medium">{name}</span>
          {isImpl && (
            <div className="flex gap-0.5">
              {IMPL_MODES.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setImplMode(m.value)}
                  className={clsx(
                    'text-xs px-1.5 py-0.5 rounded border font-medium transition-colors',
                    schedule.implMode === m.value
                      ? 'bg-purple-600 text-white border-purple-600'
                      : 'bg-white text-slate-500 border-slate-300 hover:border-purple-400 hover:text-purple-600'
                  )}
                >
                  {m.label}
                </button>
              ))}
              {schedule.implMode === 'hours' && (
                <span className="flex items-center gap-0.5 ml-1 text-xs text-slate-400">
                  × $
                  <input
                    type="number"
                    min={0}
                    value={schedule.rates.implPerHour}
                    onChange={(e) => setRates({ implPerHour: Number(e.target.value) })}
                    className="w-14 border border-slate-300 rounded px-1 py-0 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-purple-400"
                  />
                  /hr
                </span>
              )}
            </div>
          )}
          {!isImpl && svc.note && (
            <span className="text-xs text-slate-400">{svc.note}</span>
          )}
        </div>
      </td>

      {/* Type badge */}
      <td className="px-2 py-1.5 text-center">
        <span
          className={clsx(
            'text-xs px-1.5 py-0.5 rounded-full font-medium',
            toggle === 'Mandatory' && 'bg-blue-100 text-blue-700',
            toggle === 'Included' && 'bg-green-100 text-green-700',
            toggle === 'Optional' && 'bg-amber-100 text-amber-700',
          )}
        >
          {svc.type}
        </span>
      </td>

      {/* Price cells per tool */}
      {visibleTools.map((tool) => {
        const toolId = svc.appliesTo === 'single-cell' ? 'single' : tool.id;

        // Skip transit hub for tool-only services
        const skip =
          (svc.appliesTo === 'tools-only' && tool.id === 'transit-hub') ||
          (svc.appliesTo === 'transit-hub-only' && tool.id !== 'transit-hub');

        if (skip) {
          return (
            <td key={tool.id} className="px-2 py-1.5 text-center text-slate-200 text-xs">
              —
            </td>
          );
        }

        if (isReadOnly) {
          const v = resolvedCellValue(schedule, svc, toolId);
          return (
            <td key={tool.id} className="px-2 py-1.5 text-center bg-green-50 text-green-700 text-xs font-semibold">
              {v === 'TBD' ? 'TBD' : v === 0 ? '—' : fmtUSD(v as number)}
            </td>
          );
        }

        const raw = schedule.prices[svc.id]?.[toolId];
        const rawNum = raw === undefined ? 0 : raw === 'TBD' ? 0 : raw as number;

        // Hours mode: show dollar value prominently, with small hrs input below
        if (isHoursMode) {
          const dollars = rawNum * schedule.rates.implPerHour;
          return (
            <td key={tool.id} className="px-1 py-1 bg-purple-50">
              <div className="flex flex-col items-end gap-0.5">
                <span className="text-xs font-semibold text-purple-700">
                  {dollars > 0 ? fmtUSD(dollars) : '—'}
                </span>
                <input
                  type="number"
                  min={0}
                  value={rawNum || ''}
                  placeholder="hrs"
                  onChange={(e) => {
                    const n = parseFloat(e.target.value);
                    setPrice(svc.id, toolId, isNaN(n) ? 0 : n);
                  }}
                  className="w-full text-right text-xs border border-purple-200 rounded px-1 py-0 bg-white text-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-400 placeholder-purple-200"
                />
              </div>
            </td>
          );
        }

        const displayVal = raw === 'TBD' ? 'TBD' : raw === undefined ? '' : String(raw);

        return (
          <td key={tool.id} className="px-1 py-1">
            <input
              type="text"
              value={displayVal}
              placeholder={isImpl ? '$' : '0'}
              onChange={(e) => {
                const v = e.target.value;
                if (v === '' || v === '0') {
                  setPrice(svc.id, toolId, 0);
                } else if (v.toLowerCase() === 'tbd') {
                  setPrice(svc.id, toolId, 'TBD');
                } else {
                  const n = parseFloat(v.replace(/,/g, ''));
                  if (!isNaN(n)) setPrice(svc.id, toolId, n);
                }
              }}
              className={clsx(
                'price-input w-full text-right text-xs border border-slate-200 rounded px-2 py-1',
                'hover:border-blue-300 focus:bg-white focus:border-blue-500',
                svc.pricingType === 'epss-host-input' && 'bg-orange-50',
              )}
            />
          </td>
        );
      })}

      {/* N O P totals */}
      <td className={clsx('px-2 py-1.5 text-right text-xs font-semibold', totals.oneTime > 0 ? 'bg-green-50 text-green-700' : 'text-slate-300')}>
        {totals.oneTime > 0 ? fmtUSD(totals.oneTime) : '—'}
      </td>
      <td className={clsx('px-2 py-1.5 text-right text-xs font-semibold', totals.monthly > 0 ? 'bg-green-50 text-green-700' : 'text-slate-300')}>
        {totals.monthly > 0 ? fmtUSD(totals.monthly) : '—'}
      </td>
      <td className={clsx('px-2 py-1.5 text-right text-xs font-semibold', totals.annual > 0 ? 'bg-green-50 text-green-700' : 'text-slate-300')}>
        {totals.annual > 0 ? fmtUSD(totals.annual) : '—'}
      </td>
    </tr>
  );
}
