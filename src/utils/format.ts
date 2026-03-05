/** 表示フォーマットユーティリティ */

/** 日付をISO 8601 UTC文字列に変換 */
export function formatTimestamp(date: Date): string {
  return date.toISOString();
}

/** 速度を表示用文字列に変換 */
export function formatSpeed(mbps: number | null): string {
  if (mbps === null) return 'N/A';
  return `${mbps.toFixed(1)} Mbps`;
}

/** Pingを表示用文字列に変換 */
export function formatPing(ms: number | null): string {
  if (ms === null) return 'N/A';
  return `${Math.round(ms)} ms`;
}

/** 座標を表示用文字列に変換 (小数点以下6桁) */
export function formatCoordinate(value: number | null): string {
  if (value === null) return 'N/A';
  return value.toFixed(6);
}

/** セッションID用の日時文字列を生成 (YYYYMMDD_HHmmss) */
export function generateSessionId(): string {
  const now = new Date();
  const y = now.getFullYear();
  const mo = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const h = String(now.getHours()).padStart(2, '0');
  const mi = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  return `${y}${mo}${d}_${h}${mi}${s}`;
}
