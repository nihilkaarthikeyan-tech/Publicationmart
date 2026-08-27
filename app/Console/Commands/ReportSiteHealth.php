<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

/**
 * Emails a short health report so a real person finds out when the site breaks,
 * instead of the errors sitting unread in a log file.
 *
 * Run it from a scheduled task (hPanel -> Cron Jobs):
 *   php artisan site:health-report
 *
 * Add --only-if-problems to stay silent on a healthy day.
 */
class ReportSiteHealth extends Command
{
    protected $signature = 'site:health-report
                            {--hours=24 : How far back to look}
                            {--only-if-problems : Send nothing when everything is fine}
                            {--to= : Override the recipient}';

    protected $description = 'Email a summary of recent errors and system health';

    public function handle(): int
    {
        $hours = (int) $this->option('hours') ?: 24;
        $since = now()->subHours($hours);

        $errors  = $this->recentErrors($since);
        $db      = $this->databaseHealth();
        $storage = $this->storageHealth();

        $problems = [];

        if ($errors['total'] > 0) {
            $problems[] = "{$errors['total']} application error(s) in the last {$hours}h";
        }
        if ($db['usage_percent'] >= 70) {
            $problems[] = "Database connections at {$db['usage_percent']}% of the limit";
        }
        if ($storage['log_mb'] > 50) {
            $problems[] = "Log file is {$storage['log_mb']} MB — rotation may not be running";
        }
        if ($db['failed_payments'] > 0) {
            $problems[] = "{$db['failed_payments']} failed payment(s) in the last {$hours}h";
        }

        if ($this->option('only-if-problems') && empty($problems)) {
            $this->info('All healthy — no email sent.');
            return self::SUCCESS;
        }

        $to = $this->option('to') ?: config('mail.from.address');
        $subject = empty($problems)
            ? 'PublicationMart: all healthy'
            : 'PublicationMart: ' . count($problems) . ' issue(s) need attention';

        $body = $this->buildBody($hours, $problems, $errors, $db, $storage);

        try {
            Mail::raw($body, function ($m) use ($to, $subject) {
                $m->to($to)->subject($subject);
            });
            $this->info("Health report sent to {$to}");
        } catch (\Throwable $e) {
            $this->error('Could not send the report: ' . $e->getMessage());
            $this->line($body);
            return self::FAILURE;
        }

        return self::SUCCESS;
    }

    /** Count and group ERROR lines written since the cutoff. */
    private function recentErrors(\Carbon\Carbon $since): array
    {
        $path = storage_path('logs/laravel.log');
        if (!is_file($path)) {
            return ['total' => 0, 'top' => []];
        }

        $total = 0;
        $types = [];

        // Read line by line so a large log never loads into memory.
        $fh = fopen($path, 'r');
        if (!$fh) {
            return ['total' => 0, 'top' => []];
        }

        while (($line = fgets($fh)) !== false) {
            if (!preg_match('/^\[([\d-]+ [\d:]+)\].*\.(ERROR|CRITICAL)/', $line, $m)) {
                continue;
            }
            try {
                if (\Carbon\Carbon::parse($m[1])->lt($since)) {
                    continue;
                }
            } catch (\Throwable $e) {
                continue;
            }

            $total++;
            // Group by the first part of the message so counts are meaningful.
            $key = preg_replace('/^\[[^\]]+\]\s*\w+\.\w+:\s*/', '', trim($line));
            $key = mb_substr($key, 0, 90);
            $types[$key] = ($types[$key] ?? 0) + 1;
        }
        fclose($fh);

        arsort($types);

        return ['total' => $total, 'top' => array_slice($types, 0, 8, true)];
    }

    private function databaseHealth(): array
    {
        $out = ['connections' => 0, 'limit' => 0, 'usage_percent' => 0, 'failed_payments' => 0];

        try {
            $threads = DB::select("SHOW STATUS LIKE 'Threads_connected'");
            $max     = DB::select("SHOW VARIABLES LIKE 'max_user_connections'");

            $out['connections'] = (int) ($threads[0]->Value ?? 0);
            $out['limit']       = (int) ($max[0]->Value ?? 0);

            if ($out['limit'] > 0) {
                $out['usage_percent'] = (int) round($out['connections'] / $out['limit'] * 100);
            }

            $out['failed_payments'] = DB::table('transactions')
                ->where('payment_status', 'failed')
                ->where('created_at', '>=', now()->subHours((int) $this->option('hours') ?: 24))
                ->count();
        } catch (\Throwable $e) {
            // Reported as-is; the email itself is the alert.
        }

        return $out;
    }

    private function storageHealth(): array
    {
        $log = storage_path('logs/laravel.log');

        return [
            'log_mb' => is_file($log) ? (int) round(filesize($log) / 1048576) : 0,
        ];
    }

    private function buildBody(int $hours, array $problems, array $errors, array $db, array $storage): string
    {
        $lines = [];
        $lines[] = 'PublicationMart health report';
        $lines[] = 'Window: last ' . $hours . ' hours';
        $lines[] = 'Generated: ' . now()->format('d M Y, H:i');
        $lines[] = str_repeat('=', 52);
        $lines[] = '';

        if (empty($problems)) {
            $lines[] = 'STATUS: healthy — nothing needs attention.';
        } else {
            $lines[] = 'STATUS: ' . count($problems) . ' issue(s) need attention';
            foreach ($problems as $p) {
                $lines[] = '  - ' . $p;
            }
        }

        $lines[] = '';
        $lines[] = 'DATABASE';
        $lines[] = "  connections : {$db['connections']} / {$db['limit']} ({$db['usage_percent']}%)";
        $lines[] = "  failed payments : {$db['failed_payments']}";
        $lines[] = '';
        $lines[] = 'ERRORS';
        $lines[] = "  total : {$errors['total']}";

        foreach ($errors['top'] as $msg => $count) {
            $lines[] = "  {$count}x  {$msg}";
        }

        $lines[] = '';
        $lines[] = 'STORAGE';
        $lines[] = "  laravel.log : {$storage['log_mb']} MB";
        $lines[] = '';
        $lines[] = 'Full log: storage/logs/laravel.log on the server.';

        return implode("\n", $lines);
    }
}
