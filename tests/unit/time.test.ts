import { describe, expect, it } from "vitest";

import {
  addDaysUTC,
  diffDaysUTC,
  formatIsoDateUTC,
  parseDateCellUTC,
  parseIsoDateUTC,
  sameDayPreviousMonthUTC,
  sameDayPreviousYearUTC,
} from "@/lib/metrics/time";

describe("metrics/time", () => {
  it("parseia datas DD/MM/YYYY e formata para ISO (UTC)", () => {
    const d = parseDateCellUTC("12/12/2025");
    expect(d).not.toBeNull();
    expect(formatIsoDateUTC(d!)).toBe("2025-12-12");
  });

  it("suporta D±N em UTC sem depender do relógio local", () => {
    const base = parseIsoDateUTC("2025-12-12")!;
    expect(formatIsoDateUTC(addDaysUTC(base, -1))).toBe("2025-12-11");
    expect(formatIsoDateUTC(addDaysUTC(base, -7))).toBe("2025-12-05");
  });

  it("retorna null quando o mesmo dia no mês anterior não existe", () => {
    const base = parseIsoDateUTC("2025-03-31")!;
    expect(sameDayPreviousMonthUTC(base)).toBeNull();
  });

  it("retorna null quando o mesmo dia no ano anterior não existe (ex: 29/02)", () => {
    const base = parseIsoDateUTC("2024-02-29")!;
    expect(sameDayPreviousYearUTC(base)).toBeNull();
  });

  it("calcula diffs de dias em UTC", () => {
    const a = parseIsoDateUTC("2025-12-12")!;
    const b = parseIsoDateUTC("2025-12-05")!;
    expect(diffDaysUTC(a, b)).toBe(7);
  });
});

