/** 設定管理フック */

import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
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

  // 画面フォーカス時に設定を再読み込みする
  useFocusEffect(
    useCallback(() => {
      loadSettings();
    }, []),
  );

  async function loadSettings(): Promise<void> {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (json) {
        const saved = JSON.parse(json) as Record<string, unknown>;
        // 旧フォーマット移行: pollingIntervalMinutes → pollingIntervalSeconds
        if ('pollingIntervalMinutes' in saved && !('pollingIntervalSeconds' in saved)) {
          saved.pollingIntervalSeconds = (saved.pollingIntervalMinutes as number) * 60;
          delete saved.pollingIntervalMinutes;
          await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(saved));
        }
        setSettings({ ...DEFAULT_SETTINGS, ...(saved as Partial<AppSettings>) });
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
