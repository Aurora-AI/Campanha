import { DateTime } from 'luxon';

export function parsePtBrDateToISODate(value: string, tz: string): string | null {
  const v = (value || '').trim();
  if (!v) return null;

  const datePart = v.split(' ')[0];
  const dt = DateTime.fromFormat(datePart, 'dd/MM/yyyy', { zone: tz });
  return dt.isValid ? dt.toISODate() : null;
}

