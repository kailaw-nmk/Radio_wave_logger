/** expo-location モック */

export const Accuracy = {
  Lowest: 1,
  Low: 2,
  Balanced: 3,
  High: 4,
  Highest: 5,
  BestForNavigation: 6,
};

let mockPermissionStatus = 'granted';
let mockLocation = {
  coords: {
    latitude: 35.6762,
    longitude: 139.6503,
    accuracy: 10,
  },
};

/** モック用: パーミッション状態を変更 */
export function __setPermissionStatus(status: string): void {
  mockPermissionStatus = status;
}

/** モック用: 位置情報を変更 */
export function __setMockLocation(coords: {
  latitude: number;
  longitude: number;
  accuracy: number;
}): void {
  mockLocation = { coords };
}

export async function requestForegroundPermissionsAsync(): Promise<{
  status: string;
}> {
  return { status: mockPermissionStatus };
}

export async function getCurrentPositionAsync(): Promise<typeof mockLocation> {
  return mockLocation;
}
