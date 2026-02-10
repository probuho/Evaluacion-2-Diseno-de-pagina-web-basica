// Servicio para CheapShark API
// Documentación: https://apidocs.cheapshark.com/

const CHEAPSHARK_BASE_URL = 'https://www.cheapshark.com/api/1.0';

// Cache simple en memoria
const cache = new Map();
const CACHE_TTL = 3600000; // 1 hora en milisegundos

/**
 * Busca un juego por nombre en CheapShark
 * @param {string} gameName - Nombre del juego
 * @returns {Promise<Object|null>} Información del juego con precios
 */
async function searchGame(gameName) {
    try {
        // Verificar cache
        const cacheKey = `search:${gameName.toLowerCase()}`;
        const cached = cache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
            console.log(`[CheapShark] Cache hit: ${gameName}`);
            return cached.data;
        }

        // Buscar en CheapShark
        const searchUrl = `${CHEAPSHARK_BASE_URL}/games?title=${encodeURIComponent(gameName)}&limit=1`;
        const response = await fetch(searchUrl);

        if (!response.ok) {
            console.error(`[CheapShark] Error ${response.status}: ${gameName}`);
            return null;
        }

        const games = await response.json();

        if (!games || games.length === 0) {
            console.log(`[CheapShark] No encontrado: ${gameName}`);
            return null;
        }

        const game = games[0];

        // Guardar en cache
        cache.set(cacheKey, {
            data: game,
            timestamp: Date.now()
        });

        return game;
    } catch (error) {
        console.error(`[CheapShark] Error buscando ${gameName}:`, error.message);
        return null;
    }
}

/**
 * Obtiene detalles completos de un juego incluyendo precios en todas las tiendas
 * @param {string} gameID - ID del juego en CheapShark
 * @returns {Promise<Object|null>} Detalles completos del juego
 */
async function getGameDetails(gameID) {
    try {
        // Verificar cache
        const cacheKey = `details:${gameID}`;
        const cached = cache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
            console.log(`[CheapShark] Cache hit details: ${gameID}`);
            return cached.data;
        }

        const detailsUrl = `${CHEAPSHARK_BASE_URL}/games?id=${gameID}`;
        const response = await fetch(detailsUrl);

        if (!response.ok) {
            console.error(`[CheapShark] Error ${response.status} obteniendo detalles: ${gameID}`);
            return null;
        }

        const details = await response.json();

        // Guardar en cache
        cache.set(cacheKey, {
            data: details,
            timestamp: Date.now()
        });

        return details;
    } catch (error) {
        console.error(`[CheapShark] Error obteniendo detalles ${gameID}:`, error.message);
        return null;
    }
}

/**
 * Obtiene lista de tiendas disponibles
 * @returns {Promise<Array>} Lista de tiendas
 */
async function getStores() {
    try {
        const cacheKey = 'stores';
        const cached = cache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < CACHE_TTL * 24) { // Cache por 24 horas
            return cached.data;
        }

        const storesUrl = `${CHEAPSHARK_BASE_URL}/stores`;
        const response = await fetch(storesUrl);

        if (!response.ok) {
            console.error(`[CheapShark] Error obteniendo tiendas`);
            return [];
        }

        const stores = await response.json();

        cache.set(cacheKey, {
            data: stores,
            timestamp: Date.now()
        });

        return stores;
    } catch (error) {
        console.error(`[CheapShark] Error obteniendo tiendas:`, error.message);
        return [];
    }
}

/**
 * Enriquece un juego con información de precios
 * @param {Object} game - Juego de GameReqsAPI
 * @returns {Promise<Object>} Juego enriquecido con precios
 */
async function enrichGameWithPrices(game) {
    try {
        const gameName = game.info?.name || game.name;
        if (!gameName) {
            console.warn('[CheapShark] Juego sin nombre:', game);
            return game;
        }

        // Buscar juego en CheapShark
        const cheapSharkGame = await searchGame(gameName);

        if (!cheapSharkGame) {
            return {
                ...game,
                prices: null,
                lowest_price: null,
                cheapshark_id: null
            };
        }

        // Obtener detalles completos
        const details = await getGameDetails(cheapSharkGame.gameID);

        if (!details || !details.deals) {
            return {
                ...game,
                prices: null,
                lowest_price: {
                    amount: parseFloat(cheapSharkGame.cheapest || 0),
                    currency: 'USD',
                    store: 'Multiple Stores',
                    url: `https://www.cheapshark.com/redirect?dealID=${cheapSharkGame.cheapestDealID}`
                },
                cheapshark_id: cheapSharkGame.gameID,
                image: cheapSharkGame.thumb || game.image
            };
        }

        // Procesar precios de todas las tiendas
        const prices = details.deals.map(deal => ({
            amount: parseFloat(deal.price),
            currency: 'USD',
            store: getStoreName(deal.storeID),
            store_id: deal.storeID,
            url: `https://www.cheapshark.com/redirect?dealID=${deal.dealID}`,
            savings: parseFloat(deal.savings || 0)
        }));

        // Encontrar precio más bajo
        const lowestPrice = prices.reduce((min, price) =>
            price.amount < min.amount ? price : min
            , prices[0]);

        return {
            ...game,
            prices,
            lowest_price: lowestPrice,
            cheapshark_id: cheapSharkGame.gameID,
            image: cheapSharkGame.thumb || game.image,
            metacritic: details.info?.metacriticScore || game.rating?.metacritic
        };
    } catch (error) {
        console.error(`[CheapShark] Error enriqueciendo juego:`, error.message);
        return game;
    }
}

/**
 * Mapeo de IDs de tiendas a nombres
 */
const storeNames = {
    '1': 'Steam',
    '2': 'GamersGate',
    '3': 'GreenManGaming',
    '7': 'GOG',
    '8': 'Origin',
    '11': 'Humble Store',
    '13': 'Uplay',
    '15': 'Fanatical',
    '25': 'Epic Games',
    '27': 'Gamesplanet',
    '28': 'Gamesload',
    '29': 'Voidu',
    '30': 'Epic Games Store'
};

function getStoreName(storeID) {
    return storeNames[storeID.toString()] || `Store ${storeID}`;
}

/**
 * Limpia el cache (útil para desarrollo)
 */
function clearCache() {
    cache.clear();
    console.log('[CheapShark] Cache limpiado');
}

module.exports = {
    searchGame,
    getGameDetails,
    getStores,
    enrichGameWithPrices,
    clearCache
};
