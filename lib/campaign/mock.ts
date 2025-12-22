export type CampaignStatus = 'NO_JOGO' | 'EM_DISPUTA' | 'FORA_DO_RITMO';

export const NAV_LINKS = [
  { label: "Dia", href: "#dia" },
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
    storeList: Array<{ label: string; value: string }>;
    timeline: { day: string; value: number }[];
  };
  campaign: {
    groupsRadial: { group: string; score: number }[]; // Score 0-100
    status: CampaignStatus;
    statusLabel: string;
    nextAction: string;
    groupsWeekly: {
      period: 'weekly';
      weekLabel: string;
      window: { startISO: string; endISO: string };
      items: Array<{
        groupId: string;
        groupName: string;
        achieved: number;
        target: number;
        attainmentPct: number; // 0..1
        achievedLabel: string;
        targetLabel: string;
        attainmentLabel: string; // e.g. "78%"
        status: CampaignStatus;
      }>;
    };
    metaAudit: {
      campaign: { startISO: string; endISO: string };
      groupsPeriod: 'weekly';
      weekWindow: { startISO: string; endISO: string; weekLabel: string };
      byGroup: Array<{ groupId: string; groupName: string; target: number; source: string }>;
    };
  };
  reengagement: {
    title: string;
    subtitle: string;
  };
  kpis: { label: string; value: string; delta?: string }[];
  accumulated: {
    monthTotal: number;
    label: string;
    windowLabel: string;
    stores: Array<{ label: string; value: string }>;
  };
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
    storeList: [
      { label: "Loja 04", value: "6 aprov." },
      { label: "Loja 05", value: "5 aprov." },
      { label: "Loja 06", value: "3 aprov." }
    ],
    timeline: [
      { day: "Seg", value: 65 },
      { day: "Ter", value: 78 },
      { day: "Qua", value: 98 },
      { day: "Qui", value: 85 },
      { day: "Sex", value: 110 }
    ]
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
    groupsWeekly: {
      period: 'weekly',
      weekLabel: 'Semana 01–07 Dez',
      window: { startISO: '2025-12-01T00:00:00.000-03:00', endISO: '2025-12-07T23:59:59.999-03:00' },
      items: [
        {
          groupId: 'Grupo A',
          groupName: 'Grupo A',
          achieved: 85,
          target: 100,
          attainmentPct: 0.85,
          achievedLabel: '85',
          targetLabel: '100',
          attainmentLabel: '85%',
          status: 'EM_DISPUTA',
        },
        {
          groupId: 'Grupo B',
          groupName: 'Grupo B',
          achieved: 52,
          target: 60,
          attainmentPct: 0.866,
          achievedLabel: '52',
          targetLabel: '60',
          attainmentLabel: '87%',
          status: 'EM_DISPUTA',
        },
        {
          groupId: 'Grupo C',
          groupName: 'Grupo C',
          achieved: 48,
          target: 66,
          attainmentPct: 0.727,
          achievedLabel: '48',
          targetLabel: '66',
          attainmentLabel: '73%',
          status: 'FORA_DO_RITMO',
        },
      ],
    },
    metaAudit: {
      campaign: { startISO: '2025-12-01T00:00:00.000-03:00', endISO: '2025-12-31T23:59:59.999-03:00' },
      groupsPeriod: 'weekly',
      weekWindow: {
        startISO: '2025-12-01T00:00:00.000-03:00',
        endISO: '2025-12-07T23:59:59.999-03:00',
        weekLabel: 'Semana 01–07 Dez',
      },
      byGroup: [
        { groupId: 'Grupo A', groupName: 'Grupo A', target: 100, source: 'config/campaign.config.json:weeklyTargetPerStoreByGroup × lojas do grupo' },
        { groupId: 'Grupo B', groupName: 'Grupo B', target: 60, source: 'config/campaign.config.json:weeklyTargetPerStoreByGroup × lojas do grupo' },
        { groupId: 'Grupo C', groupName: 'Grupo C', target: 66, source: 'config/campaign.config.json:weeklyTargetPerStoreByGroup × lojas do grupo' },
      ],
    },
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
  ],
  accumulated: {
    monthTotal: 1250,
    label: "Produção acumulada no mês",
    windowLabel: '01/12 até hoje',
    stores: [
      { label: 'Loja 01', value: '112' },
      { label: 'Loja 02', value: '98' },
      { label: 'Loja 03', value: '94' },
    ],
  }
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
