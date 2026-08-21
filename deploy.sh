#!/usr/bin/env bash
# Deploy publicationmart.com to Hostinger.
#   ./deploy.sh                 preview what would upload (safe, default)
#   ./deploy.sh --push          upload changed source files
#   ./deploy.sh --push --assets also upload public/build (after npm run build)
set -euo pipefail

REMOTE="publicationmart"
RPATH="domains/publicationmart.com/public_html"
PUSH=0; ASSETS=0
for a in "$@"; do
  case "$a" in
    --push)   PUSH=1 ;;
    --assets) ASSETS=1 ;;
    *) echo "unknown option: $a"; exit 1 ;;
  esac
done

cd "$(dirname "$0")"

if [ -n "$(git status --porcelain)" ]; then
  echo "!! You have uncommitted changes. Commit them first so there's a record of what shipped."
  git status --short
  exit 1
fi

if git rev-parse --verify -q deployed >/dev/null 2>&1; then
  FILES=$(git diff --name-only --diff-filter=ACMR deployed HEAD)
  DELETED=$(git diff --name-only --diff-filter=D deployed HEAD)
else
  echo "(no 'deployed' marker yet - treating every tracked file as new)"
  FILES=$(git ls-files); DELETED=""
fi

[ "$ASSETS" -eq 1 ] && FILES="$FILES"$'\n'"$(find public/build -type f 2>/dev/null || true)"
FILES=$(echo "$FILES" | grep -v '^$' | sort -u || true)

if [ -z "$FILES" ] && [ -z "$DELETED" ]; then echo "Nothing changed since last deploy."; exit 0; fi

echo "=== would upload ($(echo "$FILES" | grep -c . || echo 0) files) ==="
echo "$FILES" | sed 's/^/  + /'
if [ -n "$DELETED" ]; then
  echo "=== deleted locally (NOT removed on server - do that by hand) ==="
  echo "$DELETED" | sed 's/^/  - /'
fi

if [ "$PUSH" -eq 0 ]; then
  echo
  echo "Preview only. Re-run with --push to actually upload."
  exit 0
fi

STAMP=$(date +%Y%m%d-%H%M%S)
echo; echo "=== backing up the files being replaced -> ~/backups/pm-$STAMP.tgz ==="
echo "$FILES" > /tmp/pm-deploy-list.txt
ssh "$REMOTE" "mkdir -p ~/backups"
ssh "$REMOTE" "cd $RPATH && tar -czf ~/backups/pm-$STAMP.tgz -T - 2>/dev/null || true" < /tmp/pm-deploy-list.txt

echo "=== uploading ==="
tar -czf - -T /tmp/pm-deploy-list.txt | ssh "$REMOTE" "tar -xzf - -C $RPATH"

echo "=== clearing Laravel caches ==="
ssh "$REMOTE" "cd $RPATH && php artisan config:clear && php artisan view:clear && php artisan route:clear" || echo "(cache clear failed - check manually)"

git tag -f deployed HEAD >/dev/null
echo
echo "=== DONE ==="
echo "Rollback:  ssh $REMOTE 'cd $RPATH && tar -xzf ~/backups/pm-$STAMP.tgz'"
