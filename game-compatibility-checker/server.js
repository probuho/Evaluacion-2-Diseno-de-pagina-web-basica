const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const fetch = require('node-fetch');
const fs = require('fs');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

// Importar servicios
const gamereqsService = require('./services/gamereqs');
const cheapsharkService = require('./services/cheapshark');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Función para comparar CPU (básica)
function compareCPU(userCPU, requiredCPU) {
    if (!requiredCPU || requiredCPU === 'N/A') return true;

    const userCPULower = userCPU.toLowerCase();
    const requiredCPULower = requiredCPU.toLowerCase();

    // Extraer información básica
    const userHasIntel = userCPULower.includes('intel');
    const userHasAMD = userCPULower.includes('amd') || userCPULower.includes('ryzen');
    const reqHasIntel = requiredCPULower.includes('intel');
    const reqHasAMD = requiredCPULower.includes('amd') || requiredCPULower.includes('ryzen');

    // Si son de diferentes marcas, es difícil comparar
    if ((userHasIntel && reqHasAMD) || (userHasAMD && reqHasIntel)) {
        return null; // Indeterminado
    }

    // Comparación básica por generación/serie (muy simplificada)
    const userMatch = userCPULower.match(/i[3579]-?(\d+)/);
    const reqMatch = requiredCPULower.match(/i[3579]-?(\d+)/);

    if (userMatch && reqMatch) {
        const userGen = parseInt(userMatch[1].charAt(0));
        const reqGen = parseInt(reqMatch[1].charAt(0));
        return userGen >= reqGen;
    }

    return null; // No se puede determinar con certeza
}

// Función para comparar GPU (básica)
function compareGPU(userGPU, requiredGPU) {
    if (!requiredGPU || requiredGPU === 'N/A') return true;

    const userGPULower = userGPU.toLowerCase();
    const requiredGPULower = requiredGPU.toLowerCase();

    // Extraer números de serie NVIDIA
    const userNvidiaMatch = userGPULower.match(/(?:gtx|rtx)\s*(\d+)/);
    const reqNvidiaMatch = requiredGPULower.match(/(?:gtx|rtx)\s*(\d+)/);

    if (userNvidiaMatch && reqNvidiaMatch) {
        const userModel = parseInt(userNvidiaMatch[1]);
        const reqModel = parseInt(reqNvidiaMatch[1]);

        // RTX es generalmente mejor que GTX
        const userIsRTX = userGPULower.includes('rtx');
        const reqIsRTX = requiredGPULower.includes('rtx');

        if (userIsRTX && !reqIsRTX) return true;
        if (!userIsRTX && reqIsRTX) return false;

        return userModel >= reqModel;
    }

    // Extraer números de serie AMD
    const userAMDMatch = userGPULower.match(/(?:rx|radeon)\s*(\d+)/);
    const reqAMDMatch = requiredGPULower.match(/(?:rx|radeon)\s*(\d+)/);

    if (userAMDMatch && reqAMDMatch) {
        const userModel = parseInt(userAMDMatch[1]);
        const reqModel = parseInt(reqAMDMatch[1]);
        return userModel >= reqModel;
    }

    return null; // No se puede determinar con certeza
}

