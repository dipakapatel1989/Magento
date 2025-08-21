<?php

declare(strict_types=1);

namespace Nakshatra\SystemLogs\Service;

use Magento\Framework\App\Filesystem\DirectoryList;
use Magento\Framework\Filesystem;
use Magento\Framework\Exception\LocalizedException;
use Magento\Framework\Session\SessionManagerInterface;
use Magento\Framework\Filesystem\Directory\ReadInterface;
use Magento\Framework\Filesystem\Directory\WriteInterface;

class LogReaderService
{
    private const ALLOWED_LOGS = ['debug.log', 'exception.log', 'system.log'];

    private readonly ReadInterface $logDirectory;
    private readonly WriteInterface $logWriteDirectory;

    public function __construct(
        private readonly Filesystem $filesystem,
        private readonly SessionManagerInterface $session
    ) {
        $this->logDirectory = $this->filesystem->getDirectoryRead(DirectoryList::LOG);
        $this->logWriteDirectory = $this->filesystem->getDirectoryWrite(DirectoryList::LOG);
    }

    /**
     * Get logs with filtering and pagination
     */
    public function getLogs(
        string $filename,
        int $page,
        int $perPage,
        string $levelFilter = '',
        string $searchFilter = '',
        bool $realtime = false
    ): array {
        $this->validateLogFile($filename);

        if (!$this->logDirectory->isExist($filename)) {
            return [
                'logs' => [],
                'pagination' => ['current' => 1, 'total' => 1, 'hasNext' => false, 'hasPrev' => false],
                'fileSize' => 0,
                'lastModified' => null
            ];
        }

        $stat = $this->logDirectory->stat($filename);
        $fileSize = $stat['size'];
        $lastModified = $stat['mtime'];

        if ($realtime) {
            return $this->getRealtimeUpdates($filename, $fileSize);
        }

        $lines = $this->readLogLines($filename);
        $filteredLines = $this->applyFilters($lines, $levelFilter, $searchFilter);

        // Reverse for newest first
        $filteredLines = array_reverse($filteredLines);

        // Calculate pagination
        $totalLines = count($filteredLines);
        $totalPages = max(1, (int) ceil($totalLines / $perPage));
        $offset = ($page - 1) * $perPage;

        $paginatedLines = array_slice($filteredLines, $offset, $perPage);
        $parsedLogs = array_map([$this, 'parseLogLine'], $paginatedLines);

        return [
            'logs' => $parsedLogs,
            'pagination' => [
                'current' => $page,
                'total' => $totalPages,
                'hasNext' => $page < $totalPages,
                'hasPrev' => $page > 1,
                'totalEntries' => $totalLines
            ],
            'fileSize' => $this->formatBytes($fileSize),
            'lastModified' => date('Y-m-d H:i:s', $lastModified)
        ];
    }

    /**
     * Clear a log file
     */
    public function clearLog(string $filename): void
    {
        $this->validateLogFile($filename);

        if (!$this->logDirectory->isExist($filename)) {
            throw new LocalizedException(__("Log file %1 does not exist", $filename));
        }

        if (!$this->logWriteDirectory->isWritable($filename)) {
            throw new LocalizedException(__("Log file %1 is not writable", $filename));
        }

        $this->logWriteDirectory->writeFile($filename, '');
    }

    /**
     * Validate log file name
     */
    private function validateLogFile(string $filename): void
    {
        if (!in_array($filename, self::ALLOWED_LOGS, true)) {
            throw new LocalizedException(__('Invalid log file: %1', $filename));
        }
    }

    /**
     * Read all lines from log file
     */
    private function readLogLines(string $filename): array
    {
        $content = $this->logDirectory->readFile($filename);
        return array_filter(explode("\n", $content), fn($line) => trim($line) !== '');
    }

    /**
     * Apply level and search filters
     */
    private function applyFilters(array $lines, string $levelFilter, string $searchFilter): array
    {
        return array_filter($lines, function ($line) use ($levelFilter, $searchFilter) {
            // Level filter
            if ($levelFilter && !str_contains(strtolower($line), "[{$levelFilter}]")) {
                return false;
            }

            // Search filter
            if ($searchFilter && !str_contains(strtolower($line), strtolower($searchFilter))) {
                return false;
            }

            return true;
        });
    }

    /**
     * Parse a single log line
     */
    private function parseLogLine(string $line): array
    {
        // Parse Magento log format: [2024-01-20T10:30:15.123456+00:00] main.LEVEL: message [] []
        $pattern = '/^\[([^\]]+)\]\s+([^.]+)\.(\w+):\s+(.+?)(?:\s+\[\])*\s*$/';

        if (preg_match($pattern, $line, $matches)) {
            return [
                'timestamp' => $matches[1],
                'channel' => $matches[2],
                'level' => strtoupper($matches[3]),
                'message' => trim($matches[4]),
                'raw' => $line,
                'levelClass' => $this->getLevelClass(strtoupper($matches[3]))
            ];
        }

        // Fallback for non-standard formats or stack traces
        return [
            'timestamp' => '',
            'channel' => '',
            'level' => 'INFO',
            'message' => $line,
            'raw' => $line,
            'levelClass' => 'info'
        ];
    }

    /**
     * Get CSS class for log level
     */
    private function getLevelClass(string $level): string
    {
        return match($level) {
            'ERROR', 'CRITICAL', 'ALERT', 'EMERGENCY' => 'error',
            'WARNING' => 'warning',
            'DEBUG' => 'debug',
            'INFO', 'NOTICE' => 'info',
            default => 'info'
        };
    }

    /**
     * Get realtime updates
     */
    private function getRealtimeUpdates(string $filename, int $currentSize): array
    {
        $sessionKey = 'system_logs_last_size_' . str_replace('.', '_', $filename);
        $lastSize = (int) $this->session->getData($sessionKey, 0);

        if ($currentSize <= $lastSize) {
            return ['logs' => [], 'newEntries' => 0];
        }

        $content = $this->logDirectory->readFile($filename);
        $newContent = substr($content, $lastSize);
        $newLines = array_filter(explode("\n", $newContent), fn($line) => trim($line) !== '');

        $this->session->setData($sessionKey, $currentSize);

        $parsedLogs = array_map([$this, 'parseLogLine'], $newLines);

        return [
            'logs' => array_reverse($parsedLogs),
            'newEntries' => count($parsedLogs)
        ];
    }

    /**
     * Format file size
     */
    private function formatBytes(int $size): string
    {
        $units = ['B', 'KB', 'MB', 'GB'];
        $power = $size > 0 ? floor(log($size, 1024)) : 0;
        return number_format($size / (1024 ** $power), 2) . ' ' . $units[$power];
    }
}
