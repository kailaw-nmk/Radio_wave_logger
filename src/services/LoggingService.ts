/** CSV書き込み・読み込みサービス */

import { File, Directory, Paths } from 'expo-file-system';
import type { MeasurementRecord, LogFileInfo } from '../types';
import { CSV_CONFIG } from '../constants';
import { buildCsvHeader, buildCsvLine } from '../utils/csv';

/** ログ保存ディレクトリを取得する */
function getLogDir(): Directory {
  return new Directory(Paths.document, CSV_CONFIG.SAVE_DIR);
}

/** ログディレクトリの存在を保証する */
export function ensureLogDirectory(): void {
  const dir = getLogDir();
  if (!dir.exists) {
    dir.create({ intermediates: true });
  }
}

/** 新しいログファイルを作成する (BOM + ヘッダー行) */
export function createLogFile(sessionId: string): string {
  ensureLogDirectory();
  const fileName = `${CSV_CONFIG.FILE_PREFIX}${sessionId}${CSV_CONFIG.FILE_EXTENSION}`;
  const file = new File(getLogDir(), fileName);
  const header = buildCsvHeader();
  file.create();
  file.write(header);
  return file.uri;
}

/** ログファイルにレコードを追記する */
export function appendRecord(
  fileUri: string,
  record: MeasurementRecord,
): void {
  const file = new File(fileUri);
  const line = buildCsvLine(record);
  const handle = file.open();
  handle.offset = handle.size;
  const encoder = new TextEncoder();
  handle.writeBytes(encoder.encode(line));
  handle.close();
}

/** ファイルの行数からレコード数を算出する (ヘッダー行を除く) */
function countRecords(content: string): number {
  const lines = content.split('\n').filter((l) => l.trim().length > 0);
  return Math.max(0, lines.length - 1);
}

/** 最初と最後のタイムスタンプを取得する */
function extractPeriod(content: string): { start: string; end: string } {
  const lines = content.split('\n').filter((l) => l.trim().length > 0);
  if (lines.length <= 1) {
    return { start: '', end: '' };
  }
  const firstData = lines[1].split(',')[0] ?? '';
  const lastData = lines[lines.length - 1].split(',')[0] ?? '';
  return { start: firstData, end: lastData };
}

/** ログファイル一覧を取得する */
export function getLogFiles(): LogFileInfo[] {
  ensureLogDirectory();
  const dir = getLogDir();
  const entries = dir.list();

  const logFiles: LogFileInfo[] = [];

  for (const entry of entries) {
    if (!(entry instanceof File)) continue;
    const fileName = entry.name;
    if (
      !fileName.startsWith(CSV_CONFIG.FILE_PREFIX) ||
      !fileName.endsWith(CSV_CONFIG.FILE_EXTENSION)
    ) {
      continue;
    }

    const content = entry.textSync();
    const { start, end } = extractPeriod(content);

    logFiles.push({
      fileName,
      filePath: entry.uri,
      fileSize: entry.size,
      recordCount: countRecords(content),
      periodStart: start,
      periodEnd: end,
      createdAt: fileName
        .replace(CSV_CONFIG.FILE_PREFIX, '')
        .replace(CSV_CONFIG.FILE_EXTENSION, ''),
    });
  }

  // 新しい順にソート
  logFiles.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return logFiles;
}

/** ログファイルを削除する */
export function deleteLogFile(fileUri: string): void {
  const file = new File(fileUri);
  if (file.exists) {
    file.delete();
  }
}
