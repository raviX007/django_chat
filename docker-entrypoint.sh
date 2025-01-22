#!/bin/bash

# Get secrets with error handling
if ! aws secretsmanager get-secret-value --secret-id django-chat-app-env --region ap-south-1 --query SecretString --output text > .env; then
    echo "Failed to fetch secrets from AWS Secrets Manager"
    exit 1
fi
# Source the environment variables
set -a
source .env
set +a

# Health check function
postgres_ready() {
  PGPASSWORD=$DB_PASSWORD psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -p "$DB_PORT" -c '\q' 2>/dev/null
  return $?
}

# Wait for postgres with timeout
TIMEOUT=60
echo "Checking database connection..."
RETRIES=0
until postgres_ready || [ $RETRIES -eq $TIMEOUT ]; do
  echo "Database not ready, retrying..."
  RETRIES=$((RETRIES+1))
  sleep 1
done

if [ $RETRIES -eq $TIMEOUT ]; then
  echo "Database connection timeout"
  exit 1
fi

# Run migrations
python manage.py migrate

# Start Daphne
exec daphne -b 0.0.0.0 -p $APP_PORT chat_project.asgi:application