// Función para comparar requisitos
function checkCompatibility(userHardware, gameRequirements) {
    const results = {
        minimum: {
            ram: true,
            storage: true,
            cpu: null,
            gpu: null,
            vram: true,
            overall: false
        },
        recommended: {
            ram: true,
            storage: true,
            cpu: null,
            gpu: null,
            vram: true,
            overall: false
        }
    };

    // Verificar requisitos mínimos
    if (gameRequirements.minimum) {
        const min = gameRequirements.minimum;

        // RAM
        if (min.ram && min.ram !== 'N/A') {
            const ramMatch = min.ram.match(/(\d+)/);
            if (ramMatch) {
                const requiredRAM = parseInt(ramMatch[1]);
                results.minimum.ram = userHardware.ram_gb >= requiredRAM;
            }
        }

        // Storage
        if (min.storage && min.storage !== 'N/A') {
            const storageMatch = min.storage.match(/(\d+)/);
            if (storageMatch) {
                const requiredStorage = parseInt(storageMatch[1]);
                results.minimum.storage = userHardware.free_storage_gb >= requiredStorage;
            }
        }

        // CPU
        if (min.cpu) {
            results.minimum.cpu = compareCPU(userHardware.cpu, min.cpu);
        }

        // GPU
        if (min.gpu) {
            results.minimum.gpu = compareGPU(userHardware.gpu, min.gpu);
        }

        // VRAM
        if (min.vram && min.vram !== 'N/A') {
            const vramMatch = min.vram.match(/(\d+)/);
            if (vramMatch) {
                const requiredVRAM = parseInt(vramMatch[1]);
                results.minimum.vram = userHardware.vram_gb >= requiredVRAM;
            }
        }
    }

    // Verificar requisitos recomendados
    if (gameRequirements.recommended) {
        const rec = gameRequirements.recommended;

        // RAM
        if (rec.ram && rec.ram !== 'N/A') {
            const ramMatch = rec.ram.match(/(\d+)/);
            if (ramMatch) {
                const requiredRAM = parseInt(ramMatch[1]);
                results.recommended.ram = userHardware.ram_gb >= requiredRAM;
            }
        }

        // Storage
        if (rec.storage && rec.storage !== 'N/A') {
            const storageMatch = rec.storage.match(/(\d+)/);
            if (storageMatch) {
                const requiredStorage = parseInt(storageMatch[1]);
                results.recommended.storage = userHardware.free_storage_gb >= requiredStorage;
            }
        }

        // CPU
        if (rec.cpu) {
            results.recommended.cpu = compareCPU(userHardware.cpu, rec.cpu);
        }

        // GPU
        if (rec.gpu) {
            results.recommended.gpu = compareGPU(userHardware.gpu, rec.gpu);
        }

        // VRAM
        if (rec.vram && rec.vram !== 'N/A') {
            const vramMatch = rec.vram.match(/(\d+)/);
            if (vramMatch) {
                const requiredVRAM = parseInt(vramMatch[1]);
                results.recommended.vram = userHardware.vram_gb >= requiredVRAM;
            }
        }
    }

    // Calcular compatibilidad general
    const minChecks = [
        results.minimum.ram,
        results.minimum.storage,
        results.minimum.vram
    ];

    // Solo contar CPU/GPU si se pudieron comparar
    if (results.minimum.cpu !== null) minChecks.push(results.minimum.cpu);
    if (results.minimum.gpu !== null) minChecks.push(results.minimum.gpu);

    results.minimum.overall = minChecks.every(check => check === true);

    const recChecks = [
        results.recommended.ram,
        results.recommended.storage,
        results.recommended.vram
    ];

    if (results.recommended.cpu !== null) recChecks.push(results.recommended.cpu);
    if (results.recommended.gpu !== null) recChecks.push(results.recommended.gpu);

    results.recommended.overall = recChecks.every(check => check === true);

    return results;
}

// Endpoint para detectar hardware automáticamente
app.get('/api/detect-hardware', async (req, res) => {
    try {
        console.log('Ejecutando detección de hardware...');

        // Ejecutar el script de PowerShell
        const { stdout, stderr } = await execPromise(
            'powershell -ExecutionPolicy Bypass -File "./Get-HardwareInfo.ps1"',
            { cwd: __dirname }
        );

        if (stderr) {
            console.error('Error en PowerShell:', stderr);
        }

        // Leer el archivo JSON generado
        const hardwareJsonPath = path.join(__dirname, 'hardware.json');

        if (!fs.existsSync(hardwareJsonPath)) {
            throw new Error('No se pudo generar el archivo hardware.json');
        }

        const hardwareData = JSON.parse(fs.readFileSync(hardwareJsonPath, 'utf8'));

        res.json({
            success: true,
            hardware: hardwareData,
            message: 'Hardware detectado correctamente'
        });

    } catch (error) {
        console.error('Error al detectar hardware:', error);
        res.status(500).json({
            success: false,
            error: 'Error al detectar hardware',
            details: error.message
        });
    }
});

