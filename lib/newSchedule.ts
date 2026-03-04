function randomUUID(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }
  // Fallback for older environments
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}
import type { Schedule, Tool } from '@/types/schedule';
import { SERVICES } from '@/data/services';

export function buildDefaultTools(numTools: number): Tool[] {
  const tools: Tool[] = [
    { id: 'transit-hub', name: 'Transit Hub', tier: '5 Attachments', visible: false },
  ];
  for (let i = 1; i <= numTools; i++) {
    tools.push({ id: `tool-${i}`, name: '', tier: '', visible: true });
  }
  return tools;
}

export function newSchedule(id?: string): Schedule {
  const serviceToggles: Record<string, string> = {};
  for (const svc of SERVICES) {
    serviceToggles[svc.id] = svc.defaultToggle;
  }

  // EPSS pair: both share the same toggle key 'epss'
  serviceToggles['epss-hosts'] = 'Hidden';
  serviceToggles['epss-cost'] = 'Hidden';
  // Additional service hidden by default
  serviceToggles['add-service'] = 'Hidden';

  return {
    id: id ?? randomUUID(),
    clientName: '',
    projectName: '',
    date: new Date().toISOString().split('T')[0],
    numTools: 1,
    transitHubAttachments: '5 Attachments',
    tools: buildDefaultTools(1),
    serviceToggles: serviceToggles as Schedule['serviceToggles'],
    additionalServiceName: 'Additional Service',
    discountPlatformSetup: 0,
    discountImplementation: 0,
    implMode: 'hours',
    prices: {},
    rates: { epssPerHost: 175, implPerDay: 250, implPerHour: 125 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
