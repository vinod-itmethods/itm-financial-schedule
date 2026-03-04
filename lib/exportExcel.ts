import XLSXStyle from 'xlsx-js-style';
import type { Schedule } from '@/types/schedule';
import { SERVICES, CATEGORY_LABELS } from '@/data/services';
import { resolvedCellValue, rowTotals, computeSummary, isServiceVisible } from './calculations';

// ── iTmethods brand colours ───────────────────────────────────────────────────
const C = {
  ITM_BLACK:    '1A1A1A',
  ITM_DARKGRAY: '2D2D2D',
  ITM_MIDGRAY:  '4A4A4A',
  ITM_BLUE:     '0F4C81',
  ITM_GREEN:    '0A5C2E',
  WHITE:        'FFFFFF',
  ROW_ALT:      'F7F7F7',
  ROW_WHITE:    'FFFFFF',
  BORDER:       'D0D0D0',
  GREEN_LIGHT:  'E8F5E9',
  BLUE_LIGHT:   'E8F0FB',
  PURPLE_LIGHT: 'F3E8FF',
  SUMMARY_BG:   'F0F0F0',
};

type CellStyle = {
  fill?: { patternType: 'solid'; fgColor: { rgb: string } };
  font?: { bold?: boolean; color?: { rgb: string }; sz?: number; name?: string };
  alignment?: { horizontal?: string; vertical?: string; wrapText?: boolean };
  border?: Record<string, { style: string; color: { rgb: string } }>;
};

const THIN_BORDER = {
  top:    { style: 'thin', color: { rgb: C.BORDER } },
  bottom: { style: 'thin', color: { rgb: C.BORDER } },
  left:   { style: 'thin', color: { rgb: C.BORDER } },
  right:  { style: 'thin', color: { rgb: C.BORDER } },
};

function cell(value: string | number, s: CellStyle, type: 's' | 'n' = 's') {
  return { v: value, t: type, s };
}

function numCell(value: number, s: CellStyle) {
  return { v: value, t: 'n' as const, z: '$#,##0', s };
}

function headerCell(value: string, bgRgb: string, size = 10) {
  return cell(value, {
    fill: { patternType: 'solid', fgColor: { rgb: bgRgb } },
    font: { bold: true, color: { rgb: C.WHITE }, sz: size, name: 'Calibri' },
    alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
    border: THIN_BORDER,
  });
}

function dataCell(value: string | number, bgRgb: string, bold = false, align: 'left' | 'center' | 'right' = 'left', isNum = false) {
  const s: CellStyle = {
    fill: { patternType: 'solid', fgColor: { rgb: bgRgb } },
    font: { bold, color: { rgb: C.ITM_BLACK }, sz: 10, name: 'Calibri' },
    alignment: { horizontal: align, vertical: 'center' },
    border: THIN_BORDER,
  };
  return isNum ? numCell(value as number, s) : cell(value, s);
}

function categoryCell(value: string, colspan: number) {
  return cell(value, {
    fill: { patternType: 'solid', fgColor: { rgb: C.ITM_DARKGRAY } },
    font: { bold: true, color: { rgb: C.WHITE }, sz: 10, name: 'Calibri' },
    alignment: { horizontal: 'left', vertical: 'center' },
    border: THIN_BORDER,
  });
}