// Endpoint para verificar juegos
app.post('/api/check-games', async (req, res) => {
    try {
        const userHardware = req.body;

        if (!userHardware || !userHardware.cpu || !userHardware.ram_gb) {
            return res.status(400).json({ error: 'Datos de hardware incompletos' });
        }

        // Obtener lista de juegos de GameReqsAPI LOCAL
        console.log('Consultando GameReqsAPI local...');
        const response = await fetch('http://localhost:5000/api/v1/games', {
            headers: {
                'x-api-key': 'local_development_key_12345'
            }
        });

        if (!response.ok) {
            throw new Error(`Error de API: ${response.status} ${response.statusText}`);
        }

        const games = await response.json();
        console.log(`Se obtuvieron ${games.length} juegos de la API local`);

        // Comparar cada juego con el hardware del usuario
        const results = games.map(game => {
            // Adaptar estructura de GameReqsAPI a nuestro formato
            const minimum = {
                ram: game.minimum_requirements?.ram_min ? `${game.minimum_requirements.ram_min} GB` : 'N/A',
                storage: game.minimum_requirements?.storage_min ? `${game.minimum_requirements.storage_min} GB` : 'N/A',
                cpu: game.minimum_requirements?.cpu_min || 'N/A',
                gpu: game.minimum_requirements?.gpu_min || 'N/A',
                vram: 'N/A', // GameReqsAPI no proporciona VRAM
                os: game.minimum_requirements?.OS_min || 'N/A'
            };

            const recommended = {
                ram: game.recommended_requirements?.ram_rec ? `${game.recommended_requirements.ram_rec} GB` : 'N/A',
                storage: game.recommended_requirements?.storage_rec ? `${game.recommended_requirements.storage_rec} GB` : 'N/A',
                cpu: game.recommended_requirements?.cpu_rec || 'N/A',
                gpu: game.recommended_requirements?.gpu_rec || 'N/A',
                vram: 'N/A',
                os: game.recommended_requirements?.OS_rec || 'N/A'
            };

            const compatibility = checkCompatibility(userHardware, {
                minimum: minimum,
                recommended: recommended
            });

            return {
                id: game.id,
                title: game.info?.name || 'Unknown Game',
                minimum: minimum,
                recommended: recommended,
                compatibility: compatibility
            };
        });

        // Ordenar por compatibilidad (compatibles primero)
        results.sort((a, b) => {
            if (a.compatibility.recommended.overall && !b.compatibility.recommended.overall) return -1;
            if (!a.compatibility.recommended.overall && b.compatibility.recommended.overall) return 1;
            if (a.compatibility.minimum.overall && !b.compatibility.minimum.overall) return -1;
            if (!a.compatibility.minimum.overall && b.compatibility.minimum.overall) return 1;
            return 0;
        });

        res.json({
            userHardware: userHardware,
            totalGames: results.length,
            results: results
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            error: 'Error al procesar la solicitud. Asegúrate de que GameReqsAPI esté ejecutándose en http://localhost:5000',
            details: error.message
        });
    }
});

// Nuevo endpoint: Obtener juegos enriquecidos con precios
app.post('/api/games-enriched', async (req, res) => {
    try {
        const { hardware } = req.body;

        if (!hardware) {
            return res.status(400).json({ error: 'Hardware information required' });
        }

        console.log('[API] Obteniendo juegos enriquecidos...');

        // 1. Obtener juegos de GameReqsAPI
        const games = await gamereqsService.getAllGames();
        console.log(`[API] Obtenidos ${games.length} juegos de GameReqsAPI`);

        // 2. Calcular compatibilidad para cada juego
        const gamesWithCompatibility = games.map(game => ({
            ...game,
            compatibility: gamereqsService.calculateCompatibility(game, hardware)
        }));

        // 3. Filtrar solo juegos compatibles (al menos mínimo)
        const compatibleGames = gamesWithCompatibility.filter(game =>
            game.compatibility.minimum.overall
        );
        console.log(`[API] ${compatibleGames.length} juegos compatibles encontrados`);

        // 4. Lista de juegos populares para priorizar
        const popularGames = [
            'age of empires', 'counter-strike', 'dota', 'league of legends',
            'minecraft', 'fortnite', 'valorant', 'apex legends', 'gta',
            'red dead', 'cyberpunk', 'witcher', 'elden ring', 'dark souls',
            'call of duty', 'battlefield', 'fifa', 'nba', 'rocket league',
            'overwatch', 'rainbow six', 'resident evil', 'god of war',
            'spider-man', 'horizon', 'assassin', 'far cry', 'tomb raider'
        ];

        // 5. Separar juegos populares de los demás
        const popularCompatible = compatibleGames.filter(game => {
            const gameName = game.info?.name?.toLowerCase() || '';
            return popularGames.some(popular => gameName.includes(popular));
        });

        const otherCompatible = compatibleGames.filter(game => {
            const gameName = game.info?.name?.toLowerCase() || '';
            return !popularGames.some(popular => gameName.includes(popular));
        });

        console.log(`[API] ${popularCompatible.length} juegos populares compatibles`);

        // 6. Combinar: populares primero, luego otros
        const sortedGames = [...popularCompatible, ...otherCompatible];

        // 7. Tomar los primeros 20 para enriquecer
        const limit = 20;
        const gamesToEnrich = sortedGames.slice(0, limit);
        console.log('[API] Enriqueciendo con precios de CheapShark...');

        const enrichedGames = [];
        for (let i = 0; i < gamesToEnrich.length; i++) {
            const game = gamesToEnrich[i];
            const enriched = await cheapsharkService.enrichGameWithPrices(game);
            enrichedGames.push(enriched);

            // Log de progreso cada 5 juegos
            if ((i + 1) % 5 === 0) {
                console.log(`[API] Procesados ${i + 1}/${gamesToEnrich.length} juegos`);
            }
        }

        console.log(`[API] Enriquecidos ${enrichedGames.length} juegos con precios`);

        res.json({
            games: enrichedGames,
            total: games.length,
            compatible: compatibleGames.length,
            enriched: enrichedGames.length,
            pagination: {
                total: compatibleGames.length,
                page: 1,
                limit: limit
            }
        });

    } catch (error) {
        console.error('[API] Error en games-enriched:', error);
        res.status(500).json({
            error: 'Error processing games',
            message: error.message
        });
    }
});

