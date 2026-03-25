import { DateTime } from 'luxon';
import type { ProposalFact, Snapshot } from '@/lib/analytics/types';

const FALLBACK_STORE = 'Loja nao identificada';
const FALLBACK_MEMBER = 'Sem promotor vinculado';
const FALLBACK_ROLE = 'Sem perfil informado';
const CAMPAIGN_ROLE_ALLOWLIST = new Set(['atendente da loja', 'gerente de loja']);

export type DashboardMetric = {
  label: string;
  value: string;
  helper: string;
};

export type DashboardStoreSummaryRow = {
  store: string;
  submitted: number;
  approved: number;
  approvalRate: number;
};

export type DashboardTimelineRow = {
  dateISO: string;
  submitted: number;
  approved: number;
};

export type DashboardMemberRow = {
  name: string;
  role: string;
  submitted: number;
  approved: number;
  prize: number;
};

export type DashboardStoreSection = {
  store: string;
  submitted: number;
  approved: number;
  prize: number;
  members: DashboardMemberRow[];
};

export type DashboardPageViewModel =
  | {
      status: 'empty';
      updatedAtISO: string;
    }
  | {
      status: 'ok';
      updatedAtISO: string;
      periodLabel: string;
      overview: DashboardMetric[];
      campaignOverview: DashboardMetric[];
      storeSummary: DashboardStoreSummaryRow[];
      dailyTimeline: DashboardTimelineRow[];
      salesByStore: DashboardStoreSection[];
      campaignByStore: DashboardStoreSection[];
    };

