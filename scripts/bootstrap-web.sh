#!/usr/bin/env bash
#
# @file bootstrap-web.sh
# @description Mini README: One-stop installer for the Fusion Futures web application. Installs dependencies, copies
# environment templates, and prints the primary npm commands for developers on Linux/macOS systems.
#

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")"/.. && pwd)"
WEB_DIR="$ROOT_DIR/apps/web"

cd "$ROOT_DIR"

case "${OSTYPE:-}" in
  msys*|cygwin*|win32)
    echo "⚠️  Detected Windows shell. Please run 'pwsh -File scripts/bootstrap-fusion-futures-web.ps1' instead." >&2
    exit 1
    ;;
esac

echo "🔧 Installing root dependencies..."
npm install

echo "🔧 Installing web app dependencies..."
npm install --prefix "$WEB_DIR"

if [ ! -f "$WEB_DIR/.env.local" ]; then
  if [ ! -f "$WEB_DIR/.env.example" ]; then
    echo "❌ Missing .env example at $WEB_DIR/.env.example" >&2
    exit 1
  fi

  echo "📝 Creating local environment file..."
  cp "$WEB_DIR/.env.example" "$WEB_DIR/.env.local"
fi

echo "✅ Setup complete. Key commands:"
cat <<'COMMANDS'
  npm run dev:web        # Start the development server (uses PORT env variable)
  npm run build:web      # Create an optimised production build
  npm run start:web      # Serve the production build
  npm run lint:web       # Run ESLint
  npm run test:web       # Execute Vitest (no suites yet, returns success)
COMMANDS

if command -v python >/dev/null 2>&1; then
  echo "🐍 Tip: create a Python virtual environment if you plan to extend backend services."
fi