// Endpoint: Búsqueda de juegos
app.post('/api/games/search', async (req, res) => {
    try {
        const { query } = req.body;

        if (!query || query.trim().length < 2) {
            return res.json({ games: [] });
        }

        console.log(`[API] Buscando juegos: "${query}"`);

        // Obtener todos los juegos y filtrar por nombre
        const allGames = await gamereqsService.getAllGames();

        const searchTerm = query.toLowerCase().trim();
        const matchingGames = allGames.filter(game => {
            const gameName = game.info?.name?.toLowerCase() || '';
            return gameName.includes(searchTerm);
        });

        console.log(`[API] Encontrados ${matchingGames.length} juegos para "${query}"`);

        // Limitar a 10 resultados
        const limitedResults = matchingGames.slice(0, 10);

        res.json({ games: limitedResults });
    } catch (error) {
        console.error('[API] Error en búsqueda:', error.message);
        res.status(500).json({ error: 'Error buscando juegos' });
    }
});

// Endpoint: Obtener juego por ID
app.get('/api/games/:id', async (req, res) => {
    try {
        const gameId = parseInt(req.params.id);

        if (isNaN(gameId)) {
            return res.status(400).json({ error: 'ID inválido' });
        }

        console.log(`[API] Obteniendo juego ID: ${gameId}`);

        const allGames = await gamereqsService.getAllGames();
        const game = allGames.find(g => g.id === gameId);

        if (!game) {
            return res.status(404).json({ error: 'Juego no encontrado' });
        }

        console.log(`[API] Juego encontrado: ${game.info?.name}`);
        res.json(game);
    } catch (error) {
        console.error('[API] Error obteniendo juego:', error.message);
        res.status(500).json({ error: 'Error obteniendo juego' });
    }
});

// Endpoint para limpiar cache de CheapShark
app.post('/api/clear-cache', (req, res) => {
    cheapsharkService.clearCache();
    res.json({ message: 'Cache cleared successfully' });
});

// Ruta principal - Redirigir al frontend
app.get('/', (req, res) => {
    // Redirigir automáticamente al frontend en puerto 3001
    res.redirect('http://localhost:3001');
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`\n=== SERVIDOR INICIADO ===`);
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    console.log(`\nPasos para usar la aplicación:`);
    console.log(`1. Asegúrate de que GameReqsAPI esté ejecutándose (http://localhost:5000)`);
    console.log(`2. Ejecuta Get-HardwareInfo.ps1 como Administrador`);
    console.log(`3. Abre http://localhost:${PORT} en tu navegador`);
    console.log(`4. Carga el archivo hardware.json generado`);
    console.log(`\nNOTA: Usa start-all.ps1 para iniciar ambos servidores automáticamente\n`);
});
