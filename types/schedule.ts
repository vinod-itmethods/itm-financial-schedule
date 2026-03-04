// ─── Tool Column ─────────────────────────────────────────────────────────────

export interface Tool {
  id: string;                          // 'transit-hub' | 'tool-1' … 'tool-8'
  name: string;                        // selected from list or free-text
  tier: string;                        // '2000 Users', 'Storage-based', etc.
  visible: boolean;
}

// ─── Service Row ─────────────────────────────────────────────────────────────

export type ServiceCategory = 'platform' | 'cloud' | 'professional' | 'license';
export type PricingType =
  | 'flat-monthly'       // direct $/month per tool
  | 'epss-host-input'    // user enters host count; linked row shows hosts × rate
  | 'epss-calculated'    // read-only: hosts × epssPerHost rate
  | 'days-input'         // user enters days; shown in N col as days × rate
  | 'flat-one-time'      // direct $ one-time per tool → N column
  | 'flat-annual';       // direct $/year per tool → P column directly
export type ChargeType = 'monthly' | 'one-time' | 'annual';
export type ToggleState = 'Mandatory' | 'Included' | 'Optional' | 'Hidden';
export type AppliesTo = 'all-tools' | 'tools-only' | 'transit-hub-only' | 'single-cell';

export interface ServiceDefinition {
  id: string;
  category: ServiceCategory;
  name: string;
  type: 'BASE' | 'Included' | 'Optional';
  defaultToggle: ToggleState;
  pricingType: PricingType;
  chargeType: ChargeType;
  appliesTo: AppliesTo;
  /** ID of the row whose host-count inputs drive this calculated row */
  linkedServiceId?: string;
  /** Which rate key from Schedule.rates applies */
  rateKey?: keyof Rates;
  rateLabel?: string;
  note?: string;
  isCustomName?: boolean;   // "Additional Service" — editable name
}

// ─── Rates (user-configurable) ────────────────────────────────────────────────

export type ImplMode = 'hours' | 'direct';

export interface Rates {
  epssPerHost: number;    // default: 175 $/host/month
  implPerDay: number;     // default: 250 $/day
  implPerHour: number;    // default: 125 $/hour
}

// ─── Price Matrix ─────────────────────────────────────────────────────────────

/** [serviceId][toolId] → value */
export type PriceMatrix = Record<string, Record<string, number | 'TBD'>>;

// ─── Schedule ─────────────────────────────────────────────────────────────────

export interface Schedule {
  id: string;
  clientName: string;
  projectName: string;
  date: string;                         // ISO date string
  numTools: number;                     // 1-8 (excludes Transit Hub)
  transitHubAttachments: string;        // e.g. '5 Attachments'
  tools: Tool[];                        // [transit-hub, tool-1 … tool-N]
  serviceToggles: Record<string, ToggleState>;
  additionalServiceName: string;        // custom name for "Additional Service" row
  discountPlatformSetup: number;        // $ discount off one-time total
  discountImplementation: number;       // $ discount off one-time total
  implMode: ImplMode;                   // how impl days-input rows are interpreted
  prices: PriceMatrix;
  rates: Rates;
  createdAt: string;
  updatedAt: string;
}

// ─── Computed Row Totals ──────────────────────────────────────────────────────

export interface RowTotals {
  oneTime: number;          // N column
  monthly: number;          // O column
  annual: number;           // P column (monthly × 12 for recurring; direct for annual-only)
}

// ─── Summary ──────────────────────────────────────────────────────────────────

export interface ScheduleSummary {
  totalOneTime: number;
  totalMonthly: number;
  totalAnnual: number;
  discountPlatformSetup: number;
  discountImplementation: number;
  netOneTime: number;       // totalOneTime - discounts
  netAnnual: number;        // totalAnnual (monthly×12 rolling)
}

// ─── API payloads ────────────────────────────────────────────────────────────

export interface ScheduleListItem {
  id: string;
  clientName: string;
  projectName: string;
  updatedAt: string;
}
