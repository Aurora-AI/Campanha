/**
 * Testes basicos para APIs de publicacao e leitura
 * - POST /api/publish-csv com token valido
 * - POST /api/publish-csv sem token (401)
 * - GET /api/latest quando snapshot existe
 * - GET /api/latest quando nao existe (dev/prod)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

const putMock = vi.fn();
const listMock = vi.fn();
const headMock = vi.fn();

vi.mock('@vercel/blob', () => ({
  put: putMock,
  list: listMock,
  head: headMock,
}));

async function loadHandlers() {
  vi.resetModules();
  const publishCsvModule = await import('@/app/api/publish-csv/route');
  const latestModule = await import('@/app/api/latest/route');
  return { publishCsvHandler: publishCsvModule.POST, latestHandler: latestModule.GET };
}

function buildCsv(): string {
  return [
    'Resumo 1',
    'Resumo 2',
    'Resumo 3',
    'Resumo 4',
    'CNPJ;Número da Proposta;Situação;Data de entrada;Data Finalizada',
    '07316252000769;123;APROVADA;19/12/2025 09:22;19/12/2025 10:00',
  ].join('\n');
}

describe('API Routes', () => {
  const originalAdmin = process.env.ADMIN_TOKEN;
  const originalBlob = process.env.BLOB_READ_WRITE_TOKEN;
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.ADMIN_TOKEN = 'test-secret-token';
    process.env.BLOB_READ_WRITE_TOKEN = 'test-blob-token';
    process.env.NODE_ENV = 'test';
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    process.env.ADMIN_TOKEN = originalAdmin;
    process.env.BLOB_READ_WRITE_TOKEN = originalBlob;
    process.env.NODE_ENV = originalEnv;
  });

  describe('POST /api/publish-csv', () => {
    it('deve publicar snapshot com token valido', async () => {
      const { publishCsvHandler } = await loadHandlers();

      putMock.mockResolvedValueOnce({
        url: 'https://blob.vercel-storage.com/campanha/snapshots/snapshot-2025-01-01-xyz.json',
      });

      const form = new FormData();
      form.append('file', new File([buildCsv()], 'sample.csv', { type: 'text/csv' }));

      const request = new NextRequest('http://localhost:3000/api/publish-csv', {
        method: 'POST',
        headers: {
          'x-admin-token': 'test-secret-token',
        },
        body: form,
      });

      const response = await publishCsvHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.ok).toBe(true);
      expect(data.proposals).toBe(1);
      expect(putMock).toHaveBeenCalledWith(
        expect.stringMatching(/^campanha\/snapshots\/snapshot-/),
        expect.any(String),
        expect.objectContaining({
          access: 'public',
          token: 'test-blob-token',
          contentType: 'application/json',
          addRandomSuffix: true,
        })
      );
    });

    it('deve retornar 401 sem token', async () => {
      const { publishCsvHandler } = await loadHandlers();

      const form = new FormData();
      form.append('file', new File([buildCsv()], 'sample.csv', { type: 'text/csv' }));

      const request = new NextRequest('http://localhost:3000/api/publish-csv', {
        method: 'POST',
        body: form,
      });

      const response = await publishCsvHandler(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('UNAUTHORIZED');
    });
  });

  describe('GET /api/latest', () => {
    it('deve retornar seed em dev quando snapshot nao existe', async () => {
      const { latestHandler } = await loadHandlers();

      listMock.mockResolvedValueOnce({ blobs: [] });

      const response = await latestHandler();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.schemaVersion).toBe('campaign-snapshot/v1');
      expect(data.editorialSummary?.hero?.headline).toContain('Sem publicacao');
    });

    it('deve retornar 404 em prod quando snapshot nao existe', async () => {
      process.env.NODE_ENV = 'production';
      const { latestHandler } = await loadHandlers();

      listMock.mockResolvedValueOnce({ blobs: [] });

      const response = await latestHandler();
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('NO_SNAPSHOT');
    });

    it('deve retornar snapshot quando existe', async () => {
      const { latestHandler } = await loadHandlers();

      const mockSnapshot = {
        schemaVersion: 'campaign-snapshot/v1',
        campaign: { campaignId: 'calceleve-2025' },
        editorialSummary: { hero: { headline: 'Ok' } },
      };

      listMock.mockResolvedValueOnce({
        blobs: [
          {
            pathname: 'campanha/snapshots/snapshot-2025-01-01.json',
            uploadedAt: new Date('2025-01-01T10:00:00Z'),
          },
        ],
      });

      headMock.mockResolvedValueOnce({
        url: 'https://blob.vercel-storage.com/campanha/snapshots/snapshot-2025-01-01-rnd.json',
      });

      const fetchMock = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockSnapshot,
      });
      vi.stubGlobal('fetch', fetchMock);

      const response = await latestHandler();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockSnapshot);
    });
  });
});
