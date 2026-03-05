/** @react-native-community/netinfo モック */

let mockState = {
  type: 'wifi',
  isConnected: true,
  details: null as Record<string, unknown> | null,
};

/** モック用: ネットワーク状態を変更 */
export function __setMockState(state: typeof mockState): void {
  mockState = state;
}

export default {
  fetch: async () => mockState,
};
