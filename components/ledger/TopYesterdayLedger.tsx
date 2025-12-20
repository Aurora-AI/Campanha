type TopYesterdayRow = {
  store: string;
  approvedYesterday: number;
};

type TopYesterdayLedgerProps = {
  rows: TopYesterdayRow[];
  maxDesktop?: number;
  maxMobile?: number;
};

const numberFormatter = new Intl.NumberFormat('pt-BR');

function formatInt(value: number, fallback = '—') {
  if (!Number.isFinite(value)) return fallback;
  return numberFormatter.format(value);
}

export default function TopYesterdayLedger({
  rows,
  maxDesktop = 7,
  maxMobile = 5,
}: TopYesterdayLedgerProps) {
  const displayRows = rows.slice(0, maxDesktop);

  return (
    <div className="rounded-sm border border-black/10 bg-white p-6 shadow-sm">
      <div className="text-[10px] uppercase tracking-[0.28em] text-black/45">Top de ontem</div>
      <div className="mt-4 min-w-0">
        {displayRows.length === 0 ? (
          <div className="text-sm text-black/60">Sem producao ontem.</div>
        ) : (
          <ul className="divide-y divide-black/5">
            {displayRows.map((row, idx) => (
              <li
                key={row.store}
                className={`items-center justify-between gap-4 py-2 text-sm ${
                  idx >= maxMobile ? 'hidden sm:flex' : 'flex'
                }`}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="text-xs text-black/45 tabular-nums">{idx + 1} ·</span>
                  <span className="min-w-0 truncate text-black/80">{row.store}</span>
                </div>
                <span className="font-semibold tabular-nums text-black/80">{formatInt(row.approvedYesterday)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
