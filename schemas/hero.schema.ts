import { z } from "zod";

export const CampaignStatusKeySchema = z.enum(["NO_JOGO", "EM_DISPUTA", "FORA_DO_RITMO"]);

export const HeroWeeklyGoalSchema = z.object({
  group: z.string().min(1),
  target: z.string().min(1),
  actual: z.string().min(1),
  tone: z.enum(["good", "warn"]),
});

export const HeroPayloadSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().min(1),
  images: z.object({
    puzzleSrc: z.string().min(1),
    heroSrc: z.string().min(1),
  }),
  leftSatellite: z.object({
    title: z.string().min(1),
    items: z.array(HeroWeeklyGoalSchema).min(1),
  }),
  rightSatellite: z.object({
    labelTop: z.string().min(1),
    value: z.string().min(1),
    labelBottom: z.string().min(1),
  }),
  campaign: z.object({
    status: CampaignStatusKeySchema,
    statusLabel: z.string().min(1),
    nextAction: z.string().min(1),
  }),
});

export type HeroPayload = z.infer<typeof HeroPayloadSchema>;

