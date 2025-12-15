/**
 * Testes básicos para publisher.ts
 * - buildSnapshot
 * - publishSnapshot
 * - loadLatestSnapshot
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { publishSnapshot, loadLatestSnapshot, PublicSnapshot } from "@/lib/publisher";

// Mock fetch global
global.fetch = vi.fn();

describe("Publisher Module", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("publishSnapshot", () => {
    it("deve publicar snapshot com token válido", async () => {
      const mockSnapshot: PublicSnapshot = {
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

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, url: "https://blob.vercel-storage.com/calceleve/latest.json" }),
      });

      const result = await publishSnapshot(mockSnapshot, "valid-token");

      expect(result.success).toBe(true);
      expect((result as any).url).toContain("calceleve");
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/publish",
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer valid-token",
          },
          cache: "no-store",
        })
      );
    });

    it("deve retornar erro 401 com token inválido", async () => {
      const mockSnapshot: PublicSnapshot = {
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

      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({
          error: "Token inválido. Publicação não autorizada.",
        }),
      });

      const result = await publishSnapshot(mockSnapshot, "invalid-token");

      expect(result.success).toBe(false);
      expect(result.error).toContain("Token inválido");
    });

    it("deve capturar erro de rede", async () => {
      const mockSnapshot: PublicSnapshot = {
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

      (global.fetch as any).mockRejectedValueOnce(
        new Error("Network error")
      );

      const result = await publishSnapshot(mockSnapshot, "token");

      expect(result.success).toBe(false);
      expect(result.error).toContain("rede");
    });
  });

  describe("loadLatestSnapshot", () => {
    it("deve retornar null quando snapshot não existe (204)", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        status: 204,
      });

      const result = await loadLatestSnapshot();

      expect(result).toBeNull();
    });

    it("deve carregar snapshot quando existe", async () => {
      const mockSnapshot: PublicSnapshot = {
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

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockSnapshot,
      });

      const result = await loadLatestSnapshot();

      expect(result).toEqual(mockSnapshot);
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/latest",
        expect.objectContaining({
          cache: "no-store",
        })
      );
    });

    it("deve retornar null para snapshot inválido (sem data)", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ version: "1", publishedAt: "2025-01-01T10:00:00Z" }),
      });

      const result = await loadLatestSnapshot();

      expect(result).toBeNull();
    });

    it("deve retornar null em caso de erro", async () => {
      (global.fetch as any).mockRejectedValueOnce(
        new Error("Network error")
      );

      const result = await loadLatestSnapshot();

      expect(result).toBeNull();
    });
  });
});
