import { CampaignStatus, MOCK_DB, SandboxData } from './mock';
import { ProposalFact, StoreMetrics } from '@/lib/analytics/types';
import { DateTime } from 'luxon';
import type { UnknownRecord } from '@/lib/data';

// Helper types matching the Mock DB structure
type GroupGoal = { group: string; actual: number; target: number };
type SeriesPoint = { day: string; value: number };

function asRecord(input: unknown): UnknownRecord | null {
  return input && typeof input === 'object' ? (input as UnknownRecord) : null;
}

function safeNumber(value: unknown, fallback = 0): number {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function safeString(value: unknown, fallback = ''): string {
  return typeof value === 'string' && value.trim().length > 0 ? value : fallback;
}

function aggregateGroups(storeMetrics: StoreMetrics[]): GroupGoal[] {
  const groups = new Map<string, { actual: number; target: number }>();

  // Initialize known groups if functionality requires fixed order, or just dynamic.
  // Using dynamic based on data.
  for (const m of storeMetrics) {
    const g = m.group || 'Outros';
    const current = groups.get(g) || { actual: 0, target: 0 }; // Target could be strictly mapped, using defaults or config
    // Mock target logic: aim for 2x current or fixed?
    // Using simple heuristic or preserving Mock targets if group matches?
    // Let's deduce "target" as simple logic or placeholder, since we don't have targets in snapshot.
    // For now, mapping actuals. Target = actual * 1.2 (dummy) to show progress bar.
    groups.set(g, {
      actual: current.actual + m.approvedTotal,
      target: current.target + (m.submittedTotal > 0 ? Math.ceil(m.submittedTotal * 0.8) : 0) // Dummy target rule
    });
  }

  return Array.from(groups.entries()).map(([group, val]) => ({
    group,
    actual: val.actual,
    target: val.target || 10 // avoid 0 target
  })).sort((a, b) => b.actual - a.actual).slice(0, 3); // Top 3 groups
}

function aggregateEvolution(proposals: ProposalFact[]): SeriesPoint[] {
  // Last 7 days
  const today = DateTime.now().setZone('America/Sao_Paulo');
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = today.minus({ days: 6 - i });
    return {
      iso: d.toISODate() as string,
      label: d.toFormat('dd/MM'),
      weekday: d.toFormat('ccc')
    };
  });

  return days.map(d => {
    const acts = proposals.filter(p => p.entryDateISO === d.iso); // Using entryDate for evolution
    const approved = acts.filter(p => p.approved > 0).reduce((s, p) => s + p.approved, 0);
    return {
      day: d.label,
      value: approved
    };
  });
}

function normalizeStatus(input: string | null | undefined): CampaignStatus {
  const raw = (input ?? '').toUpperCase();
  if (raw.includes('NO') && raw.includes('JOGO')) return 'NO_JOGO';
  if (raw.includes('FORA') && raw.includes('RITMO')) return 'FORA_DO_RITMO';
  if (raw.includes('EM') && raw.includes('DISPUTA')) return 'EM_DISPUTA';
  return 'EM_DISPUTA';
}

function clampScore(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, value));
}

export function adaptSnapshotToCampaign(snapshot: unknown): SandboxData {
  const root = asRecord(snapshot);
  const editorialSummary = asRecord(root?.editorialSummary);

  if (!root || !editorialSummary) {
    return {
      ...MOCK_DB,
      hero: { ...MOCK_DB.hero, subheadline: "Sem dados publicados (Showing Demo)" }
    };
  }

  const heroObj = asRecord(editorialSummary.hero);
  const pulseObj = asRecord(editorialSummary.pulse);
  const totalsObj = asRecord(editorialSummary.totals);

  const storeMetrics = Array.isArray(root.storeMetrics) ? (root.storeMetrics as StoreMetrics[]) : [];
  const proposals = Array.isArray(root.proposals) ? (root.proposals as ProposalFact[]) : [];

  // 1. Hero Data
  const weeklyGoals = aggregateGroups(storeMetrics || []);

  // 2. Evolution (Timeline)
  const timeline = aggregateEvolution(proposals || []);

  // 3. Groups (Radial)
  // Re-use aggregation or specific map
  const groupsRadial = weeklyGoals.map((g) => {
    const ratio = g.target > 0 ? g.actual / g.target : 0;
    return { group: g.group, score: clampScore(Math.round(ratio * 100)) };
  });

  // 4. Comparison
  const yesterdayResult = {
    value: safeNumber(pulseObj?.approvedYesterday, 0),
    label: "Aprovados Ontem",
    delta: "N/A" // comparatives logic could be added
  };

  const campaignStatus = normalizeStatus(safeString(heroObj?.statusLabel));

  return {
    hero: {
      headline: safeString(heroObj?.headline, "Campanha"),
      subheadline: safeString(heroObj?.subheadline, "Dados reais do snapshot"),
      weeklyGoals: weeklyGoals.length > 0 ? weeklyGoals : MOCK_DB.hero.weeklyGoals,
      yesterdayApproved: {
         value: safeNumber(pulseObj?.approvedYesterday, 0),
         label: safeString(heroObj?.kpiLabel, "Ontem")
      }
    },
    movement: {
      yesterdayResult,
      timeline
    },
    campaign: {
      groupsRadial,
      status: campaignStatus,
      statusLabel: safeString(heroObj?.statusLabel, "EM DISPUTA"),
      nextAction: "Ver Detalhes"
    },
    reengagement: MOCK_DB.reengagement, // No data in snapshot for this yet
    kpis: [
        { label: "Aprovados", value: String(safeNumber(totalsObj?.approved, 0)) },
        { label: "Digitados", value: String(safeNumber(totalsObj?.submitted, 0)) },
        { label: "Aprov %", value: `${Math.round(safeNumber(totalsObj?.approvalRate, 0) * 100)}%` }
    ],
    accumulated: {
        monthTotal: safeNumber(totalsObj?.approved, 0),
        label: "Total Aprovado"
    }
  };
}
