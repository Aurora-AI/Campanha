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

describe("integration: upload → metrics", () => {
  it("simula upload, persistência no blob e cálculo de métricas", async () => {
    const csvText = await loadFixtureText("sample.csv");
    const formData = {
      get: (key: string) =>
        key === "file" ? ({ name: "sample.csv", text: async () => csvText } as unknown as File) : null,
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
  });
});
