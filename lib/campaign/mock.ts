export type CampaignStatus = 'NO_JOGO' | 'EM_DISPUTA' | 'FORA_DO_RITMO';

export const NAV_LINKS = [
  { label: "Dia", href: "#dia" },
  { label: "Produção", href: "#producao" },
  { label: "Campanha", href: "#campanha" },
  { label: "Ação", href: "#acao" },
  { label: "KPIs", href: "#kpis" },
  { label: "Fechamento", href: "#fechamento" },
];

export interface SandboxData {
  hero: {
    headline: string;
    subheadline: string;
    weeklyGoals: { group: string; target: number; actual: number; onTrack: boolean }[];
    yesterdayApproved: { value: number; label: string };
    puzzleImages?: string[];
  };
  movement: {
    title: string;
    subtitle: string;
    dayLabel: string;
    yesterdayResult: { value: number; label: string; deltaText?: string };
    podium: Array<{ label: string; value: string }>;
    storeColumns: Array<{
      title: string;
      items: Array<{ label: string; value: string }>;
    }>;
  };
  campaign: {
    groupsRadial: { group: string; score: number }[]; // Score 0-100
    status: CampaignStatus;
    statusLabel: string;
    nextAction: string;
  };
  groups: {
    period: 'weekly';
    weekLabel: string;
    weekStartISO: string;
    weekEndISO: string;
    items: Array<{
      groupId: string;
      groupName: string;
      achieved: number;
      target: number;
      attainmentPct: number;
      status: '🟢' | '🟡' | '🔴';
    }>;
  };
  metaAudit: {
    groupsPeriod: 'weekly';
    weekStartISO: string;
    weekEndISO: string;
    targets: {
      byGroup: Array<{ groupId: string; target: number; source: string }>;
      byStore: Array<{ storeId: string; storeName: string; monthlyTarget?: number; source: string }>;
    };
  };
  storesMonthly: {
    monthLabel: string;
    fromISO: string;
    toISO: string;
    items: Array<{ storeId: string; storeName: string; achieved: number }>;
    totalAchieved: number;
  };
  trendComparative: {
    mode: 'weekday_vs_previous_month';
    current: { year: number; month: number; fromISO: string; toISO: string };
    baseline: { year: number; month: number; fromISO: string; toISO: string };
    metrics: {
      proposals: Array<{ dateISO: string; currentValue: number; baselineValue: number | null }>;
      approvals: Array<{ dateISO: string; currentValue: number; baselineValue: number | null }>;
    };
    summary?: {
      proposals?: { currentTotal: number; baselineTotal: number | null; deltaPct?: number };
      approvals?: { currentTotal: number; baselineTotal: number | null; deltaPct?: number };
      approvalRate?: { currentPct: number; baselinePct: number | null; deltaPp?: number };
    };
  };
  dataCoverage: {
    liveMonth?: { year: number; month: number; source: 'publish-csv'; publishedAtISO?: string };
    availableMonths: Array<{ year: number; month: number; source: string; uploadedAtISO: string }>;
    currentMonthLoaded: { year: number; month: number };
    baselineMonthLoaded?: { year: number; month: number; source: 'monthlySnapshots'; uploadedAtISO?: string };
    previousMonthLoaded?: { year: number; month: number };
  };
  reengagement: {
    title: string;
    subtitle: string;
  };
  kpis: { label: string; value: string; delta?: string }[];
}

