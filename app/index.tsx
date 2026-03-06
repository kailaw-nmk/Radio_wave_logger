import { StyleSheet, Text, View, Pressable, ScrollView } from 'react-native';
import { useMeasurement } from '../src/hooks/useMeasurement';
import { useSettings } from '../src/hooks/useSettings';
import {
  formatSpeed,
  formatPing,
  formatCoordinate,
  formatInterval,
} from '../src/utils/format';

/** メイン画面（計測画面） */
export default function MeasurementScreen() {
  const { session, lastRecord, status, error, startMeasuring, stopMeasuring } =
    useMeasurement();
  const { settings } = useSettings();

  const isRunning = status === 'measuring';

  function handleToggle() {
    if (isRunning) {
      stopMeasuring();
    } else {
      startMeasuring({
        intervalSeconds: settings.pollingIntervalSeconds,
        memo: settings.memoTemplate,
        testDataSize: settings.testDataSize,
        keepScreenAwake: settings.keepScreenAwake,
      });
    }
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {/* ステータス表示 */}
      <View style={styles.statusSection}>
        <Text style={styles.statusLabel}>ステータス</Text>
        <Text style={[styles.statusValue, isRunning && styles.statusRunning]}>
          {status === 'idle' && '待機中'}
          {status === 'measuring' && '計測中'}
          {status === 'error' && 'エラー'}
        </Text>
      </View>

      {/* エラー表示 */}
      {error && (
        <View style={styles.errorSection}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* 開始/停止ボタン */}
      <Pressable
        style={[styles.button, isRunning ? styles.stopButton : styles.startButton]}
        onPress={handleToggle}
      >
        <Text style={styles.buttonText}>
          {isRunning ? '計測停止' : '計測開始'}
        </Text>
      </Pressable>

      {/* セッション情報 */}
      {session && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>セッション情報</Text>
          <InfoRow label="計測回数" value={`${session.measurementCount} 回`} />
          <InfoRow
            label="間隔"
            value={formatInterval(settings.pollingIntervalSeconds)}
          />
          <InfoRow
            label="テストサイズ"
            value={settings.testDataSize === 'light' ? '1 MB' : '10 MB'}
          />
        </View>
      )}

      {/* 最新計測結果 */}
      {lastRecord && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>最新の計測結果</Text>
          <InfoRow
            label="緯度"
            value={formatCoordinate(lastRecord.latitude)}
          />
          <InfoRow
            label="経度"
            value={formatCoordinate(lastRecord.longitude)}
          />
          <InfoRow
            label="精度"
            value={
              lastRecord.accuracy !== null
                ? `${lastRecord.accuracy.toFixed(1)} m`
                : 'N/A'
            }
          />
          <InfoRow label="Ping" value={formatPing(lastRecord.ping_ms)} />
          <InfoRow
            label="下り"
            value={formatSpeed(lastRecord.download_mbps)}
          />
          <InfoRow
            label="上り"
            value={formatSpeed(lastRecord.upload_mbps)}
          />
          <InfoRow label="接続" value={lastRecord.connection_type} />
          <InfoRow
            label="世代"
            value={lastRecord.cellular_gen ?? 'N/A'}
          />
          <InfoRow label="キャリア" value={lastRecord.carrier ?? 'N/A'} />
        </View>
      )}
    </ScrollView>
  );
}

/** 情報行コンポーネント */
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  statusSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  statusLabel: {
    fontSize: 14,
    color: '#888888',
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
  },
  statusRunning: {
    color: '#4CAF50',
  },
  errorSection: {
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 14,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  startButton: {
    backgroundColor: '#2196F3',
  },
  stopButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eeeeee',
  },
  rowLabel: {
    fontSize: 14,
    color: '#666666',
  },
  rowValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
});
