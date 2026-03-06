/** 計測制御フック */

import { useReducer, useRef, useCallback, useEffect } from 'react';
import { AppState, Platform, type AppStateStatus } from 'react-native';
import type {
  MeasurementRecord,
  MeasurementSession,
  MeasurementStatus,
  TestDataSize,
} from '../types';
import { getCurrentLocation, LocationError } from '../services/LocationService';
import { getNetworkInfo } from '../services/NetworkInfoService';
import {
  defaultSpeedTestProvider,
  measureAll,
} from '../services/SpeedTestService';
import { createLogFile, appendRecord } from '../services/LoggingService';
import { formatTimestamp, generateSessionId } from '../utils/format';
import {
  setLocationCallback,
  startBackgroundTracking,
  stopBackgroundTracking,
  isBackgroundTrackingActive,
} from '../services/BackgroundService';
import {
  saveMeasurementState,
  loadMeasurementState,
  clearMeasurementState,
  updateMeasurementCount,
} from '../services/MeasurementStateStore';
import {
  activateKeepAwakeAsync,
  deactivateKeepAwake,
} from 'expo-keep-awake';

// --- State ---

interface MeasurementState {
  session: MeasurementSession | null;
  lastRecord: MeasurementRecord | null;
  status: MeasurementStatus;
  error: string | null;
}

const initialState: MeasurementState = {
  session: null,
  lastRecord: null,
  status: 'idle',
  error: null,
};

// --- Actions ---

type MeasurementAction =
  | { type: 'START'; session: MeasurementSession }
  | { type: 'RESTORE'; session: MeasurementSession }
  | { type: 'RECORD'; record: MeasurementRecord; count: number }
  | { type: 'STOP' }
  | { type: 'ERROR'; message: string }
  | { type: 'CLEAR_ERROR' };

function reducer(
  state: MeasurementState,
  action: MeasurementAction,
): MeasurementState {
  switch (action.type) {
    case 'START':
      return {
        ...state,
        session: action.session,
        status: 'measuring',
        error: null,
        lastRecord: null,
      };
    case 'RESTORE':
      return {
        ...state,
        session: action.session,
        status: 'measuring',
        error: null,
      };
    case 'RECORD':
      return {
        ...state,
        lastRecord: action.record,
        session: state.session
          ? { ...state.session, measurementCount: action.count }
          : null,
      };
    case 'STOP':
      return {
        ...state,
        status: 'idle',
        session: state.session
          ? { ...state.session, endedAt: new Date().toISOString(), status: 'idle' }
          : null,
      };
    case 'ERROR':
      return { ...state, status: 'error', error: action.message };
    case 'CLEAR_ERROR':
      return { ...state, error: null, status: 'idle' };
    default:
      return state;
  }
}

// --- Hook ---

/** 計測開始時のオプション */
interface StartOptions {
  intervalSeconds: number;
  memo?: string;
  testDataSize?: TestDataSize;
  keepScreenAwake?: boolean;
}

interface UseMeasurementReturn {
  /** 現在のセッション情報 */
  session: MeasurementSession | null;
  /** 最新の計測レコード */
  lastRecord: MeasurementRecord | null;
  /** 計測ステータス */
  status: MeasurementStatus;
  /** エラーメッセージ */
  error: string | null;
  /** 計測を開始する */
  startMeasuring: (options: StartOptions) => Promise<void>;
  /** 計測を停止する */
  stopMeasuring: () => void;
}

