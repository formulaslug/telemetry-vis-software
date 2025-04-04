$ErrorActionPreference = "Stop"

# Header
Write-Host "`n====================================="
Write-Host "      FS-3 Telemetry Code Checks     "
Write-Host "====================================="

# Get staged files
$FILES = git diff --cached --name-only --diff-filter=ACM
$FORMATTABLE_FILES = $FILES | Where-Object { $_ -match '\.(js|ts|jsx|tsx|html|css|json|md|yaml|yml)$' }

# Check if there are any files to format
if (-not $FORMATTABLE_FILES) {
    Write-Host "✅ No files to format. You're good to go!`n"
    exit 0
}

$TOTAL = ($FORMATTABLE_FILES | Measure-Object).Count

# Format!
$INDEX = 1
foreach ($FILE in $FORMATTABLE_FILES) {
    $TOOL = "🎨 prettier"
    npx prettier --write $FILE *>$null
    git add $FILE
    Write-Host "[$INDEX/$TOTAL] $TOOL $FILE"
    $INDEX++
}

# Footer
Write-Host "`n✅ All formatted! Pre-commit complete.`n" 