# 🎮 Guía Rápida - Game Compatibility Checker

## 📝 Pasos para Usar la Aplicación

### 1️⃣ Obtener Clave API (IMPORTANTE)

Antes de usar la aplicación, necesitas una clave API de GameReqsAPI:

1. Visita: https://github.com/Plutone11011/GameReqsAPI
2. Contacta al mantenedor para solicitar acceso a la API
3. Una vez que tengas la clave, edita el archivo `.env`:

```
GAMEREQS_API_KEY=tu_clave_real_aqui
```

### 2️⃣ Detectar tu Hardware

Ya ejecutamos el script y se generó el archivo `hardware.json` con tu hardware:

- **CPU**: 11th Gen Intel(R) Core(TM) i7-11390H @ 3.40GHz
- **RAM**: 15.75 GB
- **GPU**: Intel(R) Iris(R) Xe Graphics
- **VRAM**: 1 GB

### 3️⃣ Iniciar el Servidor

Ejecuta en PowerShell:

```powershell
npm start
```

### 4️⃣ Abrir la Aplicación

1. Abre tu navegador en: http://localhost:3000
2. Arrastra o selecciona el archivo `hardware.json`
3. Haz clic en "Verificar Compatibilidad"
4. ¡Explora los resultados!

## ⚠️ Nota Importante

**La aplicación NO funcionará sin una clave API válida.**

Si no tienes acceso a la API, la aplicación mostrará un error al intentar verificar la compatibilidad.

## 🔧 Comandos Útiles

```powershell
# Instalar dependencias
npm install

# Iniciar servidor
npm start

# Detectar hardware nuevamente
.\Get-HardwareInfo.ps1
```

## 📊 Características de la Aplicación

✅ Interfaz moderna con animaciones suaves
✅ Detección automática de hardware
✅ Comparación con miles de juegos
✅ Filtros y búsqueda de juegos
✅ Estadísticas visuales de compatibilidad
✅ Categorización: Recomendado / Mínimo / Incompatible

## 🎯 Próximos Pasos

1. **Obtén tu clave API** del repositorio de GameReqsAPI
2. **Configura el archivo .env** con tu clave
3. **Ejecuta `npm start`** para iniciar el servidor
4. **Abre http://localhost:3000** en tu navegador

¡Disfruta descubriendo qué juegos puede ejecutar tu PC! 🚀
