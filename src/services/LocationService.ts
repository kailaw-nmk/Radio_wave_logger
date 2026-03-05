/** GPS位置情報取得サービス */

import * as Location from 'expo-location';
import { GPS_CONFIG } from '../constants';

/** 位置情報の結果 */
interface LocationResult {
  latitude: number;
  longitude: number;
  accuracy: number;
}

/** 位置情報パーミッションを要求する */
export async function requestLocationPermission(): Promise<boolean> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === 'granted';
}

/** 現在の位置情報を取得する */
export async function getCurrentLocation(): Promise<LocationResult | null> {
  try {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      return null;
    }

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
    return null;
  }
}
