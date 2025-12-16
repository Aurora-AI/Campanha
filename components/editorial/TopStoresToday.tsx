"use client";

import { formatPct, formatIsoToPtBr } from "./format";

export type TopStoreTodayItem = {
  store: string;
  yesterdayApproved: number;
  approvalRate: number | null;
};

export default function TopStoresToday({
  lastDay,
  items,
}: {
  lastDay: string;
  items: TopStoreTodayItem[];
}) {
  return (
    <section className="bg-white rounded-4xl p-6 border border-gray-100">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-lg font-bold text-gray-900">Destaques do dia</h2>
        <div className="text-xs text-gray-500">{formatIsoToPtBr(lastDay)}</div>
      </div>

      {items.length === 0 ? (
        <div className="mt-6 text-sm text-gray-500">Sem aprovados no último dia.</div>
      ) : (
        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          {items.map((s, idx) => (
            <div key={s.store} className="rounded-3xl border border-gray-100 bg-gray-50/40 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs text-gray-400 font-mono">#{idx + 1}</div>
                  <div className="mt-1 font-bold text-gray-900">{s.store}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">Aprovados</div>
                  <div className="text-2xl font-black text-gray-900">{s.yesterdayApproved}</div>
                </div>
              </div>
              <div className="mt-4 text-xs text-gray-600">
                Taxa de aprovação: <span className="font-bold text-gray-900">{formatPct(s.approvalRate)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

