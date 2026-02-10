# 🎮 Game Compatibility Checker

Aplicación web que detecta automáticamente el hardware de tu PC y verifica la compatibilidad con miles de juegos usando la API de GameReqsAPI.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Node](https://img.shields.io/badge/node-%3E%3D14.0.0-green)
![License](https://img.shields.io/badge/license-MIT-purple)

## ✨ Características

- 🖥️ **Detección automática de hardware** mediante PowerShell
- 🎯 **Comparación inteligente** con requisitos mínimos y recomendados
- 🎨 **Interfaz moderna** con diseño glassmorphism y animaciones
- 🔍 **Búsqueda y filtros** para encontrar juegos rápidamente
- 📊 **Estadísticas visuales** de compatibilidad
- 🌐 **API de GameReqsAPI** con miles de juegos de Steam

## 📋 Requisitos Previos

- **Node.js** v14 o superior
- **PowerShell** (incluido en Windows)
- **Clave API de GameReqsAPI** (ver instrucciones abajo)

## 🚀 Instalación

### 1. Clonar o descargar el proyecto

Si ya tienes el proyecto, navega a la carpeta:

```powershell
cd C:\Users\aruizc01\.gemini\antigravity\scratch\game-compatibility-checker
```

### 2. Instalar dependencias

```powershell
npm install
```

### 3. Obtener clave API de GameReqsAPI

La aplicación requiere una clave API para funcionar. Tienes dos opciones:

#### Opción A: Solicitar clave oficial
1. Visita el repositorio: https://github.com/Plutone11011/GameReqsAPI
2. Contacta al mantenedor para solicitar una clave API
3. Espera la aprobación (puede tomar algunos días)

#### Opción B: Usar la API pública (si está disponible)
Consulta la documentación del proyecto para ver si hay endpoints públicos disponibles.

### 4. Configurar la clave API

Edita el archivo `.env` y reemplaza `tu_clave_api_aqui` con tu clave real:

```env
GAMEREQS_API_KEY=tu_clave_real_aqui
PORT=3000
```

## 🎯 Uso

### Paso 1: Detectar tu hardware

Ejecuta el script de PowerShell como **Administrador**:

```powershell
.\Get-HardwareInfo.ps1
```

Esto creará un archivo `hardware.json` con las especificaciones de tu PC.

### Paso 2: Iniciar el servidor

```powershell
npm start
```

El servidor se iniciará en `http://localhost:3000`

### Paso 3: Usar la aplicación

1. Abre tu navegador en `http://localhost:3000`
2. Arrastra o selecciona el archivo `hardware.json` generado
3. Haz clic en **"Verificar Compatibilidad"**
4. ¡Explora los resultados!

## 📁 Estructura del Proyecto

```
game-compatibility-checker/
├── public/                 # Archivos del frontend
│   ├── index.html         # Página principal
│   ├── style.css          # Estilos modernos
│   └── script.js          # Lógica del cliente
├── server.js              # Servidor Express y API
├── Get-HardwareInfo.ps1   # Script de detección de hardware
├── package.json           # Dependencias del proyecto
├── .env                   # Configuración (NO compartir)
└── README.md              # Este archivo
```

## 🔧 Cómo Funciona

### Detección de Hardware

El script `Get-HardwareInfo.ps1` utiliza comandos de PowerShell para obtener:

- **CPU**: Modelo y especificaciones del procesador
- **RAM**: Memoria total instalada
- **GPU**: Tarjeta gráfica y VRAM
- **Almacenamiento**: Espacio disponible en disco
- **Sistema Operativo**: Versión de Windows

### Comparación de Compatibilidad

El backend (`server.js`) compara tu hardware con los requisitos de cada juego:

1. **RAM y Almacenamiento**: Comparación numérica directa
2. **CPU**: Comparación básica por generación y modelo
3. **GPU**: Comparación por serie (GTX/RTX para NVIDIA, RX para AMD)
4. **VRAM**: Comparación numérica de memoria de video

**Nota**: La comparación de CPU/GPU es básica. Para resultados más precisos, se recomienda consultar benchmarks como PassMark.

### Categorías de Compatibilidad

- ✅ **Recomendado**: Tu PC cumple o supera los requisitos recomendados
- ⚠️ **Mínimo**: Tu PC cumple los requisitos mínimos pero no los recomendados
- ❌ **Incompatible**: Tu PC no cumple los requisitos mínimos

## 🎨 Personalización

### Cambiar el puerto

Edita el archivo `.env`:

```env
PORT=8080
```

### Modificar estilos

Los estilos están en `public/style.css`. Puedes cambiar los colores editando las variables CSS:

```css
:root {
    --primary: hsl(260, 85%, 65%);
    --secondary: hsl(200, 100%, 60%);
    --accent: hsl(330, 85%, 65%);
}
```

## ⚠️ Limitaciones Conocidas

1. **Comparación de CPU/GPU**: Es básica y puede no ser 100% precisa
2. **VRAM**: PowerShell no siempre detecta correctamente la VRAM dedicada
3. **Catálogo de juegos**: Depende de la base de datos de GameReqsAPI
4. **Solo Windows**: El script de PowerShell solo funciona en Windows

## 🐛 Solución de Problemas

### Error: "API Key no configurada"

**Solución**: Asegúrate de haber editado el archivo `.env` con tu clave API real.

### Error: "Error de API: 401"

**Solución**: Tu clave API es inválida o ha expirado. Solicita una nueva.

### Error: "No se pudo obtener la información del hardware"

**Solución**: Ejecuta el script de PowerShell como **Administrador**.

### La VRAM se muestra como 0 GB

**Solución**: Esto es una limitación de PowerShell. El script usa un valor por defecto de 2 GB si no puede detectarla.

### No se muestran juegos

**Solución**: 
1. Verifica que el servidor esté ejecutándose
2. Revisa la consola del navegador (F12) para ver errores
3. Asegúrate de que la API de GameReqsAPI esté disponible

## 🔒 Seguridad

- **Nunca compartas** tu archivo `.env` o tu clave API
- La aplicación está diseñada para ejecutarse **solo en localhost**
- No se envían datos a servidores externos (excepto a GameReqsAPI)

## 📝 Notas Importantes

### Sobre GameReqsAPI

Esta aplicación depende de GameReqsAPI, un proyecto de terceros. Ten en cuenta:

- La disponibilidad de la API no está garantizada
- El catálogo de juegos puede estar limitado
- Los datos provienen de Steam y pueden no estar siempre actualizados

### Mejoras Futuras

Posibles mejoras que podrías implementar:

- [ ] Integración con PassMark para comparación precisa de CPU/GPU
- [ ] Soporte para múltiples APIs de juegos
- [ ] Exportación de resultados a PDF
- [ ] Modo oscuro/claro
- [ ] Guardado de configuraciones en localStorage
- [ ] Comparación histórica de hardware

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Puedes usarlo, modificarlo y distribuirlo libremente.

## 🙏 Créditos

- **GameReqsAPI**: https://github.com/Plutone11011/GameReqsAPI
- **Fuentes**: Google Fonts (Inter)
- **Iconos**: SVG personalizados

## 📞 Soporte

Si encuentras problemas o tienes sugerencias:

1. Revisa la sección de **Solución de Problemas**
2. Verifica que todos los requisitos estén instalados
3. Consulta la documentación de GameReqsAPI

---

**¡Disfruta descubriendo qué juegos puede ejecutar tu PC! 🎮**
