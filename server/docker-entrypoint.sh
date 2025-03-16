#!/bin/sh

echo "Waiting for database to be ready..."

# Check if database is ready
check_db() {
  pg_isready -h $DB_HOST -p $DB_PORT -U $DB_USER
  return $?
}

# Wait for database with retries
wait_for_db() {
  local retries=${DB_MAX_RETRIES:-5}
  local interval=${DB_RETRY_INTERVAL:-2000}
  interval=$((interval / 1000)) # Convert to seconds
  
  echo "Checking database connection (max retries: $retries, interval: ${interval}s)..."
  
  local i=0
  while [ $i -lt $retries ]; do
    if check_db; then
      echo "Database is ready!"
      return 0
    fi
    
    i=$((i+1))
    echo "Database connection attempt $i/$retries failed, retrying in ${interval}s..."
    sleep $interval
  done
  
  echo "Failed to connect to database after $retries attempts"
  return 1
}

# Check if database exists and create it if it doesn't
ensure_database_exists() {
  echo "Checking if database '$DB_NAME' exists..."
  
  # Connect to default 'postgres' database to check if our target database exists
  if ! PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -lqt | cut -d \| -f 1 | grep -qw $DB_NAME; then
    echo "Database '$DB_NAME' does not exist. Creating..."
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "CREATE DATABASE $DB_NAME;"
    echo "Database '$DB_NAME' created successfully!"
  else
    echo "Database '$DB_NAME' already exists."
  fi
}

# Wait for database before starting the application
if wait_for_db; then
  # Ensure database exists
  ensure_database_exists
  
  echo "Running database migrations..."
  npm run migrate
  
  if [ "$NODE_ENV" = "development" ]; then
    echo "Starting application in development mode..."
    exec npm run dev
  else
    echo "Starting application..."
    exec npm start
  fi
else
  echo "Could not connect to database, exiting..."
  exit 1
fi 