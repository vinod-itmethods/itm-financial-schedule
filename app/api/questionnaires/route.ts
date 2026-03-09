import { NextResponse } from 'next/server';
import { readQuestionnaires, writeQuestionnaires } from '@/lib/questionnaireStorage';
import type { QuestionnaireRecord } from '@/types/questionnaire';

export async function GET() {
  const all = await readQuestionnaires();
  const list = all.map(({ id, clientName, projectName, updatedAt }) => ({
    id, clientName, projectName, updatedAt,
  }));
  return NextResponse.json(list);
}

export async function POST(req: Request) {
  const record = (await req.json()) as QuestionnaireRecord;
  const all = await readQuestionnaires();
  const idx = all.findIndex((r) => r.id === record.id);
  if (idx >= 0) {
    all[idx] = record;
  } else {
    all.push(record);
  }
  await writeQuestionnaires(all);
  return NextResponse.json({ ok: true, id: record.id });
}
