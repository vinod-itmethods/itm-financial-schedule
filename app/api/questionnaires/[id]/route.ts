import { NextResponse } from 'next/server';
import { readQuestionnaires, writeQuestionnaires } from '@/lib/questionnaireStorage';
import type { QuestionnaireRecord } from '@/types/questionnaire';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const all = await readQuestionnaires();
  const record = all.find((r) => r.id === id);
  if (!record) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(record);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const record = (await req.json()) as QuestionnaireRecord;
  const all = await readQuestionnaires();
  const idx = all.findIndex((r) => r.id === id);
  if (idx < 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  all[idx] = { ...record, id, updatedAt: new Date().toISOString() };
  await writeQuestionnaires(all);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const all = await readQuestionnaires();
  await writeQuestionnaires(all.filter((r) => r.id !== id));
  return NextResponse.json({ ok: true });
}
