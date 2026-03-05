/** メール送信サービス */

import * as MailComposer from 'expo-mail-composer';
import { MAIL_CONFIG } from '../constants';

/** メール送信オプション */
interface SendLogOptions {
  /** CSVファイルのURI */
  fileUri: string;
  /** 宛先メールアドレス */
  toAddress: string;
  /** 計測期間 (開始) */
  periodStart: string;
  /** 計測期間 (終了) */
  periodEnd: string;
}

/** 件名テンプレートを適用する */
function buildSubject(periodStart: string, periodEnd: string): string {
  return MAIL_CONFIG.SUBJECT_TEMPLATE
    .replace('{startDate}', periodStart || '不明')
    .replace('{endDate}', periodEnd || '不明');
}

/** メールが送信可能かチェックする */
export async function isMailAvailable(): Promise<boolean> {
  return MailComposer.isAvailableAsync();
}

/** テストメールを送信する */
export async function sendTestEmail(
  toAddress: string,
): Promise<MailComposer.MailComposerResult> {
  return MailComposer.composeAsync({
    recipients: [toAddress],
    subject: 'Radio Wave Logger テストメール',
    body: 'メール送信のテストです。このメールが届いていれば、ログファイルの送信設定は正常です。',
  });
}

/** ログファイルをメールで送信する */
export async function sendLogByEmail(
  options: SendLogOptions,
): Promise<MailComposer.MailComposerResult> {
  const { fileUri, toAddress, periodStart, periodEnd } = options;

  const subject = buildSubject(periodStart, periodEnd);
  const recipients = toAddress ? [toAddress] : [];

  return MailComposer.composeAsync({
    recipients,
    subject,
    body: '計測ログファイルを添付します。',
    attachments: [fileUri],
  });
}
