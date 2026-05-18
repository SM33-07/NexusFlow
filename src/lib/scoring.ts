import type { UomType } from './types';

function asNumber(value: string | number | null | undefined) {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  const parsed = Number(String(value).replace(/[^0-9.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
}

function asDate(value: string) {
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : Date.now();
}

export function computeQuarterScore(input: {
  uomType: UomType;
  targetValue: string;
  actualValue: string;
  baselineValue?: number | null;
}) {
  const target = asNumber(input.targetValue);
  const actual = asNumber(input.actualValue);

  if (input.uomType === 'Min (Higher is better)') {
    return Math.min(100, Math.max(0, Math.round((actual / Math.max(target, 1)) * 100)));
  }

  if (input.uomType === 'Max (Lower is better)') {
    if (actual <= target) return 100;
    return Math.min(100, Math.max(0, Math.round((target / Math.max(actual, 1)) * 100)));
  }

  if (input.uomType === 'Zero-based') {
    return actual <= 0 ? 100 : 0;
  }

  const actualDate = asDate(input.actualValue);
  const targetDate = asDate(input.targetValue);
  if (actualDate <= targetDate) return 100;
  const daysLate = Math.ceil((actualDate - targetDate) / 86_400_000);
  return Math.max(0, 100 - daysLate * 5);
}
