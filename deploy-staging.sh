#!/usr/bin/env bash
# Deploy the work-in-progress branch to the STAGING site, for review.
#   ./deploy-staging.sh                 preview what would upload (safe, default)
#   ./deploy-staging.sh --push          upload changed source files
#   ./deploy-staging.sh --push --assets also upload public/build (after npm run build)
#
# This is the sibling of deploy.sh and the two can never be confused:
# deploy.sh refuses every branch except main, this one refuses main itself,
# and each writes to a different folder on the server. Staging has its own
# database and its own .env, so nothing it does can reach the live site.
set -euo pipefail

REMOTE="publicationmart"

# The staging subdomain's document root.
#
# Hostinger's Subdomains page can only create folders underneath public_html,
# so staging necessarily lives inside the live site's directory tree. Two facts
# make that safe, and they were both checked rather than assumed:
#
#   - tar -C extracts relative paths into RPATH. Nothing in a git-tracked file
#     list begins with ../, so an upload physically cannot climb out of it.
#   - the live site's root .htaccess rewrites every request into public/, so
#     publicationmart.com/beta resolves to public/beta and returns 404.
#     Staging is reachable only through beta.publicationmart.com.
RPATH="domains/publicationmart.com/public_html/beta"

LIVE_PATH="domains/publicationmart.com/public_html"

PUSH=0; ASSETS=0
for a in "$@"; do
  case "$a" in
    --push)   PUSH=1 ;;
    --assets) ASSETS=1 ;;
    *) echo "unknown option: $a"; exit 1 ;;
  esac
done

cd "$(dirname "$0")"

# Guard 1: the live application root is never a valid target. A folder beneath
# it is (see the note on RPATH above); the root itself, or any path that would
# contain it, is not.
if [ "$RPATH" = "$LIVE_PATH" ] || [ "$RPATH" = "$LIVE_PATH/" ]; then
  echo "!! RPATH is the live application root. Refusing."
  exit 1
fi
case "$LIVE_PATH" in
  "$RPATH"/*) echo "!! RPATH contains the live site. Refusing."; exit 1 ;;
esac

# Guard 2: main belongs on the live site, deployed by deploy.sh. Staging exists
# to show work that is NOT yet on main, so deploying main here is a mistake.
CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
if [ "$CURRENT_BRANCH" = "main" ]; then
  echo "!! You are on 'main'. Staging is for reviewing unreleased work."
  echo "   To publish main to the live site, use ./deploy.sh instead."
  exit 1
fi

if [ -n "$(git status --porcelain)" ]; then
  echo "!! You have uncommitted changes. Commit them first so there's a record of what your manager saw."
  git status --short
  exit 1
fi

# Staging tracks its own marker, so deploying here never disturbs the 'deployed'
# tag that records what is actually live.
if git rev-parse --verify -q staged >/dev/null 2>&1; then
  FILES=$(git diff --name-only --diff-filter=ACMR staged HEAD)
  DELETED=$(git diff --name-only --diff-filter=D staged HEAD)
else
  echo "(no 'staged' marker yet - treating every tracked file as new)"
  FILES=$(git ls-files); DELETED=""
fi

[ "$ASSETS" -eq 1 ] && FILES="$FILES"$'\n'"$(find public/build -type f 2>/dev/null || true)"

# .env is per-environment and lives only on the server. Uploading the local one
# would point staging at the production database.
FILES=$(echo "$FILES" | grep -v '^$' | grep -v '^\.env' | sort -u || true)

if [ -z "$FILES" ] && [ -z "$DELETED" ]; then echo "Nothing changed since the last staging deploy."; exit 0; fi

echo "=== branch '$CURRENT_BRANCH' -> $RPATH ==="
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

# Refuse to deploy into a folder that was never set up, rather than silently
# creating one in the wrong place.
if ! ssh "$REMOTE" "[ -d $RPATH ]"; then
  echo "!! $RPATH does not exist on the server."
  echo "   Create the subdomain in Hostinger's hPanel first, then re-run."
  exit 1
fi

# The path check above is textual. This one asks the server: resolve both
# directories and refuse if they turn out to be the same place — a symlink or a
# mistyped path that textual comparison would not catch.
if ssh "$REMOTE" "[ \"\$(readlink -f $RPATH)\" = \"\$(readlink -f $LIVE_PATH)\" ]"; then
  echo "!! $RPATH resolves to the live site on the server. Refusing."
  exit 1
fi

# The live site must own an artisan file; staging must not be sharing it.
if ssh "$REMOTE" "[ -f $RPATH/artisan ] && [ $RPATH/artisan -ef $LIVE_PATH/artisan ]"; then
  echo "!! $RPATH/artisan is the same file as the live site's. Refusing."
  exit 1
fi

echo "=== uploading ==="
echo "$FILES" > /tmp/pm-staging-list.txt
tar -czf - -T /tmp/pm-staging-list.txt | ssh "$REMOTE" "tar -xzf - -C $RPATH"

# Staging must never appear in Google: it is the same content as the live site,
# and an indexed copy competes with the real one for its own search results.
echo "=== marking the site as no-index ==="
ssh "$REMOTE" "printf 'User-agent: *\nDisallow: /\n' > $RPATH/public/robots.txt"

echo "=== clearing Laravel caches ==="
ssh "$REMOTE" "cd $RPATH && php artisan config:clear && php artisan view:clear && php artisan route:clear" || echo "(cache clear failed - check manually)"

git tag -f staged HEAD >/dev/null
echo
echo "=== DONE ==="
echo "Staging is now showing '$CURRENT_BRANCH' at https://beta.publicationmart.com"
echo "The live site was not touched."
