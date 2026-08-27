<?php

namespace Tests\Feature;

use Tests\TestCase;

/**
 * Internal exception text must never be returned to users — it leaks file
 * paths, SQL fragments and database structure. This scans the user-facing
 * controllers for the pattern rather than trying to trigger every error.
 */
class ErrorLeakageTest extends TestCase
{
    public function test_user_facing_controllers_do_not_return_raw_exception_text(): void
    {
        $offenders = [];

        $files = array_merge(
            glob(app_path('Http/Controllers/*.php')),
            glob(app_path('Http/Controllers/Books/*.php')),
            glob(app_path('Http/Controllers/Api/*.php')),
            glob(app_path('Http/Controllers/Api/Ai/*.php')),
        );

        foreach ($files as $file) {
            foreach (file($file) as $i => $line) {
                // A response/redirect handing $e->getMessage() back to the user.
                $returnsToUser = preg_match("/('message'|'error')\s*=>.*getMessage\(\)/", $line)
                    || preg_match("/with\('error',.*getMessage\(\)/", $line);

                if (!$returnsToUser) {
                    continue;
                }
                // Guarded by app.debug is acceptable.
                if (str_contains($line, "config('app.debug')")) {
                    continue;
                }
                // Logging is fine — only responses matter.
                if (preg_match('/Log::(error|warning|info|critical)/', $line)) {
                    continue;
                }

                $offenders[] = basename($file) . ':' . ($i + 1);
            }
        }

        $this->assertSame([], $offenders,
            "These return raw exception text to users:\n" . implode("\n", $offenders));
    }
}
