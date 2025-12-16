"use client";

import { type Delta, formatDelta } from "./format";

type CoverKpiStripProps = {
  deltaVsPrevDay?: Delta;
  deltaVsSameWeekday?: Delta;
  deltaVsSameMonthDay?: Delta;
  deltaVsSameYearDay?: Delta;
};

const KpiCard = ({ label, delta }: { label: string; delta: Delta }) => {
  const fmt = formatDelta(delta);
  const tone =
    !delta || delta.pct == null
      ? "text-gray-700"
      : delta.abs > 0
        ? "text-emerald-700"
        : delta.abs < 0
          ? "text-red-700"
          : "text-gray-700";

  return (
    <div className="rounded-3xl bg-white border border-gray-100 p-5">
      <div className="text-[11px] font-bold tracking-widest text-gray-400 uppercase">{label}</div>
      <div className={`mt-2 text-lg font-black ${tone}`}>{fmt.abs}</div>
      <div className="text-xs text-gray-500">{fmt.pct}</div>
    </div>
  );
};

export default function CoverKpiStrip({
  deltaVsPrevDay,
  deltaVsSameWeekday,
  deltaVsSameMonthDay,
  deltaVsSameYearDay,
}: CoverKpiStripProps) {
  const hasAny = !!(deltaVsPrevDay || deltaVsSameWeekday || deltaVsSameMonthDay || deltaVsSameYearDay);
  if (!hasAny) return null;

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <KpiCard label="Δ vs dia anterior" delta={deltaVsPrevDay} />
      <KpiCard label="Δ vs semana passada" delta={deltaVsSameWeekday} />
      <KpiCard label="Δ vs mês anterior" delta={deltaVsSameMonthDay} />
      <KpiCard label="Δ vs ano anterior" delta={deltaVsSameYearDay} />
    </section>
  );
}

