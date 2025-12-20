/**
 * Testes basicos para publisher.ts
 * - publishSnapshot
 * - getLatestSnapshot
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const putMock = vi.fn();
const listMock = vi.fn();
const headMock = vi.fn();

vi.mock('@vercel/blob', () => ({
  put: putMock,
  list: listMock,
  head: headMock,
}));

async function loadPublisher() {
  vi.resetModules();
  return await import('@/lib/publisher');
}

describe('Publisher Module', () => {
  const originalToken = process.env.BLOB_READ_WRITE_TOKEN;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    process.env.BLOB_READ_WRITE_TOKEN = originalToken;
  });

  describe('publishSnapshot', () => {
    it('deve publicar snapshot versionado com suffix aleatorio', async () => {
      process.env.BLOB_READ_WRITE_TOKEN = 'test-blob-token';
      const { publishSnapshot } = await loadPublisher();

      putMock.mockResolvedValueOnce({
        url: 'https://blob.vercel-storage.com/campanha/snapshots/snapshot-2025-01-01-xyz.json',
      });

      const result = await publishSnapshot({ ok: true });

      expect(result).toBeUndefined();
      expect(putMock).toHaveBeenCalledTimes(1);

      const [pathname, body, options] = putMock.mock.calls[0];
      expect(pathname).toMatch(/^campanha\/snapshots\/snapshot-/);
      expect(body).toContain('"ok": true');
      expect(options).toEqual(
        expect.objectContaining({
          access: 'public',
          token: 'test-blob-token',
          contentType: 'application/json',
          addRandomSuffix: true,
        })
      );
    });

    it('deve falhar quando token nao esta configurado', async () => {
      delete process.env.BLOB_READ_WRITE_TOKEN;
      const { publishSnapshot } = await loadPublisher();

      await expect(publishSnapshot({ ok: true })).rejects.toThrow('Missing BLOB_READ_WRITE_TOKEN');
    });
  });

  describe('getLatestSnapshot', () => {
    it('deve retornar snapshot quando existe', async () => {
      process.env.BLOB_READ_WRITE_TOKEN = 'test-blob-token';
      const { getLatestSnapshot } = await loadPublisher();

      listMock.mockResolvedValueOnce({
        blobs: [
          {
            pathname: 'campanha/snapshots/snapshot-2025-01-01-old.json',
            uploadedAt: new Date('2025-01-01T10:00:00Z'),
          },
          {
            pathname: 'campanha/snapshots/snapshot-2025-01-02-new.json',
            uploadedAt: new Date('2025-01-02T10:00:00Z'),
          },
        ],
      });

      headMock.mockResolvedValueOnce({
        url: 'https://blob.vercel-storage.com/campanha/snapshots/snapshot-2025-01-02-new-rnd.json',
      });

      const mockSnapshot = {
        updatedAtISO: '2025-01-02T10:00:00Z',
        campaign: { statusLabel: 'EM DISPUTA' },
      };
      const fetchMock = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockSnapshot,
      });
      vi.stubGlobal('fetch', fetchMock);

      const result = await getLatestSnapshot();

      expect(listMock).toHaveBeenCalledWith(
        expect.objectContaining({
          token: 'test-blob-token',
          prefix: 'campanha/snapshots/',
          limit: 100,
        })
      );
      expect(headMock).toHaveBeenCalledWith(
        'campanha/snapshots/snapshot-2025-01-02-new.json',
        expect.objectContaining({ token: 'test-blob-token' })
      );
      expect(fetchMock).toHaveBeenCalledWith(
        'https://blob.vercel-storage.com/campanha/snapshots/snapshot-2025-01-02-new-rnd.json',
        expect.objectContaining({ cache: 'no-store' })
      );
      expect(result).toEqual(mockSnapshot);
    });

    it('deve retornar null quando nao existe', async () => {
      process.env.BLOB_READ_WRITE_TOKEN = 'test-blob-token';
      const { getLatestSnapshot } = await loadPublisher();

      listMock.mockResolvedValueOnce({ blobs: [] });

      const result = await getLatestSnapshot();

      expect(result).toBeNull();
    });

    it('deve retornar null quando head nao retorna url', async () => {
      process.env.BLOB_READ_WRITE_TOKEN = 'test-blob-token';
      const { getLatestSnapshot } = await loadPublisher();

      listMock.mockResolvedValueOnce({
        blobs: [
          {
            pathname: 'campanha/snapshots/snapshot-2025-01-01.json',
            uploadedAt: new Date('2025-01-01T10:00:00Z'),
          },
        ],
      });

      headMock.mockResolvedValueOnce({});

      const result = await getLatestSnapshot();

      expect(result).toBeNull();
    });
  });
});
