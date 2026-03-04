import type { Schedule, ServiceDefinition, RowTotals, ScheduleSummary } from '@/types/schedule';
import { SERVICES } from '@/data/services';

/** Tools that are visible (not hidden by the user) */
export function visibleTools(schedule: Schedule): string[] {
  return schedule.tools.filter((t) => t.visible).map((t) => t.id);
}

/** Is a service visible (toggle !== 'Hidden') */
export function isServiceVisible(schedule: Schedule, serviceId: string): boolean {
  return (schedule.serviceToggles[serviceId] ?? 'Hidden') !== 'Hidden';
}

/** Raw price value for one cell */
export function cellValue(
  schedule: Schedule,
  serviceId: string,
  toolId: string
): number | 'TBD' {
  return schedule.prices[serviceId]?.[toolId] ?? 0;
}

/** Resolved price for one cell (handles EPSS-calculated and days-input) */
export function resolvedCellValue(
  schedule: Schedule,
  svc: ServiceDefinition,
  toolId: string
): number | 'TBD' {
  if (svc.pricingType === 'epss-calculated' && svc.linkedServiceId) {
    const hosts = cellValue(schedule, svc.linkedServiceId, toolId);
    if (hosts === 'TBD') return 'TBD';
    return (hosts as number) * schedule.rates.epssPerHost;
  }
  if (svc.pricingType === 'days-input') {
    const raw = cellValue(schedule, svc.id, toolId);
    if (raw === 'TBD') return 'TBD';
    const v = raw as number;
    if (schedule.implMode === 'hours') return v * schedule.rates.implPerHour;
    return v; // direct mode: input IS the dollar value
  }
  return cellValue(schedule, svc.id, toolId);
}

/** Sum across all visible, non-hidden tool columns for a service (like `sumvisible`) */
export function sumVisible(schedule: Schedule, svc: ServiceDefinition): number {
  const visible = visibleTools(schedule);

  if (svc.appliesTo === 'transit-hub-only') {
    const thTool = schedule.tools.find((t) => t.id === 'transit-hub');
    if (!thTool?.visible) return 0;
    const v = resolvedCellValue(schedule, svc, 'transit-hub');
    return v === 'TBD' ? 0 : (v as number);
  }

  if (svc.appliesTo === 'single-cell') {
    const v = cellValue(schedule, svc.id, 'single');
    return v === 'TBD' ? 0 : (v as number);
  }

  const toolIds =
    svc.appliesTo === 'all-tools'
      ? visible
      : visible.filter((id) => id !== 'transit-hub');

  return toolIds.reduce((sum, toolId) => {
    const v = resolvedCellValue(schedule, svc, toolId);
    if (v === 'TBD') return sum;
    return sum + (v as number);
  }, 0);
}

/** Per-row N/O/P totals */
export function rowTotals(schedule: Schedule, svc: ServiceDefinition): RowTotals {
  if (!isServiceVisible(schedule, svc.id)) {
    return { oneTime: 0, monthly: 0, annual: 0 };
  }

  // Host-input row contributes nothing (calculated row does)
  if (svc.pricingType === 'epss-host-input') {
    return { oneTime: 0, monthly: 0, annual: 0 };
  }

  const total = sumVisible(schedule, svc);

  switch (svc.chargeType) {
    case 'monthly':
      return { oneTime: 0, monthly: total, annual: total * 12 };
    case 'one-time':
      return { oneTime: total, monthly: 0, annual: 0 };
    case 'annual':
      return { oneTime: 0, monthly: 0, annual: total };
  }
}

/** Full schedule summary */
export function computeSummary(schedule: Schedule): ScheduleSummary {
  let totalOneTime = 0;
  let totalMonthly = 0;
  let totalAnnual = 0;

  for (const svc of SERVICES) {
    const t = rowTotals(schedule, svc);
    totalOneTime += t.oneTime;
    totalMonthly += t.monthly;
    totalAnnual += t.annual;
  }

  const discountTotal =
    Math.abs(schedule.discountPlatformSetup) +
    Math.abs(schedule.discountImplementation);

  return {
    totalOneTime,
    totalMonthly,
    totalAnnual,
    discountPlatformSetup: schedule.discountPlatformSetup,
    discountImplementation: schedule.discountImplementation,
    netOneTime: Math.max(0, totalOneTime - discountTotal),
    netAnnual: totalAnnual,
  };
}

/** Format a number as USD currency */
export function fmtUSD(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}
