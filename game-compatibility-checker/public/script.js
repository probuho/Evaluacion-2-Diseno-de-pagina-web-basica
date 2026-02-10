// Variables globales
let userHardware = null;
let gamesData = [];
let currentFilter = 'all';

// Elementos del DOM
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const hardwareInfo = document.getElementById('hardwareInfo');
const hardwareGrid = document.getElementById('hardwareGrid');
const checkGamesBtn = document.getElementById('checkGamesBtn');
const uploadSection = document.getElementById('uploadSection');
const resultsSection = document.getElementById('resultsSection');
const loading = document.getElementById('loading');
const gamesGrid = document.getElementById('gamesGrid');
const searchInput = document.getElementById('searchInput');
const filterBtns = document.querySelectorAll('.filter-btn');
const resultsStats = document.getElementById('resultsStats');
const autoDetectBtn = document.getElementById('autoDetectBtn');

// ===== FUNCIONES DE UTILIDAD =====

function copyScriptPath() {
    const scriptPath = document.getElementById('scriptPath').textContent;
    navigator.clipboard.writeText(scriptPath).then(() => {
        const btn = event.target.closest('.btn-copy');
        const originalText = btn.innerHTML;
        btn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            ¡Copiado!
        `;
        setTimeout(() => {
            btn.innerHTML = originalText;
        }, 2000);
    });
}

// ===== DETECCIÓN AUTOMÁTICA DE HARDWARE =====

autoDetectBtn.addEventListener('click', async () => {
    // Pedir confirmación al usuario
    const confirmacion = confirm(
        '¿Deseas detectar automáticamente el hardware de tu PC?\n\n' +
        'Esto ejecutará un script de PowerShell para obtener las especificaciones de tu sistema.\n\n' +
        'Haz clic en "Aceptar" para continuar o "Cancelar" para cargar manualmente el archivo hardware.json.'
    );

    if (!confirmacion) {
        return; // Usuario canceló
    }

    const originalText = autoDetectBtn.innerHTML;
    autoDetectBtn.disabled = true;
    autoDetectBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" opacity="0.25"/>
            <path d="M12 2C6.47715 2 2 6.47715 2 12" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
            </path>
        </svg>
        Detectando hardware...
    `;

    try {
        const response = await fetch('/api/detect-hardware');

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.details || 'Error al detectar hardware');
        }

        const data = await response.json();

        if (data.success) {
            userHardware = data.hardware;
            displayHardwareInfo(userHardware);

            // Ocultar área de carga y mostrar info de hardware
            document.querySelector('.auto-detect-section').classList.add('hidden');
            document.querySelector('.instructions').classList.add('hidden');
            uploadArea.classList.add('hidden');
            hardwareInfo.classList.remove('hidden');

            // Mostrar mensaje de éxito
            autoDetectBtn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                ¡Hardware detectado!
            `;
        }
    } catch (error) {
        alert(`Error al detectar hardware: ${error.message}\n\nPuedes cargar manualmente el archivo hardware.json usando el área de carga.`);
        console.error(error);

        autoDetectBtn.innerHTML = originalText;
        autoDetectBtn.disabled = false;
    }
});

// ===== MANEJO DE ARCHIVOS =====

// Click en el área de carga
uploadArea.addEventListener('click', () => {
    fileInput.click();
});

// Drag and drop
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');

    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
});

// Selección de archivo
fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFile(e.target.files[0]);
    }
});

// Procesar archivo JSON
function handleFile(file) {
    if (!file.name.endsWith('.json')) {
        alert('Por favor, selecciona un archivo JSON válido.');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            userHardware = JSON.parse(e.target.result);
            displayHardwareInfo(userHardware);
            uploadArea.classList.add('hidden');
            hardwareInfo.classList.remove('hidden');
        } catch (error) {
            alert('Error al leer el archivo JSON. Asegúrate de que sea válido.');
            console.error(error);
        }
    };
    reader.readAsText(file);
}

// Mostrar información del hardware
function displayHardwareInfo(hardware) {
    hardwareGrid.innerHTML = `
        <div class="hardware-item">
            <div class="hardware-item-label">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" stroke-width="2"/>
                    <path d="M9 9H15M9 12H15M9 15H13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                CPU
            </div>
            <div class="hardware-item-value">${hardware.cpu}</div>
        </div>
        
        <div class="hardware-item">
            <div class="hardware-item-label">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" stroke-width="2"/>
                    <path d="M7 10H7.01M11 10H11.01M7 14H7.01M11 14H11.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                RAM
            </div>
            <div class="hardware-item-value">${hardware.ram_gb} GB</div>
        </div>
        
        <div class="hardware-item">
            <div class="hardware-item-label">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="2" y="6" width="20" height="12" rx="2" stroke="currentColor" stroke-width="2"/>
                    <path d="M6 10H10M6 14H14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                GPU
            </div>
            <div class="hardware-item-value">${hardware.gpu}</div>
        </div>
        
        <div class="hardware-item">
            <div class="hardware-item-label">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                VRAM
            </div>
            <div class="hardware-item-value">${hardware.vram_gb} GB</div>
        </div>
        
        <div class="hardware-item">
            <div class="hardware-item-label">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" stroke-width="2"/>
                    <path d="M12 11V17M9 14H15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                Almacenamiento
            </div>
            <div class="hardware-item-value">${hardware.free_storage_gb} GB libres</div>
        </div>
        
        <div class="hardware-item">
            <div class="hardware-item-label">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
                    <path d="M9 9L15 15M15 9L9 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                Sistema
            </div>
            <div class="hardware-item-value">${hardware.os}</div>
        </div>
    `;
}

// ===== VERIFICAR COMPATIBILIDAD =====

checkGamesBtn.addEventListener('click', async () => {
    if (!userHardware) {
        alert('Por favor, carga primero tu archivo de hardware.');
        return;
    }

    loading.classList.remove('hidden');

    try {
        const response = await fetch('/api/check-games', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userHardware)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Error al verificar compatibilidad');
        }

        const data = await response.json();
        gamesData = data.results;

        displayResults(data);

        uploadSection.classList.add('hidden');
        resultsSection.classList.remove('hidden');

    } catch (error) {
        alert(`Error: ${error.message}\n\nAsegúrate de que:\n1. El servidor esté ejecutándose\n2. Hayas configurado GAMEREQS_API_KEY en el archivo .env\n3. La clave API sea válida`);
        console.error(error);
    } finally {
        loading.classList.add('hidden');
    }
});

// ===== MOSTRAR RESULTADOS =====

function displayResults(data) {
    // Calcular estadísticas
    const recommended = data.results.filter(g => g.compatibility.recommended.overall).length;
    const minimum = data.results.filter(g => g.compatibility.minimum.overall && !g.compatibility.recommended.overall).length;
    const incompatible = data.results.filter(g => !g.compatibility.minimum.overall).length;

    // Mostrar estadísticas
    resultsStats.innerHTML = `
        <div class="stat-item">
            <div class="stat-icon success">✓</div>
            <div class="stat-content">
                <h4>Recomendados</h4>
                <p>${recommended}</p>
            </div>
        </div>
        
        <div class="stat-item">
            <div class="stat-icon warning">~</div>
            <div class="stat-content">
                <h4>Mínimos</h4>
                <p>${minimum}</p>
            </div>
        </div>
        
        <div class="stat-item">
            <div class="stat-icon error">✗</div>
            <div class="stat-content">
                <h4>Incompatibles</h4>
                <p>${incompatible}</p>
            </div>
        </div>
        
        <div class="stat-item">
            <div class="stat-icon" style="background: hsla(200, 100%, 60%, 0.2); color: var(--secondary);">∑</div>
            <div class="stat-content">
                <h4>Total</h4>
                <p>${data.totalGames}</p>
            </div>
        </div>
    `;

    renderGames(data.results);
}

// Renderizar juegos
function renderGames(games) {
    const filteredGames = filterGames(games);

    if (filteredGames.length === 0) {
        gamesGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--text-secondary);">
                <svg style="width: 64px; height: 64px; margin: 0 auto 1rem; opacity: 0.5;" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                    <path d="M8 15C8 15 9.5 17 12 17C14.5 17 16 15 16 15M9 9H9.01M15 9H15.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                <h3>No se encontraron juegos</h3>
                <p>Intenta con otro filtro o búsqueda</p>
            </div>
        `;
        return;
    }

    gamesGrid.innerHTML = filteredGames.map(game => createGameCard(game)).join('');
}

// Crear tarjeta de juego
function createGameCard(game) {
    const comp = game.compatibility;

    let badgeClass = 'badge-incompatible';
    let badgeText = 'Incompatible ✗';

    if (comp.recommended.overall) {
        badgeClass = 'badge-recommended';
        badgeText = 'Recomendado ✓';
    } else if (comp.minimum.overall) {
        badgeClass = 'badge-minimum';
        badgeText = 'Mínimo ✓';
    }

    return `
        <div class="game-card">
            <div class="game-card-header">
                <h3 class="game-title">${game.title}</h3>
                <span class="compatibility-badge ${badgeClass}">${badgeText}</span>
            </div>
            
            <div class="requirements">
                ${createRequirementSection('Mínimos', game.minimum, comp.minimum)}
                ${createRequirementSection('Recomendados', game.recommended, comp.recommended)}
            </div>
        </div>
    `;
}

// Crear sección de requisitos
function createRequirementSection(title, requirements, compatibility) {
    if (!requirements) return '';

    return `
        <div class="requirement-section">
            <h4>${title}</h4>
            ${createRequirementItem('CPU', requirements.cpu, compatibility.cpu)}
            ${createRequirementItem('RAM', requirements.ram, compatibility.ram)}
            ${createRequirementItem('GPU', requirements.gpu, compatibility.gpu)}
            ${createRequirementItem('VRAM', requirements.vram, compatibility.vram)}
            ${createRequirementItem('Almacenamiento', requirements.storage, compatibility.storage)}
        </div>
    `;
}

// Crear item de requisito
function createRequirementItem(label, value, isCompatible) {
    if (!value || value === 'N/A') return '';

    let iconSVG = '';
    let iconClass = '';

    if (isCompatible === true) {
        iconClass = 'check';
        iconSVG = '<path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';
    } else if (isCompatible === false) {
        iconClass = 'cross';
        iconSVG = '<path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';
    } else {
        iconClass = 'question';
        iconSVG = '<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><path d="M9.09 9C9.3251 8.33167 9.78915 7.76811 10.4 7.40913C11.0108 7.05016 11.7289 6.91894 12.4272 7.03871C13.1255 7.15849 13.7588 7.52152 14.2151 8.06353C14.6713 8.60553 14.9211 9.29152 14.92 10C14.92 12 11.92 13 11.92 13M12 17H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';
    }

    return `
        <div class="requirement-item">
            <svg class="requirement-icon ${iconClass}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                ${iconSVG}
            </svg>
            <span class="requirement-label">${label}:</span>
            <span class="requirement-value">${value}</span>
        </div>
    `;
}

// ===== FILTROS Y BÚSQUEDA =====

// Filtros
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderGames(gamesData);
    });
});

// Búsqueda
searchInput.addEventListener('input', (e) => {
    renderGames(gamesData);
});

// Filtrar juegos
function filterGames(games) {
    let filtered = games;

    // Aplicar filtro de categoría
    if (currentFilter !== 'all') {
        filtered = filtered.filter(game => {
            if (currentFilter === 'recommended') {
                return game.compatibility.recommended.overall;
            } else if (currentFilter === 'minimum') {
                return game.compatibility.minimum.overall && !game.compatibility.recommended.overall;
            } else if (currentFilter === 'incompatible') {
                return !game.compatibility.minimum.overall;
            }
            return true;
        });
    }

    // Aplicar búsqueda
    const searchTerm = searchInput.value.toLowerCase().trim();
    if (searchTerm) {
        filtered = filtered.filter(game =>
            game.title.toLowerCase().includes(searchTerm)
        );
    }

    return filtered;
}

// ===== INICIALIZACIÓN =====

console.log('%c🎮 Game Compatibility Checker', 'font-size: 20px; font-weight: bold; color: #a855f7;');
console.log('%cAplicación lista. Carga tu archivo hardware.json para comenzar.', 'color: #60a5fa;');
