import { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import { useSettings } from '../src/hooks/useSettings';
import { POLLING_INTERVAL } from '../src/constants';
import type { TestDataSize } from '../src/types';
import { isMailAvailable, sendTestEmail } from '../src/services/MailService';

/** 設定画面 */
export default function SettingsScreen() {
  const { settings, updateSettings, isLoading } = useSettings();

  async function handleSendTestEmail() {
    const available = await isMailAvailable();
    if (!available) {
      Alert.alert('エラー', 'この端末ではメール送信ができません');
      return;
    }
    try {
      await sendTestEmail(settings.emailAddress);
    } catch {
      Alert.alert('エラー', 'テストメールの送信に失敗しました');
    }
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {/* ポーリング間隔 */}
      <IntervalSection
        value={settings.pollingIntervalSeconds}
        onChange={(v) => updateSettings({ pollingIntervalSeconds: v })}
      />

      {/* テストデータサイズ */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>テストデータサイズ</Text>
        <View style={styles.segmentContainer}>
          <SegmentButton
            label="Light (1 MB)"
            selected={settings.testDataSize === 'light'}
            onPress={() => updateSettings({ testDataSize: 'light' })}
          />
          <SegmentButton
            label="Standard (10 MB)"
            selected={settings.testDataSize === 'standard'}
            onPress={() => updateSettings({ testDataSize: 'standard' })}
          />
        </View>
        <Text style={styles.hint}>
          Lightは通信量を節約できますが、精度が下がります
        </Text>
      </View>

      {/* メールアドレス */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>送信先メールアドレス</Text>
        <TextInput
          style={styles.textInput}
          value={settings.emailAddress}
          onChangeText={(text) => updateSettings({ emailAddress: text })}
          placeholder="example@email.com"
          placeholderTextColor="#aaaaaa"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Pressable
          style={[
            styles.testMailButton,
            !settings.emailAddress && styles.testMailButtonDisabled,
          ]}
          onPress={handleSendTestEmail}
          disabled={!settings.emailAddress}
        >
          <Text
            style={[
              styles.testMailButtonText,
              !settings.emailAddress && styles.testMailButtonTextDisabled,
            ]}
          >
            テスト送信
          </Text>
        </Pressable>
      </View>

      {/* メモテンプレート */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>メモテンプレート</Text>
        <TextInput
          style={[styles.textInput, styles.multilineInput]}
          value={settings.memoTemplate}
          onChangeText={(text) => updateSettings({ memoTemplate: text })}
          placeholder="計測時に自動入力されるメモ"
          placeholderTextColor="#aaaaaa"
          multiline
          numberOfLines={3}
        />
        <Text style={styles.hint}>
          各計測レコードのmemoカラムに記録されます
        </Text>
      </View>
    </ScrollView>
  );
}

/** ポーリング間隔セクション */
function IntervalSection({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [inputText, setInputText] = useState(String(value));

  function handleEndEditing() {
    const parsed = parseInt(inputText, 10);
    if (isNaN(parsed)) {
      setInputText(String(value));
      return;
    }
    const clamped = Math.max(
      POLLING_INTERVAL.MIN,
      Math.min(POLLING_INTERVAL.MAX, parsed),
    );
    setInputText(String(clamped));
    onChange(clamped);
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>ポーリング間隔</Text>
      <View style={styles.intervalRow}>
        <TextInput
          style={styles.intervalInput}
          value={inputText}
          onChangeText={setInputText}
          onEndEditing={handleEndEditing}
          keyboardType="number-pad"
          maxLength={4}
        />
        <Text style={styles.intervalUnit}>秒</Text>
      </View>
      <Text style={styles.hint}>
        {POLLING_INTERVAL.MIN}〜{POLLING_INTERVAL.MAX}秒の範囲で設定できます
      </Text>
    </View>
  );
}

/** セグメントボタン */
function SegmentButton({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.segmentButton, selected && styles.segmentButtonSelected]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.segmentButtonText,
          selected && styles.segmentButtonTextSelected,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
  },
  hint: {
    fontSize: 12,
    color: '#888888',
    marginTop: 8,
  },
  intervalRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  intervalInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
    width: 100,
  },
  intervalUnit: {
    fontSize: 18,
    color: '#666666',
    marginLeft: 8,
  },
  segmentContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  segmentButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  segmentButtonSelected: {
    backgroundColor: '#2196F3',
  },
  segmentButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
  segmentButtonTextSelected: {
    color: '#ffffff',
  },
  textInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    fontSize: 16,
    color: '#333333',
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  testMailButton: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#2196F3',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  testMailButtonDisabled: {
    borderColor: '#cccccc',
  },
  testMailButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2196F3',
  },
  testMailButtonTextDisabled: {
    color: '#cccccc',
  },
});
