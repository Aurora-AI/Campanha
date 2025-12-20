type StoreTotalsRow = {
  store: string;
  approvedTotal: number;
};

type StoreTotalsLedgerProps = {
  rows: StoreTotalsRow[];
};

const numberFormatter = new Intl.NumberFormat('pt-BR');

function formatInt(value: number, fallback = '—') {
  if (!Number.isFinite(value)) return fallback;
  return numberFormatter.format(value);
}

export default function StoreTotalsLedger({ rows }: StoreTotalsLedgerProps) {
  return (
    <div className="rounded-sm border border-black/10 bg-white p-6 shadow-sm">
      <div className="text-[10px] uppercase tracking-[0.28em] text-black/45">Total por Loja (campanha)</div>
      <div className="mt-4 max-h-[320px] min-w-0 overflow-y-auto pr-2">
        {rows.length === 0 ? (
          <div className="text-sm text-black/60">Sem dados publicados.</div>
        ) : (
          <ul className="divide-y divide-black/5">
            {rows.map((row) => (
              <li key={row.store} className="flex items-center justify-between gap-4 py-2 text-sm">
                <span className="min-w-0 truncate text-black/80">{row.store}</span>
                <span className="font-semibold tabular-nums text-black/80">{formatInt(row.approvedTotal)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
