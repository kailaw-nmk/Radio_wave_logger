/** GPS位置情報取得サービス */

import * as Location from 'expo-location';
import { GPS_CONFIG } from '../constants';

/** 位置情報の結果 */
export interface LocationResult {
  latitude: number;
  longitude: number;
  accuracy: number;
}

/** 位置情報取得エラー */
export class LocationError extends Error {
  constructor(
    message: string,
    public readonly code: 'PERMISSION_DENIED' | 'TIMEOUT' | 'UNAVAILABLE',
  ) {
    super(message);
    this.name = 'LocationError';
  }
}

/** 位置情報パーミッションを要求する */
export async function requestLocationPermission(): Promise<boolean> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === 'granted';
}

/** 現在の位置情報を取得する (エラー時はLocationErrorをthrow) */
export async function getCurrentLocation(): Promise<LocationResult | null> {
  const hasPermission = await requestLocationPermission();
  if (!hasPermission) {
    throw new LocationError(
      '位置情報の権限が許可されていません。設定アプリから位置情報の使用を許可してください。',
      'PERMISSION_DENIED',
    );
  }

  try {
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
      timeInterval: GPS_CONFIG.MAX_AGE_MS,
    });

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy ?? 0,
    };
  } catch {
    throw new LocationError(
      'GPS信号を取得できませんでした。屋外で再試行してください。',
      'UNAVAILABLE',
    );
  }
}
