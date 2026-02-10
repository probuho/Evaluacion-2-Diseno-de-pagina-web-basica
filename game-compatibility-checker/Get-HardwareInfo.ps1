# Get-HardwareInfo.ps1
# Script para detectar hardware del sistema
# NO requiere permisos de administrador

Write-Host "Detectando hardware del sistema..." -ForegroundColor Cyan
Write-Host ""

try {
    # Obtener información del procesador
    Write-Host "Detectando CPU..." -ForegroundColor Yellow
    $cpu = Get-CimInstance -ClassName Win32_Processor | Select-Object -First 1
    $cpuName = $cpu.Name.Trim()

    # Obtener información de RAM
    Write-Host "Detectando RAM..." -ForegroundColor Yellow
    $ram = Get-CimInstance -ClassName Win32_ComputerSystem
    $ramGB = [math]::Round($ram.TotalPhysicalMemory / 1GB, 2)

    # Obtener información de GPU
    Write-Host "Detectando GPU..." -ForegroundColor Yellow
    $gpu = Get-CimInstance -ClassName Win32_VideoController | Where-Object { $_.AdapterCompatibility -notlike "*Microsoft*" } | Select-Object -First 1
    
    if ($gpu) {
        $gpuName = $gpu.Name.Trim()
        # Intentar obtener VRAM (puede no estar disponible sin admin)
        $vramBytes = $gpu.AdapterRAM
        if ($vramBytes -and $vramBytes -gt 0) {
            $vramGB = [math]::Round($vramBytes / 1GB, 2)
        }
        else {
            # Si no se puede obtener VRAM, usar un valor estimado
            $vramGB = 2
        }
    }
    else {
        $gpuName = "GPU no detectada"
        $vramGB = 0
    }

    # Obtener información de almacenamiento
    Write-Host "Detectando almacenamiento..." -ForegroundColor Yellow
    $disk = Get-CimInstance -ClassName Win32_LogicalDisk -Filter "DeviceID='C:'"
    $freeStorageGB = [math]::Round($disk.FreeSpace / 1GB, 2)

    # Obtener información del sistema operativo
    Write-Host "Detectando sistema operativo..." -ForegroundColor Yellow
    $os = Get-CimInstance -ClassName Win32_OperatingSystem
    $osName = $os.Caption.Trim()

    # Crear objeto con la información
    $hardwareInfo = @{
        cpu             = $cpuName
        ram_gb          = $ramGB
        gpu             = $gpuName
        vram_gb         = $vramGB
        free_storage_gb = $freeStorageGB
        os              = $osName
    }

    # Convertir a JSON
    $jsonOutput = $hardwareInfo | ConvertTo-Json -Depth 3

    # Guardar en Escritorio con nombre específico
    $desktopPath = [Environment]::GetFolderPath("Desktop")
    $outputPath = Join-Path -Path $desktopPath -ChildPath "hardware-info.json"
    [System.IO.File]::WriteAllText($outputPath, $jsonOutput)
    
    # También guardar copia en directorio actual para compatibilidad
    $localPath = Join-Path -Path $PSScriptRoot -ChildPath "hardware.json"
    [System.IO.File]::WriteAllText($localPath, $jsonOutput)

    Write-Host ""
    Write-Host "Hardware detectado correctamente!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Archivos guardados:" -ForegroundColor Cyan
    Write-Host "  1. Escritorio: $outputPath" -ForegroundColor White
    Write-Host "  2. Local: $localPath" -ForegroundColor White
    Write-Host ""
    Write-Host "Resumen:" -ForegroundColor Cyan
    Write-Host "  CPU: $cpuName" -ForegroundColor White
    Write-Host "  RAM: $ramGB GB" -ForegroundColor White
    Write-Host "  GPU: $gpuName" -ForegroundColor White
    Write-Host "  VRAM: $vramGB GB" -ForegroundColor White
    Write-Host "  Almacenamiento libre: $freeStorageGB GB" -ForegroundColor White
    Write-Host "  SO: $osName" -ForegroundColor White
    Write-Host ""
    Write-Host "Puedes cargar 'hardware-info.json' desde tu Escritorio en la aplicación web." -ForegroundColor Yellow

}
catch {
    Write-Host ""
    Write-Host "Error al detectar hardware: $_" -ForegroundColor Red
    Write-Host ""
    exit 1
}
