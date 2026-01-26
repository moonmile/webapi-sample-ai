#!/usr/bin/env bash
set -eux

# 1) パッケージ更新とDocker/compose-plugin導入（Amazon Linux 2023）
sudo dnf update -y
sudo dnf install -y docker
# compose v2 は docker CLI に同梱の場合あり。無ければ次行を利用:
# sudo dnf install -y docker-compose-plugin

sudo systemctl enable --now docker
sudo usermod -aG docker ec2-user

# 2) プロジェクト配置
sudo mkdir -p /var/www/laravel-webapi
sudo chown ec2-user:ec2-user /var/www/laravel-webapi
cd /var/www/laravel-webapi

# （例）Git で取得する場合:
# git clone https://github.com/your/repo.git .

# 3) 環境変数ファイルを配置（手動で .env を用意）
# 4) 初回ビルド＆起動
docker compose -f docker-compose.prod.yml up -d --build

# 5) APP_KEY が未生成なら生成
docker compose exec app php artisan key:generate --force

# 6) マイグレーション
docker compose exec app php artisan migrate --force --seed
