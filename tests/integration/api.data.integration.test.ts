import { describe, expect, it, vi } from "vitest";

import { GET as dataHandler } from "@/app/api/data/route";
import { okJson } from "../helpers/blobMock";
import { loadFixtureJson } from "../helpers/makeRows";

vi.mock("@vercel/blob", () => ({
  head: vi.fn(),
}));

import { head } from "@vercel/blob";

const headMock = vi.mocked(head);

describe("integration: GET /api/data", () => {
  it("retorna 404 quando blob não existe", async () => {
    headMock.mockResolvedValueOnce({ url: undefined });
    const res = await dataHandler();
    expect(res.status).toBe(404);
  });

  it("retorna o payload do blob quando existe", async () => {
    type BlobPayload = Record<string, unknown> & { meta?: Record<string, unknown> };
    const blobPayload = await loadFixtureJson<BlobPayload>("sample_payload.json");

    headMock.mockResolvedValueOnce({ url: "http://localhost/blob/campanha-data.json" });
    global.fetch = vi.fn().mockResolvedValueOnce(okJson(blobPayload));

    const res = await dataHandler();
    expect(res.status).toBe(200);

    const json = (await res.json()) as unknown;

    const expectedMeta: Record<string, unknown> = { ...(blobPayload.meta ?? {}) };
    delete expectedMeta.headers;
    delete expectedMeta.normalizedHeaders;
    delete expectedMeta.skippedPreambleRows;

    const expected: BlobPayload = {
      ...blobPayload,
      meta: expectedMeta,
    };
    expect(json).toEqual(expected);
  });

  it("sanitiza campos de debug do meta (headers, skippedPreambleRows)", async () => {
    type BlobPayload = Record<string, unknown> & { meta: Record<string, unknown> };
    const blobPayload = await loadFixtureJson<BlobPayload>("sample_payload.json");
    // Inject debug fields
    const payloadWithDebug = {
      ...blobPayload,
      meta: {
        ...blobPayload.meta,
        headers: ["col1", "col2"],
        skippedPreambleRows: 3,
      },
    };

    headMock.mockResolvedValueOnce({ url: "http://localhost/blob/campanha-data.json" });
    global.fetch = vi.fn().mockResolvedValueOnce(okJson(payloadWithDebug));

    const res = await dataHandler();
    expect(res.status).toBe(200);

    const json = (await res.json()) as unknown as { meta?: Record<string, unknown> };
    expect(json.meta ?? {}).not.toHaveProperty("headers");
    expect(json.meta ?? {}).not.toHaveProperty("normalizedHeaders");
    expect(json.meta ?? {}).not.toHaveProperty("skippedPreambleRows");
  });
});
