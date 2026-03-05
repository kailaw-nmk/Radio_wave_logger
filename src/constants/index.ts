import type { AppSettings, TestDataSize } from '../types';

/** アプリのデフォルト設定 */
export const DEFAULT_SETTINGS: AppSettings = {
  pollingIntervalSeconds: 300,
  emailAddress: '',
  testDataSize: 'light',
  memoTemplate: '',
};

/** ポーリング間隔の範囲 (秒) */
export const POLLING_INTERVAL = {
  MIN: 10,
  MAX: 3600,
  DEFAULT: 300,
} as const;

/** Cloudflare Speed Test エンドポイント */
export const CLOUDFLARE_SPEED_TEST = {
  /** ダウンロードテスト用URL (サイズはパラメータで指定) */
  DOWNLOAD_URL: 'https://speed.cloudflare.com/__down',
  /** アップロードテスト用URL */
  UPLOAD_URL: 'https://speed.cloudflare.com/__up',
  /** タイムアウト (ms) */
  TIMEOUT_MS: 30_000,
  /** テストデータサイズ (bytes) */
  TEST_SIZES: {
    light: 1_000_000,   // 1MB
    standard: 10_000_000, // 10MB
  } satisfies Record<TestDataSize, number>,
  /** Ping測定回数 */
  PING_COUNT: 3,
} as const;

/** GPS設定 */
export const GPS_CONFIG = {
  /** 精度 */
  ACCURACY: 'high' as const,
  /** タイムアウト (ms) */
  TIMEOUT_MS: 15_000,
  /** 最大キャッシュ年齢 (ms) */
  MAX_AGE_MS: 10_000,
} as const;

/** CSVファイル設定 */
export const CSV_CONFIG = {
  /** ファイル名プレフィックス */
  FILE_PREFIX: 'netlog_',
  /** ファイル拡張子 */
  FILE_EXTENSION: '.csv',
  /** BOM (UTF-8 Byte Order Mark) */
  BOM: '\uFEFF',
  /** 改行コード */
  LINE_ENDING: '\r\n',
  /** 保存ディレクトリ (expo-file-system documentDirectory 内) */
  SAVE_DIR: 'logs/',
} as const;

/** メール設定 */
export const MAIL_CONFIG = {
  /** 件名テンプレート */
  SUBJECT_TEMPLATE: 'Network Log: {startDate} - {endDate}',
} as const;

/** AsyncStorage キー */
export const STORAGE_KEYS = {
  SETTINGS: '@netlog/settings',
  CURRENT_SESSION: '@netlog/current_session',
} as const;
