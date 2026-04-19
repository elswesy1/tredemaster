# Script to add force-dynamic exports to all API route files
# This prevents "Dynamic server usage" errors during Next.js build

$apiDir = "src\app\api"
$routeFiles = Get-ChildItem -Recurse -Path $apiDir -Filter "route.ts"

$fixedCount = 0
$alreadyFixed = 0
$skipped = 0

$exportLines = @"
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
"@

foreach ($file in $routeFiles) {
    $content = Get-Content $file.FullName -Raw
    
    # Skip if already has the fix
    if ($content -match "export const dynamic = 'force-dynamic'") {
        $alreadyFixed++
        Write-Host "[SKIP] Already fixed: $($file.FullName)" -ForegroundColor Yellow
        continue
    }
    
    # Find the insertion point: after the last import statement
    $lines = Get-Content $file.FullName
    $lastImportLine = -1
    
    for ($i = 0; $i -lt $lines.Count; $i++) {
        $line = $lines[$i].Trim()
        if ($line -match "^import " -or $line -match "^import\{") {
            $lastImportLine = $i
        }
        # Also handle multi-line imports
        if ($line -match "^} from ") {
            $lastImportLine = $i
        }
    }
    
    if ($lastImportLine -eq -1) {
        # No imports found - insert at the top
        $newContent = $exportLines + "`r`n" + $content
    } else {
        # Insert after the last import line
        $before = $lines[0..$lastImportLine] -join "`r`n"
        $after = ""
        if ($lastImportLine + 1 -lt $lines.Count) {
            $after = $lines[($lastImportLine + 1)..($lines.Count - 1)] -join "`r`n"
        }
        $newContent = $before + "`r`n" + $exportLines + "`r`n" + $after
    }
    
    Set-Content -Path $file.FullName -Value $newContent -NoNewline
    $fixedCount++
    Write-Host "[FIXED] $($file.FullName)" -ForegroundColor Green
}

Write-Host ""
Write-Host "========== SUMMARY ==========" -ForegroundColor Cyan
Write-Host "Total route files: $($routeFiles.Count)" -ForegroundColor White
Write-Host "Fixed: $fixedCount" -ForegroundColor Green
Write-Host "Already fixed: $alreadyFixed" -ForegroundColor Yellow
Write-Host "Skipped: $skipped" -ForegroundColor Red
