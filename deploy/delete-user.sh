#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# TinyPlan — data-deletion request runner (GDPR / CCPA / PIPEDA / COPPA)
#
# Thin wrapper around scripts/delete-user.mjs. Run from anywhere; it resolves
# the repo root from its own location and always operates on
# <repo>/data/tinyplan.db unless --db is passed through.
#
#   # 1) ALWAYS preview first (read-only, no changes):
#   deploy/delete-user.sh --email parent@example.com --dry-run
#
#   # 2) Then delete for real (asks you to retype the email to confirm):
#   deploy/delete-user.sh --email parent@example.com
#
#   # By user id instead of email:
#   deploy/delete-user.sh --user-id <uuid> --dry-run
#
# Deletes the LOCAL database record only. You MUST ALSO delete the user in Clerk
# to fully honor the request — see DEPLOY.md → "Honoring data-deletion requests".
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

# Resolve the directory this script lives in (deploy/), then the repo root.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

if ! command -v node >/dev/null 2>&1; then
  echo "Error: node is not installed or not on PATH." >&2
  exit 127
fi

# Run from the repo root so the default DB path (data/tinyplan.db) resolves,
# and pass through every argument unchanged.
exec node "$REPO_ROOT/scripts/delete-user.mjs" "$@"
