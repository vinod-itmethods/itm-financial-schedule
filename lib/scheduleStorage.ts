import 'server-only';
import { promises as fs } from 'fs';
import path from 'path';
import type { Schedule } from '@/types/schedule';

const DATA_FILE = path.join(process.cwd(), 'data', 'schedules', 'schedules.json');

export async function readSchedules(): Promise<Schedule[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(raw) as Schedule[];
  } catch {
    return [];
  }
}

export async function writeSchedules(schedules: Schedule[]): Promise<void> {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(schedules, null, 2));
}
