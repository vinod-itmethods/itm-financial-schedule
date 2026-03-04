import { NextResponse } from 'next/server';
import { readSchedules, writeSchedules } from '@/lib/scheduleStorage';
import type { Schedule } from '@/types/schedule';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const schedules = await readSchedules();
  const found = schedules.find((s: Schedule) => s.id === id);
  if (!found) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(found);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body: Schedule = await req.json();
  const schedules = await readSchedules();
  const idx = schedules.findIndex((s: Schedule) => s.id === id);
  if (idx < 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  schedules[idx] = { ...body, id, updatedAt: new Date().toISOString() };
  await writeSchedules(schedules);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const schedules = await readSchedules();
  const filtered = schedules.filter((s: Schedule) => s.id !== id);
  await writeSchedules(filtered);
  return NextResponse.json({ ok: true });
}
