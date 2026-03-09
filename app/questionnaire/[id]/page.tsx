'use client';

import { useEffect, useState, use, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, CheckCircle, ClipboardList } from 'lucide-react';
import { TOOL_QUESTIONNAIRES } from '@/data/questionnaires';
import type { QuestionnaireRecord, QuestionnaireAnswers } from '@/types/questionnaire';

// ─── Question Field ───────────────────────────────────────────────────────────

function QuestionField({
  question,
  value,
  allAnswers,
  onChange,
}: {
  question: (typeof TOOL_QUESTIONNAIRES)[0]['questions'][0];
  value: string;
  allAnswers: Record<string, string>;
  onChange: (v: string) => void;
}) {
  // Conditional visibility
  if (question.conditionalOn) {
    const parentVal = allAnswers[question.conditionalOn.questionId] ?? '';
    if (parentVal !== question.conditionalOn.value) return null;
  }

  const baseInput =
    'w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81] bg-white text-slate-800';

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-slate-700">{question.label}</label>

      {question.type === 'yes-no' && (
        <select className={baseInput} value={value} onChange={(e) => onChange(e.target.value)}>
          <option value="">— Select —</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      )}

      {question.type === 'select' && (
        <select className={baseInput} value={value} onChange={(e) => onChange(e.target.value)}>
          <option value="">— Select —</option>
          {question.options?.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      )}

      {question.type === 'text' && (
        <input
          type="text"
          className={baseInput}
          value={value}
          placeholder={question.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {question.type === 'textarea' && (
        <textarea
          className={`${baseInput} resize-y min-h-[80px]`}
          value={value}
          placeholder={question.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {question.comment && (
        <p className="text-xs text-slate-400 leading-relaxed">{question.comment}</p>
      )}
    </div>
  );
}

// ─── Tool Tab Panel ───────────────────────────────────────────────────────────

function ToolPanel({
  toolId,
  answers,
  onAnswer,
}: {
  toolId: string;
  answers: Record<string, string>;
  onAnswer: (questionId: string, value: string) => void;
}) {
  const tool = TOOL_QUESTIONNAIRES.find((t) => t.id === toolId);
  if (!tool) return null;

  const answered = tool.questions.filter(
    (q) => !q.conditionalOn && answers[q.id]
  ).length;
  const total = tool.questions.filter((q) => !q.conditionalOn).length;

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 bg-slate-100 rounded-full h-2">
          <div
            className="bg-[#0F4C81] rounded-full h-2 transition-all"
            style={{ width: `${total > 0 ? (answered / total) * 100 : 0}%` }}
          />
        </div>
        <span className="text-xs text-slate-500 whitespace-nowrap">
          {answered} / {total} answered
        </span>
      </div>

      {/* Questions */}
      {tool.questions.map((q) => (
        <QuestionField
          key={q.id}
          question={q}
          value={answers[q.id] ?? ''}
          allAnswers={answers}
          onChange={(v) => onAnswer(q.id, v)}
        />
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function QuestionnairePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [record, setRecord] = useState<QuestionnaireRecord | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState(TOOL_QUESTIONNAIRES[0].id);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);

  useEffect(() => {
    fetch(`/api/questionnaires/${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data: QuestionnaireRecord | null) => {
        if (data) setRecord(data);
        setLoaded(true);
      });
  }, [id]);

  const setAnswer = useCallback(
    (toolId: string, questionId: string, value: string) => {
      setRecord((prev) => {
        if (!prev) return prev;
        const answers: QuestionnaireAnswers = {
          ...prev.answers,
          [toolId]: {
            ...(prev.answers[toolId] ?? {}),
            [questionId]: value,
          },
        };
        return { ...prev, answers };
      });
    },
    []
  );

  const handleSave = async () => {
    if (!record) return;
    setSaving(true);
    await fetch(`/api/questionnaires/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...record, updatedAt: new Date().toISOString() }),
    });
    setSaving(false);
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2500);
  };

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400">
        Loading…
      </div>
    );
  }

  if (!record) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400">
        Questionnaire not found.{' '}
        <Link href="/" className="text-[#0F4C81] underline ml-1">
          Go home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-[#1a1a1a] text-white px-6 py-4 flex items-center gap-4 shadow-md">
        <img src="/itm-logo.png" alt="iTmethods" className="h-8 w-auto object-contain" />
        <div className="border-l border-white/20 pl-4">
          <div className="font-bold text-lg leading-tight">Forge</div>
          <div className="text-white/50 text-sm">Pre-Sales Questionnaire</div>
        </div>
        <div className="ml-auto flex items-center gap-3">
          {savedMsg && (
            <span className="flex items-center gap-1.5 text-green-400 text-sm font-semibold">
              <CheckCircle size={15} /> Saved
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-[#0F4C81] text-white px-4 py-2 rounded-lg hover:bg-[#0a3562] transition-colors font-semibold text-sm disabled:opacity-60"
          >
            <Save size={15} />
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </header>

      {/* Sub-nav */}
      <div className="bg-white border-b border-slate-200 px-6 py-2 flex items-center gap-3 text-sm">
        <Link href="/" className="flex items-center gap-1 text-slate-500 hover:text-[#0F4C81]">
          <ArrowLeft size={14} /> All Questionnaires
        </Link>
      </div>

      {/* Client Info Bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Client</label>
          <input
            type="text"
            value={record.clientName}
            onChange={(e) => setRecord((r) => r && { ...r, clientName: e.target.value })}
            placeholder="Client name"
            className="border border-slate-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81] w-48"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Project</label>
          <input
            type="text"
            value={record.projectName}
            onChange={(e) => setRecord((r) => r && { ...r, projectName: e.target.value })}
            placeholder="Project name"
            className="border border-slate-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81] w-48"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</label>
          <input
            type="date"
            value={record.date}
            onChange={(e) => setRecord((r) => r && { ...r, date: e.target.value })}
            className="border border-slate-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81]"
          />
        </div>
      </div>

      {/* Main: Tab sidebar + Content */}
      <div className="flex flex-1 max-w-6xl mx-auto w-full gap-0 py-6 px-4">
        {/* Tool Tabs (left sidebar) */}
        <div className="w-48 shrink-0 flex flex-col gap-1 mr-4">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 mb-1">
            Tools
          </p>
          {TOOL_QUESTIONNAIRES.map((tool) => {
            const toolAnswers = record.answers[tool.id] ?? {};
            const filled = Object.values(toolAnswers).filter(Boolean).length;
            const isActive = activeTab === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => setActiveTab(tool.id)}
                className={`flex items-center justify-between w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-[#0F4C81] text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>{tool.label}</span>
                {filled > 0 && (
                  <span
                    className={`text-xs rounded-full px-1.5 py-0.5 font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-[#0F4C81]/10 text-[#0F4C81]'
                    }`}
                  >
                    {filled}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Question Panel */}
        <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Tab header */}
          <div className="bg-[#0F4C81] px-6 py-3 flex items-center gap-2">
            <ClipboardList size={16} className="text-white/70" />
            <h2 className="text-white font-bold text-sm">
              {TOOL_QUESTIONNAIRES.find((t) => t.id === activeTab)?.label} — Discovery Questionnaire
            </h2>
          </div>

          <ToolPanel
            toolId={activeTab}
            answers={record.answers[activeTab] ?? {}}
            onAnswer={(qId, val) => setAnswer(activeTab, qId, val)}
          />
        </div>

        {/* General Notes (right column) */}
        <div className="w-56 shrink-0 ml-4 flex flex-col gap-3">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
            General Notes
          </p>
          <textarea
            value={record.notes}
            onChange={(e) => setRecord((r) => r && { ...r, notes: e.target.value })}
            placeholder="Pre-sales notes, context, follow-ups…"
            className="flex-1 border border-slate-300 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81] resize-none min-h-[400px] bg-white"
          />
          <p className="text-xs text-slate-400 px-1">
            Last saved:{' '}
            {record.updatedAt
              ? new Date(record.updatedAt).toLocaleString()
              : '—'}
          </p>
        </div>
      </div>
    </div>
  );
}
