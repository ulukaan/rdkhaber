#!/usr/bin/env bash
# MySQL yedeği — cron veya manuel çalıştırma için.
# Kullanım: DATABASE_URL=mysql://... ./scripts/backup-db.sh

set -euo pipefail

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "DATABASE_URL tanımlı değil." >&2
  exit 1
fi

BACKUP_DIR="${BACKUP_DIR:-./backups}"
mkdir -p "$BACKUP_DIR"

STAMP="$(date +%Y%m%d-%H%M%S)"
OUT="$BACKUP_DIR/rdkhaber-$STAMP.sql.gz"

# mysql://user:pass@host:port/db
PARSED="${DATABASE_URL#mysql://}"
CREDS="${PARSED%%@*}"
REST="${PARSED#*@}"
HOSTPORT="${REST%%/*}"
DB="${REST#*/}"
DB="${DB%%\?*}"

USER="${CREDS%%:*}"
PASS="${CREDS#*:}"
HOST="${HOSTPORT%%:*}"
PORT="${HOSTPORT#*:}"
[[ "$PORT" == "$HOST" ]] && PORT=3306

export MYSQL_PWD="$PASS"
mysqldump -h "$HOST" -P "$PORT" -u "$USER" --single-transaction --routines --triggers "$DB" | gzip > "$OUT"
unset MYSQL_PWD

echo "Yedek: $OUT"
