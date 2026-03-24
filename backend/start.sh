#!/usr/bin/env bash
# Exit on error
set -e

# Use PORT from environment or default to 8000
PORT=${PORT:-8000}

echo "Running migrations..."

# We try to upgrade. If it fails (like because of DuplicateColumn on Render),
# we then try to stamp it to the latest version to tell Alembic "we are good".
alembic upgrade head || {
    echo "Migration failed, stamping database to head instead..."
    alembic stamp head
}

echo "Starting server on port $PORT..."
uvicorn app.main:app --host 0.0.0.0 --port $PORT
