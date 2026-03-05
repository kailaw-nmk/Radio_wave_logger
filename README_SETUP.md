# Network Quality Logger - Claude Code セットアップガイド

## 前提条件

1. **Node.js** v18以上がインストール済み
2. **Claude Code** がインストール済み (`npm install -g @anthropic-ai/claude-code`)
3. **Git** がインストール済み
4. **Python 3.10+** (可視化ツール用、オプション)

---

## セットアップ手順

### 1. ファイル配置

このZIPの内容を `C:\dev\Radio_wave_logger\` に展開してください。

```
C:\dev\Radio_wave_logger\
├── CLAUDE.md                  ← プロジェクトの指示書（最重要）
├── .claude/
│   └── settings.json          ← 権限設定
├── .mcp.json                  ← MCP サーバー設定
├── src/
│   ├── types/index.ts         ← 型定義（先に作成済み）
│   └── constants/index.ts     ← 定数定義（先に作成済み）
├── tools/
│   └── visualize_map.py       ← Google Map 可視化スクリプト
└── README_SETUP.md            ← このファイル
```

### 2. Expo プロジェクト初期化

Claude Codeを開いて以下を指示してください:

```
C:\dev\Radio_wave_logger で Expo プロジェクトを初期化してください。
CLAUDE.md に従い、Expo Router テンプレートを使ってセットアップしてください。
既存の src/types/ と src/constants/ は保持してください。
```

### 3. MCP サーバーの認証

Claude Code起動後、MCP サーバーのセットアップが必要です:

**Expo MCP Server:**
```
/mcp
```
を実行し、Expoアカウントで認証してください。
（Expoアカウントがない場合は https://expo.dev で無料作成）

**Context7** と **Sequential Thinking** は認証不要で自動接続されます。

### 4. 追加のMCPサーバー（オプション）

必要に応じて以下のMCPサーバーを追加できます:

```bash
# GitHub連携（PRやIssue管理に便利）
claude mcp add-json github '{"command":"npx","args":["-y","@modelcontextprotocol/server-github"],"env":{"GITHUB_PERSONAL_ACCESS_TOKEN":"YOUR_TOKEN"}}' --scope user
```

---

## 各ファイルの説明

### CLAUDE.md
Claude Code が最初に読み込むプロジェクト指示書です。
技術スタック、ディレクトリ構成、コーディング規約、開発フェーズを定義しています。
**Claude Code がコードを生成する際の品質に直結するため、最も重要なファイルです。**

### .claude/settings.json
Claude Code の権限設定です。
- `allow`: 許可するコマンド（expo, npm, git, jest など）
- `deny`: 拒否するパス（.env、secrets ディレクトリ）

### .mcp.json
プロジェクトスコープのMCPサーバー設定です。

| サーバー | 用途 |
|---------|------|
| **expo** | Expo公式MCP。SDKドキュメント参照、シミュレータ操作 |
| **context7** | ライブラリのバージョン別ドキュメント参照 |
| **sequential-thinking** | 複雑な設計判断の思考整理 |

### src/types/index.ts
全型定義を事前に用意。Claude Code はここを参照して型安全なコードを生成します。

### src/constants/index.ts
設定定数。Cloudflare Speed Test のURL、GPS設定、CSV仕様などをまとめています。

### tools/visualize_map.py
CSVログをGoogle Map上に可視化するPythonスクリプトです。

```bash
# 使い方
pip install folium pandas
python tools/visualize_map.py netlog_20260304_120000.csv --metric download_mbps
# → netlog_20260304_120000.html が生成される
```

---

## Claude Code での開発の始め方

Claude Code を `C:\dev\Radio_wave_logger` で起動してください:

```bash
cd C:\dev\Radio_wave_logger
claude
```

Phase 1 から順に以下のように指示を出していきます:

### Phase 1 の指示例:
```
Phase 1 を開始してください。
1. npx create-expo-app で Expo Router テンプレートを使ってプロジェクトを初期化
2. 必要な依存パッケージをインストール (expo-location, expo-file-system, @react-native-community/netinfo)
3. src/types/index.ts と src/constants/index.ts は既存のものを使用
4. src/services/LocationService.ts を作成: expo-location でGPS座標を取得する関数
5. src/services/LoggingService.ts を作成: CSV ファイルの作成・追記・読み込み
6. 動作確認できる最小限のメイン画面を作成
```

### Phase 2 の指示例:
```
Phase 2 を開始してください。
1. src/services/SpeedTestService.ts を作成: ISpeedTestProvider インターフェースを実装し、Cloudflare Speed Test でDL/UL/Pingを測定
2. src/services/NetworkInfoService.ts を作成: NetInfoで接続種別・セルラー世代を取得
3. src/hooks/useMeasurement.ts を作成: setInterval でポーリング制御、開始/停止ロジック
4. メイン画面UIを実装: 開始/停止ボタン、最新計測結果カード、経過時間表示
```

---

## トラブルシューティング

### MCP サーバーが接続できない
```
/mcp
```
で状態確認。`failed` の場合は Node.js のバージョンを確認（v18以上必須）。

### Expo の依存関係エラー
```
npx expo doctor
npx expo install --check --fix
```

### TypeScript エラー
```
npx tsc --noEmit
```
で型チェック。CLAUDE.md の規約に従っていればエラーは発生しにくい。
