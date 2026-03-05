# Network Quality Logger (Radio Wave Logger)

## プロジェクト概要
モバイル回線の通信品質（GPS位置情報・回線速度）を定期的に計測・記録し、CSVで出力するReact Native (Expo) アプリ。
計測データはGoogle Map上で可視化するために使用する。

## 技術スタック
- **フレームワーク**: React Native + Expo (Managed Workflow)
- **言語**: TypeScript (strict mode)
- **ナビゲーション**: Expo Router (ファイルベースルーティング)
- **状態管理**: React Context + useReducer（外部ライブラリ不要な規模）
- **位置情報**: expo-location
- **速度測定**: Cloudflare Speed Test エンドポイント (speed.cloudflare.com)
- **ファイルI/O**: expo-file-system (CSV保存)
- **メール送信**: expo-mail-composer
- **バックグラウンド**: expo-task-manager (V2以降で対応)
- **ネットワーク情報**: @react-native-community/netinfo

## ディレクトリ構成
```
C:\dev\Radio_wave_logger\
├── CLAUDE.md              # このファイル
├── .claude/               # Claude Code設定
│   └── settings.json      # 権限・環境変数
├── .mcp.json              # MCP サーバー設定（プロジェクトスコープ）
├── app/                   # Expo Router ページ
│   ├── _layout.tsx        # ルートレイアウト
│   ├── index.tsx          # メイン画面（計測画面）
│   ├── settings.tsx       # 設定画面
│   └── logs.tsx           # ログ一覧画面
├── src/
│   ├── services/          # ビジネスロジック
│   │   ├── SpeedTestService.ts    # 速度測定（Cloudflare）
│   │   ├── LocationService.ts     # GPS取得
│   │   ├── NetworkInfoService.ts  # 電波情報取得
│   │   ├── LoggingService.ts      # CSV書き込み・読み込み
│   │   └── MailService.ts         # メール送信
│   ├── hooks/
│   │   ├── useMeasurement.ts      # 計測制御フック
│   │   └── useSettings.ts         # 設定管理フック
│   ├── types/
│   │   └── index.ts               # 全型定義
│   ├── constants/
│   │   └── index.ts               # デフォルト値・設定定数
│   └── utils/
│       ├── csv.ts                 # CSV生成ユーティリティ
│       └── format.ts              # 表示フォーマット
├── tools/
│   └── visualize_map.py           # Google Map可視化スクリプト (folium)
├── app.json
├── tsconfig.json
└── package.json
```

## コーディング規約

### 全般
- すべてのファイルはTypeScriptで記述する（.ts / .tsx）
- `any` 型の使用禁止。必ず適切な型を定義する
- 関数は50行以内に収める。超える場合は分割する
- コメントは日本語で記述する
- エラーメッセージは日本語で表示する（ユーザー向けUI）
- console.log はデバッグ時のみ使用し、本番コードでは削除する

### React Native / Expo 固有
- StyleSheet.create() を使用する（インラインスタイル禁止）
- コンポーネントは関数コンポーネント + hooks で記述する
- Platform.OS で分岐が必要な箇所は明示的にコメントを入れる
- Expo SDK のAPIは最新の推奨パターンを使用する
- `expo install` でパッケージを追加する（npm install ではなく）

### 速度測定モジュール
- SpeedTestService は interface を定義し、プロバイダー交換可能にする
- 測定失敗時は null を返し、CSVには "N/A" と記録する
- タイムアウトは1回の測定につき30秒とする

### CSV仕様
- エンコーディング: UTF-8 (BOM付き、Excelでの文字化け防止)
- 改行コード: CRLF
- カラム順序: timestamp, latitude, longitude, accuracy, download_mbps, upload_mbps, ping_ms, connection_type, cellular_gen, carrier, signal_dbm, memo
- ファイル名: netlog_YYYYMMDD_HHmmss.csv

## 開発フェーズ

### Phase 1: 基盤構築
Expoプロジェクト初期化、型定義、GPS取得、Ping計測、CSV保存の基本フロー

### Phase 2: 速度測定 + ポーリング
Cloudflare速度測定の組み込み、setIntervalによるポーリング制御、メイン画面UI

### Phase 3: 設定 + ログ管理
設定画面、ログ一覧画面、メール送信機能

### Phase 4: 安定化
エラーハンドリング強化、バックグラウンド対応(Foreground Service)、テスト

### Phase 5: 可視化ツール
Python (folium) によるGoogle Map可視化スクリプト作成

## プラットフォーム固有の注意事項

### iOS
- 電波強度 (dBm) は取得不可 → CSVではnull
- キャリア名は iOS 16以降で取得不可 → CSVではnull
- バックグラウンドGPSは「常に許可」が必要
- Info.plist に位置情報使用理由の記述が必須

### Android
- Foreground Service の Notification が必要
- ACCESS_BACKGROUND_LOCATION は別途リクエストが必要
- TelephonyManager で電波強度・キャリア名が取得可能

## テスト方針
- サービス層 (services/) は Jest でユニットテスト
- 速度測定のモック: fetch をモックして固定レスポンスを返す
- GPS のモック: expo-location のモックモジュールを作成
