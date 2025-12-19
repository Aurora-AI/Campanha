import type { MetricsPayload } from "@/lib/metrics/compute";
import { assets } from "@/lib/assets";
import { HeroPayloadSchema, type HeroPayload } from "@/schemas/hero.schema";

type GroupDef = {
  key: "A" | "B" | "C";
  label: string;
  storeNumbers: string[];
  perStoreTarget: number;
};

const GROUPS: GroupDef[] = [
  { key: "A", label: "Grupo A", storeNumbers: ["12", "15", "11"], perStoreTarget: 20 },
  { key: "B", label: "Grupo B", storeNumbers: ["21", "20", "04", "19", "05", "07", "13", "03", "10"], perStoreTarget: 12 },
  { key: "C", label: "Grupo C", storeNumbers: ["01", "09", "17", "02", "06", "14", "08", "18", "16"], perStoreTarget: 6 },
];

const storeNumberFromName = (store: string): string | null => {
  const m = /\bLOJA\s+(\d{1,2})\b/i.exec(store);
  if (!m?.[1]) return null;
  return m[1].padStart(2, "0");
};

const formatIntPtBr = (value: number): string => new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 }).format(value);

export function buildHeroPayload(metrics: MetricsPayload): HeroPayload {
  const approvedByStoreNumber = new Map<string, number>();
  for (const s of metrics.stores) {
    const n = storeNumberFromName(s.store);
    if (!n) continue;
    approvedByStoreNumber.set(n, (approvedByStoreNumber.get(n) ?? 0) + s.approved);
  }

  const leftItems = GROUPS.map((g) => {
    const target = g.perStoreTarget * g.storeNumbers.length;
    const actual = g.storeNumbers.reduce((sum, storeNo) => sum + (approvedByStoreNumber.get(storeNo) ?? 0), 0);
    return {
      group: g.label,
      target: formatIntPtBr(target),
      actual: formatIntPtBr(actual),
      tone: actual >= target ? ("good" as const) : ("warn" as const),
    };
  });

  const status = (() => {
    if (metrics.headline.yesterdayApproved <= 0) return "FORA_DO_RITMO" as const;
    if (metrics.headline.deltaVsPrevDay && metrics.headline.deltaVsPrevDay.abs < 0) return "EM_DISPUTA" as const;
    return "NO_JOGO" as const;
  })();

  const statusLabel =
    status === "NO_JOGO"
      ? "🟢 NO JOGO"
      : status === "EM_DISPUTA"
        ? "🟡 EM DISPUTA"
        : "🔴 FORA DO RITMO";

  const nextAction =
    status === "NO_JOGO"
      ? "Sustente o ritmo e destrave pendências com foco."
      : status === "EM_DISPUTA"
        ? "Atue nas pendências dominantes para recuperar o ritmo hoje."
        : "Priorize destravar pendências e retomadas imediatamente.";

  const payload = {
    title: "Campanha",
    subtitle: "Arquitetura Cognitive Puzzle — ativos imutáveis, conteúdo mutável.",
    images: { puzzleSrc: assets.images.puzzle, heroSrc: assets.images.heroFinal },
    leftSatellite: {
      title: "Meta semanal por grupo",
      items: leftItems.map((i) => ({
        group: i.group,
        target: `Meta ${i.target}`,
        actual: `Atual ${i.actual}`,
        tone: i.tone,
      })),
    },
    rightSatellite: {
      labelTop: "Aprovados",
      value: formatIntPtBr(metrics.headline.yesterdayApproved),
      labelBottom: "Ontem",
    },
    campaign: {
      status,
      statusLabel,
      nextAction,
    },
  };

  return HeroPayloadSchema.parse(payload);
}

