export type IsoDateString = `${number}-${string}-${string}`;

const DAY_MS = 24 * 60 * 60 * 1000;

const pad2 = (n: number) => String(n).padStart(2, "0");

export function formatIsoDateUTC(date: Date): IsoDateString {
  const y = date.getUTCFullYear();
  const m = pad2(date.getUTCMonth() + 1);
  const d = pad2(date.getUTCDate());
  return `${y}-${m}-${d}`;
}

export function parseIsoDateUTC(value: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return null;
  const d = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  if (d.getUTCFullYear() !== year || d.getUTCMonth() !== month - 1 || d.getUTCDate() !== day) return null;
  return d;
}

export function parseDateCellUTC(raw: string): Date | null {
  const s = String(raw ?? "").trim();
  if (!s) return null;

  let datePart = s.split(" ")[0]?.trim() ?? "";
  if (!datePart) return null;

  if (/^\d{4}-\d{2}-\d{2}T/.test(datePart)) datePart = datePart.slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) return parseIsoDateUTC(datePart);

  let m: RegExpExecArray | null;
  // dd/MM/yyyy or dd-MM-yyyy
  m = /^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/.exec(datePart);
  if (m) {
    const day = Number(m[1]);
    const month = Number(m[2]);
    const year = Number(m[3]);
    const d = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
    if (d.getUTCFullYear() !== year || d.getUTCMonth() !== month - 1 || d.getUTCDate() !== day) return null;
    return d;
  }

  // yyyy/MM/dd or yyyy-MM-dd
  m = /^(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})$/.exec(datePart);
  if (m) {
    const year = Number(m[1]);
    const month = Number(m[2]);
    const day = Number(m[3]);
    const d = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
    if (d.getUTCFullYear() !== year || d.getUTCMonth() !== month - 1 || d.getUTCDate() !== day) return null;
    return d;
  }

  return null;
}

export function addDaysUTC(date: Date, days: number): Date {
  return new Date(date.getTime() + days * DAY_MS);
}

export function sameDayPreviousMonthUTC(date: Date): Date | null {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();

  let targetYear = year;
  let targetMonth = month - 1;
  if (targetMonth < 0) {
    targetMonth = 11;
    targetYear -= 1;
  }

  const target = new Date(Date.UTC(targetYear, targetMonth, day, 12, 0, 0));
  if (
    target.getUTCFullYear() !== targetYear ||
    target.getUTCMonth() !== targetMonth ||
    target.getUTCDate() !== day
  ) {
    return null;
  }
  return target;
}

export function sameDayPreviousYearUTC(date: Date): Date | null {
  const year = date.getUTCFullYear() - 1;
  const month = date.getUTCMonth();
  const day = date.getUTCDate();

  const target = new Date(Date.UTC(year, month, day, 12, 0, 0));
  if (target.getUTCFullYear() !== year || target.getUTCMonth() !== month || target.getUTCDate() !== day) return null;
  return target;
}

export function diffDaysUTC(a: Date, b: Date): number {
  return Math.floor((a.getTime() - b.getTime()) / DAY_MS);
}
