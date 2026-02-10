Write-Host "=== Configurando Entorno Python para GameReqsAPI ===" -ForegroundColor Cyan
Write-Host ""

# Navegar a la carpeta de la API
$apiPath = "GameReqsAPI-master\GameReqsAPI-master"

if (-not (Test-Path $apiPath)) {
    Write-Host "ERROR: No se encuentra la carpeta GameReqsAPI" -ForegroundColor Red
    Write-Host "Ruta esperada: $apiPath" -ForegroundColor Yellow
    exit 1
}

Write-Host "Carpeta GameReqsAPI encontrada" -ForegroundColor Green
Write-Host ""

# Verificar Python
Write-Host "Verificando Python..." -ForegroundColor Yellow
$pythonVersion = python --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Python no esta instalado" -ForegroundColor Red
    Write-Host "Descarga Python desde: https://www.python.org/downloads/" -ForegroundColor Yellow
    exit 1
}

Write-Host "Python detectado: $pythonVersion" -ForegroundColor Green
Write-Host ""

# Navegar a la carpeta de la API
cd $apiPath

# Crear entorno virtual
Write-Host "Creando entorno virtual..." -ForegroundColor Yellow
python -m venv venv

if (-not (Test-Path "venv\Scripts\Activate.ps1")) {
    Write-Host "ERROR: No se pudo crear el entorno virtual" -ForegroundColor Red
    exit 1
}

Write-Host "Entorno virtual creado correctamente" -ForegroundColor Green
Write-Host ""

# Activar entorno virtual
Write-Host "Activando entorno virtual..." -ForegroundColor Yellow
& ".\venv\Scripts\Activate.ps1"

# Instalar dependencias
Write-Host "Instalando dependencias de Python..." -ForegroundColor Yellow
Write-Host "(Esto puede tomar unos minutos)" -ForegroundColor Gray
Write-Host ""

pip install -r requirements.txt --quiet

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Hubo problemas al instalar las dependencias" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=== Entorno Python Configurado Correctamente ===" -ForegroundColor Green
Write-Host ""
Write-Host "Dependencias instaladas:" -ForegroundColor Cyan
Write-Host "  - Flask" -ForegroundColor White
Write-Host "  - beautifulsoup4" -ForegroundColor White
Write-Host "  - flask-cors" -ForegroundColor White
Write-Host "  - aiohttp" -ForegroundColor White
Write-Host "  - y mas..." -ForegroundColor White
Write-Host ""
Write-Host "Para iniciar la aplicacion completa, ejecuta:" -ForegroundColor Cyan
Write-Host "  .\start-all.ps1" -ForegroundColor White
Write-Host ""

cd ..\..
