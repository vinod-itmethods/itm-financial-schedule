'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { ScheduleListItem } from '@/types/schedule';
import { newSchedule } from '@/lib/newSchedule';
import { PlusCircle, FileText, Trash2, ExternalLink } from 'lucide-react';

export default function HomePage() {
  const [schedules, setSchedules] = useState<ScheduleListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/schedules')
      .then((r) => r.json())
      .then(setSchedules)
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    const s = newSchedule();
    await fetch('/api/schedules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(s),
    });
    router.push(`/schedule/${s.id}`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this schedule?')) return;
    await fetch(`/api/schedules/${id}`, { method: 'DELETE' });
    setSchedules((s) => s.filter((x) => x.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-[#1a1a1a] text-white px-6 py-4 flex items-center gap-4 shadow-md">
        <img src="/itm-logo.png" alt="iTmethods" className="h-8 w-auto object-contain" />
        <div className="border-l border-white/20 pl-4">
          <div className="font-bold text-lg leading-tight">Forge</div>
          <div className="text-white/50 text-sm">Financial Schedule Tool</div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Saved Schedules</h1>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 bg-[#0F4C81] text-white px-4 py-2 rounded-lg hover:bg-[#0a3562] transition-colors font-semibold"
          >
            <PlusCircle size={18} />
            New Schedule
          </button>
        </div>

        {loading ? (
          <div className="text-slate-400 text-center py-16">Loading…</div>
        ) : schedules.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
            <FileText size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500 text-lg mb-2">No schedules yet</p>
            <p className="text-slate-400 text-sm mb-6">Create your first financial schedule</p>
            <button
              onClick={handleCreate}
              className="bg-[#0F4C81] text-white px-6 py-2 rounded-lg hover:bg-[#0a3562] transition-colors font-semibold"
            >
              Create Schedule
            </button>
          </div>
        ) : (
          <div className="grid gap-3">
            {schedules.map((s) => (
              <div
                key={s.id}
                className="bg-white rounded-xl border border-slate-200 px-5 py-4 flex items-center hover:border-[#0F4C81] hover:shadow-sm transition-all"
              >
                <div className="flex-1">
                  <p className="font-semibold text-slate-800">
                    {s.clientName || 'Untitled Client'}{' '}
                    {s.projectName && (
                      <span className="font-normal text-slate-500">— {s.projectName}</span>
                    )}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Last saved: {new Date(s.updatedAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/schedule/${s.id}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-[#0F4C81] text-white rounded-lg hover:bg-[#0a3562] transition-colors"
                  >
                    <ExternalLink size={14} />
                    Open
                  </Link>
                  <button
                    onClick={() => handleDelete(s.id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
