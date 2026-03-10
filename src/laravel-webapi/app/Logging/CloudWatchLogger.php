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
    protected $retentionDays;

    public function __construct(CloudWatchLogsClient $client, $group, $stream, $retentionDays = 14, $level = Logger::DEBUG, $bubble = true)
    {
        parent::__construct($level, $bubble);
        $this->client = $client;
        $this->group = $group;
        $this->stream = $stream;
        $this->retentionDays = $retentionDays;
        $this->setup();
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
        $this->sequenceToken = $result['nextSequenceToken'];
    }

    private function setup(): void
    {
        // ロググループとストリーム作成済み
        $streams = $this->client->describeLogStreams([
            'logGroupName' => $this->group,
            'logStreamNamePrefix' => $this->stream,
        ]);
        $stream = collect($streams->get('logStreams') ?? [])
            ->first(fn ($s) => ($s['logStreamName'] ?? '') === $this->stream);

        if ($stream) {
            if (isset($stream['uploadSequenceToken'])) {
                $this->sequenceToken = (string) $stream['uploadSequenceToken'];
            }
        }
    }
}
