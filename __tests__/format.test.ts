import {
  formatTimestamp,
  formatSpeed,
  formatPing,
  formatCoordinate,
  generateSessionId,
} from '../src/utils/format';

describe('format.ts', () => {
  describe('formatTimestamp', () => {
    it('DateオブジェクトをISO 8601文字列に変換する', () => {
      const date = new Date('2025-01-15T10:30:00.000Z');
      expect(formatTimestamp(date)).toBe('2025-01-15T10:30:00.000Z');
    });
  });

  describe('formatSpeed', () => {
    it('速度を小数点1桁のMbps表記に変換する', () => {
      expect(formatSpeed(50.3)).toBe('50.3 Mbps');
      expect(formatSpeed(0)).toBe('0.0 Mbps');
      expect(formatSpeed(100.15)).toBe('100.2 Mbps');
    });

    it('nullの場合はN/Aを返す', () => {
      expect(formatSpeed(null)).toBe('N/A');
    });
  });

  describe('formatPing', () => {
    it('Pingを整数のms表記に変換する', () => {
      expect(formatPing(15.3)).toBe('15 ms');
      expect(formatPing(0)).toBe('0 ms');
      expect(formatPing(100.9)).toBe('101 ms');
    });

    it('nullの場合はN/Aを返す', () => {
      expect(formatPing(null)).toBe('N/A');
    });
  });

  describe('formatCoordinate', () => {
    it('座標を小数点6桁に変換する', () => {
      expect(formatCoordinate(35.6762)).toBe('35.676200');
      expect(formatCoordinate(139.6503)).toBe('139.650300');
    });

    it('nullの場合はN/Aを返す', () => {
      expect(formatCoordinate(null)).toBe('N/A');
    });
  });

  describe('generateSessionId', () => {
    it('YYYYMMDD_HHmmss形式のIDを生成する', () => {
      const id = generateSessionId();
      expect(id).toMatch(/^\d{8}_\d{6}$/);
    });

    it('現在時刻ベースの値を返す', () => {
      const before = new Date();
      const id = generateSessionId();
      const after = new Date();

      const year = parseInt(id.substring(0, 4), 10);
      expect(year).toBeGreaterThanOrEqual(before.getFullYear());
      expect(year).toBeLessThanOrEqual(after.getFullYear());
    });
  });
});
