export type CampaignStatus = 'NO_JOGO' | 'EM_DISPUTA' | 'FORA_DO_RITMO';

export type PodiumItem = {
  label: string;
  value: string;
  stateBadge?: '🟢';
};

export type StoreListItem = {
  label: string;
  value: string;
};

export type HighlightBlock = {
  label: string;
  value: string;
  deltaText?: string;
  tone?: 'positive' | 'negative' | 'neutral';
};

export type HomeViewModel = {
  podium: PodiumItem[];
  storeList: StoreListItem[];

  cover: {
    headline: string;
    subtitle: string;
    state: CampaignStatus;
    stateLabel: string;
    leaderValue: string;
    leaderLabel: string;
    deltaText?: string;
    cta: { label: string; href: string };
    weeklyGoals: Array<{
      group: string;
      target: number;
      actual: number;
      tone: 'good' | 'warn';
    }>;
    yesterdayApproved: { value: number; label: string };
  };

  movement: {
    title: string;
    subtitle: string;
    summary: { label: string; value: string; deltaText?: string };
    timeline: Array<{ day: string; value: number }>;
  };

  campaign: {
    statusLabel: string;
    statusPillClass: string;
    nextAction: string;
    cards: Array<{
      key: string;
      title: string;
      caption: string;
      delay: number;
      thermometer: {
        size: number;
        radius: number;
        circumference: number;
        offset: number;
        stroke: string;
        labelText: string;
        labelColor: string;
        cx: number;
        cy: number;
        strokeWidth: number;
      };
    }>;
  };

  spread: {
    left: { bullets: string[] };
    right: {
      nextActionTitle: string;
      nextActionReason: string;
      href: string;
      contestable: boolean;
    };
  };

  highlights: HighlightBlock[];
  reengagement: { title: string; subtitle: string; ctaLabel: string };
  accumulated: { monthTotal: number; label: string; note?: string };
  archive: { links: Array<{ label: string; href: string }> };
};
