/** 設定管理フック */

import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppSettings } from '../types';
import { DEFAULT_SETTINGS, STORAGE_KEYS } from '../constants';

interface UseSettingsReturn {
  /** 現在の設定値 */
  settings: AppSettings;
  /** 設定を部分更新する */
  updateSettings: (partial: Partial<AppSettings>) => Promise<void>;
  /** 読み込み中フラグ */
  isLoading: boolean;
}

/** アプリ設定の読み書きフック */
export function useSettings(): UseSettingsReturn {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // 起動時に設定を読み込む
  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings(): Promise<void> {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (json) {
        const saved = JSON.parse(json) as Partial<AppSettings>;
        setSettings({ ...DEFAULT_SETTINGS, ...saved });
      }
    } catch {
      // 読み込み失敗時はデフォルト値を使用
    } finally {
      setIsLoading(false);
    }
  }

  const updateSettings = useCallback(
    async (partial: Partial<AppSettings>): Promise<void> => {
      const updated = { ...settings, ...partial };
      setSettings(updated);
      await AsyncStorage.setItem(
        STORAGE_KEYS.SETTINGS,
        JSON.stringify(updated),
      );
    },
    [settings],
  );

  return { settings, updateSettings, isLoading };
}
