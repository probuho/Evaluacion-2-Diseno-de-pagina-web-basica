// Servicio para GameReqsAPI local
const fetch = require('node-fetch');

const GAMEREQS_BASE_URL = 'http://localhost:5000/api/v1';

/**
 * Obtiene todos los juegos de GameReqsAPI
 * @returns {Promise<Array>} Lista de juegos con requisitos
 */
async function getAllGames() {
    try {
        const response = await fetch(`${GAMEREQS_BASE_URL}/games`, {
            headers: {
                'x-api-key': 'local_development_key_12345'
            }
        });

        if (!response.ok) {
            throw new Error(`GameReqsAPI error: ${response.status}`);
        }

        const data = await response.json();
        console.log(`[GameReqsAPI] Obtenidos ${data.length} juegos`);
        return data;
    } catch (error) {
        console.error('[GameReqsAPI] Error obteniendo juegos:', error.message);
        // Retornar datos de ejemplo si la API falla
        return getFallbackGames();
    }
}

/**
 * Busca un juego específico por nombre
 * @param {string} gameName - Nombre del juego
 * @returns {Promise<Object|null>} Juego encontrado
 */
async function searchGame(gameName) {
    try {
        const response = await fetch(`${GAMEREQS_BASE_URL}/games?search=${encodeURIComponent(gameName)}`, {
            headers: {
                'x-api-key': 'local_development_key_12345'
            }
        });

        if (!response.ok) {
            throw new Error(`GameReqsAPI error: ${response.status}`);
        }

        const games = await response.json();
        return games.length > 0 ? games[0] : null;
    } catch (error) {
        console.error(`[GameReqsAPI] Error buscando ${gameName}:`, error.message);
        return null;
    }
}

/**
 * Calcula compatibilidad de un juego con el hardware del usuario
 * @param {Object} game - Juego con requisitos
 * @param {Object} hardware - Hardware del usuario
 * @returns {Object} Resultado de compatibilidad
 */
function calculateCompatibility(game, hardware) {
    const compatibility = {
        minimum: {
            overall: true,
            cpu: true,
            ram: true,
            gpu: true,
            vram: true,
            storage: true
        },
        recommended: {
            overall: true,
            cpu: true,
            ram: true,
            gpu: true,
            vram: true,
            storage: true
        }
    };

    // Verificar requisitos mínimos
    if (game.minimum_requirements) {
        const minReq = game.minimum_requirements;

        // RAM
        if (minReq.ram_min && hardware.ram_gb < minReq.ram_min) {
            compatibility.minimum.ram = false;
            compatibility.minimum.overall = false;
        }

        // VRAM
        if (minReq.vram_min && hardware.vram_gb < minReq.vram_min) {
            compatibility.minimum.vram = false;
            compatibility.minimum.overall = false;
        }

        // Almacenamiento
        if (minReq.storage_min && hardware.free_storage_gb < minReq.storage_min) {
            compatibility.minimum.storage = false;
            compatibility.minimum.overall = false;
        }
    }

    // Verificar requisitos recomendados
    if (game.recommended_requirements) {
        const recReq = game.recommended_requirements;

        // RAM
        if (recReq.ram_rec && hardware.ram_gb < recReq.ram_rec) {
            compatibility.recommended.ram = false;
            compatibility.recommended.overall = false;
        }

        // VRAM
        if (recReq.vram_rec && hardware.vram_gb < recReq.vram_rec) {
            compatibility.recommended.vram = false;
            compatibility.recommended.overall = false;
        }

        // Almacenamiento
        if (recReq.storage_rec && hardware.free_storage_gb < recReq.storage_rec) {
            compatibility.recommended.storage = false;
            compatibility.recommended.overall = false;
        }
    }

    return compatibility;
}

/**
 * Datos de ejemplo si GameReqsAPI no está disponible
 */
function getFallbackGames() {
    return [
        {
            id: 1,
            info: {
                name: "Cyberpunk 2077",
                developer: "CD Projekt Red"
            },
            minimum_requirements: {
                cpu_min: "Intel Core i5-3570K",
                ram_min: 8,
                gpu_min: "NVIDIA GeForce GTX 780",
                vram_min: 3,
                storage_min: 70,
                OS_min: "Windows 7"
            },
            recommended_requirements: {
                cpu_rec: "Intel Core i7-4790",
                ram_rec: 12,
                gpu_rec: "NVIDIA GeForce GTX 1060",
                vram_rec: 6,
                storage_rec: 70,
                OS_rec: "Windows 10"
            }
        },
        {
            id: 2,
            info: {
                name: "The Witcher 3: Wild Hunt",
                developer: "CD Projekt Red"
            },
            minimum_requirements: {
                cpu_min: "Intel Core i5-2500K",
                ram_min: 6,
                gpu_min: "NVIDIA GeForce GTX 660",
                vram_min: 2,
                storage_min: 50,
                OS_min: "Windows 7"
            },
            recommended_requirements: {
                cpu_rec: "Intel Core i7-3770",
                ram_rec: 8,
                gpu_rec: "NVIDIA GeForce GTX 770",
                vram_rec: 4,
                storage_rec: 50,
                OS_rec: "Windows 10"
            }
        }
    ];
}

module.exports = {
    getAllGames,
    searchGame,
    calculateCompatibility,
    getFallbackGames
};
