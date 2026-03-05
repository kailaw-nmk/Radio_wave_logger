import {
  getCurrentLocation,
  requestLocationPermission,
  LocationError,
} from '../src/services/LocationService';
import { __setPermissionStatus, __setMockLocation } from '../__mocks__/expo-location';

describe('LocationService', () => {
  describe('requestLocationPermission', () => {
    it('許可された場合trueを返す', async () => {
      __setPermissionStatus('granted');
      expect(await requestLocationPermission()).toBe(true);
    });

    it('拒否された場合falseを返す', async () => {
      __setPermissionStatus('denied');
      expect(await requestLocationPermission()).toBe(false);
    });
  });

  describe('getCurrentLocation', () => {
    it('パーミッション許可時、位置情報を返す', async () => {
      __setPermissionStatus('granted');
      __setMockLocation({
        latitude: 35.6762,
        longitude: 139.6503,
        accuracy: 10,
      });

      const result = await getCurrentLocation();
      expect(result).not.toBeNull();
      expect(result!.latitude).toBe(35.6762);
      expect(result!.longitude).toBe(139.6503);
      expect(result!.accuracy).toBe(10);
    });

    it('パーミッション拒否時、LocationErrorをthrowする', async () => {
      __setPermissionStatus('denied');
      await expect(getCurrentLocation()).rejects.toThrow(LocationError);
      await expect(getCurrentLocation()).rejects.toThrow('位置情報の権限が許可されていません');
    });

    it('LocationErrorのcodeがPERMISSION_DENIEDである', async () => {
      __setPermissionStatus('denied');
      try {
        await getCurrentLocation();
        fail('エラーがthrowされるべき');
      } catch (e) {
        expect(e).toBeInstanceOf(LocationError);
        expect((e as LocationError).code).toBe('PERMISSION_DENIED');
      }
    });
  });
});