function normalizeLabel(value: string | null | undefined): string {
  return (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\u00a0/g, ' ')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function displayText(value: string | null | undefined, fallback: string): string {
  const normalized = (value ?? '').replace(/\s+/g, ' ').trim();
  return normalized || fallback;
}

function proposalMoment(proposal: ProposalFact): string {
  return proposal.finalizedDateISO ?? proposal.entryDateISO;
}

function approvalMoment(proposal: ProposalFact): string {
  return proposal.finalizedDateISO ?? proposal.entryDateISO;
}

function proposalWeight(status: ProposalFact['status']): number {
  if (status === 'APROVADO') return 3;
  if (status === 'REPROVADO') return 2;
  return 1;
}

function dedupeProposals(proposals: ProposalFact[]): ProposalFact[] {
  const byId = new Map<number, ProposalFact>();

  for (const proposal of proposals) {
    const existing = byId.get(proposal.proposalId);
    if (!existing) {
      byId.set(proposal.proposalId, proposal);
      continue;
    }

    const currentWeight = proposalWeight(proposal.status);
    const existingWeight = proposalWeight(existing.status);

    if (currentWeight > existingWeight) {
      byId.set(proposal.proposalId, proposal);
      continue;
    }

    if (currentWeight === existingWeight && proposalMoment(proposal) >= proposalMoment(existing)) {
      byId.set(proposal.proposalId, proposal);
    }
  }

  return Array.from(byId.values());
}

function sortMembers(rows: DashboardMemberRow[]): DashboardMemberRow[] {
  return [...rows].sort((a, b) => {
    if (b.approved !== a.approved) return b.approved - a.approved;
    if (b.submitted !== a.submitted) return b.submitted - a.submitted;
    if (a.role !== b.role) return a.role.localeCompare(b.role, 'pt-BR');
    return a.name.localeCompare(b.name, 'pt-BR');
  });
}

function sortStores(rows: DashboardStoreSection[]): DashboardStoreSection[] {
  return [...rows].sort((a, b) => {
    if (b.approved !== a.approved) return b.approved - a.approved;
    if (b.submitted !== a.submitted) return b.submitted - a.submitted;
    return a.store.localeCompare(b.store, 'pt-BR');
  });
}

function createTimeline(proposals: ProposalFact[]): DashboardTimelineRow[] {
  if (proposals.length === 0) return [];

  const submittedByDate = new Map<string, number>();
  const approvedByDate = new Map<string, number>();
  let minDateISO: string | null = null;
  let maxDateISO: string | null = null;

  for (const proposal of proposals) {
    const submittedKey = proposal.entryDateISO;
    submittedByDate.set(submittedKey, (submittedByDate.get(submittedKey) ?? 0) + 1);
    if (!minDateISO || submittedKey < minDateISO) minDateISO = submittedKey;
    if (!maxDateISO || submittedKey > maxDateISO) maxDateISO = submittedKey;

    if (proposal.approved) {
      const approvedKey = approvalMoment(proposal);
      approvedByDate.set(approvedKey, (approvedByDate.get(approvedKey) ?? 0) + 1);
      if (!minDateISO || approvedKey < minDateISO) minDateISO = approvedKey;
      if (!maxDateISO || approvedKey > maxDateISO) maxDateISO = approvedKey;
    }
  }

  if (!minDateISO || !maxDateISO) return [];

  const start = DateTime.fromISO(minDateISO, { zone: 'utc' }).startOf('day');
  const end = DateTime.fromISO(maxDateISO, { zone: 'utc' }).startOf('day');
  if (!start.isValid || !end.isValid) return [];

  const rows: DashboardTimelineRow[] = [];
  for (let cursor = start; cursor.toMillis() <= end.toMillis(); cursor = cursor.plus({ days: 1 })) {
    const key = cursor.toISODate() ?? '';
    rows.push({
      dateISO: key,
      submitted: submittedByDate.get(key) ?? 0,
      approved: approvedByDate.get(key) ?? 0,
    });
  }

  return rows;
}

function buildSalesByStore(proposals: ProposalFact[]): DashboardStoreSection[] {
  const stores = new Map<
    string,
    {
      store: string;
      submitted: number;
      approved: number;
      members: Map<string, DashboardMemberRow>;
    }
  >();

  for (const proposal of proposals) {
    const storeName = displayText(proposal.store, FALLBACK_STORE);
    const memberName = displayText(proposal.promoterName, FALLBACK_MEMBER);
    const memberRole = displayText(proposal.promoterProfile, FALLBACK_ROLE);
    const memberKey = `${normalizeLabel(memberRole)}::${normalizeLabel(memberName)}`;

    const storeAcc =
      stores.get(storeName) ??
      {
        store: storeName,
        submitted: 0,
        approved: 0,
        members: new Map<string, DashboardMemberRow>(),
      };

    storeAcc.submitted += 1;
    storeAcc.approved += proposal.approved;

    const member =
      storeAcc.members.get(memberKey) ??
      {
        name: memberName,
        role: memberRole,
        submitted: 0,
        approved: 0,
        prize: 0,
      };

    member.submitted += 1;
    member.approved += proposal.approved;
    member.prize = member.approved * 10;

    storeAcc.members.set(memberKey, member);
    stores.set(storeName, storeAcc);
  }

  return sortStores(
    Array.from(stores.values()).map((store) => ({
      store: store.store,
      submitted: store.submitted,
      approved: store.approved,
      prize: 0,
      members: sortMembers(Array.from(store.members.values())),
    }))
  );
}

function buildCampaignByStore(proposals: ProposalFact[], baseStores: DashboardStoreSummaryRow[]): DashboardStoreSection[] {
  const stores = new Map<
    string,
    {
      store: string;
      submitted: number;
      approved: number;
      members: Map<string, DashboardMemberRow>;
    }
  >();

  for (const store of baseStores) {
    stores.set(store.store, {
      store: store.store,
      submitted: 0,
      approved: 0,
      members: new Map<string, DashboardMemberRow>(),
    });
  }

  for (const proposal of proposals) {
    const role = displayText(proposal.promoterProfile, FALLBACK_ROLE);
    if (!CAMPAIGN_ROLE_ALLOWLIST.has(normalizeLabel(role))) continue;

    const storeName = displayText(proposal.store, FALLBACK_STORE);
    const memberName = displayText(proposal.promoterName, FALLBACK_MEMBER);
    const memberKey = `${normalizeLabel(role)}::${normalizeLabel(memberName)}`;

    const storeAcc =
      stores.get(storeName) ??
      {
        store: storeName,
        submitted: 0,
        approved: 0,
        members: new Map<string, DashboardMemberRow>(),
      };

    storeAcc.submitted += 1;
    storeAcc.approved += proposal.approved;

    const member =
      storeAcc.members.get(memberKey) ??
      {
        name: memberName,
        role,
        submitted: 0,
        approved: 0,
        prize: 0,
      };

    member.submitted += 1;
    member.approved += proposal.approved;
    member.prize = member.approved * 10;

    storeAcc.members.set(memberKey, member);
    stores.set(storeName, storeAcc);
  }

  return sortStores(
    Array.from(stores.values()).map((store) => ({
      store: store.store,
      submitted: store.submitted,
      approved: store.approved,
      prize: store.approved * 10,
      members: sortMembers(Array.from(store.members.values())),
    }))
  );
}

export function buildSimpleDashboardViewModel(snapshot: Snapshot | null | undefined): DashboardPageViewModel {
  const updatedAtISO = snapshot?.updatedAtISO ?? new Date().toISOString();
  const proposals = dedupeProposals(snapshot?.proposals ?? []);

  if (proposals.length === 0) {
    return {
      status: 'empty',
      updatedAtISO,
    };
  }

  const storeSummary = proposals
    .reduce<Map<string, DashboardStoreSummaryRow>>((acc, proposal) => {
      const storeName = displayText(proposal.store, FALLBACK_STORE);
      const current = acc.get(storeName) ?? {
        store: storeName,
        submitted: 0,
        approved: 0,
        approvalRate: 0,
      };

      current.submitted += 1;
      current.approved += proposal.approved;
      current.approvalRate = current.submitted > 0 ? current.approved / current.submitted : 0;

      acc.set(storeName, current);
      return acc;
    }, new Map<string, DashboardStoreSummaryRow>())
    .values();

  const sortedStoreSummary = [...storeSummary].sort((a, b) => {
    if (b.approved !== a.approved) return b.approved - a.approved;
    if (b.submitted !== a.submitted) return b.submitted - a.submitted;
    return a.store.localeCompare(b.store, 'pt-BR');
  });

  const timeline = createTimeline(proposals);
  const salesByStore = buildSalesByStore(proposals);
  const campaignByStore = buildCampaignByStore(proposals, sortedStoreSummary);

  const totalSubmitted = proposals.length;
  const totalApproved = proposals.reduce((sum, proposal) => sum + proposal.approved, 0);
  const eligibleSubmitted = campaignByStore.reduce((sum, store) => sum + store.submitted, 0);
  const eligibleApproved = campaignByStore.reduce((sum, store) => sum + store.approved, 0);
  const campaignParticipants = campaignByStore.reduce((sum, store) => sum + store.members.length, 0);

  const firstDay = timeline[0]?.dateISO ?? proposals[0]?.entryDateISO;
  const lastDay = timeline[timeline.length - 1]?.dateISO ?? proposals[0]?.entryDateISO;

  return {
    status: 'ok',
    updatedAtISO,
    periodLabel: firstDay && lastDay ? `${firstDay} ate ${lastDay}` : 'Periodo indisponivel',
    overview: [
      {
        label: 'Lojas monitoradas',
        value: String(sortedStoreSummary.length),
        helper: 'Digitadas e aprovadas por loja sem regras de grupo.',
      },
      {
        label: 'Propostas digitadas',
        value: String(totalSubmitted),
        helper: 'Soma de todas as propostas validas no periodo.',
      },
      {
        label: 'Propostas aprovadas',
        value: String(totalApproved),
        helper: 'Somente propostas com status aprovado.',
      },
      {
        label: 'Taxa geral',
        value: `${totalSubmitted > 0 ? Math.round((totalApproved / totalSubmitted) * 1000) / 10 : 0}%`,
        helper: 'Relacao entre aprovadas e digitadas.',
      },
    ],
    campaignOverview: [
      {
        label: 'Perfis elegiveis',
        value: String(campaignParticipants),
        helper: 'Atendente da Loja e Gerente de Loja.',
      },
      {
        label: 'Digitadas elegiveis',
        value: String(eligibleSubmitted),
        helper: 'Somente propostas dos perfis participantes.',
      },
      {
        label: 'Aprovadas elegiveis',
        value: String(eligibleApproved),
        helper: 'Base para o calculo de premiacao.',
      },
      {
        label: 'Premiacao projetada',
        value: `R$ ${(eligibleApproved * 10).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        helper: 'R$ 10,00 por proposta aprovada.',
      },
    ],
    storeSummary: sortedStoreSummary,
    dailyTimeline: timeline,
    salesByStore,
    campaignByStore,
  };
}
