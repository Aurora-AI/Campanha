/**
 * Testes basicos para APIs de publicacao e leitura
 * - POST /api/publish-csv com token valido
 * - POST /api/publish-csv sem token (401)
 * - GET /api/latest quando snapshot existe
 * - GET /api/latest quando nao existe (dev/prod)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DateTime } from 'luxon';

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
  const publishMonthModule = await import('@/app/api/publish-month/route');
  const latestModule = await import('@/app/api/latest/route');
  return { publishCsvModule, publishMonthHandler: publishMonthModule.POST, latestHandler: latestModule.GET };
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

function buildCsvWithDates(args: { entry: string; finalized?: string }): string {
  return [
    'Resumo 1',
    'Resumo 2',
    'Resumo 3',
    'Resumo 4',
    'CNPJ;Número da Proposta;Situação;Data de entrada;Data Finalizada',
    `07316252000769;123;APROVADA;${args.entry};${args.finalized ?? ''}`,
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
      const { publishCsvModule } = await loadHandlers();
      const publishMetricsMock = vi.fn().mockResolvedValue(undefined);
      const publishCsvHandler = publishCsvModule.createPublishCsvHandler({
        publisher: { publishMetrics: publishMetricsMock },
        requireToken: false,
      });

      putMock.mockResolvedValueOnce({
        url: 'https://blob.vercel-storage.com/campanha/snapshots/snapshot-2025-01-01-xyz.json',
      });

      const form = new FormData();
      form.append('file', new File([buildCsv()], 'sample.csv', { type: 'text/csv' }));

      const request = {
        headers: new Headers({ 'x-admin-token': 'test-secret-token' }),
        formData: async () => form,
      } as unknown as Request;

      const response = await publishCsvHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.ok).toBe(true);
      expect(data.proposals).toBe(1);
      expect(publishMetricsMock).toHaveBeenCalledTimes(1);
    });

    it('deve retornar 401 sem token', async () => {
      const { publishCsvModule } = await loadHandlers();
      const publishCsvHandler = publishCsvModule.createPublishCsvHandler({
        publisher: { publishMetrics: vi.fn() },
        requireToken: false,
      });

      const form = new FormData();
      form.append('file', new File([buildCsv()], 'sample.csv', { type: 'text/csv' }));

      const request = {
        headers: new Headers(),
        formData: async () => form,
      } as unknown as Request;

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

  describe('POST /api/publish-month', () => {
    it('deve bloquear ingestão do mês corrente', async () => {
      const nowSP = DateTime.now().setZone('America/Sao_Paulo');
      const { publishMonthHandler } = await loadHandlers();

      const form = new FormData();
      form.append('file', new File([buildCsv()], 'sample.csv', { type: 'text/csv' }));
      form.append('year', String(nowSP.year));
      form.append('month', String(nowSP.month));

      const request = {
        headers: new Headers({ 'x-admin-token': 'test-secret-token' }),
        formData: async () => form,
      } as unknown as Request;

      const response = await publishMonthHandler(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('CURRENT_MONTH_IS_LIVE');
    });

    it('deve bloquear duplicidade de mês por padrão', async () => {
      const nowSP = DateTime.now().setZone('America/Sao_Paulo');
      const prev = nowSP.minus({ months: 1 });
      const { publishMonthHandler } = await loadHandlers();

      headMock.mockResolvedValueOnce({
        url: 'https://example.com/campanha/monthly/index.json',
      });

      const fetchMock = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          schemaVersion: 'campaign-monthly-index/v1',
          updatedAtISO: '2025-12-10T00:00:00.000Z',
          months: [
            {
              year: prev.year,
              month: prev.month,
              source: 'sample.csv',
              uploadedAtISO: '2025-12-01T00:00:00.000Z',
              pathname: 'campanha/monthly/prev.json',
            },
          ],
        }),
      });
      vi.stubGlobal('fetch', fetchMock);

      const form = new FormData();
      form.append('file', new File([buildCsv()], 'sample.csv', { type: 'text/csv' }));
      form.append('year', String(prev.year));
      form.append('month', String(prev.month));

      const request = {
        headers: new Headers({ 'x-admin-token': 'test-secret-token' }),
        formData: async () => form,
      } as unknown as Request;

      const response = await publishMonthHandler(request);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.error).toBe('MONTH_ALREADY_EXISTS');
    });

    it('deve aceitar finalização fora do mês (spillover)', async () => {
      const nowSP = DateTime.now().setZone('America/Sao_Paulo');
      const prev = nowSP.minus({ months: 1 });
      const entry = prev.endOf('month').toFormat('dd/LL/yyyy') + ' 09:22';
      const finalized = prev.plus({ months: 1 }).startOf('month').toFormat('dd/LL/yyyy') + ' 10:00';

      const { publishMonthHandler } = await loadHandlers();

      const csvText = [
        buildCsvWithDates({ entry, finalized }),
        'Legenda do campo status:',
        'Aprovado',
        'Cadastro aprovado',
      ].join('\n');

      const form = new FormData();
      form.append('file', new File([csvText], 'sample.csv', { type: 'text/csv' }));
      form.append('year', String(prev.year));
      form.append('month', String(prev.month));
      form.append('overwrite', '1');

      const request = {
        headers: new Headers({ 'x-admin-token': 'test-secret-token' }),
        formData: async () => form,
      } as unknown as Request;

      const response = await publishMonthHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.ok).toBe(true);
      expect(data.spilloverFinalizedOutsideMonthCount).toBe(1);
      expect(data.canonicalMonthField?.key).toBe('data de entrada');
    });

    it('deve bloquear cadastro fora do mês selecionado', async () => {
      const nowSP = DateTime.now().setZone('America/Sao_Paulo');
      const prev = nowSP.minus({ months: 1 });

      const { publishMonthHandler } = await loadHandlers();

      const form = new FormData();
      form.append('file', new File([buildCsv()], 'sample.csv', { type: 'text/csv' }));
      form.append('year', String(prev.year));
      form.append('month', String(prev.month));
      form.append('overwrite', '1');

      const request = {
        headers: new Headers({ 'x-admin-token': 'test-secret-token' }),
        formData: async () => form,
      } as unknown as Request;

      const response = await publishMonthHandler(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('CADASTRO_DATE_OUTSIDE_MONTH');
    });
  });
});
