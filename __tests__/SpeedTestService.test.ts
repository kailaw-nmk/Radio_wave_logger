import {
  CloudflareSpeedTestProvider,
  measureAll,
} from '../src/services/SpeedTestService';
import type { ISpeedTestProvider } from '../src/types';

// fetchをモック
const originalFetch = global.fetch;

beforeAll(() => {
  // performance.nowをモック (Node.jsにも存在するが念のため)
  if (!global.performance) {
    (global as Record<string, unknown>).performance = { now: () => Date.now() };
  }
});

afterEach(() => {
  global.fetch = originalFetch;
});

describe('SpeedTestService', () => {
  describe('CloudflareSpeedTestProvider', () => {
    it('プロバイダー名がCloudflareである', () => {
      const provider = new CloudflareSpeedTestProvider();
      expect(provider.providerName).toBe('Cloudflare');
    });

    it('テストデータサイズを変更できる', () => {
      const provider = new CloudflareSpeedTestProvider('light');
      // エラーなく呼び出せることを確認
      expect(() => provider.setTestDataSize('standard')).not.toThrow();
    });

    describe('measurePing', () => {
      it('fetchが成功した場合、Ping値を返す', async () => {
        global.fetch = jest.fn().mockResolvedValue(new Response(''));
        const provider = new CloudflareSpeedTestProvider();
        const ping = await provider.measurePing();
        expect(ping).toBeGreaterThanOrEqual(0);
        expect(typeof ping).toBe('number');
      });

      it('fetchが失敗した場合、nullを返す', async () => {
        global.fetch = jest.fn().mockRejectedValue(new Error('network error'));
        const provider = new CloudflareSpeedTestProvider();
        const ping = await provider.measurePing();
        expect(ping).toBeNull();
      });
    });

    describe('measureDownload', () => {
      it('fetchが成功した場合、Mbps値を返す', async () => {
        const mockBlob = { size: 1_000_000 };
        global.fetch = jest.fn().mockResolvedValue({
          blob: () => Promise.resolve(mockBlob),
        });
        const provider = new CloudflareSpeedTestProvider('light');
        const speed = await provider.measureDownload();
        expect(speed).toBeGreaterThan(0);
        expect(typeof speed).toBe('number');
      });

      it('fetchが失敗した場合、nullを返す', async () => {
        global.fetch = jest.fn().mockRejectedValue(new Error('timeout'));
        const provider = new CloudflareSpeedTestProvider();
        const speed = await provider.measureDownload();
        expect(speed).toBeNull();
      });
    });

    describe('measureUpload', () => {
      it('fetchが成功した場合、Mbps値を返す', async () => {
        global.fetch = jest.fn().mockResolvedValue(new Response(''));
        const provider = new CloudflareSpeedTestProvider('light');
        const speed = await provider.measureUpload();
        expect(speed).toBeGreaterThan(0);
        expect(typeof speed).toBe('number');
      });

      it('fetchが失敗した場合、nullを返す', async () => {
        global.fetch = jest.fn().mockRejectedValue(new Error('timeout'));
        const provider = new CloudflareSpeedTestProvider();
        const speed = await provider.measureUpload();
        expect(speed).toBeNull();
      });
    });
  });

  describe('measureAll', () => {
    it('全テスト結果をまとめて返す', async () => {
      const mockProvider: ISpeedTestProvider = {
        providerName: 'Mock',
        measurePing: jest.fn().mockResolvedValue(10),
        measureDownload: jest.fn().mockResolvedValue(50),
        measureUpload: jest.fn().mockResolvedValue(20),
      };

      const result = await measureAll(mockProvider);
      expect(result).toEqual({
        ping_ms: 10,
        download_mbps: 50,
        upload_mbps: 20,
      });
    });

    it('部分的に失敗しても他の結果を返す', async () => {
      const mockProvider: ISpeedTestProvider = {
        providerName: 'Mock',
        measurePing: jest.fn().mockResolvedValue(null),
        measureDownload: jest.fn().mockResolvedValue(50),
        measureUpload: jest.fn().mockResolvedValue(null),
      };

      const result = await measureAll(mockProvider);
      expect(result).toEqual({
        ping_ms: null,
        download_mbps: 50,
        upload_mbps: null,
      });
    });

    it('Ping → Download → Upload の順で実行される', async () => {
      const callOrder: string[] = [];
      const mockProvider: ISpeedTestProvider = {
        providerName: 'Mock',
        measurePing: jest.fn().mockImplementation(async () => {
          callOrder.push('ping');
          return 10;
        }),
        measureDownload: jest.fn().mockImplementation(async () => {
          callOrder.push('download');
          return 50;
        }),
        measureUpload: jest.fn().mockImplementation(async () => {
          callOrder.push('upload');
          return 20;
        }),
      };

      await measureAll(mockProvider);
      expect(callOrder).toEqual(['ping', 'download', 'upload']);
    });
  });
});
