# Controleur interactif du backend/frontend Gamify.
# Tape "start" pour lancer les deux serveurs (chacun dans sa propre fenetre
# PowerShell), "stop" pour tout arreter et fermer ces fenetres, "build" pour
# verifier que le backend et le frontend compilent sans lancer de serveur,
# "exit" pour quitter le controleur.

$root = Split-Path -Parent $PSScriptRoot
$backendProcess = $null
$frontendProcess = $null

function Start-Dev {
    if ($script:backendProcess -and -not $script:backendProcess.HasExited) {
        Write-Host "Le backend tourne deja (PID $($script:backendProcess.Id))." -ForegroundColor Yellow
    }
    else {
        $backendCmd = "`$Host.UI.RawUI.WindowTitle = 'Gamify Backend'; `$env:JAVA_HOME = 'C:\Program Files\Eclipse Adoptium\jdk-17.0.19.10-hotspot'; Set-Location '$root\gamify-backend'; .\mvnw.cmd spring-boot:run"
        $script:backendProcess = Start-Process powershell -ArgumentList '-NoExit', '-Command', $backendCmd -PassThru
        Write-Host "Backend lance (PID $($script:backendProcess.Id))." -ForegroundColor Green
    }

    if ($script:frontendProcess -and -not $script:frontendProcess.HasExited) {
        Write-Host "Le frontend tourne deja (PID $($script:frontendProcess.Id))." -ForegroundColor Yellow
    }
    else {
        $frontendCmd = "`$Host.UI.RawUI.WindowTitle = 'Gamify Frontend'; Set-Location '$root\gamify-frontend'; npm run dev"
        $script:frontendProcess = Start-Process powershell -ArgumentList '-NoExit', '-Command', $frontendCmd -PassThru
        Write-Host "Frontend lance (PID $($script:frontendProcess.Id))." -ForegroundColor Green
    }
}

function Stop-DevPort {
    param([int]$Port)

    $procIds = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue |
        Select-Object -ExpandProperty OwningProcess -Unique

    foreach ($procId in $procIds) {
        Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
    }
}

function Stop-Dev {
    Write-Host "Arret du backend (port 8081)..." -ForegroundColor Cyan
    Stop-DevPort -Port 8081
    if ($script:backendProcess) {
        Stop-Process -Id $script:backendProcess.Id -Force -ErrorAction SilentlyContinue
        $script:backendProcess = $null
    }

    Write-Host "Arret du frontend (port 5173)..." -ForegroundColor Cyan
    Stop-DevPort -Port 5173
    if ($script:frontendProcess) {
        Stop-Process -Id $script:frontendProcess.Id -Force -ErrorAction SilentlyContinue
        $script:frontendProcess = $null
    }

    Write-Host "Fait." -ForegroundColor Green
}

function Test-Build {
    $backendOk = $false
    $frontendOk = $false

    Write-Host "Build backend (mvnw compile)..." -ForegroundColor Cyan
    Push-Location "$root\gamify-backend"
    try {
        $env:JAVA_HOME = 'C:\Program Files\Eclipse Adoptium\jdk-17.0.19.10-hotspot'
        & .\mvnw.cmd compile
        $backendOk = $LASTEXITCODE -eq 0
    }
    finally {
        Pop-Location
    }
    if ($backendOk) {
        Write-Host "Backend : build OK." -ForegroundColor Green
    }
    else {
        Write-Host "Backend : build EN ECHEC." -ForegroundColor Red
    }

    Write-Host "Build frontend (npm run build -- tsc + vite build)..." -ForegroundColor Cyan
    Push-Location "$root\gamify-frontend"
    try {
        & npm run build
        $frontendOk = $LASTEXITCODE -eq 0
    }
    finally {
        Pop-Location
    }
    if ($frontendOk) {
        Write-Host "Frontend : build OK." -ForegroundColor Green
    }
    else {
        Write-Host "Frontend : build EN ECHEC." -ForegroundColor Red
    }

    if ($backendOk -and $frontendOk) {
        Write-Host "Build complet OK." -ForegroundColor Green
    }
    else {
        Write-Host "Build EN ECHEC -- voir le detail ci-dessus." -ForegroundColor Red
    }
}

Write-Host "Controleur Gamify -- tape 'start', 'stop', 'build', 'clear' ou 'exit'." -ForegroundColor Magenta

while ($true) {
    $command = (Read-Host '>').Trim().ToLower()
    switch ($command) {
        'start' { Start-Dev }
        'stop' { Stop-Dev }
        'build' { Test-Build }
        { $_ -in @('clear', 'cls') } { Clear-Host }
        { $_ -in @('exit', 'quit') } {
            Stop-Dev
            return
        }
        default { Write-Host "Commande inconnue. Utilise 'start', 'stop', 'build', 'clear' ou 'exit'." -ForegroundColor Yellow }
    }
}
