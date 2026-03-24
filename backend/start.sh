#!/usr/bin/env bash
# Exit on error
set -e

# Use PORT from environment or default to 8000
PORT=${PORT:-8000}

echo "Ensuring database schema is correct on Neon..."
# Run our fix script before everything else
python fix_db.py

echo "Running migrations..."
alembic upgrade head || echo "Alembic upgrade failed, but schema fix should handle it."

echo "Starting server on port $PORT..."
uvicorn app.main:app --host 0.0.0.0 --port $PORT
