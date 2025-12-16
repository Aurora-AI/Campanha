import { describe, expect, it } from "vitest";

import { computeMetrics } from "@/lib/metrics/compute";
import { loadFixtureJson } from "../helpers/makeRows";

type BlobPayload = {
  meta: { uploadedAt: string };
  data: { rows: string[][] };
};

describe("metrics/compute", () => {
  it("calcula headline, comparativos e cards por loja a partir do payload do blob", async () => {
    const blobPayload = await loadFixtureJson<BlobPayload>("sample_payload.json");

    const payload = computeMetrics({
      uploadedAt: blobPayload.meta.uploadedAt,
      rawRows: blobPayload.data.rows,
    });

    expect(payload.meta.lastDay).toBe("2025-12-12");
    expect(payload.meta.period.min).toBe("2024-12-12");
    expect(payload.meta.period.max).toBe("2025-12-12");

    expect(payload.headline.totalApproved).toBe(12);
    expect(payload.headline.yesterdayApproved).toBe(3);

    expect(payload.headline.deltaVsPrevDay).toEqual({ abs: 1, pct: 0.5 });
    expect(payload.headline.deltaVsSameWeekday).toEqual({ abs: 2, pct: 2 });
    expect(payload.headline.deltaVsSameMonthDay).toEqual({ abs: -1, pct: -0.25 });
    expect(payload.headline.deltaVsSameYearDay).toEqual({ abs: 1, pct: 0.5 });

    const shareSum = payload.rankings.storesBySharePct.reduce((sum, s) => sum + s.sharePct, 0);
    expect(shareSum).toBeCloseTo(1, 8);

    expect(payload.rankings.groupsByApprovedAbs.length).toBeGreaterThan(0);

    const byStore = new Map(payload.stores.map((s) => [s.store, s]));
    const alpha = byStore.get("Loja Alpha");
    const beta = byStore.get("Loja Beta");

    expect(alpha).toBeDefined();
    expect(beta).toBeDefined();

    expect(alpha?.approved).toBe(6);
    expect(alpha?.rejected).toBe(0);
    expect(alpha?.decided).toBe(6);
    expect(alpha?.approvalRate).toBe(1);
    expect(alpha?.yesterdayApproved).toBe(1);
    expect(alpha?.pending.total).toBe(2);
    expect(alpha?.pending.byType.find((p) => p.type === "AGUARDANDO_DOCUMENTOS")?.count).toBe(1);
    expect(alpha?.pending.byType.find((p) => p.type === "AGUARDANDO_FINALIZAR_CADASTRO")?.count).toBe(1);
    expect(alpha?.pending.sampleCpfsMasked.join(",")).toContain("***");
    expect(alpha?.pending.messageToManager.toLowerCase()).toContain("aguardando documentos");
    expect(alpha?.firstPurchaseTicketAvg).toBeCloseTo(85, 6);

    expect(beta?.approved).toBe(6);
    expect(beta?.rejected).toBe(2);
    expect(beta?.decided).toBe(8);
    expect(beta?.approvalRate).toBeCloseTo(0.75, 8);
    expect(beta?.yesterdayApproved).toBe(2);
    expect(beta?.pending.total).toBe(3);
    expect(beta?.pending.byType.find((p) => p.type === "PENDENTE")?.count).toBe(2);
    expect(beta?.pending.byType.find((p) => p.type === "ANALISE")?.count).toBe(1);
    expect(beta?.pending.sampleCpfsMasked.join(",")).toContain("***");
    expect(beta?.pending.messageToManager.toLowerCase()).toContain("ocorr");
    expect(beta?.firstPurchaseTicketAvg).toBeCloseTo(131.666666, 3);
  });

  it("retorna approvalRate null quando decided == 0", () => {
    const rawRows: string[][] = [
      ["Data da proposta", "Loja", "CNPJ", "CPF", "Situação", "Ticket 1ª compra"],
      ["12/12/2025", "Loja Gamma", "22.222.222/0001-22", "999.***.***-99", "Pendente", ""],
    ];

    const payload = computeMetrics({ uploadedAt: "2025-12-13T00:00:00Z", rawRows });
    const gamma = payload.stores.find((s) => s.store === "Loja Gamma");
    expect(gamma?.decided).toBe(0);
    expect(gamma?.approvalRate).toBeNull();
  });
});

