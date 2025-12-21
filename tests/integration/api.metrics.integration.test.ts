import { describe, expect, it, vi } from "vitest";

import { POST as uploadHandler } from "@/app/api/upload/route";
import { GET as metricsHandler } from "@/app/api/metrics/route";
import { metricsPayloadSchema } from "../contract/metrics.schema";
import { getLastPutJson, okJson } from "../helpers/blobMock";
import { loadFixtureText } from "../helpers/makeRows";

vi.mock("@vercel/blob", () => ({
  put: vi.fn(),
  head: vi.fn(),
}));

import { head, put } from "@vercel/blob";

describe("integration: upload → metrics (cards-only)", () => {
  it("aceita TSV cards-only, persiste no blob e calcula métricas sem colunas financeiras", async () => {
    const tsvText = await loadFixtureText("sample_cards_only.tsv");
    const formData = {
      get: (key: string) =>
        key === "file" ? ({ name: "sample_cards_only.tsv", text: async () => tsvText } as unknown as File) : null,
    } as unknown as FormData;

    (put as any).mockResolvedValueOnce({ url: "http://localhost/blob/campanha-data.json" });

    const req = { formData: async () => formData } as unknown as Request;
    const uploadRes = await uploadHandler(req);
    expect(uploadRes.status).toBe(200);
    expect(put).toHaveBeenCalled();

    const stored = getLastPutJson(put as any);

    (head as any).mockResolvedValueOnce({ url: "http://localhost/blob/campanha-data.json" });
    global.fetch = vi.fn().mockResolvedValueOnce(okJson(stored));

    const metricsRes = await metricsHandler();
    expect(metricsRes.status).toBe(200);

    const metricsJson = await metricsRes.json();
    expect(() => metricsPayloadSchema.parse(metricsJson)).not.toThrow();

    expect((metricsJson as any).meta?.lastDay).toBe("2025-12-12");
    expect((metricsJson as any).headline?.totalApproved).toBe(3);
  });

  it("não confunde preâmbulo com Ticket e detecta header real (CNPJ + Número + Situação)", async () => {
    const tsvText = await loadFixtureText("sample_cards_misleading_preamble.tsv");
    const formData = {
      get: (key: string) =>
        key === "file"
          ? ({ name: "sample_cards_misleading_preamble.tsv", text: async () => tsvText } as unknown as File)
          : null,
    } as unknown as FormData;

    (put as any).mockResolvedValueOnce({ url: "http://localhost/blob/campanha-data.json" });

    const req = { formData: async () => formData } as unknown as Request;
    const uploadRes = await uploadHandler(req);
    expect(uploadRes.status).toBe(200);

    const stored = getLastPutJson(put as any) as any;
    expect(stored?.meta?.skippedPreambleRows).toBe(4);
    expect(stored?.meta?.headers).toContain("CNPJ");
    expect(stored?.meta?.headers).toContain("Número da Proposta");
    expect(stored?.meta?.headers).toContain("Situação");

    (head as any).mockResolvedValueOnce({ url: "http://localhost/blob/campanha-data.json" });
    global.fetch = vi.fn().mockResolvedValueOnce(okJson(stored));

    const metricsRes = await metricsHandler();
    expect(metricsRes.status).toBe(200);
  });
});

