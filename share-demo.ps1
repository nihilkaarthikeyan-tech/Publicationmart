# Share the 2.0 site with someone outside your network, for a demo.
#
# Everything runs on THIS machine and a temporary public link points at it.
# The live site is never involved: different machine, different database, and
# APP_ENV stays "local" so the payment guard keeps blocking real transactions.
# Close this window and the link stops working.
#
#   Run:  .\share-demo.ps1
#   Stop: Ctrl+C in this window

$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
Set-Location $root

$php = 'D:/dev/php/php.exe'
$envPath   = Join-Path $root '.env'
$envBackup = Join-Path $root '.env.demo-backup'

function Test-Port($p) {
    try { (New-Object Net.Sockets.TcpClient).Connect('127.0.0.1', $p); return $true }
    catch { return $false }
}

Write-Host ""
Write-Host "  Preparing the 2.0 demo" -ForegroundColor Cyan
Write-Host "  ----------------------"

# 1. Database ---------------------------------------------------------------
if (Test-Port 3307) {
    Write-Host "  MariaDB already running" -ForegroundColor Green
} else {
    Write-Host "  starting MariaDB..." -NoNewline
    Start-Process -FilePath 'D:/dev/mariadb/bin/mysqld.exe' `
                  -ArgumentList '--defaults-file=D:/dev/mariadb/data/my.ini' `
                  -WindowStyle Hidden
    $ok = $false
    foreach ($i in 1..40) {
        Start-Sleep -Milliseconds 500
        if (Test-Port 3307) { $ok = $true; break }
    }
    if ($ok) { Write-Host " up" -ForegroundColor Green }
    else {
        Write-Host " FAILED" -ForegroundColor Red
        Write-Host "  MariaDB would not start. Check D:/dev/mariadb/data for a .err file."
        exit 1
    }
}

# 2. Hide stack traces ------------------------------------------------------
# A crash in front of your manager should be a tidy error page, not a stack
# trace listing your database password. Restored when this script exits.
Copy-Item $envPath $envBackup -Force
(Get-Content $envPath) -replace '^APP_DEBUG=.*', 'APP_DEBUG=false' |
    Set-Content $envPath -Encoding utf8
& $php artisan config:clear | Out-Null
Write-Host "  debug output hidden" -ForegroundColor Green

# 3. The app ----------------------------------------------------------------
Write-Host "  building front-end..." -NoNewline
& npm run build 2>&1 | Out-Null
Write-Host " done" -ForegroundColor Green

$serve = Start-Process -FilePath $php `
                       -ArgumentList 'artisan', 'serve', '--host=127.0.0.1', '--port=8000' `
                       -PassThru -WindowStyle Hidden
Start-Sleep -Seconds 3

# 4. The public link --------------------------------------------------------
Write-Host ""
Write-Host "  Look for the https://<something>.trycloudflare.com address below." -ForegroundColor Cyan
Write-Host "  That is the link you send your manager." -ForegroundColor Cyan
Write-Host "  Press Ctrl+C here when he has finished looking." -ForegroundColor DarkGray
Write-Host ""

try {
    & cloudflared tunnel --url http://127.0.0.1:8000
}
finally {
    Write-Host ""
    Write-Host "  shutting down..." -ForegroundColor DarkGray
    if ($serve -and -not $serve.HasExited) {
        Stop-Process -Id $serve.Id -Force -ErrorAction SilentlyContinue
    }
    if (Test-Path $envBackup) {
        Move-Item $envBackup $envPath -Force
        & $php artisan config:clear | Out-Null
        Write-Host "  .env restored, link closed." -ForegroundColor Green
    }
}
