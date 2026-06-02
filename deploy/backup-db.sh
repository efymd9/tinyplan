#!/usr/bin/env bash
# WAL-safe SQLite backup for TinyPlan.
#
# Uses sqlite3's online ".backup" (which checkpoints automatically), so it is
# safe to run while the app is live — unlike `cp tinyplan.db`, which can miss
# data still sitting in the -wal sidecar file.
#
# Schedule via cron (as the tinyplan user):
#   0 3 * * *  /srv/tinyplan/deploy/backup-db.sh >> /srv/tinyplan/backups/backup.log 2>&1
#
# Override paths/retention with env vars if needed.
set -euo pipefail

DB="${TINYPLAN_DB:-/srv/tinyplan/data/tinyplan.db}"
DEST="${TINYPLAN_BACKUP_DIR:-/srv/tinyplan/backups}"
RETAIN="${TINYPLAN_BACKUP_RETAIN:-14}"

mkdir -p "$DEST"
STAMP="$(date +%Y%m%d-%H%M%S)"
OUT="$DEST/tinyplan-$STAMP.db"

sqlite3 "$DB" ".backup '$OUT'"
gzip -f "$OUT"
echo "$(date -Is)  backup -> ${OUT}.gz"

# Prune old backups, keeping the newest $RETAIN.
ls -1t "$DEST"/tinyplan-*.db.gz 2>/dev/null | tail -n +$((RETAIN + 1)) | xargs -r rm -f
