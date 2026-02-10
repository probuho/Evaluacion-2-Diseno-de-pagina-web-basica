@echo off
echo === Iniciando Game Compatibility Checker ===
echo.

REM Verificar Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python no esta instalado
    echo Por favor instala Python 3.7+ desde https://www.python.org/
    pause
    exit /b 1
)

echo Python detectado correctamente
echo.

REM Verificar entorno virtual
if not exist "GameReqsAPI-master\GameReqsAPI-master\venv" (
    echo AVISO: Configurando entorno Python por primera vez...
    echo.
    powershell -ExecutionPolicy Bypass -File setup-python.ps1
    if errorlevel 1 (
        echo.
        echo ERROR: No se pudo configurar el entorno Python
        pause
        exit /b 1
    )
)

echo Iniciando GameReqsAPI (Flask)...
start "GameReqsAPI" python start_gamereqs_api.py

echo Esperando a que la API inicie...
timeout /t 5 /nobreak >nul

echo Iniciando servidor Node.js...
echo.
echo === Servidores Iniciados ===
echo.
echo   GameReqsAPI:     http://localhost:5000
echo   Aplicacion Web:  http://localhost:3000
echo.
echo Abre tu navegador en http://localhost:3000
echo.
echo Presiona Ctrl+C para detener
echo ============================================
echo.

npm start
