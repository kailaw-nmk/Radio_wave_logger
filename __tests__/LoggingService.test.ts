import {
  createLogFile,
  appendRecord,
  getLogFiles,
  deleteLogFile,
  ensureLogDirectory,
} from '../src/services/LoggingService';
import { __resetStore, __getFileContent } from '../__mocks__/expo-file-system';
import type { MeasurementRecord } from '../src/types';

/** テスト用レコード */
function createTestRecord(overrides?: Partial<MeasurementRecord>): MeasurementRecord {
  return {
    timestamp: '2025-01-15T10:30:00.000Z',
    latitude: 35.6762,
    longitude: 139.6503,
    accuracy: 10.5,
    download_mbps: 50.3,
    upload_mbps: 20.1,
    ping_ms: 15,
    connection_type: 'cellular',
    cellular_gen: '4g',
    carrier: 'docomo',
    signal_dbm: -75,
    memo: 'テスト',
    session_id: 'netlog_20250115_103000',
    ...overrides,
  };
}

describe('LoggingService', () => {
  beforeEach(() => {
    __resetStore();
  });

  describe('createLogFile', () => {
    it('ログファイルを作成しURIを返す', () => {
      const uri = createLogFile('20250115_103000');
      expect(uri).toContain('netlog_20250115_103000.csv');
    });

    it('作成されたファイルにBOM付きヘッダーが書き込まれる', () => {
      const uri = createLogFile('20250115_103000');
      const content = __getFileContent(uri);
      expect(content).toBeDefined();
      // BOM
      expect(content!.charCodeAt(0)).toBe(0xFEFF);
      // ヘッダーカラム
      expect(content).toContain('timestamp');
      expect(content).toContain('download_mbps');
    });
  });

  describe('appendRecord', () => {
    it('ファイルにレコード行を追記する', () => {
      const uri = createLogFile('20250115_103000');
      const record = createTestRecord();
      appendRecord(uri, record);

      const content = __getFileContent(uri);
      expect(content).toContain('2025-01-15T10:30:00.000Z');
      expect(content).toContain('35.6762');
      expect(content).toContain('50.3');
    });

    it('複数レコードを順次追記できる', () => {
      const uri = createLogFile('20250115_103000');
      appendRecord(uri, createTestRecord({ timestamp: '2025-01-15T10:30:00.000Z' }));
      appendRecord(uri, createTestRecord({ timestamp: '2025-01-15T10:35:00.000Z' }));

      const content = __getFileContent(uri)!;
      const lines = content.split('\n').filter((l) => l.trim().length > 0);
      // ヘッダー1行 + データ2行
      expect(lines.length).toBe(3);
    });
  });

  describe('getLogFiles', () => {
    it('ログファイル一覧を取得する', () => {
      createLogFile('20250115_103000');
      createLogFile('20250115_120000');

      const files = getLogFiles();
      expect(files.length).toBe(2);
    });

    it('新しい順にソートされる', () => {
      createLogFile('20250115_103000');
      createLogFile('20250116_120000');

      const files = getLogFiles();
      expect(files[0].fileName).toContain('20250116');
      expect(files[1].fileName).toContain('20250115');
    });

    it('レコード数と期間情報を含む', () => {
      const uri = createLogFile('20250115_103000');
      appendRecord(uri, createTestRecord({ timestamp: '2025-01-15T10:30:00.000Z' }));
      appendRecord(uri, createTestRecord({ timestamp: '2025-01-15T10:35:00.000Z' }));

      const files = getLogFiles();
      expect(files[0].recordCount).toBe(2);
      expect(files[0].periodStart).toBe('2025-01-15T10:30:00.000Z');
      expect(files[0].periodEnd).toBe('2025-01-15T10:35:00.000Z');
    });

    it('ログファイルがない場合は空配列を返す', () => {
      const files = getLogFiles();
      expect(files).toEqual([]);
    });
  });

  describe('deleteLogFile', () => {
    it('ファイルを削除する', () => {
      const uri = createLogFile('20250115_103000');
      expect(getLogFiles().length).toBe(1);

      deleteLogFile(uri);
      expect(getLogFiles().length).toBe(0);
    });

    it('存在しないファイルを削除してもエラーにならない', () => {
      expect(() => deleteLogFile('file:///nonexistent')).not.toThrow();
    });
  });
});
