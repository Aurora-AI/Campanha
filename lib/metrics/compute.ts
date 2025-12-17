import {
  ColumnNotFoundError,
  DatasetError,
  PendingType,
  detectHeaderAndRows,
  normalizeRows,
  type StatusClass,
} from "./normalize";
import {
  addDaysUTC,
  diffDaysUTC,
  formatIsoDateUTC,
  parseIsoDateUTC,
  sameDayPreviousMonthUTC,
  sameDayPreviousYearUTC,
} from "./time";

export type MetricsPayload = {
  meta: {
    uploadedAt: string;
    rows: number;
    period: { min: string; max: string };
    lastDay: string;
  };
  headline: {
    totalApproved: number;
    yesterdayApproved: number;
    deltaVsPrevDay?: { abs: number; pct: number | null };
    deltaVsSameWeekday?: { abs: number; pct: number | null };
    deltaVsSameMonthDay?: { abs: number; pct: number | null };
    deltaVsSameYearDay?: { abs: number; pct: number | null };
  };
  rankings: {
    storesBySharePct: Array<{ store: string; approved: number; sharePct: number }>;
  };
  stores: Array<{
    store: string;
    cnpj?: string;
    approved: number;
    rejected: number;
    decided: number;
    approvalRate: number | null;
    yesterdayApproved: number;
    pending: {
      total: number;
      byType: Array<{ type: string; count: number }>;
      sampleCpfsMasked: string[];
      messageToManager: string;
    };
  }>;
};

type Delta = { abs: number; pct: number | null };

const PENDING_TYPES: PendingType[] = [
  "AGUARDANDO_DOCUMENTOS",
  "AGUARDANDO_FINALIZAR_CADASTRO",
  "ANALISE",
  "PENDENTE",
];

const makePendingCounts = (): Record<PendingType, number> => ({
  AGUARDANDO_DOCUMENTOS: 0,
  AGUARDANDO_FINALIZAR_CADASTRO: 0,
  ANALISE: 0,
  PENDENTE: 0,
});

const makeDelta = (current: number, baseline: number): Delta => {
  const abs = current - baseline;
  const pct = baseline > 0 ? abs / baseline : null;
  return { abs, pct };
};

const dominantPendingType = (counts: Record<PendingType, number>): PendingType | null => {
  const max = Math.max(...PENDING_TYPES.map((t) => counts[t] || 0));
  if (!Number.isFinite(max) || max <= 0) return null;

  const priority: PendingType[] = [
    "AGUARDANDO_DOCUMENTOS",
    "PENDENTE",
    "AGUARDANDO_FINALIZAR_CADASTRO",
    "ANALISE",
  ];
  for (const t of priority) if (counts[t] === max) return t;
  return priority[0] ?? null;
};

const messageToManager = (counts: Record<PendingType, number>): string => {
  const dom = dominantPendingType(counts);
  if (!dom) return "Sem pendências operacionais relevantes.";

  const n = counts[dom] ?? 0;
  switch (dom) {
    case "AGUARDANDO_DOCUMENTOS":
      return `Você tem ${n} propostas pré-aprovadas aguardando documentos. Contate os clientes e destrave aprovações.`;
    case "PENDENTE":
      return `Você tem ${n} propostas com pendências operacionais. Regularize as ocorrências para avançar o resultado.`;
    case "AGUARDANDO_FINALIZAR_CADASTRO":
      return `Você tem ${n} cadastros iniciados e não finalizados. Faça retomada ativa para recuperar aprovações.`;
    case "ANALISE":
      return `Você tem ${n} propostas em análise. Acompanhe para evitar gargalos.`;
    default:
      return "Sem pendências operacionais relevantes.";
  }
};

type StoreAcc = {
  store: string;
  cnpj?: string;
  approved: number;
  rejected: number;
  approvedYesterday: number;
  pendingTotal: number;
  pendingCounts: Record<PendingType, number>;
  pendingCpfSet: Set<string>;
  pendingCpfSample: string[];
};

const ensureStoreAcc = (map: Map<string, StoreAcc>, store: string): StoreAcc => {
  const existing = map.get(store);
  if (existing) return existing;
  const acc: StoreAcc = {
    store,
    approved: 0,
    rejected: 0,
    approvedYesterday: 0,
    pendingTotal: 0,
    pendingCounts: makePendingCounts(),
    pendingCpfSet: new Set(),
    pendingCpfSample: [],
  };
  map.set(store, acc);
  return acc;
};

export type ComputeInput = {
  uploadedAt: string;
  rawRows: string[][];
  sampleCpfsPerStore?: number;
};

