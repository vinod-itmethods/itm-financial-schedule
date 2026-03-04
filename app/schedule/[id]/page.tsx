'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useScheduleStore } from '@/store/scheduleStore';
import Header from '@/components/Header';
import ClientInfoBar from '@/components/ClientInfoBar';
import Configurator from '@/components/Configurator';
import PricingGrid from '@/components/PricingGrid';
import SummarySection from '@/components/SummarySection';
import type { Schedule } from '@/types/schedule';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function SchedulePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { schedule, loadSchedule } = useScheduleStore();
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => {
    fetch(`/api/schedules/${id}`)
      .then((r) => {
        if (!r.ok) return null;
        return r.json() as Promise<Schedule>;
      })
      .then((s) => {
        if (s) loadSchedule(s);
        setLoaded(true);
      });
  }, [id, loadSchedule]);

  const handleSave = async () => {
    setSaving(true);
    const updated = { ...schedule, id, updatedAt: new Date().toISOString() };
    await fetch(`/api/schedules/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });
    setSaving(false);
    setSaveMsg('Saved!');
    setTimeout(() => setSaveMsg(''), 2000);
  };

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400">
        Loading schedule…
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Top nav */}
      <div className="bg-white border-b border-slate-200 px-4 py-1.5 flex items-center gap-3 no-print text-sm">
        <Link href="/" className="flex items-center gap-1 text-slate-500 hover:text-[#0F4C81]">
          <ArrowLeft size={14} />
          All Schedules
        </Link>
        {saveMsg && (
          <span className="text-green-600 font-semibold ml-auto text-xs">{saveMsg}</span>
        )}
      </div>

      <Header scheduleId={id} onSave={handleSave} saving={saving} />
      <ClientInfoBar />

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden" id="printable-schedule">
        <Configurator />
        <div className="flex flex-col flex-1 overflow-hidden">
          <PricingGrid />
          <SummarySection />
        </div>
      </div>
    </div>
  );
}
