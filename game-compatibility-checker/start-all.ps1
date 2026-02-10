Write-Host "=== Iniciando Game Compatibility Checker ===" -ForegroundColor Cyan
Write-Host ""

# Verificar que Python este instalado
Write-Host "Verificando Python..." -ForegroundColor Yellow
$pythonVersion = python --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Python no esta instalado" -ForegroundColor Red
    Write-Host "Por favor instala Python 3.7+ desde https://www.python.org/" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Presiona cualquier tecla para salir..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

Write-Host "Python detectado: $pythonVersion" -ForegroundColor Green
Write-Host ""

# Verificar que las dependencias esten instaladas
if (-not (Test-Path "GameReqsAPI-master\GameReqsAPI-master\venv")) {
    Write-Host "AVISO: El entorno virtual de Python no esta configurado" -ForegroundColor Yellow
    Write-Host "Ejecutando setup-python.ps1..." -ForegroundColor Yellow
    Write-Host ""
    
    .\setup-python.ps1
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "ERROR: No se pudo configurar el entorno Python" -ForegroundColor Red
        Write-Host "Presiona cualquier tecla para salir..."
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        exit 1
    }
}

# Iniciar GameReqsAPI en segundo plano
Write-Host "Iniciando GameReqsAPI (Flask)..." -ForegroundColor Yellow
$apiProcess = Start-Process python -ArgumentList "start_gamereqs_api.py" -WindowStyle Normal -PassThru

# Esperar a que Flask inicie
Write-Host "Esperando a que la API inicie..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Verificar que la API este corriendo
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/v1/games" -TimeoutSec 5 -ErrorAction SilentlyContinue
    Write-Host "API Flask iniciada correctamente" -ForegroundColor Green
}
catch {
    Write-Host "AVISO: La API puede tardar un poco mas en iniciar" -ForegroundColor Yellow
}

Write-Host ""

# Iniciar servidor Node.js en segundo plano
Write-Host "Iniciando servidor Node.js (Backend)..." -ForegroundColor Yellow
$nodeProcess = Start-Process npm -ArgumentList "start" -WindowStyle Normal -PassThru
Start-Sleep -Seconds 3

# Iniciar frontend Next.js en segundo plano
Write-Host "Iniciando frontend Next.js..." -ForegroundColor Yellow
$frontendProcess = Start-Process npm -ArgumentList "run", "dev" -WorkingDirectory "frontend" -WindowStyle Normal -PassThru
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "=== Servidores Iniciados ===" -ForegroundColor Green
Write-Host ""
Write-Host "  GameReqsAPI (Flask):  http://localhost:5000" -ForegroundColor White
Write-Host "  Backend (Node.js):    http://localhost:3000 (redirige a 3001)" -ForegroundColor White
Write-Host "  Frontend (Next.js):   http://localhost:3001" -ForegroundColor Cyan
Write-Host ""
Write-Host "Abre tu navegador en http://localhost:3001" -ForegroundColor Cyan
Write-Host ""
Write-Host "Presiona Ctrl+C para detener todos los servidores" -ForegroundColor Gray
Write-Host "=" * 60
Write-Host ""

# Esperar a que el usuario presione Ctrl+C
try {
    while ($true) {
        Start-Sleep -Seconds 1
        
        # Verificar si algún proceso murió
        if ($apiProcess.HasExited) {
            Write-Host "GameReqsAPI se detuvo inesperadamente" -ForegroundColor Red
            break
        }
        if ($nodeProcess.HasExited) {
            Write-Host "Backend Node.js se detuvo inesperadamente" -ForegroundColor Red
            break
        }
        if ($frontendProcess.HasExited) {
            Write-Host "Frontend Next.js se detuvo inesperadamente" -ForegroundColor Red
            break
        }
    }
}
finally {
    # Detener todos los procesos al salir
    Write-Host ""
    Write-Host "Deteniendo servidores..." -ForegroundColor Yellow
    
    if ($apiProcess -and !$apiProcess.HasExited) {
        Stop-Process -Id $apiProcess.Id -Force -ErrorAction SilentlyContinue
    }
    if ($nodeProcess -and !$nodeProcess.HasExited) {
        Stop-Process -Id $nodeProcess.Id -Force -ErrorAction SilentlyContinue
    }
    if ($frontendProcess -and !$frontendProcess.HasExited) {
        Stop-Process -Id $frontendProcess.Id -Force -ErrorAction SilentlyContinue
    }
    
    Write-Host "Todos los servidores detenidos" -ForegroundColor Green
}
