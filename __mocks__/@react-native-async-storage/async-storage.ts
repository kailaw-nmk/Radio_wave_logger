/** @react-native-async-storage/async-storage モック */

const store: Map<string, string> = new Map();

/** モック用: ストアをリセットする */
export function __resetStore(): void {
  store.clear();
}

export default {
  getItem: async (key: string): Promise<string | null> => {
    return store.get(key) ?? null;
  },
  setItem: async (key: string, value: string): Promise<void> => {
    store.set(key, value);
  },
  removeItem: async (key: string): Promise<void> => {
    store.delete(key);
  },
};
