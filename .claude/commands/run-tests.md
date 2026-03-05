---
description: "計測系サービスのユニットテストを作成・実行する"
---

# テスト実行コマンド

以下の手順でテストを作成・実行してください:

1. `src/services/` 内の各サービスに対するテストファイルを `__tests__/` ディレクトリに作成
2. テストファイル名は `{ServiceName}.test.ts` とする
3. GPS と fetch はモックする
4. `npx jest` で全テストを実行
5. 失敗したテストがあれば修正

テスト対象:
- SpeedTestService: fetch をモックし、固定サイズのレスポンスを返す
- LocationService: expo-location をモックし、固定座標を返す
- LoggingService: expo-file-system をモックし、ファイル操作を検証
- NetworkInfoService: NetInfo をモックし、接続情報を返す

各テストでは正常系と異常系（タイムアウト、ネットワークエラー、権限拒否）の両方をカバーすること。
