# ============================================================================
# File: infra/docker/services/backup.Dockerfile
# Purpose: Provide lightweight container for database backups.
# Structure: Copies backup script and schedules via cron-compatible entrypoint.
# Usage: Invoked by docker-compose backup service.
# ============================================================================
FROM alpine:3.19
RUN apk add --no-cache bash tzdata
WORKDIR /scripts
COPY infra/docker/scripts/run-backup.sh /scripts/run-backup.sh
RUN chmod +x /scripts/run-backup.sh
CMD ["/bin/sh", "/scripts/run-backup.sh"]
