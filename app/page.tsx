'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { ScheduleListItem } from '@/types/schedule';
import type { QuestionnaireListItem } from '@/types/questionnaire';
import { newSchedule } from '@/lib/newSchedule';
import {
  PlusCircle,
  FileText,
  Trash2,
  ExternalLink,
  ClipboardList,
  DollarSign,
} from 'lucide-react';

function randomUUID(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

type Tab = 'schedules' | 'questionnaires';

export default function HomePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('schedules');

  // Schedules state
  const [schedules, setSchedules] = useState<ScheduleListItem[]>([]);
  const [schedulesLoading, setSchedulesLoading] = useState(true);

  // Questionnaires state
  const [questionnaires, setQuestionnaires] = useState<QuestionnaireListItem[]>([]);
  const [questionnairesLoading, setQuestionnairesLoading] = useState(true);

  useEffect(() => {
    fetch('/api/schedules')
      .then((r) => r.json())
      .then(setSchedules)
      .finally(() => setSchedulesLoading(false));

    fetch('/api/questionnaires')
      .then((r) => r.json())
      .then(setQuestionnaires)
      .finally(() => setQuestionnairesLoading(false));
  }, []);

  // ── Schedule actions ────────────────────────────────────────────────────────

  const handleCreateSchedule = async () => {
    try {
      const s = newSchedule();
      const res = await fetch('/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(s),
      });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      router.push(`/schedule/${s.id}`);
    } catch (err) {
      alert(`Failed to create schedule: ${err instanceof Error ? err.message : err}`);
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    if (!confirm('Delete this schedule?')) return;
    await fetch(`/api/schedules/${id}`, { method: 'DELETE' });
    setSchedules((s) => s.filter((x) => x.id !== id));
  };

  // ── Questionnaire actions ───────────────────────────────────────────────────

  const handleCreateQuestionnaire = async () => {
    const id = randomUUID();
    const record = {
      id,
      clientName: '',
      projectName: '',
      date: new Date().toISOString().split('T')[0],
      answers: {},
      notes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const res = await fetch('/api/questionnaires', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record),
    });
    if (!res.ok) return;
    router.push(`/questionnaire/${id}`);
  };

  const handleDeleteQuestionnaire = async (id: string) => {
    if (!confirm('Delete this questionnaire?')) return;
    await fetch(`/api/questionnaires/${id}`, { method: 'DELETE' });
    setQuestionnaires((q) => q.filter((x) => x.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-[#1a1a1a] text-white px-6 py-4 flex items-center gap-4 shadow-md">
        <img src="/itm-logo.png" alt="iTmethods" className="h-8 w-auto object-contain" />
        <div className="border-l border-white/20 pl-4">
          <div className="font-bold text-lg leading-tight">Forge</div>
          <div className="text-white/50 text-sm">Pre-Sales Platform</div>
        </div>
      </header>

      {/* Tab Bar */}
      <div className="bg-white border-b border-slate-200 px-6">
        <div className="max-w-4xl mx-auto flex gap-0">
          <button
            onClick={() => setActiveTab('schedules')}
            className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'schedules'
                ? 'border-[#0F4C81] text-[#0F4C81]'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <DollarSign size={15} />
            Financial Schedules
          </button>
          <button
            onClick={() => setActiveTab('questionnaires')}
            className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'questionnaires'
                ? 'border-[#0F4C81] text-[#0F4C81]'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <ClipboardList size={15} />
            Pre-Sales Questionnaires
            {questionnaires.length > 0 && (
              <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">
                {questionnaires.length}
              </span>
            )}
          </button>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* ── Schedules Tab ────────────────────────────────────────────────── */}
        {activeTab === 'schedules' && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-slate-800">Financial Schedules</h1>
              <button
                onClick={handleCreateSchedule}
                className="flex items-center gap-2 bg-[#0F4C81] text-white px-4 py-2 rounded-lg hover:bg-[#0a3562] transition-colors font-semibold"
              >
                <PlusCircle size={18} />
                New Schedule
              </button>
            </div>

            {schedulesLoading ? (
              <div className="text-slate-400 text-center py-16">Loading…</div>
            ) : schedules.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
                <FileText size={48} className="mx-auto text-slate-300 mb-4" />
                <p className="text-slate-500 text-lg mb-2">No schedules yet</p>
                <p className="text-slate-400 text-sm mb-6">Create your first financial schedule</p>
                <button
                  onClick={handleCreateSchedule}
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
                        onClick={() => handleDeleteSchedule(s.id)}
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
          </>
        )}

        {/* ── Questionnaires Tab ───────────────────────────────────────────── */}
        {activeTab === 'questionnaires' && (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Pre-Sales Questionnaires</h1>
                <p className="text-sm text-slate-500 mt-1">
                  Capture customer requirements per tool — single source of pre-sales knowledge.
                </p>
              </div>
              <button
                onClick={handleCreateQuestionnaire}
                className="flex items-center gap-2 bg-[#0F4C81] text-white px-4 py-2 rounded-lg hover:bg-[#0a3562] transition-colors font-semibold"
              >
                <PlusCircle size={18} />
                New Questionnaire
              </button>
            </div>

            {questionnairesLoading ? (
              <div className="text-slate-400 text-center py-16">Loading…</div>
            ) : questionnaires.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
                <ClipboardList size={48} className="mx-auto text-slate-300 mb-4" />
                <p className="text-slate-500 text-lg mb-2">No questionnaires yet</p>
                <p className="text-slate-400 text-sm mb-6">
                  Start capturing customer requirements for SonarQube, GitLab, GitHub, Artifactory and more
                </p>
                <button
                  onClick={handleCreateQuestionnaire}
                  className="bg-[#0F4C81] text-white px-6 py-2 rounded-lg hover:bg-[#0a3562] transition-colors font-semibold"
                >
                  Create Questionnaire
                </button>
              </div>
            ) : (
              <div className="grid gap-3">
                {questionnaires.map((q) => (
                  <div
                    key={q.id}
                    className="bg-white rounded-xl border border-slate-200 px-5 py-4 flex items-center hover:border-[#0F4C81] hover:shadow-sm transition-all"
                  >
                    <ClipboardList size={18} className="text-slate-300 mr-3 shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold text-slate-800">
                        {q.clientName || 'Untitled Client'}{' '}
                        {q.projectName && (
                          <span className="font-normal text-slate-500">— {q.projectName}</span>
                        )}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Last saved: {new Date(q.updatedAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/questionnaire/${q.id}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-[#0F4C81] text-white rounded-lg hover:bg-[#0a3562] transition-colors"
                      >
                        <ExternalLink size={14} />
                        Open
                      </Link>
                      <button
                        onClick={() => handleDeleteQuestionnaire(q.id)}
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
          </>
        )}
      </main>
    </div>
  );
}
