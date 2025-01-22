#!/bin/bash

set -a
source .env
set +a

# DB health check
postgres_ready() {
  PGPASSWORD=$DB_PASSWORD psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME"  -p "$DB_PORT" -c '\q' 2>/dev/null
  return $?
}

# Wait for postgres
TIMEOUT=60
echo "Checking database connection..."
RETRIES=0
until postgres_ready || [ $RETRIES -eq $TIMEOUT ]; do
  echo "Database not ready, retrying..."
  RETRIES=$((RETRIES+1))
  sleep 1
done

python manage.py migrate
exec daphne -b 0.0.0.0 -p $APP_PORT chat_project.asgi:application