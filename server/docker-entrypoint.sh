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

# Wait for database before starting the application
if wait_for_db; then
  echo "Skipping database migrations for now..."
  
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