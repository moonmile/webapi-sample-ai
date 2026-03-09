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
$Region = "ap-northeast-1"
$Message = "hello from ec2 $(Get-Date -Format o)"
$SequenceToken = aws logs describe-log-streams `
    --region $Region `
    --log-group-name sample-webapi `
    --log-stream-name-prefix ec2-manual `
    --query 'logStreams[0].uploadSequenceToken' `
    --output text

aws logs put-log-events `
    --region $Region `
    --log-group-name sample-webapi `
    --log-stream-name ec2-manual `
    --log-events "timestamp=$([DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()),message=$Message" `
    --sequence-token $SequenceToken
```

CloudWatch Logs でメッセージが見えれば OK。

ログの順序が保たれるように sequenceToken を取得してから put-log-events するのがポイント。

### 3. CloudWatchLogger.php の作成


```php
namespace App\Logging;

use Aws\CloudWatchLogs\CloudWatchLogsClient;
use Aws\Exception\AwsException;
use Monolog\Formatter\JsonFormatter;
use Monolog\Handler\AbstractProcessingHandler;
use Monolog\LogRecord;
use Monolog\Logger;

class CloudWatchLogger
{
    /**
     * Create a custom Monolog instance.
     *
     * @param  array<string,mixed>  $config
     */
    public function __invoke(array $config): Logger
    {
        $options = [
            'region' => $config['region'] ?? env('AWS_DEFAULT_REGION', 'ap-northeast-1'),
            'version' => $config['version'] ?? 'latest',
        ];

        $credentials = array_filter([
            'key' => $config['credentials']['key'] ?? env('AWS_ACCESS_KEY_ID'),
            'secret' => $config['credentials']['secret'] ?? env('AWS_SECRET_ACCESS_KEY'),
        ], fn ($v) => ! empty($v));

        if (! empty($credentials)) {
            $options['credentials'] = $credentials;
        }

        $client = new CloudWatchLogsClient($options);

        $group = $config['group_name'] ?? 'laravel_app';
        $stream = $config['stream_name'] ?? 'laravel_app';
        $retention = (int) ($config['retention'] ?? 14);

        $handler = new CloudWatchHandler(
            $client,
            $group,
            $stream,
            $retention,
            $config['level'] ?? Logger::DEBUG
        );

        $formatterClass = $config['formatter'] ?? JsonFormatter::class;

        $handler->setFormatter(new $formatterClass());

        return new Logger($config['name'] ?? 'cloudwatch', [$handler]);
    }
}

class CloudWatchHandler extends AbstractProcessingHandler
{
    private CloudWatchLogsClient $client;

    private string $group;

    private string $stream;

    private ?string $sequenceToken = null;

    private int $retentionDays;

    public function __construct(CloudWatchLogsClient $client, string $group, string $stream, int $retentionDays = 14, int $level = Logger::DEBUG, bool $bubble = true)
    {
        parent::__construct($level, $bubble);

        $this->client = $client;
        $this->group = $group;
        $this->stream = $stream;
        $this->retentionDays = $retentionDays;

        $this->initializeGroupAndStream();
    }

    protected function write(LogRecord $record): void
    {
        $event = [
            'message' => (string) $record->formatted,
            'timestamp' => (int) round(microtime(true) * 1000),
        ];

        $params = [
            'logGroupName' => $this->group,
            'logStreamName' => $this->stream,
            'logEvents' => [$event],
        ];

        if ($this->sequenceToken !== null) {
            $params['sequenceToken'] = $this->sequenceToken;
        }

        try {
            $result = $this->client->putLogEvents($params);

            if ($result->hasKey('nextSequenceToken')) {
                $this->sequenceToken = (string) $result->get('nextSequenceToken');
            }
        } catch (AwsException $e) {
            // CloudWatch への送信失敗時はアプリ本体を落とさない
        }
    }

    private function initializeGroupAndStream(): void
    {
        try {
            $groups = $this->client->describeLogGroups([
                'logGroupNamePrefix' => $this->group,
            ]);

            $exists = collect($groups->get('logGroups') ?? [])
                ->contains(fn ($g) => ($g['logGroupName'] ?? '') === $this->group);

            if (! $exists) {
                $this->client->createLogGroup([
                    'logGroupName' => $this->group,
                ]);

                if ($this->retentionDays > 0) {
                    $this->client->putRetentionPolicy([
                        'logGroupName' => $this->group,
                        'retentionInDays' => $this->retentionDays,
                    ]);
                }
            }

            $streams = $this->client->describeLogStreams([
                'logGroupName' => $this->group,
                'logStreamNamePrefix' => $this->stream,
            ]);

            $stream = collect($streams->get('logStreams') ?? [])
                ->first(fn ($s) => ($s['logStreamName'] ?? '') === $this->stream);

            if (! $stream) {
                $this->client->createLogStream([
                    'logGroupName' => $this->group,
                    'logStreamName' => $this->stream,
                ]);
            } else {
                if (isset($stream['uploadSequenceToken'])) {
                    $this->sequenceToken = (string) $stream['uploadSequenceToken'];
                }
            }
        } catch (AwsException $e) {
            // セットアップ失敗時もアプリ本体は継続させる
        }
    }
}
```

### 4. Laravel（ホスト）で CloudWatch 出力確認


.env（テスト用）
```env
LOG_CHANNEL=cloudwatch
CLOUDWATCH_LOG_GROUP=sample-webapi
CLOUDWATCH_LOG_STREAM=laravel-host
AWS_DEFAULT_REGION=ap-northeast-1
```
config/logging.php の cloudwatch チャンネル設定を有効にした上で、アプリ内で Log::info('hello from laravel host'); を実行。CloudWatch に出れば成功。

tinker で直接実行する場合は以下のように。

```bash
php artisan tinker --execute="Log::info('hello from laravel docker');"
```

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
docker compose -f docker-compose.prod.yml build 
docker compose -f docker-compose.prod.yml up -d
docker compose -f docker-compose.prod.yml exec app php artisan key:generate --force
```

3) Laravel 内でログを吐く。

```bash
docker compose -f docker-compose.prod.yml exec app php artisan tinker --execute="Log::info('hello from laravel docker');"
```

4) CloudWatch Logs で laravel-docker ストリームにログが届いているか確認。

外部から api/hello にアクセスしてログが出力されていることを確認

```bash
curl http://ec2-35-75-9-46.ap-northeast-1.compute.amazonaws.com/api/hello
```


### 6. 障害切り分けメモ
- 出ない場合は IAM 権限（特に logs:CreateLogStream と logs:PutLogEvents）を確認。
- リージョンミスマッチを確認（AWS_DEFAULT_REGION とコンソールの表示を揃える）。
- シーケンストークンエラーが出たら最新トークンを取得して再送（put 時の sequenceToken を更新）。
- コンテナの stdout/stderr は /var/lib/docker/containers/<ID>/*json.log にも出るので、docker logs app でアプリログを直接確認可能。










