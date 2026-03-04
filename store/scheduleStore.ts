'use client';

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { Schedule, ToggleState, Rates, ImplMode } from '@/types/schedule';
import { buildDefaultTools, newSchedule } from '@/lib/newSchedule';

interface ScheduleStore {
  schedule: Schedule;

  // Client info
  setClientName: (v: string) => void;
  setProjectName: (v: string) => void;
  setDate: (v: string) => void;

  // Tools
  setNumTools: (n: number) => void;
  setToolName: (toolId: string, name: string) => void;
  setToolTier: (toolId: string, tier: string) => void;
  setTransitHubAttachments: (v: string) => void;

  // Services
  setServiceToggle: (serviceId: string, toggle: ToggleState) => void;
  setAdditionalServiceName: (v: string) => void;

  // Prices
  setPrice: (serviceId: string, toolId: string, value: number | 'TBD') => void;
  clearPrice: (serviceId: string, toolId: string) => void;

  // Discounts
  setDiscountPlatformSetup: (v: number) => void;
  setDiscountImplementation: (v: number) => void;

  // Rates
  setRates: (rates: Partial<Rates>) => void;
  setImplMode: (mode: ImplMode) => void;

  // Load full schedule (from API)
  loadSchedule: (s: Schedule) => void;
  resetSchedule: () => void;
}

export const useScheduleStore = create<ScheduleStore>()(
  immer((set) => ({
    schedule: newSchedule(),

    setClientName: (v) => set((s) => { s.schedule.clientName = v; }),
    setProjectName: (v) => set((s) => { s.schedule.projectName = v; }),
    setDate: (v) => set((s) => { s.schedule.date = v; }),

    setNumTools: (n) =>
      set((s) => {
        s.schedule.numTools = n;
        s.schedule.tools = buildDefaultTools(n);
      }),

    setToolName: (toolId, name) =>
      set((s) => {
        const t = s.schedule.tools.find((t) => t.id === toolId);
        if (t) t.name = name;
      }),

    setToolTier: (toolId, tier) =>
      set((s) => {
        const t = s.schedule.tools.find((t) => t.id === toolId);
        if (t) t.tier = tier;
      }),

    setTransitHubAttachments: (v) =>
      set((s) => {
        s.schedule.transitHubAttachments = v;
        const th = s.schedule.tools.find((t) => t.id === 'transit-hub');
        if (th) th.tier = v;
      }),

    setServiceToggle: (serviceId, toggle) =>
      set((s) => {
        s.schedule.serviceToggles[serviceId] = toggle;
        // Keep EPSS pair in sync
        if (serviceId === 'epss-hosts') s.schedule.serviceToggles['epss-cost'] = toggle;
        if (serviceId === 'epss-cost') s.schedule.serviceToggles['epss-hosts'] = toggle;
        // Transit Hub column visibility follows its service toggle
        if (serviceId === 'transit-hub-svc') {
          const th = s.schedule.tools.find((t) => t.id === 'transit-hub');
          if (th) th.visible = toggle !== 'Hidden';
        }
      }),

    setAdditionalServiceName: (v) =>
      set((s) => { s.schedule.additionalServiceName = v; }),

    setPrice: (serviceId, toolId, value) =>
      set((s) => {
        if (!s.schedule.prices[serviceId]) s.schedule.prices[serviceId] = {};
        s.schedule.prices[serviceId][toolId] = value;
      }),

    clearPrice: (serviceId, toolId) =>
      set((s) => {
        if (s.schedule.prices[serviceId]) {
          delete s.schedule.prices[serviceId][toolId];
        }
      }),

    setDiscountPlatformSetup: (v) =>
      set((s) => { s.schedule.discountPlatformSetup = v; }),

    setDiscountImplementation: (v) =>
      set((s) => { s.schedule.discountImplementation = v; }),

    setRates: (rates) =>
      set((s) => {
        s.schedule.rates = { ...s.schedule.rates, ...rates };
      }),

    setImplMode: (mode) =>
      set((s) => { s.schedule.implMode = mode; }),

    loadSchedule: (schedule) =>
      set((s) => { s.schedule = schedule; }),

    resetSchedule: () =>
      set((s) => { s.schedule = newSchedule(s.schedule.id); }),
  }))
);
