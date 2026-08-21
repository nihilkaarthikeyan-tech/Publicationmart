#!/usr/bin/env bash
# Run all automated checks. Use before every deploy.
#   bash check.sh
set -u
PHP=/d/dev/php/php.exe
FAIL=0

echo "=== 1/3  PHP syntax ==="
ERR=$(find app routes database config -name "*.php" -print0 | xargs -0 -n1 "$PHP" -l 2>&1 | grep -v "No syntax errors" || true)
if [ -n "$ERR" ]; then echo "$ERR"; FAIL=1; else echo "  OK"; fi

echo
echo "=== 2/3  Static analysis (PHPStan) ==="
if ! "$PHP" -d memory_limit=3G vendor/bin/phpstan analyse --no-progress --error-format=table 2>&1 | tail -5; then FAIL=1; fi

echo
echo "=== 3/3  Test suite (PHPUnit) ==="
if ! "$PHP" -d memory_limit=1G vendor/bin/phpunit 2>&1 | tail -8; then FAIL=1; fi

echo
if [ "$FAIL" -eq 0 ]; then echo "ALL CHECKS PASSED"; else echo "SOME CHECKS FAILED - do not deploy"; fi
exit $FAIL