/** 計測制御フック */
export function useMeasurement(): UseMeasurementReturn {
  const [state, dispatch] = useReducer(reducer, initialState);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const filePathRef = useRef<string | null>(null);
  const countRef = useRef(0);
  const memoRef = useRef('');
  const isMeasuringRef = useRef(false);
  const intervalSecondsRef = useRef(0);
  const measurementInProgressRef = useRef(false);
  const lastMeasurementTimeRef = useRef(0);
  const keepScreenAwakeRef = useRef(false);

  /** 1回の計測を実行する */
  const performMeasurement = useCallback(async (preLocation?: {
    latitude: number; longitude: number; accuracy: number;
  }): Promise<void> => {
    if (!filePathRef.current) return;

    // 重複計測ガード
    if (measurementInProgressRef.current) return;
    const now = Date.now();
    const minGap = (intervalSecondsRef.current * 1000) / 2;
    if (now - lastMeasurementTimeRef.current < minGap) return;
    measurementInProgressRef.current = true;

    try {
      // GPS取得 (バックグラウンドから位置情報が渡された場合はそれを使用)
      let location: { latitude: number; longitude: number; accuracy: number } | null =
        preLocation ?? null;
      if (!location) {
        try {
          location = await getCurrentLocation();
        } catch (e) {
          if (e instanceof LocationError && e.code === 'PERMISSION_DENIED') {
            dispatch({ type: 'ERROR', message: e.message });
          }
        }
      }

      // ネットワーク情報取得
      const networkInfo = await getNetworkInfo();

      // 速度テスト
      const speedResult = await measureAll(defaultSpeedTestProvider);

      const record: MeasurementRecord = {
        timestamp: formatTimestamp(new Date()),
        latitude: location?.latitude ?? null,
        longitude: location?.longitude ?? null,
        accuracy: location?.accuracy ?? null,
        download_mbps: speedResult.download_mbps,
        upload_mbps: speedResult.upload_mbps,
        ping_ms: speedResult.ping_ms,
        connection_type: networkInfo.connection_type,
        cellular_gen: networkInfo.cellular_gen,
        carrier: networkInfo.carrier,
        signal_dbm: networkInfo.signal_dbm,
        memo: memoRef.current,
      };

      appendRecord(filePathRef.current, record);
      countRef.current += 1;
      dispatch({ type: 'RECORD', record, count: countRef.current });

      // 永続化された計測回数を更新
      updateMeasurementCount(countRef.current);
    } catch {
      dispatch({ type: 'ERROR', message: '計測中にエラーが発生しました。次回の計測で再試行します。' });
    } finally {
      measurementInProgressRef.current = false;
      lastMeasurementTimeRef.current = Date.now();
    }
  }, []);

  /** フォアグラウンドタイマーを開始する */
  const startForegroundTimer = useCallback(
    (intervalSeconds: number) => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      const intervalMs = intervalSeconds * 1000;
      intervalRef.current = setInterval(performMeasurement, intervalMs);
    },
    [performMeasurement],
  );

  /** フォアグラウンドタイマーを停止する */
  const stopForegroundTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  /** バックグラウンド復帰時にセッションを復元する */
  const restoreSession = useCallback(async (): Promise<void> => {
    // 既にフック側で計測中なら何もしない
    if (isMeasuringRef.current) return;

    const persisted = await loadMeasurementState();
    if (!persisted) return;

    // バックグラウンドタスクがまだ動いているか確認
    const bgActive = await isBackgroundTrackingActive();
    if (!bgActive) {
      // バックグラウンドタスクが停止していたら永続状態もクリア
      await clearMeasurementState();
      return;
    }

    // 計測状態を復元
    filePathRef.current = persisted.filePath;
    countRef.current = persisted.measurementCount;
    memoRef.current = persisted.memo;
    intervalSecondsRef.current = persisted.intervalSeconds;
    isMeasuringRef.current = true;

    // テストデータサイズを復元
    defaultSpeedTestProvider.setTestDataSize(persisted.testDataSize);

    // keepScreenAwakeを復元
    keepScreenAwakeRef.current = persisted.keepScreenAwake ?? false;
    if (keepScreenAwakeRef.current) {
      activateKeepAwakeAsync('measurement');
    }

    const session: MeasurementSession = {
      sessionId: persisted.sessionId,
      startedAt: persisted.startedAt,
      endedAt: null,
      measurementCount: persisted.measurementCount,
      status: 'measuring',
    };
    dispatch({ type: 'RESTORE', session });

    // バックグラウンドタスクのコールバックを再登録 (位置情報を直接渡す)
    setLocationCallback((locations) => {
      const loc = locations[locations.length - 1];
      performMeasurement({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        accuracy: loc.coords.accuracy ?? 0,
      });
    });

    // フォアグラウンドタイマーを再開
    startForegroundTimer(persisted.intervalSeconds);
  }, [performMeasurement, startForegroundTimer]);

  // マウント時にセッション復元を試みる
  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  // AppState監視: フォアグラウンド復帰時にタイマー再開・セッション復元
  useEffect(() => {
    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        if (isMeasuringRef.current) {
          // 計測中ならフォアグラウンドタイマーを再開
          startForegroundTimer(intervalSecondsRef.current);
        } else {
          // 計測中でなければ復元を試みる (OSにコンポーネントが破棄された場合)
          restoreSession();
        }
      } else if (nextState === 'background') {
        // iOS: JSスレッドが停止するためタイマーを停止
        // Android: フォアグラウンドサービスがプロセスを維持するためタイマーを継続
        if (Platform.OS === 'ios') {
          stopForegroundTimer();
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
    };
  }, [restoreSession, startForegroundTimer, stopForegroundTimer]);

  // アンマウント時はフォアグラウンドタイマーのみ停止
  // バックグラウンドトラッキングは停止しない (明示的な停止ボタンでのみ停止)
  useEffect(() => {
    return () => {
      stopForegroundTimer();
    };
  }, [stopForegroundTimer]);

  /** 計測を開始する */
  const startMeasuring = useCallback(
    async (options: StartOptions): Promise<void> => {
      try {
        const testDataSize = options.testDataSize ?? 'light';
        const keepAwake = options.keepScreenAwake ?? false;
        defaultSpeedTestProvider.setTestDataSize(testDataSize);
        keepScreenAwakeRef.current = keepAwake;

        // 画面点灯維持
        if (keepAwake) {
          await activateKeepAwakeAsync('measurement');
        }

        const sessionId = generateSessionId();
        const filePath = createLogFile(sessionId);
        filePathRef.current = filePath;
        countRef.current = 0;
        memoRef.current = options.memo ?? '';
        intervalSecondsRef.current = options.intervalSeconds;

        const session: MeasurementSession = {
          sessionId,
          startedAt: new Date().toISOString(),
          endedAt: null,
          measurementCount: 0,
          status: 'measuring',
        };

        dispatch({ type: 'START', session });

        // 永続化
        await saveMeasurementState({
          sessionId,
          filePath,
          startedAt: session.startedAt,
          measurementCount: 0,
          memo: memoRef.current,
          intervalSeconds: options.intervalSeconds,
          testDataSize,
          keepScreenAwake: keepAwake,
        });

        // 最初の計測を即座に実行
        await performMeasurement();

        // バックグラウンド位置情報トラッキングを開始 (位置情報を直接渡す)
        setLocationCallback((locations) => {
          const loc = locations[locations.length - 1];
          performMeasurement({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            accuracy: loc.coords.accuracy ?? 0,
          });
        });

        const bgStarted = await startBackgroundTracking(options.intervalSeconds);
        isMeasuringRef.current = true;

        if (!bgStarted) {
          dispatch({
            type: 'ERROR',
            message: 'バックグラウンド権限が未許可のため、アプリがバックグラウンド時に計測が停止する可能性があります。',
          });
        }

        // フォアグラウンド補助タイマー
        startForegroundTimer(options.intervalSeconds);
      } catch {
        dispatch({
          type: 'ERROR',
          message: '計測の開始に失敗しました。ストレージの空き容量を確認してください。',
        });
      }
    },
    [performMeasurement, startForegroundTimer],
  );

  /** 計測を停止する */
  const stopMeasuring = useCallback((): void => {
    stopForegroundTimer();
    // バックグラウンドトラッキングを停止
    stopBackgroundTracking();
    isMeasuringRef.current = false;
    filePathRef.current = null;
    // 画面点灯維持を解除
    if (keepScreenAwakeRef.current) {
      deactivateKeepAwake('measurement');
      keepScreenAwakeRef.current = false;
    }
    // 永続化をクリア
    clearMeasurementState();
    dispatch({ type: 'STOP' });
  }, [stopForegroundTimer]);

  return {
    session: state.session,
    lastRecord: state.lastRecord,
    status: state.status,
    error: state.error,
    startMeasuring,
    stopMeasuring,
  };
}
