/** react-native モック (テスト用最小実装) */

export const Platform = {
  OS: 'android' as 'android' | 'ios' | 'web',
};

export const StyleSheet = {
  create: <T extends Record<string, unknown>>(styles: T): T => styles,
  hairlineWidth: 1,
};

export const Alert = {
  alert: jest.fn(),
};
