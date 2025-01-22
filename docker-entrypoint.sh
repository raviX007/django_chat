#!/bin/bash

# Get secrets and convert JSON to env format
aws secretsmanager get-secret-value --secret-id django-chat-app-env --region ap-south-1 --query SecretString --output text | jq -r 'to_entries | .[] | .key + "=" + .value' > .env

# Source the environment variables
set -a
source .env
set +a

# Debug: Print connection details (excluding sensitive data)
echo "Attempting database connection to:"
echo "Host: $DB_HOST"
echo "Port: $DB_PORT"
echo "Database: $DB_NAME"
echo "User: $DB_USER"

# Health check function with verbose output
postgres_ready() {
 echo "Trying to connect to $DB_HOST:$DB_PORT..."
 PGPASSWORD=$DB_PASSWORD psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -p "$DB_PORT" -c '\q' 2>&1
 return $?
}

# Wait for postgres with timeout
TIMEOUT=60
echo "Checking database connection..."
RETRIES=0
until postgres_ready || [ $RETRIES -eq $TIMEOUT ]; do
 echo "Database not ready, retrying... (Attempt $RETRIES of $TIMEOUT)"
 RETRIES=$((RETRIES+1))
 sleep 1
done

if [ $RETRIES -eq $TIMEOUT ]; then
 echo "Database connection timeout after $TIMEOUT attempts"
 exit 1
fi

echo "Database connection successful!"

# Run migrations
echo "Running migrations..."
python manage.py migrate

# Start Daphne
echo "Starting Daphne server on port $APP_PORT..."
exec daphne -b 0.0.0.0 -p $APP_PORT chat_project.asgi:application