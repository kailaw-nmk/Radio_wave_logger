import {
  defineBackgroundTask,
  setLocationCallback,
  BACKGROUND_LOCATION_TASK,
} from '../src/services/BackgroundService';
import { __getTask, __resetTasks } from '../__mocks__/expo-task-manager';

// expo-location のバックグラウンド関連モック
jest.mock('expo-location', () => ({
  ...jest.requireActual('../__mocks__/expo-location'),
  requestBackgroundPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  hasStartedLocationUpdatesAsync: jest.fn().mockResolvedValue(false),
  startLocationUpdatesAsync: jest.fn().mockResolvedValue(undefined),
  stopLocationUpdatesAsync: jest.fn().mockResolvedValue(undefined),
  Accuracy: { High: 4 },
}));

describe('BackgroundService', () => {
  beforeEach(() => {
    __resetTasks();
  });

  describe('defineBackgroundTask', () => {
    it('タスクを定義する', () => {
      defineBackgroundTask();
      expect(__getTask(BACKGROUND_LOCATION_TASK)).toBeDefined();
    });

    it('二重定義しない', () => {
      defineBackgroundTask();
      const firstTask = __getTask(BACKGROUND_LOCATION_TASK);
      defineBackgroundTask();
      const secondTask = __getTask(BACKGROUND_LOCATION_TASK);
      expect(firstTask).toBe(secondTask);
    });
  });

  describe('タスクコールバック', () => {
    it('位置情報を受信するとコールバックが呼ばれる', () => {
      defineBackgroundTask();
      const callback = jest.fn();
      setLocationCallback(callback);

      const task = __getTask(BACKGROUND_LOCATION_TASK)!;
      const mockLocations = [
        { coords: { latitude: 35.68, longitude: 139.76, accuracy: 5 }, timestamp: Date.now() },
      ];
      task({ data: { locations: mockLocations }, error: null });

      expect(callback).toHaveBeenCalledWith(mockLocations);
    });

    it('エラーデータの場合コールバックは呼ばれない', () => {
      defineBackgroundTask();
      const callback = jest.fn();
      setLocationCallback(callback);

      const task = __getTask(BACKGROUND_LOCATION_TASK)!;
      task({ data: null, error: new Error('test') });

      expect(callback).not.toHaveBeenCalled();
    });

    it('コールバック未登録時はエラーにならない', () => {
      defineBackgroundTask();
      setLocationCallback(null);

      const task = __getTask(BACKGROUND_LOCATION_TASK)!;
      expect(() => {
        task({
          data: { locations: [{ coords: { latitude: 0, longitude: 0 } }] },
          error: null,
        });
      }).not.toThrow();
    });
  });
});
