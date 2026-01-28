# AWS でのログ出力

## 目的

動作確認がわかりやすくなるように、順番に手順を追ってログ出力を試してみる。

## 手順

1. AWS にログストリームを作成する
2. EC2 そのものから、ログ出力してみる。
 2.1 PHP から出力、ログ出力用の Laravel を作る
 
3. EC2 の Docker コンテナ内から、ログ出力してみる
 3.1 Docker 内の PHP - laravel-webapi から出力してみる

## steps

### 0. 前提準備
- IAM で CloudWatch Logs への書き込み権限を持つロールを作成し、EC2 にアタッチ（logs:CreateLogGroup|CreateLogStream|PutLogEvents|DescribeLogStreams）。
- EC2 に AWS CLI をインストール済みで aws configure（またはインスタンスロール）で認証できる状態にする。
- リージョンは ap-northeast-1 を想定。

ロール laravel-log を作成
管理ポリシー: CloudWatchAgentServerPolicy 
信頼ポリシー
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "sts:AssumeRole"
            ],
            "Principal": {
                "Service": [
                    "ec2.amazonaws.com"
                ]
            }
        }
    ]
}
```


### 1. CloudWatch Logs のロググループとストリームを作成
```bash
aws logs create-log-group --log-group-name sample-webapi
aws logs create-log-stream --log-group-name sample-webapi --log-stream-name ec2-manual
```
※ 既に存在する場合はスキップ。

### 2. EC2（ホストOS）からの直接出力テスト
```powershell
$Message = "hello from ec2 $(Get-Date -Format o)"
$SequenceToken = aws logs describe-log-streams `
    --log-group-name sample-webapi `
    --log-stream-name-prefix ec2-manual `
    --query 'logStreams[0].uploadSequenceToken' `
    --output text

aws logs put-log-events `
    --log-group-name sample-webapi `
    --log-stream-name ec2-manual `
    --log-events "timestamp=$([DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()),message=$Message" `
    --sequence-token $SequenceToken
```
CloudWatch Logs でメッセージが見えれば OK。

### 3. PHP 単体スクリプトでの出力確認
```bash
cat > /tmp/cw_test.php <<'PHP'
<?php
require '/tmp/aws-autoloader.php'; // aws sdk を配置した場所に合わせる
use Aws\CloudWatchLogs\CloudWatchLogsClient;

$client = new CloudWatchLogsClient([
    'version' => 'latest',
    'region'  => 'ap-northeast-1'
]);

$group = 'sample-webapi';
$stream = 'php-standalone';

$streams = $client->describeLogStreams([
    'logGroupName' => $group,
    'logStreamNamePrefix' => $stream,
]);
$token = $streams['logStreams'][0]['uploadSequenceToken'] ?? null;

$client->putLogEvents([
    'logGroupName' => $group,
    'logStreamName' => $stream,
    'logEvents' => [[
        'timestamp' => round(microtime(true) * 1000),
        'message'   => 'hello from php standalone',
    ]],
    'sequenceToken' => $token,
]);
echo "sent\n";
PHP
php /tmp/cw_test.php
```

### 4. Laravel（ホスト）で CloudWatch 出力確認

aporat/laravel-cloudwatch-logger パッケージを利用する。

```bash
composer require aporat/laravel-cloudwatch-logger
```

.env（テスト用）
```env
LOG_CHANNEL=cloudwatch
CLOUDWATCH_LOG_GROUP=sample-webapi
CLOUDWATCH_LOG_STREAM=laravel-host
AWS_DEFAULT_REGION=ap-northeast-1
```
config/logging.php の cloudwatch チャンネル設定を有効にした上で、アプリ内で Log::info('hello from laravel host'); を実行。CloudWatch に出れば成功。

### 5. Docker コンテナ（laravel-webapi）から出力確認
1) .env.prod.example をコピーして .env を用意し、上記 CloudWatch 環境変数を追加。
```env
LOG_CHANNEL=cloudwatch
CLOUDWATCH_LOG_GROUP=sample-webapi
CLOUDWATCH_LOG_STREAM=laravel-docker
AWS_DEFAULT_REGION=ap-northeast-1
```
2) コンテナをビルド＆起動。
```bash
docker compose -f docker-compose.prod.yml up -d --build
docker compose exec app php artisan key:generate --force
```
3) Laravel 内でログを吐く。
```bash
docker compose exec app php artisan tinker --execute="Log::info('hello from laravel docker');"
```
4) CloudWatch Logs で laravel-docker ストリームにログが届いているか確認。

### 6. 障害切り分けメモ
- 出ない場合は IAM 権限（特に logs:CreateLogStream と logs:PutLogEvents）を確認。
- リージョンミスマッチを確認（AWS_DEFAULT_REGION とコンソールの表示を揃える）。
- シーケンストークンエラーが出たら最新トークンを取得して再送（put 時の sequenceToken を更新）。
- コンテナの stdout/stderr は /var/lib/docker/containers/<ID>/*json.log にも出るので、docker logs app でアプリログを直接確認可能。










