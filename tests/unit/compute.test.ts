import { describe, expect, it } from "vitest";

import { computeMetrics } from "@/lib/metrics/compute";
import { loadFixtureJson } from "../helpers/makeRows";

type BlobPayload = {
  meta: { uploadedAt: string };
  data: { rows: string[][] };
};

describe("metrics/compute (cards-only)", () => {
  it("calcula métricas de captação (Aprovado) sem depender de colunas financeiras", async () => {
    const blobPayload = await loadFixtureJson<BlobPayload>("sample_payload.json");

    const payload = computeMetrics({
      uploadedAt: blobPayload.meta.uploadedAt,
      rawRows: blobPayload.data.rows,
    });

    expect(payload.meta.lastDay).toBe("2025-12-12");
    expect(payload.meta.period.min).toBe("2025-12-10");
    expect(payload.meta.period.max).toBe("2025-12-12");

    expect(payload.headline.totalApproved).toBe(3);
    expect(payload.headline.yesterdayApproved).toBe(3);
    expect(payload.headline.deltaVsPrevDay).toEqual({ abs: 3, pct: null });

    const shareSum = payload.rankings.storesBySharePct.reduce((sum, s) => sum + s.sharePct, 0);
    expect(shareSum).toBeCloseTo(1, 8);

    expect(payload.stores.length).toBeGreaterThan(0);
    expect("firstPurchaseTicketAvg" in (payload.stores[0] as any)).toBe(false);

    const byStore = new Map(payload.stores.map((s) => [s.store, s]));
    const loja16 = byStore.get("LOJA 16 Cerro Azul - Centro");
    const loja06 = byStore.get("LOJA 06 Rio Branco do Sul - Centro");

    expect(loja16?.approved).toBe(2);
    expect(loja16?.rejected).toBe(0);
    expect(loja16?.decided).toBe(2);
    expect(loja16?.approvalRate).toBe(1);
    expect(loja16?.yesterdayApproved).toBe(2);
    expect(loja16?.pending.total).toBe(2);
    expect(loja16?.pending.byType.find((p) => p.type === "AGUARDANDO_DOCUMENTOS")?.count).toBe(1);
    expect(loja16?.pending.byType.find((p) => p.type === "ANALISE")?.count).toBe(1);
    expect(loja16?.pending.sampleCpfsMasked.join(",")).toContain("***");
    expect(loja16?.pending.messageToManager.toLowerCase()).toContain("aguardando documentos");

    expect(loja06?.approved).toBe(1);
    expect(loja06?.rejected).toBe(1);
    expect(loja06?.decided).toBe(2);
    expect(loja06?.approvalRate).toBeCloseTo(0.5, 8);
    expect(loja06?.yesterdayApproved).toBe(1);
    expect(loja06?.pending.total).toBe(1);
    expect(loja06?.pending.byType.find((p) => p.type === "AGUARDANDO_FINALIZAR_CADASTRO")?.count).toBe(1);
  });

  it("retorna approvalRate null quando decided == 0", () => {
    const rawRows: string[][] = [
      ["CNPJ", "Número da Proposta", "Situação"],
      ["07.316.252/0011-45", "9999", "Pendente"],
    ];

    const payload = computeMetrics({ uploadedAt: "2025-12-13T00:00:00Z", rawRows });
    const store = payload.stores.find((s) => s.store === "LOJA 16 Cerro Azul - Centro");
    expect(store?.decided).toBe(0);
    expect(store?.approvalRate).toBeNull();
  });
});

