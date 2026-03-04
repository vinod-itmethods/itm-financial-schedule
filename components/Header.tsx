'use client';

import { useScheduleStore } from '@/store/scheduleStore';
import { exportToExcel } from '@/lib/exportExcel';
import { exportToImage } from '@/lib/exportPdf';
import { computeSummary } from '@/lib/calculations';
import { Download, Image, RotateCcw, Save, FileSpreadsheet } from 'lucide-react';
import { useState } from 'react';
import NextImage from 'next/image';

interface HeaderProps {
  scheduleId?: string;
  onSave?: () => Promise<void>;
  saving?: boolean;
}

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

export default function Header({ scheduleId, onSave, saving }: HeaderProps) {
  const { schedule, resetSchedule } = useScheduleStore();
  const [exportOpen, setExportOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  const summary = computeSummary(schedule);

  const handleExcelExport = () => {
    exportToExcel(schedule);
    setExportOpen(false);
  };

  const handleImageExport = async () => {
    setExporting(true);
    setExportOpen(false);
    const fileName = `${schedule.clientName || 'Schedule'} - ${schedule.projectName || 'Forge'} Financial Schedule`;
    await exportToImage('printable-schedule', fileName);
    setExporting(false);
  };

  return (
    <header className="bg-[#1a1a1a] text-white flex items-center px-4 h-14 gap-4 no-print shadow-md">
      {/* iTmethods logo */}
      <div className="flex items-center gap-3 shrink-0">
        <NextImage
          src="/itm-logo.png"
          alt="iTmethods"
          width={120}
          height={32}
          className="h-8 w-auto object-contain"
          priority
        />
        <div className="border-l border-white/20 pl-3">
          <div className="font-bold text-sm leading-tight text-white">Forge</div>
          <div className="text-xs leading-tight text-white/50">Financial Schedule</div>
        </div>
      </div>

      {/* Client / Project */}
      {(schedule.clientName || schedule.projectName) && (
        <div className="text-sm text-white/60">
          {schedule.clientName && <span className="font-semibold text-white">{schedule.clientName}</span>}
          {schedule.clientName && schedule.projectName && <span className="text-white/40"> — </span>}
          {schedule.projectName && <span className="text-white/80">{schedule.projectName}</span>}
        </div>
      )}

      <div className="flex-1" />

      {/* Summary pills */}
      <div className="hidden lg:flex items-center gap-2 text-xs">
        <span className="bg-white/10 rounded-full px-3 py-1 text-white/70">
          One-Time: <strong className="text-white">{fmt(summary.netOneTime)}</strong>
        </span>
        <span className="bg-white/10 rounded-full px-3 py-1 text-white/70">
          Monthly: <strong className="text-white">{fmt(summary.totalMonthly)}</strong>
        </span>
        <span className="bg-[#0a5c2e]/80 rounded-full px-3 py-1 font-semibold text-white">
          Annual: <strong>{fmt(summary.netAnnual)}</strong>
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => { if (confirm('Reset all values?')) resetSchedule(); }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-white/50 hover:text-white hover:bg-white/10 rounded transition-colors"
        >
          <RotateCcw size={14} />
          Reset
        </button>

        {onSave && (
          <button
            onClick={onSave}
            disabled={saving}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-white/10 hover:bg-white/20 rounded transition-colors disabled:opacity-50"
          >
            <Save size={14} />
            {saving ? 'Saving…' : 'Save'}
          </button>
        )}

        {/* Export dropdown */}
        <div className="relative">
          <button
            onClick={() => setExportOpen((o) => !o)}
            disabled={exporting}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-white text-[#1a1a1a] font-semibold hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
          >
            <Download size={14} />
            {exporting ? 'Exporting…' : 'Export'}
          </button>
          {exportOpen && (
            <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-50 min-w-[170px]">
              <button
                onClick={handleExcelExport}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                <FileSpreadsheet size={14} className="text-green-600" />
                Export to Excel
              </button>
              <button
                onClick={handleImageExport}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                <Image size={14} className="text-blue-500" />
                Export as Image
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
