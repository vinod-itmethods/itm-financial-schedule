import { NextResponse } from 'next/server';
import { readSchedules, writeSchedules } from '@/lib/scheduleStorage';
import type { Schedule } from '@/types/schedule';

export async function GET() {
  const schedules = await readSchedules();
  const list = schedules.map((s: Schedule) => ({
    id: s.id,
    clientName: s.clientName,
    projectName: s.projectName,
    updatedAt: s.updatedAt,
  }));
  return NextResponse.json(list);
}

export async function POST(req: Request) {
  const body: Schedule = await req.json();
  const schedules = await readSchedules();
  const existing = schedules.findIndex((s: Schedule) => s.id === body.id);
  const now = new Date().toISOString();

  if (existing >= 0) {
    schedules[existing] = { ...body, updatedAt: now };
  } else {
    schedules.push({ ...body, createdAt: now, updatedAt: now });
  }

  await writeSchedules(schedules);
  return NextResponse.json({ ok: true, id: body.id });
}