export function computeMetrics(input: ComputeInput): MetricsPayload {
  const sampleLimit = Math.max(1, Math.min(50, input.sampleCpfsPerStore ?? 10));

  const { header, rows } = detectHeaderAndRows(input.rawRows);
  const normalized = normalizeRows(header, rows);

  if (normalized.length === 0) throw new DatasetError("Nenhuma linha válida encontrada.");

  const statusWeight = (status: StatusClass): number => {
    switch (status) {
      case "APROVADO":
        return 3;
      case "REPROVADO":
        return 2;
      case "EM_ANDAMENTO":
        return 1;
      case "IGNORADO":
      default:
        return 0;
    }
  };

  const byProposal = new Map<string, (typeof normalized)[number]>();
  for (const r of normalized) {
    const key = r.proposalId;
    const existing = byProposal.get(key);
    if (!existing) {
      byProposal.set(key, r);
      continue;
    }

    const w = statusWeight(r.status);
    const ew = statusWeight(existing.status);
    if (w > ew) {
      byProposal.set(key, r);
      continue;
    }

    if (w === ew) {
      if (r.date && existing.date) {
        if (r.date > existing.date) byProposal.set(key, r);
      } else if (r.date && !existing.date) {
        byProposal.set(key, r);
      }
    }
  }

  const effectiveRows = Array.from(byProposal.values());

  const dates = effectiveRows.map((r) => r.date).filter((d): d is string => !!d);
  let minDate = dates[0] ?? "SEM DATA";
  let maxDate = dates[0] ?? "SEM DATA";
  for (const d of dates) {
    if (d < minDate) minDate = d;
    if (d > maxDate) maxDate = d;
  }

  const lastDay = maxDate;
  const lastDayDate = lastDay !== "SEM DATA" ? parseIsoDateUTC(lastDay) : null;
  const minDayDate = minDate !== "SEM DATA" ? parseIsoDateUTC(minDate) : null;

  const seenDates = new Set<string>();
  const approvedByDate = new Map<string, number>();

  const storeMap = new Map<string, StoreAcc>();

  let totalApproved = 0;
  let yesterdayApproved = 0;

  for (const r of effectiveRows) {
    if (r.date) seenDates.add(r.date);

    const storeAcc = ensureStoreAcc(storeMap, r.store);
    if (!storeAcc.cnpj) storeAcc.cnpj = r.cnpj;

    if (r.status === "APROVADO" && r.isApproved) {
      totalApproved += 1;
      if (r.date) approvedByDate.set(r.date, (approvedByDate.get(r.date) ?? 0) + 1);

      storeAcc.approved += 1;
      if (r.date && r.date === lastDay) storeAcc.approvedYesterday += 1;
      if (r.date && r.date === lastDay) yesterdayApproved += 1;
      continue;
    }

    if (r.status === "REPROVADO") {
      storeAcc.rejected += 1;
      continue;
    }

    if (r.status === "EM_ANDAMENTO") {
      const pendingType = r.pendingType ?? "PENDENTE";
      storeAcc.pendingTotal += 1;
      storeAcc.pendingCounts[pendingType] = (storeAcc.pendingCounts[pendingType] ?? 0) + 1;

      const cpf = r.cpfMasked?.trim();
      if (cpf && storeAcc.pendingCpfSample.length < sampleLimit && !storeAcc.pendingCpfSet.has(cpf)) {
        storeAcc.pendingCpfSet.add(cpf);
        storeAcc.pendingCpfSample.push(cpf);
      }
    }
  }

  const deltaForDate = (baselineDate: Date | null): Delta | undefined => {
    if (!baselineDate) return undefined;
    const key = formatIsoDateUTC(baselineDate);
    if (!seenDates.has(key)) return undefined;
    const baseline = approvedByDate.get(key) ?? 0;
    return makeDelta(yesterdayApproved, baseline);
  };

  const prevDayDate = lastDayDate ? addDaysUTC(lastDayDate, -1) : null;
  const sameWeekdayDate = lastDayDate ? addDaysUTC(lastDayDate, -7) : null;
  const sameMonthDayDate = lastDayDate ? sameDayPreviousMonthUTC(lastDayDate) : null;
  const sameYearDayDate =
    lastDayDate && minDayDate && diffDaysUTC(lastDayDate, minDayDate) >= 365 ? sameDayPreviousYearUTC(lastDayDate) : null;

  const storesBySharePct = Array.from(storeMap.values())
    .map((s) => ({
      store: s.store,
      approved: s.approved,
      sharePct: totalApproved > 0 ? s.approved / totalApproved : 0,
    }))
    .sort((a, b) => b.approved - a.approved || a.store.localeCompare(b.store));

  const stores = Array.from(storeMap.values())
    .map((s) => {
      const decided = s.approved + s.rejected;
      const approvalRate = decided > 0 ? s.approved / decided : null;

      return {
        store: s.store,
        cnpj: s.cnpj,
        approved: s.approved,
        rejected: s.rejected,
        decided,
        approvalRate,
        yesterdayApproved: s.approvedYesterday,
        pending: {
          total: s.pendingTotal,
          byType: PENDING_TYPES.map((t) => ({ type: t, count: s.pendingCounts[t] ?? 0 })),
          sampleCpfsMasked: s.pendingCpfSample,
          messageToManager: messageToManager(s.pendingCounts),
        },
      };
    })
    .sort((a, b) => b.approved - a.approved || a.store.localeCompare(b.store));

  const payload: MetricsPayload = {
    meta: {
      uploadedAt: input.uploadedAt,
      rows: effectiveRows.length,
      period: { min: minDate, max: maxDate },
      lastDay,
    },
    headline: {
      totalApproved,
      yesterdayApproved,
      ...(prevDayDate ? { deltaVsPrevDay: deltaForDate(prevDayDate) } : {}),
      ...(sameWeekdayDate ? { deltaVsSameWeekday: deltaForDate(sameWeekdayDate) } : {}),
      ...(sameMonthDayDate ? { deltaVsSameMonthDay: deltaForDate(sameMonthDayDate) } : {}),
      ...(sameYearDayDate ? { deltaVsSameYearDay: deltaForDate(sameYearDayDate) } : {}),
    },
    rankings: {
      storesBySharePct,
    },
    stores,
  };

  return payload;
}

export function isColumnNotFoundError(err: unknown): err is ColumnNotFoundError {
  return err instanceof ColumnNotFoundError;
}

export function isDatasetError(err: unknown): err is DatasetError {
  return err instanceof DatasetError;
}