export const MOCK_DB: SandboxData = {
  hero: {
    headline: "Aceleração 2025",
    subheadline: "Ritmo diário e leitura rápida do que importa hoje.",
    weeklyGoals: [
      { group: "Grupo A", target: 100, actual: 85, onTrack: false },
      { group: "Grupo B", target: 60, actual: 52, onTrack: false },
      { group: "Grupo C", target: 66, actual: 48, onTrack: false }
    ],
    yesterdayApproved: { value: 142, label: "Aprovados ontem" }
  },
  movement: {
    title: "Resultado de ontem",
    subtitle: "Três referências de aprovações. A lista abaixo aparece sem ordem de mérito.",
    dayLabel: "Ontem",
    yesterdayResult: { value: 98, label: "Aprovados ontem", deltaText: "+12 vs dia anterior" },
    podium: [
      { label: "Loja 01", value: "12 aprov." },
      { label: "Loja 02", value: "10 aprov." },
      { label: "Loja 03", value: "9 aprov." },
    ],
    storeColumns: [
      {
        title: "Lojas 04–09",
        items: [
          { label: "Loja 04", value: "6 aprov." },
          { label: "Loja 05", value: "5 aprov." },
          { label: "Loja 06", value: "3 aprov." },
        ],
      },
      {
        title: "Lojas 10–15",
        items: [],
      },
      {
        title: "Lojas 16–21",
        items: [],
      },
    ],
  },
  campaign: {
    groupsRadial: [
      { group: "Grupo A", score: 85 },
      { group: "Grupo B", score: 60 },
      { group: "Grupo C", score: 72 }
    ],
    status: 'EM_DISPUTA',
    statusLabel: "EM DISPUTA",
    nextAction: "Ajustar o foco hoje: destravar pendências e retomar contatos quentes.",
  },
  groups: {
    period: 'weekly',
    weekLabel: 'Semana 01–07 Dez',
    weekStartISO: '2025-12-01T00:00:00.000-03:00',
    weekEndISO: '2025-12-07T23:59:59.999-03:00',
    items: [
      { groupId: 'Grupo A', groupName: 'Grupo A', achieved: 85, target: 100, attainmentPct: 0.85, status: '🟡' },
      { groupId: 'Grupo B', groupName: 'Grupo B', achieved: 52, target: 60, attainmentPct: 0.866, status: '🟡' },
      { groupId: 'Grupo C', groupName: 'Grupo C', achieved: 48, target: 66, attainmentPct: 0.727, status: '🔴' },
    ],
  },
  metaAudit: {
    groupsPeriod: 'weekly',
    weekStartISO: '2025-12-01T00:00:00.000-03:00',
    weekEndISO: '2025-12-07T23:59:59.999-03:00',
    targets: {
      byGroup: [
        { groupId: 'Grupo A', target: 100, source: 'Configuração canônica da campanha' },
        { groupId: 'Grupo B', target: 60, source: 'Configuração canônica da campanha' },
        { groupId: 'Grupo C', target: 66, source: 'Configuração canônica da campanha' },
      ],
      byStore: [
        { storeId: 'LOJA 01', storeName: 'Loja 01', source: 'Catálogo de lojas' },
      ],
    },
  },
  storesMonthly: {
    monthLabel: 'Dez/2025',
    fromISO: '2025-12-01T00:00:00.000-03:00',
    toISO: '2025-12-12T23:59:59.999-03:00',
    items: [
      { storeId: 'LOJA 01', storeName: 'Loja 01', achieved: 112 },
      { storeId: 'LOJA 02', storeName: 'Loja 02', achieved: 98 },
      { storeId: 'LOJA 03', storeName: 'Loja 03', achieved: 94 },
    ],
    totalAchieved: 304,
  },
  trendComparative: {
    mode: 'weekday_vs_previous_month',
    current: { year: 2025, month: 12, fromISO: '2025-12-01T00:00:00.000-03:00', toISO: '2025-12-12T23:59:59.999-03:00' },
    baseline: { year: 2025, month: 11, fromISO: '2025-11-01T00:00:00.000-03:00', toISO: '2025-11-30T23:59:59.999-03:00' },
    metrics: {
      proposals: [
        { dateISO: '2025-12-01', currentValue: 120, baselineValue: 95 },
        { dateISO: '2025-12-02', currentValue: 130, baselineValue: 110 },
      ],
      approvals: [
        { dateISO: '2025-12-01', currentValue: 65, baselineValue: 58 },
        { dateISO: '2025-12-02', currentValue: 78, baselineValue: 70 },
      ],
    },
    summary: {
      proposals: { currentTotal: 250, baselineTotal: 205, deltaPct: 0.2195 },
      approvals: { currentTotal: 143, baselineTotal: 128, deltaPct: 0.1172 },
      approvalRate: { currentPct: 0.572, baselinePct: 0.624, deltaPp: -5.2 },
    },
  },
  dataCoverage: {
    liveMonth: { year: 2025, month: 12, source: 'publish-csv', publishedAtISO: '2025-12-12T12:00:00.000Z' },
    availableMonths: [
      { year: 2025, month: 11, source: 'admin', uploadedAtISO: '2025-12-01T12:00:00.000Z' },
      { year: 2025, month: 12, source: 'admin', uploadedAtISO: '2025-12-12T12:00:00.000Z' },
    ],
    currentMonthLoaded: { year: 2025, month: 12 },
    baselineMonthLoaded: { year: 2025, month: 11, source: 'monthlySnapshots', uploadedAtISO: '2025-12-01T12:00:00.000Z' },
    previousMonthLoaded: { year: 2025, month: 11 },
  },
  reengagement: {
    title: "Ruptura de foco",
    subtitle: "Recuperar oportunidades antes de esfriar: revisar pendências e acelerar retorno."
  },
  kpis: [
    { label: "Aprovados (total)", value: "1250", delta: "+12" },
    { label: "Digitados (total)", value: "3300", delta: "+31" },
    { label: "Taxa de aprovação", value: "24%", delta: "+1pp" },
    { label: "Lojas ativas", value: "21" }
  ]
};

// Legacy exports for backward compatibility during transition if needed,
// but components should verify MOCK_DB
export const HERO_DATA = {
    headline: MOCK_DB.hero.headline,
    subheadline: MOCK_DB.hero.subheadline,
    puzzleImages: ["/campaign/hero.png", "/campaign/gallery-01.svg", "/campaign/gallery-02.svg"]
};

export type SectionFeatureData = {
  title: string;
  description: string;
  image: string;
};

export const SECTION_A_DATA: SectionFeatureData = {
  title: "Cognitive Puzzle",
  description: "Protótipo editorial para explorar composição, ritmo e narrativa antes do transplante para o produto real.",
  image: "/campaign/hero.png",
};

export type SectionGridItem = {
  id: string;
  title: string;
  category: string;
  image: string;
};

export const SECTION_GRID_DATA: SectionGridItem[] = [
  { id: "g1", title: "Puzzle Head", category: "Hero", image: "/campaign/hero.png" },
  { id: "g2", title: "Satellite A", category: "Card", image: "/campaign/gallery-01.svg" },
  { id: "g3", title: "Satellite B", category: "Seal", image: "/campaign/gallery-02.svg" },
  { id: "g4", title: "Radial", category: "Gauge", image: "/campaign/gallery-01.svg" },
];

export const MANIFESTO_DATA: { text: string } = {
  text: "A UI manifesta estados; o backend produz inteligência.",
};
