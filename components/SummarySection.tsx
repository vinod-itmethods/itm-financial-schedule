'use client';

import { useScheduleStore } from '@/store/scheduleStore';
import { computeSummary, fmtUSD } from '@/lib/calculations';

export default function SummarySection() {
  const { schedule, setDiscountPlatformSetup, setDiscountImplementation } = useScheduleStore();
  const summary = computeSummary(schedule);

  return (
    <div className="bg-white border-t-2 border-[#0F4C81] p-4" id="summary-section">
      <h2 className="text-sm font-bold text-[#0F4C81] uppercase tracking-wider mb-3">
        Solution Estimate Summary
      </h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Discounts */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Discounts</p>
          <div>
            <label className="text-xs text-slate-500 block mb-0.5">Platform Setup Discount ($)</label>
            <input
              type="number"
              min={0}
              value={schedule.discountPlatformSetup || ''}
              onChange={(e) => setDiscountPlatformSetup(Number(e.target.value))}
              placeholder="0"
              className="w-full border border-slate-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-0.5">Impl/Migration Discount ($)</label>
            <input
              type="number"
              min={0}
              value={schedule.discountImplementation || ''}
              onChange={(e) => setDiscountImplementation(Number(e.target.value))}
              placeholder="0"
              className="w-full border border-slate-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* One-Time */}
        <SummaryCard
          label="Total One-Time Fees"
          raw={summary.totalOneTime}
          net={summary.netOneTime}
          discounted={summary.discountPlatformSetup + summary.discountImplementation > 0}
          color="blue"
        />

        {/* Monthly */}
        <SummaryCard
          label="Total Monthly Recurring"
          net={summary.totalMonthly}
          color="indigo"
        />

        {/* Annual */}
        <SummaryCard
          label="Total Annual Fees"
          net={summary.netAnnual}
          color="green"
          large
        />
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  raw,
  net,
  discounted,
  color,
  large,
}: {
  label: string;
  raw?: number;
  net: number;
  discounted?: boolean;
  color: 'blue' | 'indigo' | 'green';
  large?: boolean;
}) {
  const colors = {
    blue:   { bg: 'bg-blue-50',   border: 'border-blue-300',  text: 'text-blue-800' },
    indigo: { bg: 'bg-indigo-50', border: 'border-indigo-300', text: 'text-indigo-800' },
    green:  { bg: 'bg-green-50',  border: 'border-green-400',  text: 'text-green-800' },
  }[color];

  return (
    <div className={`rounded-lg border-2 p-3 ${colors.bg} ${colors.border}`}>
      <p className={`text-xs font-semibold uppercase tracking-wide mb-1 ${colors.text}`}>{label}</p>
      {discounted && raw !== undefined && (
        <p className="text-xs text-slate-400 line-through">{fmtUSD(raw)}</p>
      )}
      <p className={`font-bold ${large ? 'text-2xl' : 'text-xl'} ${colors.text}`}>
        {fmtUSD(net)}
      </p>
      {color === 'indigo' && (
        <p className="text-xs text-indigo-400 mt-0.5">× 12 = {fmtUSD(net * 12)} /year</p>
      )}
    </div>
  );
}
