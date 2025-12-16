import { describe, expect, it, vi } from "vitest";

import { GET as dataHandler } from "@/app/api/data/route";
import { okJson } from "../helpers/blobMock";
import { loadFixtureJson } from "../helpers/makeRows";

vi.mock("@vercel/blob", () => ({
  head: vi.fn(),
}));

import { head } from "@vercel/blob";

describe("integration: GET /api/data", () => {
  it("retorna 404 quando blob não existe", async () => {
    (head as any).mockResolvedValueOnce({ url: undefined });
    const res = await dataHandler();
    expect(res.status).toBe(404);
  });

  it("retorna o payload do blob quando existe", async () => {
    const blobPayload = await loadFixtureJson("sample_payload.json");

    (head as any).mockResolvedValueOnce({ url: "http://localhost/blob/campanha-data.json" });
    global.fetch = vi.fn().mockResolvedValueOnce(okJson(blobPayload));

    const res = await dataHandler();
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json).toEqual(blobPayload);
  });
});

