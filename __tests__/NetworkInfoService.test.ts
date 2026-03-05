import { getNetworkInfo } from '../src/services/NetworkInfoService';
import { __setMockState } from '../__mocks__/@react-native-community/netinfo';

describe('NetworkInfoService', () => {
  it('WiFi接続時の情報を返す', async () => {
    __setMockState({
      type: 'wifi',
      isConnected: true,
      details: null,
    });

    const info = await getNetworkInfo();
    expect(info.connection_type).toBe('wifi');
    expect(info.cellular_gen).toBeNull();
    expect(info.carrier).toBeNull();
  });

  it('セルラー接続時の世代情報を返す', async () => {
    __setMockState({
      type: 'cellular',
      isConnected: true,
      details: {
        cellularGeneration: '4g',
        carrier: 'docomo',
      },
    });

    const info = await getNetworkInfo();
    expect(info.connection_type).toBe('cellular');
    expect(info.cellular_gen).toBe('4g');
    // Platformモックは 'android' に設定されている
    expect(info.carrier).toBe('docomo');
  });

  it('5Gセルラーを正しく変換する', async () => {
    __setMockState({
      type: 'cellular',
      isConnected: true,
      details: {
        cellularGeneration: '5g',
        carrier: 'softbank',
      },
    });

    const info = await getNetworkInfo();
    expect(info.cellular_gen).toBe('5g');
  });

  it('未接続時の情報を返す', async () => {
    __setMockState({
      type: 'none',
      isConnected: false,
      details: null,
    });

    const info = await getNetworkInfo();
    expect(info.connection_type).toBe('none');
  });

  it('不明な接続タイプはunknownに変換される', async () => {
    __setMockState({
      type: 'wimax' as string,
      isConnected: true,
      details: null,
    });

    const info = await getNetworkInfo();
    expect(info.connection_type).toBe('unknown');
  });
});
