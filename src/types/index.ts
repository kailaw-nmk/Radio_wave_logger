// ============================================================
// Network Quality Logger - 型定義
// ============================================================

/** 1回の計測で取得する全データ */
export interface MeasurementRecord {
  /** 計測日時 (ISO 8601 UTC) */
  timestamp: string;
  /** GPS緯度 */
  latitude: number | null;
  /** GPS経度 */
  longitude: number | null;
  /** GPS精度 (メートル) */
  accuracy: number | null;
  /** 下り速度 (Mbps) */
  download_mbps: number | null;
  /** 上り速度 (Mbps) */
  upload_mbps: number | null;
  /** ラウンドトリップタイム (ms) */
  ping_ms: number | null;
  /** 接続種別 */
  connection_type: ConnectionType;
  /** セルラー世代 */
  cellular_gen: CellularGeneration | null;
  /** キャリア名 (Androidのみ) */
  carrier: string | null;
  /** 電波強度 dBm (Androidのみ) */
  signal_dbm: number | null;
  /** ユーザーメモ */
  memo: string;
}

/** 接続種別 */
export type ConnectionType = 'wifi' | 'cellular' | 'ethernet' | 'bluetooth' | 'none' | 'unknown';

/** セルラー世代 */
export type CellularGeneration = '2g' | '3g' | '4g' | '5g' | 'unknown';

/** アプリ設定 */
export interface AppSettings {
  /** ポーリング間隔 (分) */
  pollingIntervalMinutes: number;
  /** 送信先メールアドレス */
  emailAddress: string;
  /** テストデータサイズ */
  testDataSize: TestDataSize;
  /** メモテンプレート */
  memoTemplate: string;
}

/** テストデータサイズ */
export type TestDataSize = 'light' | 'standard';

/** 計測セッションの状態 */
export type MeasurementStatus = 'idle' | 'measuring' | 'paused' | 'error';

/** 計測セッション */
export interface MeasurementSession {
  /** セッションID (ファイル名のベース) */
  sessionId: string;
  /** 開始日時 */
  startedAt: string;
  /** 終了日時 */
  endedAt: string | null;
  /** 計測回数 */
  measurementCount: number;
  /** 現在の状態 */
  status: MeasurementStatus;
}

/** ログファイル情報 */
export interface LogFileInfo {
  /** ファイル名 */
  fileName: string;
  /** ファイルパス */
  filePath: string;
  /** ファイルサイズ (bytes) */
  fileSize: number;
  /** 計測回数 */
  recordCount: number;
  /** 計測期間 (開始) */
  periodStart: string;
  /** 計測期間 (終了) */
  periodEnd: string;
  /** 作成日時 */
  createdAt: string;
}

/** 速度測定サービスのインターフェース (プロバイダー交換可能) */
export interface ISpeedTestProvider {
  /** 下り速度を測定 (Mbps) */
  measureDownload(): Promise<number | null>;
  /** 上り速度を測定 (Mbps) */
  measureUpload(): Promise<number | null>;
  /** Ping (RTT) を測定 (ms) */
  measurePing(): Promise<number | null>;
  /** プロバイダー名 */
  readonly providerName: string;
}

/** 速度測定結果 */
export interface SpeedTestResult {
  download_mbps: number | null;
  upload_mbps: number | null;
  ping_ms: number | null;
}

/** CSVカラム定義 */
export const CSV_COLUMNS: (keyof MeasurementRecord)[] = [
  'timestamp',
  'latitude',
  'longitude',
  'accuracy',
  'download_mbps',
  'upload_mbps',
  'ping_ms',
  'connection_type',
  'cellular_gen',
  'carrier',
  'signal_dbm',
  'memo',
];

/** CSVヘッダー行 */
export const CSV_HEADER = CSV_COLUMNS.join(',');
