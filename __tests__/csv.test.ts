import { buildCsvHeader, buildCsvLine, recordToCsvLine } from '../src/utils/csv';
import type { MeasurementRecord } from '../src/types';
import { CSV_CONFIG } from '../src/constants';
import { CSV_HEADER } from '../src/types';

/** テスト用のレコード */
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
    memo: 'テスト計測',
    session_id: 'netlog_20250115_103000',
    ...overrides,
  };
}

describe('csv.ts', () => {
  describe('buildCsvHeader', () => {
    it('BOM付きヘッダー行を生成する', () => {
      const header = buildCsvHeader();
      expect(header.startsWith(CSV_CONFIG.BOM)).toBe(true);
      expect(header).toContain(CSV_HEADER);
      expect(header.endsWith(CSV_CONFIG.LINE_ENDING)).toBe(true);
    });

    it('全カラムを含む', () => {
      const header = buildCsvHeader();
      const columns = [
        'timestamp', 'latitude', 'longitude', 'accuracy',
        'download_mbps', 'upload_mbps', 'ping_ms',
        'connection_type', 'cellular_gen', 'carrier', 'signal_dbm', 'memo', 'session_id',
      ];
      for (const col of columns) {
        expect(header).toContain(col);
      }
    });
  });

  describe('recordToCsvLine', () => {
    it('全フィールドが揃ったレコードをCSV行に変換する', () => {
      const record = createTestRecord();
      const line = recordToCsvLine(record);
      expect(line).toBe(
        '2025-01-15T10:30:00.000Z,35.6762,139.6503,10.5,50.3,20.1,15,cellular,4g,docomo,-75,テスト計測,netlog_20250115_103000',
      );
    });

    it('null値はN/Aに変換される', () => {
      const record = createTestRecord({
        latitude: null,
        longitude: null,
        accuracy: null,
        download_mbps: null,
        upload_mbps: null,
        ping_ms: null,
        cellular_gen: null,
        carrier: null,
        signal_dbm: null,
      });
      const line = recordToCsvLine(record);
      expect(line).toContain('N/A');
      // null フィールド9個分のN/A
      const naCount = (line.match(/N\/A/g) ?? []).length;
      expect(naCount).toBe(9);
    });

    it('カンマを含む値はダブルクォートで囲まれる', () => {
      const record = createTestRecord({ memo: '東京,大阪' });
      const line = recordToCsvLine(record);
      expect(line).toContain('"東京,大阪"');
    });

    it('ダブルクォートを含む値はエスケープされる', () => {
      const record = createTestRecord({ memo: 'テスト"メモ' });
      const line = recordToCsvLine(record);
      expect(line).toContain('"テスト""メモ"');
    });
  });

  describe('buildCsvLine', () => {
    it('CRLF改行コード付きの行を生成する', () => {
      const record = createTestRecord();
      const line = buildCsvLine(record);
      expect(line.endsWith('\r\n')).toBe(true);
    });
  });
});
