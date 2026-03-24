#!/bin/sh
set -e

echo "Running database migrations..."
npx prisma db push --skip-generate 2>/dev/null || echo "Warning: Could not run migrations. Make sure DATABASE_URL is set."

echo "Starting application..."
exec "$@"
