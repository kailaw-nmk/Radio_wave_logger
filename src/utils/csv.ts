/** CSV生成ユーティリティ */

import { CSV_COLUMNS, CSV_HEADER } from '../types';
import type { MeasurementRecord } from '../types';
import { CSV_CONFIG } from '../constants';

/** 値をCSVセル用文字列に変換 (null → "N/A") */
function toCsvCell(value: string | number | null): string {
  if (value === null || value === undefined) return 'N/A';
  const str = String(value);
  // カンマや改行を含む場合はダブルクォートで囲む
  if (str.includes(',') || str.includes('\n') || str.includes('"')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/** MeasurementRecordを1行のCSV文字列に変換 (改行なし) */
export function recordToCsvLine(record: MeasurementRecord): string {
  return CSV_COLUMNS.map((col) => toCsvCell(record[col])).join(',');
}

/** BOM付きCSVヘッダー行を生成 */
export function buildCsvHeader(): string {
  return CSV_CONFIG.BOM + CSV_HEADER + CSV_CONFIG.LINE_ENDING;
}

/** レコードをCSV行文字列に変換 (CRLF付き) */
export function buildCsvLine(record: MeasurementRecord): string {
  return recordToCsvLine(record) + CSV_CONFIG.LINE_ENDING;
}
