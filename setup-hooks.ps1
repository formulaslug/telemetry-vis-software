# PowerShell script for setting up Git hooks on Windows
$ErrorActionPreference = "Stop"

$HOOK_SOURCE_UNIX = ".githooks/pre-commit"
$HOOK_SOURCE_WINDOWS = ".githooks/pre-commit.ps1"
$HOOK_TARGET = ".git/hooks/pre-commit"

Write-Host "🛠️  FS-3 Telemetry: Pre-Commit Hook Setup"

# Check if source hooks exist
if (-not (Test-Path $HOOK_SOURCE_UNIX) -and -not (Test-Path $HOOK_SOURCE_WINDOWS)) {
    Write-Host "❌ Error: Cannot find hook sources at $HOOK_SOURCE_UNIX or $HOOK_SOURCE_WINDOWS"
    exit 1
}

# Create .git/hooks if needed
if (-not (Test-Path ".git/hooks")) {
    Write-Host "📂 Creating .git/hooks directory..."
    New-Item -ItemType Directory -Force -Path ".git/hooks"
}

# Create the hook file
Write-Host "🔗 Creating $HOOK_TARGET"

# Prefer to use git bash, otherwise use PowerShell
$gitBashPath = "${env:ProgramFiles}\Git\bin\bash.exe"
if (Test-Path $gitBashPath) {
    Write-Host "📝 Using Unix-style hook with Git Bash"
    Copy-Item -Path $HOOK_SOURCE_UNIX -Destination $HOOK_TARGET -Force
} else {
    Write-Host "📝 Using PowerShell hook"
    Copy-Item -Path $HOOK_SOURCE_WINDOWS -Destination $HOOK_TARGET -Force
}

# (We'll keep the message for consistency)
Write-Host "🔒 Hook file created"

# Finish up
Write-Host "✅ Pre-commit hook installed!"
Write-Host "🚦 Try staging files and committing changes!" 