# Controleur interactif du backend/frontend Gamify.
# Tape "start" pour lancer les deux serveurs (chacun dans sa propre fenetre
# PowerShell), "stop" pour tout arreter et fermer ces fenetres, "exit" pour
# quitter le controleur.

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

Write-Host "Controleur Gamify -- tape 'start', 'stop' ou 'exit'." -ForegroundColor Magenta

while ($true) {
    $command = (Read-Host '>').Trim().ToLower()
    switch ($command) {
        'start' { Start-Dev }
        'stop' { Stop-Dev }
        { $_ -in @('exit', 'quit') } {
            Stop-Dev
            return
        }
        default { Write-Host "Commande inconnue. Utilise 'start', 'stop' ou 'exit'." -ForegroundColor Yellow }
    }
}