export function exportToExcel(schedule: Schedule): void {
  const wb = XLSXStyle.utils.book_new();
  const visibleTools = schedule.tools.filter((t) => t.visible);
  const visibleServices = SERVICES.filter((s) => isServiceVisible(schedule, s.id));
  const categories = ['platform', 'cloud', 'professional', 'license'] as const;

  const totalCols = 3 + visibleTools.length + 3; // Cat + Svc + Type + tools + N + O + P

  // Helper: blank cell
  const blank = (bg = C.ROW_WHITE) => cell('', {
    fill: { patternType: 'solid', fgColor: { rgb: bg } },
    border: THIN_BORDER,
  });

  // ── Worksheet data ──────────────────────────────────────────────────────────
  const ws: Record<string, unknown> = {};
  let r = 0; // current row index (0-based)

  const setCell = (row: number, col: number, c: unknown) => {
    const addr = XLSXStyle.utils.encode_cell({ r: row, c: col });
    ws[addr] = c;
  };

  const mergeRange = (r1: number, c1: number, r2: number, c2: number) => {
    if (!ws['!merges']) ws['!merges'] = [];
    (ws['!merges'] as unknown[]).push({ s: { r: r1, c: c1 }, e: { r: r2, c: c2 } });
  };

  // ── Row 0: Logo / Title banner ──────────────────────────────────────────────
  setCell(r, 0, cell('FORGE  ·  iTmethods', {
    fill: { patternType: 'solid', fgColor: { rgb: C.ITM_BLACK } },
    font: { bold: true, color: { rgb: C.WHITE }, sz: 18, name: 'Calibri' },
    alignment: { horizontal: 'left', vertical: 'center' },
    border: THIN_BORDER,
  }));
  for (let c2 = 1; c2 < totalCols; c2++) setCell(r, c2, blank(C.ITM_BLACK));
  mergeRange(r, 0, r, totalCols - 1);
  r++;

  // ── Row 1: Sub-title ────────────────────────────────────────────────────────
  setCell(r, 0, cell('Forge Financial Schedule', {
    fill: { patternType: 'solid', fgColor: { rgb: C.ITM_DARKGRAY } },
    font: { bold: false, color: { rgb: 'AAAAAA' }, sz: 11, name: 'Calibri' },
    alignment: { horizontal: 'left', vertical: 'center' },
    border: THIN_BORDER,
  }));
  for (let c2 = 1; c2 < totalCols; c2++) setCell(r, c2, blank(C.ITM_DARKGRAY));
  mergeRange(r, 0, r, totalCols - 1);
  r++;

  // ── Row 2: Client / Project / Date ─────────────────────────────────────────
  const clientBg = C.ITM_MIDGRAY;
  const infoStyle = (v: string) => cell(v, {
    fill: { patternType: 'solid', fgColor: { rgb: clientBg } },
    font: { color: { rgb: C.WHITE }, sz: 10, name: 'Calibri' },
    alignment: { horizontal: 'left', vertical: 'center' },
    border: THIN_BORDER,
  });
  setCell(r, 0, infoStyle(`Client: ${schedule.clientName || '—'}`));
  setCell(r, 1, infoStyle(`Project: ${schedule.projectName || '—'}`));
  for (let c2 = 2; c2 < totalCols - 1; c2++) setCell(r, c2, blank(clientBg));
  setCell(r, totalCols - 1, infoStyle(`Date: ${schedule.date}`));
  mergeRange(r, 0, r, 1);
  mergeRange(r, 2, r, totalCols - 2);
  r++;

  // ── Row 3: Spacer ───────────────────────────────────────────────────────────
  for (let c2 = 0; c2 < totalCols; c2++) setCell(r, c2, blank());
  r++;

  // ── Row 4: Column headers ───────────────────────────────────────────────────
  setCell(r, 0, headerCell('Category', C.ITM_BLACK));
  setCell(r, 1, headerCell('Service', C.ITM_BLACK));
  setCell(r, 2, headerCell('Type', C.ITM_BLACK));
  let col = 3;
  for (const tool of visibleTools) {
    const label = tool.id === 'transit-hub'
      ? `Transit Hub\n${tool.tier}`
      : `${tool.name || '—'}\n${tool.tier}`;
    setCell(r, col++, headerCell(label, C.ITM_BLUE));
  }
  setCell(r, col++, headerCell('One-Time ($)', C.ITM_GREEN));
  setCell(r, col++, headerCell('Monthly ($)', C.ITM_GREEN));
  setCell(r, col++, headerCell('Annual ($)', C.ITM_GREEN));
  r++;

  // ── Service rows ────────────────────────────────────────────────────────────
  let rowIndex = 0;
  for (const cat of categories) {
    const catServices = visibleServices.filter((s) => s.category === cat);
    if (catServices.length === 0) continue;

    // Category divider
    setCell(r, 0, categoryCell(CATEGORY_LABELS[cat], totalCols));
    for (let c2 = 1; c2 < totalCols; c2++) setCell(r, c2, blank(C.ITM_DARKGRAY));
    mergeRange(r, 0, r, totalCols - 1);
    r++;

    for (const svc of catServices) {
      const bg = rowIndex % 2 === 0 ? C.ROW_WHITE : C.ROW_ALT;
      rowIndex++;
      const name = svc.isCustomName ? schedule.additionalServiceName : svc.name;

      setCell(r, 0, dataCell(CATEGORY_LABELS[cat], bg, false, 'left'));
      setCell(r, 1, dataCell(name, bg, false, 'left'));
      setCell(r, 2, dataCell(svc.type, bg, false, 'center'));

      col = 3;
      for (const tool of visibleTools) {
        const toolId = svc.appliesTo === 'single-cell' ? 'single' : tool.id;
        const skip =
          (svc.appliesTo === 'tools-only' && tool.id === 'transit-hub') ||
          (svc.appliesTo === 'transit-hub-only' && tool.id !== 'transit-hub');

        if (skip) {
          setCell(r, col++, dataCell('—', bg, false, 'center'));
        } else {
          const v = resolvedCellValue(schedule, svc, toolId);
          if (v === 'TBD') {
            setCell(r, col++, dataCell('TBD', bg, false, 'center'));
          } else {
            const n = v as number;
            const cellBg = n > 0
              ? (svc.pricingType === 'epss-calculated' ? C.GREEN_LIGHT
                : svc.pricingType === 'days-input' ? C.PURPLE_LIGHT : bg)
              : bg;
            setCell(r, col++, n > 0
              ? numCell(n, {
                  fill: { patternType: 'solid', fgColor: { rgb: cellBg } },
                  font: { sz: 10, name: 'Calibri', bold: n > 0 },
                  alignment: { horizontal: 'right', vertical: 'center' },
                  border: THIN_BORDER,
                })
              : dataCell('—', bg, false, 'center')
            );
          }
        }
      }

      const totals = rowTotals(schedule, svc);
      const tBg = C.GREEN_LIGHT;
      const tStyle = (v: number) => v > 0
        ? numCell(v, {
            fill: { patternType: 'solid', fgColor: { rgb: tBg } },
            font: { bold: true, sz: 10, name: 'Calibri', color: { rgb: C.ITM_GREEN } },
            alignment: { horizontal: 'right', vertical: 'center' },
            border: THIN_BORDER,
          })
        : dataCell('—', bg, false, 'right');

      setCell(r, col++, tStyle(totals.oneTime));
      setCell(r, col++, tStyle(totals.monthly));
      setCell(r, col++, tStyle(totals.annual));
      r++;
    }
  }

  // ── Summary ─────────────────────────────────────────────────────────────────
  r++; // spacer
  const summary = computeSummary(schedule);

  const summaryRows = [
    ['SUMMARY', '', ''],
    ['Platform Setup Discount', '', -summary.discountPlatformSetup],
    ['Implementation / Migration Discount', '', -summary.discountImplementation],
    ['Total One-Time Fees (net)', '', summary.netOneTime],
    ['Total Monthly Recurring', '', summary.totalMonthly],
    ['Total Annual Fees (net)', '', summary.netAnnual],
  ];

  for (const [label, , value] of summaryRows) {
    const isHeader = label === 'SUMMARY';
    const bg = isHeader ? C.ITM_BLACK : C.SUMMARY_BG;
    const fontColor = isHeader ? C.WHITE : C.ITM_BLACK;

    setCell(r, 0, cell(label as string, {
      fill: { patternType: 'solid', fgColor: { rgb: bg } },
      font: { bold: true, color: { rgb: fontColor }, sz: isHeader ? 12 : 10, name: 'Calibri' },
      alignment: { horizontal: 'left', vertical: 'center' },
      border: THIN_BORDER,
    }));
    for (let c2 = 1; c2 < totalCols - 1; c2++) setCell(r, c2, blank(bg));
    mergeRange(r, 0, r, totalCols - 2);

    if (!isHeader && typeof value === 'number') {
      const isTotal = (label as string).startsWith('Total');
      setCell(r, totalCols - 1, numCell(value, {
        fill: { patternType: 'solid', fgColor: { rgb: isTotal ? C.GREEN_LIGHT : C.SUMMARY_BG } },
        font: { bold: isTotal, color: { rgb: isTotal ? C.ITM_GREEN : C.ITM_BLACK }, sz: 10, name: 'Calibri' },
        alignment: { horizontal: 'right', vertical: 'center' },
        border: THIN_BORDER,
      }));
    } else {
      setCell(r, totalCols - 1, blank(bg));
    }
    r++;
  }

  // ── Sheet dimensions ────────────────────────────────────────────────────────
  ws['!ref'] = XLSXStyle.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: r - 1, c: totalCols - 1 } });

  // Row heights
  ws['!rows'] = [
    { hpt: 36 }, // title
    { hpt: 20 }, // subtitle
    { hpt: 20 }, // client info
    { hpt: 8  }, // spacer
    { hpt: 40 }, // column headers
  ];

  // Column widths
  ws['!cols'] = [
    { wch: 26 }, // Category
    { wch: 42 }, // Service
    { wch: 11 }, // Type
    ...visibleTools.map(() => ({ wch: 18 })),
    { wch: 16 }, // One-Time
    { wch: 16 }, // Monthly
    { wch: 16 }, // Annual
  ];

  XLSXStyle.utils.book_append_sheet(wb, ws as XLSXStyle.WorkSheet, 'Forge Financial Schedule');

  const fileName = `${schedule.clientName || 'Schedule'} - ${schedule.projectName || 'Forge'} Financial Schedule.xlsx`
    .replace(/[/\\:*?"<>|]/g, '-');
  XLSXStyle.writeFile(wb, fileName);
}
