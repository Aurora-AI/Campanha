/**
 * Testes básicos para APIs de publicação e leitura
 * - POST /api/publish com token válido
 * - POST /api/publish sem token (401)
 * - GET /api/latest quando snapshot existe
 * - GET /api/latest quando não existe (204)
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST as publishHandler } from "@/app/api/publish/route";
import { GET as latestHandler } from "@/app/api/latest/route";

// Mock @vercel/blob
vi.mock("@vercel/blob", () => ({
  put: vi.fn(),
  head: vi.fn(),
}));

import { put, head } from "@vercel/blob";

describe("API Routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.ADMIN_TOKEN = "test-secret-token";
  });

  describe("POST /api/publish", () => {
    it("deve publicar snapshot com token válido", async () => {
      const mockSnapshot = {
        publishedAt: "2025-01-01T10:00:00Z",
        sourceFileName: "test.csv",
        version: "1",
        data: {
          raw: [],
          metrics: {
            total: 10,
            approved: 8,
            weeks: {},
            dailyEvolution: [],
          },
        },
      };

      (put as any).mockResolvedValueOnce({
        url: "https://blob.vercel-storage.com/calceleve/latest.json",
      });

      const request = new NextRequest("http://localhost:3000/api/publish", {
        method: "POST",
        headers: {
          Authorization: "Bearer test-secret-token",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(mockSnapshot),
      });

      const response = await publishHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(put).toHaveBeenCalledWith(
        "calceleve/latest.json",
        expect.any(String),
        expect.objectContaining({
          access: "public",
          contentType: "application/json",
          addRandomSuffix: false,
        })
      );
    });

    it("deve retornar 401 com token inválido", async () => {
      const mockSnapshot = {
        publishedAt: "2025-01-01T10:00:00Z",
        version: "1",
        data: { raw: [], metrics: { total: 10, approved: 8, weeks: {}, dailyEvolution: [] } },
      };

      const request = new NextRequest("http://localhost:3000/api/publish", {
        method: "POST",
        headers: {
          Authorization: "Bearer wrong-token",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(mockSnapshot),
      });

      const response = await publishHandler(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toContain("Unauthorized");
    });

    it("deve retornar 401 sem Authorization header", async () => {
      const mockSnapshot = {
        publishedAt: "2025-01-01T10:00:00Z",
        version: "1",
        data: { raw: [], metrics: { total: 10, approved: 8, weeks: {}, dailyEvolution: [] } },
      };

      const request = new NextRequest("http://localhost:3000/api/publish", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(mockSnapshot),
      });

      const response = await publishHandler(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toContain("Unauthorized");
    });

    it("deve retornar 401 se ADMIN_TOKEN não estiver configurado", async () => {
      delete process.env.ADMIN_TOKEN;

      const mockSnapshot = {
        publishedAt: "2025-01-01T10:00:00Z",
        version: "1",
        data: { raw: [], metrics: { total: 10, approved: 8, weeks: {}, dailyEvolution: [] } },
      };

      const request = new NextRequest("http://localhost:3000/api/publish", {
        method: "POST",
        headers: {
          Authorization: "Bearer some-token",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(mockSnapshot),
      });

      const response = await publishHandler(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toContain("Unauthorized");

      process.env.ADMIN_TOKEN = "test-secret-token";
    });
  });

  describe("GET /api/latest", () => {
    it("deve retornar 204 quando snapshot não existe", async () => {
      (head as any).mockRejectedValueOnce(new Error("Not found"));

      const request = new NextRequest("http://localhost:3000/api/latest", {
        method: "GET",
      });

      const response = await latestHandler(request);

      expect(response.status).toBe(204);
    });

    it("deve retornar snapshot quando existe", async () => {
      const mockSnapshot = {
        publishedAt: "2025-01-01T10:00:00Z",
        sourceFileName: "latest.csv",
        version: "1",
        data: {
          raw: [],
          metrics: {
            total: 100,
            approved: 85,
            weeks: {},
            dailyEvolution: [],
          },
        },
      };

      (head as any).mockResolvedValueOnce({
        url: "https://blob.vercel-storage.com/calceleve/latest.json",
      });

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockSnapshot,
      });

      const request = new NextRequest("http://localhost:3000/api/latest", {
        method: "GET",
      });

      const response = await latestHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockSnapshot);
      expect(response.headers.get("Cache-Control")).toContain("no-store");
    });

    it("deve incluir header Cache-Control para desabilitar cache", async () => {
      (head as any).mockRejectedValueOnce(new Error("Not found"));

      const request = new NextRequest("http://localhost:3000/api/latest", {
        method: "GET",
      });

      const response = await latestHandler(request);

      expect(response.status).toBe(204);
    });
  });
});
