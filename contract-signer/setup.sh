#!/bin/bash
set -e

echo "========================================="
echo "  NETkyu Contract Signer - Local Setup"
echo "========================================="
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
  echo "ERROR: Node.js is not installed. Install it from https://nodejs.org"
  exit 1
fi
echo "Node.js $(node -v) found"

# Check if PostgreSQL is available
export PATH="/opt/homebrew/opt/postgresql@16/bin:/opt/homebrew/opt/postgresql@17/bin:$PATH"

if ! command -v psql &> /dev/null; then
  echo "ERROR: PostgreSQL not found. Install with: brew install postgresql@16"
  exit 1
fi
echo "PostgreSQL found"

# Try to start PostgreSQL if not running
if ! pg_isready -q 2>/dev/null; then
  echo "Starting PostgreSQL..."
  pg_ctl -D /opt/homebrew/var/postgresql@16 start 2>/dev/null || \
  pg_ctl -D /opt/homebrew/var/postgresql@17 start 2>/dev/null || true
  sleep 2
fi

if ! pg_isready -q 2>/dev/null; then
  echo "ERROR: PostgreSQL is not running. Start it manually."
  exit 1
fi
echo "PostgreSQL is running"

# Create database if not exists
if psql -lqt 2>/dev/null | cut -d \| -f 1 | grep -qw contract_signer; then
  echo "Database 'contract_signer' already exists"
else
  echo "Creating database 'contract_signer'..."
  createdb contract_signer
fi

# Get current macOS username for DATABASE_URL
DB_USER=$(whoami)

# Create .env if not exists
if [ ! -f .env ]; then
  echo "Creating .env file..."
  SECRET=$(openssl rand -base64 32)
  cat > .env << ENVEOF
# Database
DATABASE_URL="postgresql://${DB_USER}@localhost:5432/contract_signer"

# NextAuth
NEXTAUTH_SECRET="${SECRET}"
NEXTAUTH_URL="http://localhost:3000"

# App URL (used for signing links in emails)
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Email (Resend - get your key at https://resend.com)
RESEND_API_KEY="re_TQv3YS7b_83eBAzJeE5nep4SDHp2eHrFw"
EMAIL_FROM="NETkyu Contract Signer <office@netkyu.com>"
ENVEOF
  echo ".env created"
else
  echo ".env already exists"
fi

# Install dependencies
echo ""
echo "Installing dependencies..."
npm install

# Generate Prisma client
echo ""
echo "Generating Prisma client..."
npx prisma generate

# Push schema to database
echo ""
echo "Setting up database schema..."
npx prisma db push

# Seed admin user
echo ""
echo "Seeding admin user..."
npx prisma db seed

echo ""
echo "========================================="
echo "  Setup complete!"
echo "========================================="
echo ""
echo "Run:  npm run dev"
echo "Open: http://localhost:3000"
echo ""
echo "Login: admin@netkyu.com / admin123"
echo "========================================="
