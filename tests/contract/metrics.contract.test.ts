import { describe, expect, it, vi } from "vitest";

import { GET as metricsHandler } from "@/app/api/metrics/route";
import { metricsPayloadSchema } from "./metrics.schema";
import { loadFixtureJson } from "../helpers/makeRows";
import { okJson } from "../helpers/blobMock";

vi.mock("@vercel/blob", () => ({
  head: vi.fn(),
}));

import { head } from "@vercel/blob";

describe("contract: GET /api/metrics", () => {
  it("retorna payload válido no schema (Zod)", async () => {
    const blobPayload = await loadFixtureJson("sample_payload.json");

    (head as any).mockResolvedValueOnce({ url: "http://localhost/blob/campanha-data.json" });
    global.fetch = vi.fn().mockResolvedValueOnce(okJson(blobPayload));

    const res = await metricsHandler();
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(() => metricsPayloadSchema.parse(json)).not.toThrow();
  });

  it("retorna 400 com erro claro quando faltar coluna obrigatória", async () => {
    const badPayload = {
      meta: { uploadedAt: "2025-12-13T00:00:00Z" },
      data: {
        rows: [
          ["Data da proposta", "Loja", "CNPJ", "Situação", "Ticket 1ª compra"],
          ["12/12/2025", "Loja X", "00.000.000/0001-00", "Aprovado", "R$ 10,00"],
        ],
      },
    };

    (head as any).mockResolvedValueOnce({ url: "http://localhost/blob/campanha-data.json" });
    global.fetch = vi.fn().mockResolvedValueOnce(okJson(badPayload));

    const res = await metricsHandler();
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json).toHaveProperty("error");
    expect(String((json as any).error)).toContain("Coluna cpf não encontrada");
  });
});

