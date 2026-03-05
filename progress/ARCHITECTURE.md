# Radio Wave Logger - アーキテクチャ

## リポジトリ構成

```
Radio_wave_logger (本体)          Wave_logger_mapper (可視化)
├── app/          UI層            ├── app/          Next.js pages
├── src/services/ ビジネスロジック  ├── src/components/ React components
├── src/hooks/    状態管理         ├── src/lib/       CSV解析・カラー計算
├── src/types/    型定義           └── tools/         Python CLI (参考用)
├── src/utils/    ユーティリティ
├── src/constants/ 設定定数
├── __tests__/    ユニットテスト
└── start-dev.bat 開発起動
```

## データフロー

```
[GPS] ─────────┐
[NetworkInfo] ──┤
[SpeedTest] ────┤──→ [useMeasurement] ──→ [LoggingService] ──→ CSV
                │          ↓
                │     [UI: index.tsx]
                │
[AsyncStorage] ←──→ [useSettings] ←──→ [UI: settings.tsx]
```

## ファイル依存関係

```
app/index.tsx
  ├── src/hooks/useMeasurement.ts
  │     ├── src/services/LocationService.ts
  │     ├── src/services/NetworkInfoService.ts
  │     ├── src/services/SpeedTestService.ts
  │     ├── src/services/LoggingService.ts
  │     └── src/utils/format.ts
  └── src/hooks/useSettings.ts
        └── src/constants/index.ts

app/settings.tsx
  ├── src/hooks/useSettings.ts
  ├── src/services/MailService.ts
  └── src/constants/index.ts

app/logs.tsx
  ├── src/services/LoggingService.ts
  └── src/services/MailService.ts
```

## テストカバレッジ

| テストファイル | 対象 | テスト数 |
|--------------|------|---------|
| BackgroundService.test.ts | バックグラウンド計測 | - |
| LocationService.test.ts | GPS取得 | - |
| LoggingService.test.ts | CSV読み書き | - |
| MailService.test.ts | メール送信 | - |
| NetworkInfoService.test.ts | ネットワーク情報 | - |
| SpeedTestService.test.ts | 速度測定 | - |
| csv.test.ts | CSV生成 | - |
| format.test.ts | フォーマット | - |
| **合計** | **8ファイル** | **58テスト** |

## 設定の永続化

- **ストレージ**: AsyncStorage (`@react-native-async-storage/async-storage`)
- **キー**: `@netlog/settings`, `@netlog/current_session`
- **マイグレーション**: `useSettings.ts` 内で旧フォーマットを検出し自動変換
  - `pollingIntervalMinutes` → `pollingIntervalSeconds` (× 60)
