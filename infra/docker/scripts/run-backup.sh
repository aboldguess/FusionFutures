#!/bin/sh
# ============================================================================
# File: infra/docker/scripts/run-backup.sh
# Purpose: Nightly backup script for Postgres database using pg_dump.
# Structure: Creates timestamped dumps in /backups and prunes old files.
# Usage: Executed by backup container entrypoint.
# ============================================================================
set -euo pipefail
BACKUP_DIR=/backups
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
mkdir -p "$BACKUP_DIR"
pg_dump -h postgres -U fusion -F c -b -v -f "$BACKUP_DIR/fusion-$TIMESTAMP.dump" fusion
find "$BACKUP_DIR" -type f -mtime +14 -delete
