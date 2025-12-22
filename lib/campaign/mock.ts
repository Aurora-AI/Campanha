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
  };
  reengagement: {
    title: string;
    subtitle: string;
  };
  kpis: { label: string; value: string; delta?: string }[];
  accumulated: { monthTotal: number; label: string };
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
    nextAction: "Ajustar o foco hoje: destravar pendências e retomar contatos quentes."
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
    label: "Produção acumulada no mês"
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
