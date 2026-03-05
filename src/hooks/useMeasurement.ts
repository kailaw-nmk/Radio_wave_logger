/** 計測制御フック */

import { useReducer, useRef, useCallback } from 'react';
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

  /** 1回の計測を実行する */
  const performMeasurement = useCallback(async (): Promise<void> => {
    if (!filePathRef.current) return;

    try {
      // GPS取得 (権限エラーは個別ハンドリング)
      let location: { latitude: number; longitude: number; accuracy: number } | null = null;
      try {
        location = await getCurrentLocation();
      } catch (e) {
        if (e instanceof LocationError && e.code === 'PERMISSION_DENIED') {
          // 権限拒否: エラー表示するがポーリングは継続
          dispatch({ type: 'ERROR', message: e.message });
        }
        // GPS取得失敗でも速度測定は続行 (locationはnullのまま)
      }

      // ネットワーク情報取得
      const networkInfo = await getNetworkInfo();

      // 速度テストは順次実行 (Ping → Download → Upload)
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
    } catch {
      // 速度測定やファイル書き込みの致命的エラー
      // ポーリングは継続し、次回の計測で回復を試みる
      dispatch({ type: 'ERROR', message: '計測中にエラーが発生しました。次回の計測で再試行します。' });
    }
  }, []);

  /** 計測を開始する */
  const startMeasuring = useCallback(
    async (options: StartOptions): Promise<void> => {
      try {
        // テストデータサイズをプロバイダーに反映
        defaultSpeedTestProvider.setTestDataSize(
          options.testDataSize ?? 'light',
        );

        const sessionId = generateSessionId();
        const filePath = createLogFile(sessionId);
        filePathRef.current = filePath;
        countRef.current = 0;
        memoRef.current = options.memo ?? '';

        const session: MeasurementSession = {
          sessionId,
          startedAt: new Date().toISOString(),
          endedAt: null,
          measurementCount: 0,
          status: 'measuring',
        };

        dispatch({ type: 'START', session });

        // 最初の計測を即座に実行
        await performMeasurement();

        // ポーリング開始
        const intervalMs = options.intervalSeconds * 1000;
        intervalRef.current = setInterval(performMeasurement, intervalMs);
      } catch {
        dispatch({
          type: 'ERROR',
          message: '計測の開始に失敗しました。ストレージの空き容量を確認してください。',
        });
      }
    },
    [performMeasurement],
  );

  /** 計測を停止する */
  const stopMeasuring = useCallback((): void => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    filePathRef.current = null;
    dispatch({ type: 'STOP' });
  }, []);

  return {
    session: state.session,
    lastRecord: state.lastRecord,
    status: state.status,
    error: state.error,
    startMeasuring,
    stopMeasuring,
  };
}
