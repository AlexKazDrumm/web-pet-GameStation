#!/bin/sh
set -e

echo "→ applying database migrations"
npx prisma migrate deploy

echo "→ starting API"
exec "$@"
