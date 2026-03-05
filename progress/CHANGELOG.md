# Radio Wave Logger - 変更履歴

## 2026-03-05: 追加改善 (3機能)
**コミット**: `45f9a45`, `e3b9073`, `8344456`

### ポーリング間隔を秒単位に変更
- `pollingIntervalMinutes` → `pollingIntervalSeconds` にリネーム
- 範囲: 10〜3600秒 (旧: 1〜60分)、デフォルト: 300秒 (5分)
- 旧フォーマット自動移行ロジック (`minutes * 60`) を `useSettings.ts` に追加
- `formatInterval()` ヘルパーを追加 (例: `"2分30秒"`, `"30秒"`)
- 変更ファイル: `types`, `constants`, `useSettings`, `useMeasurement`, `BackgroundService`, `settings.tsx`, `index.tsx`, `format.ts`

### テストメール送信ボタン追加
- `MailService.ts` に `sendTestEmail()` 関数追加
- 設定画面のメールアドレス入力下にアウトラインスタイルのボタン追加
- メールアドレス未入力時は disabled
- `isMailAvailable()` チェック → 不可なら Alert 表示

### 可視化ツールを Wave_logger_mapper に分離
- `tools/visualize_map.py` を削除
- 新リポジトリ `Wave_logger_mapper` (Next.js 15.3 + react-leaflet + papaparse)
- Python版 `get_color()` を TypeScript `colorScale.ts` にポート
- CSVドラッグ&ドロップ → Leaflet地図表示 (CircleMarker + Polyline + Popup + Legend)
- メトリック選択ドロップダウン (下り速度/上り速度/Ping)
- GitHub: https://github.com/kailaw-nmk/Wave_logger_mapper

### 開発環境起動バッチ
- `start-dev.bat` 追加 (エミュレータ起動 → Expo開発サーバー起動)

---

## 2026-03-05: Phase 4 - 安定化
**コミット**: `0466138`

- バックグラウンド計測サービス (`BackgroundService.ts`)
- エラーハンドリング強化
- ユニットテスト 8ファイル / 58テスト (全パス)

---

## 2026-03-05: Phase 1-3 - 初期実装
**コミット**: `a999ff9`

- Expoプロジェクト初期化
- 型定義、定数、ユーティリティ
- GPS取得、ネットワーク情報取得、Cloudflare速度測定
- CSV書き込み・読み込み
- 計測制御フック、設定管理フック
- メイン画面、設定画面、ログ一覧画面
- メール送信サービス
