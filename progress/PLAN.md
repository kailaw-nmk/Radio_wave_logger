# Radio Wave Logger - 実装計画

## 概要
モバイル回線の通信品質（GPS位置情報・回線速度）を定期的に計測・記録し、CSVで出力するReact Native (Expo) アプリ。

---

## Phase 1: 基盤構築
Expoプロジェクト初期化、型定義、GPS取得、Ping計測、CSV保存の基本フロー

| タスク | 対象ファイル | 状態 |
|--------|-------------|------|
| Expoプロジェクト初期化 | `app.json`, `package.json`, `tsconfig.json` | ✅ 完了 |
| 型定義 | `src/types/index.ts` | ✅ 完了 |
| 定数定義 | `src/constants/index.ts` | ✅ 完了 |
| GPS取得サービス | `src/services/LocationService.ts` | ✅ 完了 |
| ネットワーク情報取得 | `src/services/NetworkInfoService.ts` | ✅ 完了 |
| CSV生成ユーティリティ | `src/utils/csv.ts` | ✅ 完了 |
| CSV書き込み・読み込み | `src/services/LoggingService.ts` | ✅ 完了 |
| 表示フォーマット | `src/utils/format.ts` | ✅ 完了 |

---

## Phase 2: 速度測定 + ポーリング
Cloudflare速度測定の組み込み、setIntervalによるポーリング制御、メイン画面UI

| タスク | 対象ファイル | 状態 |
|--------|-------------|------|
| Cloudflare速度測定サービス | `src/services/SpeedTestService.ts` | ✅ 完了 |
| 計測制御フック | `src/hooks/useMeasurement.ts` | ✅ 完了 |
| メイン画面UI | `app/index.tsx` | ✅ 完了 |
| ルートレイアウト | `app/_layout.tsx` | ✅ 完了 |

---

## Phase 3: 設定 + ログ管理
設定画面、ログ一覧画面、メール送信機能

| タスク | 対象ファイル | 状態 |
|--------|-------------|------|
| 設定管理フック | `src/hooks/useSettings.ts` | ✅ 完了 |
| 設定画面UI | `app/settings.tsx` | ✅ 完了 |
| ログ一覧画面 | `app/logs.tsx` | ✅ 完了 |
| メール送信サービス | `src/services/MailService.ts` | ✅ 完了 |

---

## Phase 4: 安定化
エラーハンドリング強化、バックグラウンド対応(Foreground Service)、テスト

| タスク | 対象ファイル | 状態 |
|--------|-------------|------|
| バックグラウンドサービス | `src/services/BackgroundService.ts` | ✅ 完了 |
| ユニットテスト (8ファイル, 58テスト) | `__tests__/*.test.ts` | ✅ 完了 |
| エラーハンドリング強化 | 各サービス | ✅ 完了 |

---

## Phase 5: 可視化ツール
CSVデータの地図上可視化 → 別リポジトリに分離

| タスク | 対象 | 状態 |
|--------|------|------|
| Python版可視化スクリプト (folium) | 旧 `tools/visualize_map.py` | ✅ 完了 → 移行済み |
| Wave_logger_mapper リポジトリ作成 | `C:\dev\Wave_logger_mapper\` | ✅ 完了 |
| Next.js + Leaflet Webアプリ | Wave_logger_mapper | ✅ 完了 |
| Vercelデプロイ | Wave_logger_mapper | 🔲 未着手 |

---

## 追加改善 (2026-03-05 実施)

| タスク | 変更内容 | 状態 |
|--------|---------|------|
| ポーリング間隔を秒単位に変更 | `pollingIntervalMinutes` → `pollingIntervalSeconds` (10〜3600秒) | ✅ 完了 |
| 旧設定フォーマット移行 | `useSettings.ts` に分→秒の自動変換ロジック追加 | ✅ 完了 |
| テストメール送信ボタン | `MailService.ts` + `settings.tsx` に追加 | ✅ 完了 |
| 可視化ツール分離 | `tools/` 削除、Wave_logger_mapper へ移行 | ✅ 完了 |
| 開発環境起動バッチ | `start-dev.bat` (エミュレータ+Expo) | ✅ 完了 |

---

## 今後の候補タスク

| タスク | 優先度 | 備考 |
|--------|--------|------|
| Wave_logger_mapper の Vercel デプロイ | 高 | `.nvmrc` で Node 20 指定済み |
| 実機テスト (Android) | 高 | エミュレータでは電波強度取得不可 |
| iOS対応テスト | 中 | dBm/キャリア名の制限あり |
| バックグラウンド計測の実機検証 | 中 | Foreground Service の動作確認 |
| テストメール送信のテストコード追加 | 低 | `sendTestEmail()` のユニットテスト |
| E2Eテスト (Detox等) | 低 | UI操作の自動テスト |
