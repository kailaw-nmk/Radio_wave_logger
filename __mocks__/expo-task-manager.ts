/** expo-task-manager モック */

const definedTasks: Map<string, (body: { data: unknown; error: unknown }) => void> = new Map();

export function isTaskDefined(taskName: string): boolean {
  return definedTasks.has(taskName);
}

export function defineTask(
  taskName: string,
  callback: (body: { data: unknown; error: unknown }) => void,
): void {
  definedTasks.set(taskName, callback);
}

/** モック用: 定義されたタスクを取得 */
export function __getTask(taskName: string) {
  return definedTasks.get(taskName);
}

/** モック用: リセット */
export function __resetTasks(): void {
  definedTasks.clear();
}
