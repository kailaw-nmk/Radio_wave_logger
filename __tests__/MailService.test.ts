import { sendLogByEmail, isMailAvailable } from '../src/services/MailService';
import {
  __setAvailable,
  __getLastComposeArgs,
} from '../__mocks__/expo-mail-composer';

describe('MailService', () => {
  describe('isMailAvailable', () => {
    it('メールが利用可能な場合trueを返す', async () => {
      __setAvailable(true);
      expect(await isMailAvailable()).toBe(true);
    });

    it('メールが利用不可の場合falseを返す', async () => {
      __setAvailable(false);
      expect(await isMailAvailable()).toBe(false);
    });
  });

  describe('sendLogByEmail', () => {
    beforeEach(() => {
      __setAvailable(true);
    });

    it('正しい引数でcomposeAsyncを呼び出す', async () => {
      const result = await sendLogByEmail({
        fileUri: 'file:///logs/netlog_20250115.csv',
        toAddress: 'test@example.com',
        periodStart: '2025-01-15',
        periodEnd: '2025-01-16',
      });

      expect(result.status).toBe('sent');

      const args = __getLastComposeArgs() as Record<string, unknown>;
      expect(args.recipients).toEqual(['test@example.com']);
      expect(args.subject).toContain('2025-01-15');
      expect(args.subject).toContain('2025-01-16');
      expect(args.attachments).toEqual(['file:///logs/netlog_20250115.csv']);
    });

    it('件名テンプレートが適用される', async () => {
      await sendLogByEmail({
        fileUri: 'file:///test.csv',
        toAddress: 'user@example.com',
        periodStart: '2025-03-01',
        periodEnd: '2025-03-05',
      });

      const args = __getLastComposeArgs() as Record<string, unknown>;
      expect(args.subject).toBe('Network Log: 2025-03-01 - 2025-03-05');
    });

    it('宛先が空の場合、recipientsは空配列', async () => {
      await sendLogByEmail({
        fileUri: 'file:///test.csv',
        toAddress: '',
        periodStart: '',
        periodEnd: '',
      });

      const args = __getLastComposeArgs() as Record<string, unknown>;
      expect(args.recipients).toEqual([]);
    });

    it('期間が空の場合、件名に「不明」が入る', async () => {
      await sendLogByEmail({
        fileUri: 'file:///test.csv',
        toAddress: 'test@example.com',
        periodStart: '',
        periodEnd: '',
      });

      const args = __getLastComposeArgs() as Record<string, unknown>;
      expect(args.subject).toContain('不明');
    });
  });
});
