# 『PHP&Laravelで作るWeb API開発入門』サンプルコード
日経BPより発行されている『PHP&Laravelで作るWeb API開発入門』のサンプルコードです。

サイトよりダウンロードできるサンプルコードを公開しています。学習用に利用してください。

# 章立て

- 第1章 Web API とは
- 第2章 Laravel 概要
- 第3章 開発環境
- 第4章 最初のプロジェクト
- 第5章 フロントエンドとバックエンド
- 第6章 データベースとモデル、ORM
- 第7章 ルーティングとコントローラー
- 第8章 OpenAPI 仕様
- 第9章 認証
- 第10章 エラーハンドリングとログ
- 第11章 セキュリティ
- 第12章 自動テスト
- 第13章 Docker
- 第14章 デプロイ
- 付録 AIエージェントを利用した開発

# フォルダ構成

サンプルコードの対応です。

サンプルコードは Laravel 13 対応です。


- README.md : このファイル
 + agents : サンプルコードを作成時の AIエージェントのコード
 + docs
   - ddl.sql : データベースのDDL
   - openapi.yaml : OpenAPI 仕様の定義ファイル
 + src
   + laravel-webapi : Laravel で作成したサンプルコード
   + order-manager : 管理端末のサンプルコード（React）
   + order-mobile : モバイル端末のサンプルコード（React Native Expo）
   + order-tablet : タブレット端末のサンプルコード（React）

本書の主なサンプルコード（Web API構築）は laravel-webapi フォルダーを参照してください。

実際の Web API を呼び出すクライアントとして order-manager、order-mobile、order-tablet フォルダーのコードも用意しています。

# ライセンス＆免責
書籍に準じます。

# Author
Tomoaki Masuda