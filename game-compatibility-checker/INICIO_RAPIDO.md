# 🎮 Guía de Inicio Rápido - Game Compatibility Checker

## ✅ ¡Todo Listo para Usar!

La aplicación está completamente configurada y lista para funcionar con GameReqsAPI local.

## 🚀 Inicio Rápido (3 Pasos)

### 1️⃣ Detectar tu Hardware

Ejecuta el script de PowerShell como **Administrador**:

```powershell
.\Get-HardwareInfo.ps1
```

Esto creará el archivo `hardware.json` con las especificaciones de tu PC.

### 2️⃣ Iniciar la Aplicación

**Opción A: Script Automático (Recomendado)**
```powershell
.\start-all.ps1
```

**Opción B: Batch**
```batch
start-all.bat
```

El script iniciará automáticamente:
- ✅ GameReqsAPI (Flask) en http://localhost:5000
- ✅ Servidor Web (Node.js) en http://localhost:3000

### 3️⃣ Usar la Aplicación

1. Abre tu navegador en: **http://localhost:3000**
2. Arrastra o selecciona el archivo `hardware.json`
3. Haz clic en **"Verificar Compatibilidad"**
4. ¡Explora los resultados!

## 📊 ¿Qué Hace la Aplicación?

- 🔍 **Analiza** tu hardware (CPU, RAM, GPU, almacenamiento)
- 🎮 **Compara** con miles de juegos de Steam
- ✅ **Clasifica** los juegos en:
  - **Recomendado** ✓ - Tu PC supera los requisitos recomendados
  - **Mínimo** ⚠️ - Cumple requisitos mínimos pero no recomendados
  - **Incompatible** ✗ - No cumple los requisitos mínimos
- 🔎 **Filtra y busca** juegos específicos

## 🛠️ Archivos Importantes

| Archivo | Descripción |
|---------|-------------|
| `Get-HardwareInfo.ps1` | Detecta tu hardware |
| `start-all.ps1` | Inicia ambos servidores automáticamente |
| `start-all.bat` | Alternativa batch |
| `hardware.json` | Tu hardware detectado |
| `server.js` | Backend Node.js |
| `start_gamereqs_api.py` | Inicia GameReqsAPI |

## 🔧 Solución de Problemas

### Error: "Python no está instalado"
**Solución**: Ya instalaste Python 3.13.4 ✅

### Error: "GameReqsAPI no responde"
**Solución**: 
1. Verifica que `start-all.ps1` haya iniciado ambos servidores
2. Espera 5-10 segundos para que Flask inicie completamente
3. Abre http://localhost:5000/api/v1/games para verificar

### Error: "No se muestran juegos"
**Solución**:
1. Asegúrate de que GameReqsAPI esté ejecutándose
2. Revisa la consola del servidor Node.js para ver errores
3. Verifica que hayas cargado correctamente `hardware.json`

### Los juegos se muestran como "Unknown Game"
**Solución**: Esto es normal si la base de datos no tiene el nombre del juego. La API sigue funcionando correctamente.

## 📝 Notas Técnicas

### Arquitectura
```
Usuario → Frontend (localhost:3000)
           ↓
        Backend Node.js
           ↓
        GameReqsAPI Flask (localhost:5000)
           ↓
        Base de Datos SQLite
```

### Puertos Usados
- **3000**: Aplicación web (Node.js)
- **5000**: GameReqsAPI (Flask)

### Sin Modificaciones a GameReqsAPI
✅ El repositorio GameReqsAPI permanece **intacto**
✅ Solo usamos scripts externos para iniciarlo
✅ Todos los cambios están en nuestra aplicación

## 🎯 Próximos Pasos Opcionales

1. **Personalizar estilos**: Edita `public/style.css`
2. **Mejorar comparación**: Integrar API de benchmarks (PassMark)
3. **Agregar más juegos**: Usar el scraper de GameReqsAPI
4. **Exportar resultados**: Agregar función para exportar a PDF

## 💡 Consejos

- 🔄 **Actualiza tu hardware**: Ejecuta `Get-HardwareInfo.ps1` después de upgrades
- 🎮 **Filtra por compatibilidad**: Usa los botones de filtro para ver solo juegos compatibles
- 🔍 **Busca juegos específicos**: Usa la barra de búsqueda
- ⚡ **Cierra correctamente**: Presiona Ctrl+C en la terminal para detener los servidores

## ✨ ¡Disfruta!

Tu aplicación está lista para ayudarte a descubrir qué juegos puede ejecutar tu PC.

**¿Preguntas?** Revisa el `README.md` para más detalles técnicos.
