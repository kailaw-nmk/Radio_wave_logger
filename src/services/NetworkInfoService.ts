/** ネットワーク情報取得サービス */

import NetInfo from '@react-native-community/netinfo';
import { Platform } from 'react-native';
import type { ConnectionType, CellularGeneration } from '../types';

/** ネットワーク情報の結果 */
interface NetworkInfoResult {
  connection_type: ConnectionType;
  cellular_gen: CellularGeneration | null;
  carrier: string | null;
  signal_dbm: number | null;
}

/** NetInfoの接続タイプをアプリの型に変換 */
function mapConnectionType(type: string): ConnectionType {
  switch (type) {
    case 'wifi':
      return 'wifi';
    case 'cellular':
      return 'cellular';
    case 'ethernet':
      return 'ethernet';
    case 'bluetooth':
      return 'bluetooth';
    case 'none':
      return 'none';
    default:
      return 'unknown';
  }
}

/** NetInfoのセルラー世代をアプリの型に変換 */
function mapCellularGeneration(
  gen: string | null | undefined,
): CellularGeneration | null {
  switch (gen) {
    case '2g':
      return '2g';
    case '3g':
      return '3g';
    case '4g':
      return '4g';
    case '5g':
      return '5g';
    default:
      return null;
  }
}

/** 現在のネットワーク情報を取得する */
export async function getNetworkInfo(): Promise<NetworkInfoResult> {
  try {
    const state = await NetInfo.fetch();
    const connectionType = mapConnectionType(state.type);

    let cellularGen: CellularGeneration | null = null;
    let carrier: string | null = null;
    const signalDbm: number | null = null;

    if (state.type === 'cellular' && state.details) {
      cellularGen = mapCellularGeneration(state.details.cellularGeneration);
      // キャリア名はAndroidのみ取得可能 (iOS 16以降は取得不可)
      if (Platform.OS === 'android') {
        carrier = state.details.carrier ?? null;
      }
    }

    // 電波強度 (dBm) はNetInfoからは直接取得不可
    // Android: 将来的にNative Moduleで対応可能
    // iOS: 取得不可

    return {
      connection_type: connectionType,
      cellular_gen: cellularGen,
      carrier,
      signal_dbm: signalDbm,
    };
  } catch {
    return {
      connection_type: 'unknown',
      cellular_gen: null,
      carrier: null,
      signal_dbm: null,
    };
  }
}
