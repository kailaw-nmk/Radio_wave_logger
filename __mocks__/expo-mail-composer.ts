/** expo-mail-composer モック */

export interface MailComposerResult {
  status: 'sent' | 'saved' | 'cancelled' | 'undetermined';
}

let mockAvailable = true;
let lastComposeArgs: unknown = null;

/** モック用: メール送信可否を変更 */
export function __setAvailable(available: boolean): void {
  mockAvailable = available;
}

/** モック用: 最後のcomposeAsync引数を取得 */
export function __getLastComposeArgs(): unknown {
  return lastComposeArgs;
}

export async function isAvailableAsync(): Promise<boolean> {
  return mockAvailable;
}

export async function composeAsync(
  options: Record<string, unknown>,
): Promise<MailComposerResult> {
  lastComposeArgs = options;
  return { status: 'sent' };
}
