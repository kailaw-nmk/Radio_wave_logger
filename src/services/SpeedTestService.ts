/** 速度測定サービス (Cloudflare Speed Test) */

import type { ISpeedTestProvider, SpeedTestResult, TestDataSize } from '../types';
import { CLOUDFLARE_SPEED_TEST } from '../constants';

/** bytes → Mbps 変換 */
function bytesToMbps(bytes: number, durationMs: number): number {
  if (durationMs <= 0) return 0;
  const bits = bytes * 8;
  const seconds = durationMs / 1000;
  return bits / seconds / 1_000_000;
}

/** タイムアウト付き fetch のヘルパー */
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

/** Cloudflare Speed Testプロバイダー */
export class CloudflareSpeedTestProvider implements ISpeedTestProvider {
  readonly providerName = 'Cloudflare';
  private testDataSize: TestDataSize;

  constructor(testDataSize: TestDataSize = 'light') {
    this.testDataSize = testDataSize;
  }

  /** テストデータサイズを変更する */
  setTestDataSize(size: TestDataSize): void {
    this.testDataSize = size;
  }

  /** Ping (RTT) を測定する (PING_COUNT回の中央値) */
  async measurePing(): Promise<number | null> {
    try {
      const results: number[] = [];

      for (let i = 0; i < CLOUDFLARE_SPEED_TEST.PING_COUNT; i++) {
        const start = performance.now();
        await fetchWithTimeout(
          `${CLOUDFLARE_SPEED_TEST.DOWNLOAD_URL}?bytes=0&_=${Date.now()}_${i}`,
          { method: 'GET', cache: 'no-store' },
          CLOUDFLARE_SPEED_TEST.TIMEOUT_MS,
        );
        const end = performance.now();
        results.push(end - start);
      }

      if (results.length === 0) return null;

      // 中央値を返す
      results.sort((a, b) => a - b);
      const mid = Math.floor(results.length / 2);
      return results.length % 2 === 0
        ? (results[mid - 1] + results[mid]) / 2
        : results[mid];
    } catch {
      return null;
    }
  }

  /** 下り速度を測定 (Mbps) */
  async measureDownload(): Promise<number | null> {
    try {
      const bytes = CLOUDFLARE_SPEED_TEST.TEST_SIZES[this.testDataSize];
      const url = `${CLOUDFLARE_SPEED_TEST.DOWNLOAD_URL}?bytes=${bytes}&_=${Date.now()}`;

      const start = performance.now();
      const response = await fetchWithTimeout(
        url,
        { method: 'GET', cache: 'no-store' },
        CLOUDFLARE_SPEED_TEST.TIMEOUT_MS,
      );

      // レスポンスボディを全て読み取る
      const blob = await response.blob();
      const end = performance.now();

      const actualBytes = blob.size || bytes;
      return bytesToMbps(actualBytes, end - start);
    } catch {
      return null;
    }
  }

  /** 上り速度を測定 (Mbps) */
  async measureUpload(): Promise<number | null> {
    try {
      const bytes = CLOUDFLARE_SPEED_TEST.TEST_SIZES[this.testDataSize];
      // ランダムデータを生成
      const data = new Uint8Array(bytes);

      const start = performance.now();
      await fetchWithTimeout(
        `${CLOUDFLARE_SPEED_TEST.UPLOAD_URL}?_=${Date.now()}`,
        {
          method: 'POST',
          body: data,
          headers: { 'Content-Type': 'application/octet-stream' },
        },
        CLOUDFLARE_SPEED_TEST.TIMEOUT_MS,
      );
      const end = performance.now();

      return bytesToMbps(bytes, end - start);
    } catch {
      return null;
    }
  }
}

/** 全速度テストを順次実行する (帯域を取り合わないよう直列) */
export async function measureAll(
  provider: ISpeedTestProvider,
): Promise<SpeedTestResult> {
  const ping_ms = await provider.measurePing();
  const download_mbps = await provider.measureDownload();
  const upload_mbps = await provider.measureUpload();

  return { download_mbps, upload_mbps, ping_ms };
}

/** デフォルトのプロバイダーインスタンス */
export const defaultSpeedTestProvider = new CloudflareSpeedTestProvider();
