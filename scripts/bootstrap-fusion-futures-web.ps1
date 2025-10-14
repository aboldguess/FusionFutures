#!/usr/bin/env pwsh
<#+
.SYNOPSIS
    Mini README: Windows-first bootstrapper for the Fusion Futures web application.
.DESCRIPTION
    Installs root and web dependencies, ensures `.env.local` exists, and prints the
    primary npm commands. Designed for PowerShell 7+ so that Windows users do not
    need WSL to get started.
.NOTES
    Run from any PowerShell terminal: `pwsh -File scripts/bootstrap-fusion-futures-web.ps1`
#>

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..'))
$webDir = Join-Path $repoRoot 'apps/web'

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    throw 'npm is not available. Install Node.js LTS from https://nodejs.org/ and try again.'
}

Write-Host '🔧 Installing root dependencies...' -ForegroundColor Cyan
Push-Location $repoRoot
try {
    # Ensure root dependencies install cleanly before moving on to the web app packages.
    npm install
    Write-Host '🔧 Installing web app dependencies...' -ForegroundColor Cyan
    npm install --prefix $webDir
}
finally {
    # Always restore the original working directory even if installation fails.
    Pop-Location
}

$envFile = Join-Path $webDir '.env.local'
$exampleEnv = Join-Path $webDir '.env.example'
if (-not (Test-Path $envFile)) {
    if (-not (Test-Path $exampleEnv)) {
        throw ".env template not found at $exampleEnv. Please ensure the repository is up to date."
    }

    Write-Host '📝 Creating local environment file from .env.example...' -ForegroundColor Cyan
    Copy-Item -Path $exampleEnv -Destination $envFile
}

Write-Host '✅ Setup complete. Primary commands:' -ForegroundColor Green
Write-Host '  npm run dev:web              # Start the development server (use $env:PORT or -- --port to change port)'
Write-Host '  npm run build:web            # Create an optimised production build'
Write-Host '  npm run start:web            # Serve the production build'
Write-Host '  npm run lint:web             # Run ESLint'
Write-Host '  npm run test:web             # Execute Vitest suites'

Write-Host "🐍 Optional: create a Python venv if you're extending backend tooling:"
Write-Host '  python -m venv .venv; .\.venv\Scripts\Activate.ps1' -ForegroundColor DarkGray
