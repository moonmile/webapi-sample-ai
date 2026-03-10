<?php

namespace App\Logging;

use Aws\CloudWatchLogs\CloudWatchLogsClient;
use Aws\Exception\AwsException;
use Monolog\Formatter\JsonFormatter;
use Monolog\Handler\AbstractProcessingHandler;
use Monolog\LogRecord;
use Monolog\Logger;

/**
 * CloudWatch Logs にログを送るクラス
 */

class CloudWatchLogger
{
    public function __invoke(array $config)
    {
        $client = new CloudWatchLogsClient([
            'region' => $config['region'],
            'version' => 'latest',
            'credentials' => $config['credentials'],
        ]);

        $handler = new CloudWatchHandler(
            $client,
            $config['group_name'],
            $config['stream_name'],
            Logger::DEBUG
        );

        // JSON 形式で CloudWatch に送る
        $handler->setFormatter(new JsonFormatter());

        $logger = new Logger('cloudwatch');
        $logger->pushHandler($handler);

        return $logger;
    }
}

class CloudWatchHandler extends AbstractProcessingHandler
{
    protected $client;
    protected $group;
    protected $stream;
    protected $sequenceToken;

    public function __construct(CloudWatchLogsClient $client, $group, $stream, $level = Logger::DEBUG, $bubble = true)
    {
        parent::__construct($level, $bubble);

        $this->client = $client;
        $this->group = $group;
        $this->stream = $stream;
    }
    protected function write(LogRecord $record): void
    {
        $params = [
            'logGroupName'  => $this->group,
            'logStreamName' => $this->stream,
            'logEvents'     => [
                [
                    'timestamp' => round(microtime(true) * 1000),
                    'message'   => $record->formatted,
                ],
            ],
        ];

        if ($this->sequenceToken) {
            $params['sequenceToken'] = $this->sequenceToken;
        }
        $result = $this->client->putLogEvents($params);
        // 次の書き込みのために sequenceToken を更新
        $this->sequenceToken = $result['nextSequenceToken'];
    }
}
/*
class CloudWatchLogger
{
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
*/
