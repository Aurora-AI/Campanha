"use client";

import { formatPct } from "./format";

export type LeaderPeriodItem = {
  store: string;
  approved: number;
  sharePct: number;
};

export default function LeadersPeriod({ items }: { items: LeaderPeriodItem[] }) {
  return (
    <section className="bg-white rounded-4xl p-6 border border-gray-100">
      <h2 className="text-lg font-bold text-gray-900">Líderes do período</h2>
      <p className="mt-1 text-sm text-gray-500">Ranking justo por participação no total de aprovados.</p>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-gray-500">
            <tr className="border-b border-gray-100">
              <th className="py-2 pr-4">#</th>
              <th className="py-2 pr-4">Loja</th>
              <th className="py-2 pr-4 text-right">Aprovados</th>
              <th className="py-2 text-right">Participação</th>
            </tr>
          </thead>
          <tbody>
            {items.map((r, idx) => (
              <tr key={`${r.store}-${idx}`} className="border-b border-gray-50">
                <td className="py-2 pr-4 text-gray-400 font-mono">#{idx + 1}</td>
                <td className="py-2 pr-4 font-medium text-gray-900">{r.store}</td>
                <td className="py-2 pr-4 text-right font-bold text-gray-900">{r.approved}</td>
                <td className="py-2 text-right text-gray-600">{formatPct(r.sharePct)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

