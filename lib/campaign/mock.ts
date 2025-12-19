export type CampaignStatus = 'NO_JOGO' | 'EM_DISPUTA' | 'FORA_DO_RITMO';

export const NAV_LINKS = [
  { label: "Overview", href: "#" },
  { label: "Timeline", href: "#" },
  { label: "Groups", href: "#" },
  { label: "KPIs", href: "#" },
];

export interface SandboxData {
  hero: {
    headline: string;
    subheadline: string;
    weeklyGoals: { group: string; target: number; actual: number }[];
    yesterdayApproved: { value: number; label: string };
    puzzleImages?: string[];
  };
  movement: {
    yesterdayResult: { value: number; label: string; delta: string };
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
    headline: "Campaign \nPerformance",
    subheadline: "Daily evolution and strategic insights for the modern era.",
    weeklyGoals: [
      { group: "Alpha", target: 100, actual: 85 },
      { group: "Beta", target: 120, actual: 110 },
      { group: "Gamma", target: 90, actual: 95 }
    ],
    yesterdayApproved: { value: 142, label: "Approved Yesterday" }
  },
  movement: {
    yesterdayResult: { value: 98, label: "Yesterday's Performance", delta: "+12%" },
    timeline: [
      { day: "Mon", value: 65 },
      { day: "Tue", value: 78 },
      { day: "Wed", value: 98 },
      { day: "Thu", value: 85 },
      { day: "Fri", value: 110 }
    ]
  },
  campaign: {
    groupsRadial: [
      { group: "A", score: 85 },
      { group: "B", score: 60 },
      { group: "C", score: 92 }
    ],
    status: 'EM_DISPUTA',
    statusLabel: "Em Disputa",
    nextAction: "Accelerate re-engagement for Group B to secure the lead."
  },
  reengagement: {
    title: "Rupture Point",
    subtitle: "Identify and recover lost opportunities before they churn."
  },
  kpis: [
    { label: "Conversion Rate", value: "24.5%", delta: "+2.1%" },
    { label: "Avg Ticket", value: "R$ 4.2k", delta: "-0.5%" },
    { label: "Lead Velocity", value: "12h", delta: "-1h" },
    { label: "Active CAC", value: "R$ 120", delta: "+5%" }
  ],
  accumulated: {
    monthTotal: 1250,
    label: "Accumulated Production (Monthly)"
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
