import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createUploadHandler } from "@/app/api/upload/route";
import { GET as metricsHandler } from "@/app/api/metrics/route";
import { metricsPayloadSchema } from "../contract/metrics.schema";
import { getLastPutJson, okJson } from "../helpers/blobMock";
import { loadFixtureText } from "../helpers/makeRows";
import { createNoopPublisher } from "@/lib/publisher";

vi.mock("@vercel/blob", () => ({
  put: vi.fn(),
  head: vi.fn(),
}));

import { head, put } from "@vercel/blob";

const putMock = vi.mocked(put);
const headMock = vi.mocked(head);

const originalBlobToken = process.env.BLOB_READ_WRITE_TOKEN;

beforeEach(() => {
  process.env.BLOB_READ_WRITE_TOKEN = "test-blob-token";
});

afterEach(() => {
  process.env.BLOB_READ_WRITE_TOKEN = originalBlobToken;
});

const uploadHandler = createUploadHandler({
  publisher: createNoopPublisher(),
  requireToken: false,
});

describe("integration: upload → metrics (cards-only)", () => {
  it("aceita TSV cards-only, persiste no blob e calcula métricas sem colunas financeiras", async () => {
    const tsvText = await loadFixtureText("sample_cards_only.tsv");
    const formData = {
      get: (key: string) =>
        key === "file" ? ({ name: "sample_cards_only.tsv", text: async () => tsvText } as unknown as File) : null,
    } as unknown as FormData;

    putMock.mockResolvedValueOnce({ url: "http://localhost/blob/campanha-data.json" });

    const req = { formData: async () => formData } as unknown as Request;
    const uploadRes = await uploadHandler(req);
    expect(uploadRes.status).toBe(200);
    expect(put).toHaveBeenCalled();

    const stored = getLastPutJson(putMock);

    headMock.mockResolvedValueOnce({ url: "http://localhost/blob/campanha-data.json" });
    global.fetch = vi.fn().mockResolvedValueOnce(okJson(stored));

    const metricsRes = await metricsHandler();
    expect(metricsRes.status).toBe(200);

    const metricsJson = await metricsRes.json();
    expect(() => metricsPayloadSchema.parse(metricsJson)).not.toThrow();

    const metricsObj = metricsJson as {
      meta?: Record<string, unknown>;
      headline?: Record<string, unknown>;
    };
    expect(metricsObj.meta?.lastDay).toBe("2025-12-12");
    expect(metricsObj.headline?.totalApproved).toBe(3);
  });

  it("não confunde preâmbulo com Ticket e detecta header real (CNPJ + Número + Situação)", async () => {
    const tsvText = await loadFixtureText("sample_cards_misleading_preamble.tsv");
    const formData = {
      get: (key: string) =>
        key === "file"
          ? ({ name: "sample_cards_misleading_preamble.tsv", text: async () => tsvText } as unknown as File)
          : null,
    } as unknown as FormData;

    putMock.mockResolvedValueOnce({ url: "http://localhost/blob/campanha-data.json" });

    const req = { formData: async () => formData } as unknown as Request;
    const uploadRes = await uploadHandler(req);
    expect(uploadRes.status).toBe(200);

    const stored = getLastPutJson(putMock);
    const storedObj = stored as Record<string, unknown>;
    const meta = (storedObj.meta ?? {}) as Record<string, unknown>;
    const headers = meta.headers as string[] | undefined;

    expect(meta.skippedPreambleRows).toBe(4);
    expect(headers ?? []).toContain("CNPJ");
    expect(headers ?? []).toContain("Número da Proposta");
    expect(headers ?? []).toContain("Situação");

    headMock.mockResolvedValueOnce({ url: "http://localhost/blob/campanha-data.json" });
    global.fetch = vi.fn().mockResolvedValueOnce(okJson(stored));

    const metricsRes = await metricsHandler();
    expect(metricsRes.status).toBe(200);
  });
});

