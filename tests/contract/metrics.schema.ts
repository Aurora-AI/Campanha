import { z } from "zod";

export const deltaSchema = z.object({
  abs: z.number(),
  pct: z.number().nullable(),
});

export const metricsPayloadSchema = z.object({
  meta: z.object({
    uploadedAt: z.string(),
    rows: z.number(),
    period: z.object({
      min: z.string(),
      max: z.string(),
    }),
    lastDay: z.string(),
  }),
  headline: z.object({
    totalApproved: z.number(),
    yesterdayApproved: z.number(),
    deltaVsPrevDay: deltaSchema.optional(),
    deltaVsSameWeekday: deltaSchema.optional(),
    deltaVsSameMonthDay: deltaSchema.optional(),
    deltaVsSameYearDay: deltaSchema.optional(),
  }),
  rankings: z.object({
    storesBySharePct: z.array(
      z.object({
        store: z.string(),
        approved: z.number(),
        sharePct: z.number(),
      })
    ),
  }),
  stores: z.array(
    z.object({
      store: z.string(),
      cnpj: z.string().optional(),
      approved: z.number(),
      rejected: z.number(),
      decided: z.number(),
      approvalRate: z.number().nullable(),
      yesterdayApproved: z.number(),
      pending: z.object({
        total: z.number(),
        byType: z.array(
          z.object({
            type: z.string(),
            count: z.number(),
          })
        ),
        sampleCpfsMasked: z.array(z.string()),
        messageToManager: z.string(),
      }),
    })
  ),
});

export type MetricsPayloadSchema = z.infer<typeof metricsPayloadSchema>;
