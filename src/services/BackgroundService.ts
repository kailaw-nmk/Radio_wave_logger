/** バックグラウンド計測サービス */

import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';

/** バックグラウンドタスク名 */
export const BACKGROUND_LOCATION_TASK = 'background-location-task';

/** バックグラウンドタスクのコールバック型 */
type LocationCallback = (locations: Location.LocationObject[]) => void;

/** 位置情報コールバックの登録先 */
let locationCallback: LocationCallback | null = null;

/** バックグラウンドタスクを定義する (アプリ起動時に1回呼ぶ) */
export function defineBackgroundTask(): void {
  if (TaskManager.isTaskDefined(BACKGROUND_LOCATION_TASK)) return;

  TaskManager.defineTask(BACKGROUND_LOCATION_TASK, async ({ data, error }) => {
    if (error) return;
    if (!data) return;

    const { locations } = data as { locations: Location.LocationObject[] };
    if (locationCallback && locations.length > 0) {
      locationCallback(locations);
    }
  });
}

/** 位置情報コールバックを登録する */
export function setLocationCallback(callback: LocationCallback | null): void {
  locationCallback = callback;
}

/** バックグラウンドパーミッションをリクエストする */
export async function requestBackgroundPermission(): Promise<boolean> {
  const { status: fgStatus } = await Location.requestForegroundPermissionsAsync();
  if (fgStatus !== 'granted') return false;

  const { status: bgStatus } = await Location.requestBackgroundPermissionsAsync();
  return bgStatus === 'granted';
}

/** バックグラウンド位置情報の追跡を開始する */
export async function startBackgroundTracking(
  intervalSeconds: number,
): Promise<boolean> {
  const hasPermission = await requestBackgroundPermission();
  if (!hasPermission) return false;

  const isTracking = await Location.hasStartedLocationUpdatesAsync(
    BACKGROUND_LOCATION_TASK,
  ).catch(() => false);

  if (isTracking) return true;

  await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
    accuracy: Location.Accuracy.High,
    timeInterval: intervalSeconds * 1000,
    distanceInterval: 0,
    // Android: フォアグラウンドサービス通知
    foregroundService: {
      notificationTitle: '通信品質計測中',
      notificationBody: '定期的に通信速度とGPS位置を記録しています',
      notificationColor: '#2196F3',
    },
    // iOS: バックグラウンド更新を有効化
    showsBackgroundLocationIndicator: true,
  });

  return true;
}

/** バックグラウンド位置情報の追跡を停止する */
export async function stopBackgroundTracking(): Promise<void> {
  const isTracking = await Location.hasStartedLocationUpdatesAsync(
    BACKGROUND_LOCATION_TASK,
  ).catch(() => false);

  if (isTracking) {
    await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
  }
  setLocationCallback(null);
}

/** バックグラウンドタスクが実行中か確認する */
export async function isBackgroundTrackingActive(): Promise<boolean> {
  return Location.hasStartedLocationUpdatesAsync(
    BACKGROUND_LOCATION_TASK,
  ).catch(() => false);
}
