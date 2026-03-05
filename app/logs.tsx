import { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { getLogFiles, deleteLogFile } from '../src/services/LoggingService';
import { sendLogByEmail, isMailAvailable } from '../src/services/MailService';
import { useSettings } from '../src/hooks/useSettings';
import type { LogFileInfo } from '../src/types';

/** ファイルサイズを読みやすい形式に変換する */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** タイムスタンプを短い表示形式に変換する */
function formatShortTimestamp(iso: string): string {
  if (!iso) return '---';
  try {
    const date = new Date(iso);
    const mo = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const h = String(date.getHours()).padStart(2, '0');
    const mi = String(date.getMinutes()).padStart(2, '0');
    return `${mo}/${d} ${h}:${mi}`;
  } catch {
    return iso;
  }
}

/** ログ一覧画面 */
export default function LogsScreen() {
  const [logFiles, setLogFiles] = useState<LogFileInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { settings } = useSettings();

  // 画面フォーカス時にログ一覧を更新
  useFocusEffect(
    useCallback(() => {
      loadLogs();
    }, []),
  );

  function loadLogs() {
    setIsLoading(true);
    try {
      const files = getLogFiles();
      setLogFiles(files);
    } catch {
      Alert.alert('エラー', 'ログファイルの読み込みに失敗しました');
    } finally {
      setIsLoading(false);
    }
  }

  function handleDelete(file: LogFileInfo) {
    Alert.alert(
      '削除確認',
      `${file.fileName} を削除しますか？`,
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: () => {
            deleteLogFile(file.filePath);
            loadLogs();
          },
        },
      ],
    );
  }

  async function handleSendMail(file: LogFileInfo) {
    const available = await isMailAvailable();
    if (!available) {
      Alert.alert('エラー', 'メールアプリが利用できません');
      return;
    }

    try {
      await sendLogByEmail({
        fileUri: file.filePath,
        toAddress: settings.emailAddress,
        periodStart: file.periodStart,
        periodEnd: file.periodEnd,
      });
    } catch {
      Alert.alert('エラー', 'メールの送信に失敗しました');
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
    <View style={styles.container}>
      {logFiles.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>ログファイルがありません</Text>
          <Text style={styles.emptyHint}>
            計測画面で計測を開始するとログが記録されます
          </Text>
        </View>
      ) : (
        <FlatList
          data={logFiles}
          keyExtractor={(item) => item.fileName}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <LogFileCard
              file={item}
              onDelete={() => handleDelete(item)}
              onSendMail={() => handleSendMail(item)}
            />
          )}
        />
      )}
    </View>
  );
}

/** ログファイルカード */
function LogFileCard({
  file,
  onDelete,
  onSendMail,
}: {
  file: LogFileInfo;
  onDelete: () => void;
  onSendMail: () => void;
}) {
  const periodText =
    file.recordCount > 0
      ? `${formatShortTimestamp(file.periodStart)} 〜 ${formatShortTimestamp(file.periodEnd)}`
      : '計測データなし';

  return (
    <View style={styles.card}>
      <Text style={styles.fileName}>{file.fileName}</Text>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>計測回数</Text>
        <Text style={styles.infoValue}>{file.recordCount} 回</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>期間</Text>
        <Text style={styles.infoValue}>{periodText}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>サイズ</Text>
        <Text style={styles.infoValue}>{formatFileSize(file.fileSize)}</Text>
      </View>
      <View style={styles.actionRow}>
        <Pressable style={styles.mailButton} onPress={onSendMail}>
          <Text style={styles.mailButtonText}>メール送信</Text>
        </Pressable>
        <Pressable style={styles.deleteButton} onPress={onDelete}>
          <Text style={styles.deleteButtonText}>削除</Text>
        </Pressable>
      </View>
    </View>
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
  listContent: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#888888',
    marginBottom: 8,
  },
  emptyHint: {
    fontSize: 14,
    color: '#aaaaaa',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  fileName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  infoLabel: {
    fontSize: 13,
    color: '#666666',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333333',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#eeeeee',
  },
  mailButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  mailButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#ffebee',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  deleteButtonText: {
    color: '#D32F2F',
    fontSize: 14,
    fontWeight: '600',
  },
});
