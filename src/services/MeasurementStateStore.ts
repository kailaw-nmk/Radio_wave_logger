/** 計測状態の永続化ストア */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { TestDataSize } from '../types';

const STORAGE_KEY = 'measurement_active_session';

/** 永続化する計測セッション情報 */
export interface PersistedMeasurementState {
  sessionId: string;
  filePath: string;
  startedAt: string;
  measurementCount: number;
  memo: string;
  intervalSeconds: number;
  testDataSize: TestDataSize;
  keepScreenAwake: boolean;
}

/** 計測状態を保存する */
export async function saveMeasurementState(
  state: PersistedMeasurementState,
): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/** 計測状態を読み込む (なければnull) */
export async function loadMeasurementState(): Promise<PersistedMeasurementState | null> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PersistedMeasurementState;
  } catch {
    return null;
  }
}

/** 計測状態をクリアする */
export async function clearMeasurementState(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}

/** 計測回数を更新する */
export async function updateMeasurementCount(count: number): Promise<void> {
  const state = await loadMeasurementState();
  if (state) {
    state.measurementCount = count;
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
}
