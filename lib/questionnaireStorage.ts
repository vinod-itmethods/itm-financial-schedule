import 'server-only';
import { promises as fs } from 'fs';
import path from 'path';
import type { QuestionnaireRecord } from '@/types/questionnaire';

const DATA_FILE = path.join(process.cwd(), 'data', 'schedules', 'questionnaires.json');

export async function readQuestionnaires(): Promise<QuestionnaireRecord[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(raw) as QuestionnaireRecord[];
  } catch {
    return [];
  }
}

export async function writeQuestionnaires(records: QuestionnaireRecord[]): Promise<void> {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(records, null, 2));
}
