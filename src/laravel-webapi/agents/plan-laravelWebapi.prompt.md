# Laravel API EC2 計画

Web API 専用の Laravel アプリケーションを AWS EC2 インスタンスにデプロイするための計画を立てます。

- ローカルでテスト済みの docker-compose.yml を利用する

# steps

1. EC2準備: Amazon Linux 2023 を作成
2. セキュリティグループ設定: HTTP(80), HTTPS(443), SSH(22) を許可
3. コード配置と環境変数: プロジェクトを /var/www/laravel-webapi に配置
4. .env 設定: APP_ENV, APP_KEY, DB_CONNECTION, DB_HOST, DB_PORT, DB_DATABASE, DB_USERNAME, DB_PASSWORD を設定
5. Dockerインストール: Docker と Docker Compose をインストール
6. Docker起動: docker-compose up -d でコンテナを起動
7. マイグレーション 実行: docker-compose exec app php artisan migrate --seed を実行
8. 動作確認: ブラウザまたは Postman で API エンドポイントを確認
9. SSL設定: Let's Encrypt で SSL 証明書を取得し、HTTPS を有効化
10. ログ監視: Docker コンテナのログを監視し、問題がないか確認
11. 自動起動設定: EC2 インスタンス再起動時に Docker コンテナが自動起動するよう設定



