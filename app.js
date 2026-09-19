// ============================================
// MiscalorIAs - Aplicación Principal
// Dual AI: Food-101 Swin (platos) + MobileNet (frutas/bebidas)
// ============================================

// Estado global
let foodClassifier = null;
let foodsData = {};
let nutritionEngine = null;
let currentLanguage = 'es';
let currentProgressKey = 'loadingPreparing';
let lastResult = null;
let isModelLoading = false;
let currentCandidates = [];

// Elementos DOM
const btnUpload = document.getElementById('btn-upload');
const uploadBox = document.getElementById('upload-box');
const imageInput = document.getElementById('image-input');
const uploadSection = document.getElementById('upload-section');
const previewSection = document.getElementById('preview-section');
const imagePreview = document.getElementById('image-preview');
const scanningOverlay = document.getElementById('scanning-overlay');
const resultsContainer = document.getElementById('results-container');
const btnReset = document.getElementById('btn-reset');
const scanText = document.querySelector('.scan-text');

const adModal = document.getElementById('ad-modal');
const btnCloseAd = document.getElementById('btn-close-ad');

const foodNameEl = document.getElementById('food-name');
const healthBadgeEl = document.getElementById('health-badge');
const calorieAmountEl = document.getElementById('calorie-amount');
const calorieUnitEl = document.getElementById('calorie-unit');
const foodSuggestionEl = document.getElementById('food-suggestion');
const detectedItemsListEl = document.getElementById('detected-items-list');
const macroGridEl = document.getElementById('macro-grid');
const recommendationsListEl = document.getElementById('recommendations-list');
const progressBar = document.getElementById('loading-progress');
const progressText = document.getElementById('loading-text');
const brandTitle = document.getElementById('brand-title');
const languageButtons = document.querySelectorAll('.language-option');
const qualityNoticeEl = document.getElementById('quality-notice');
const alternativesBoxEl = document.getElementById('alternatives-box');

// Traducciones
const translations = {
    es: {
        documentTitle: 'MiscalorIAs - Analizador de Alimentos con IA',
        metaDescription: 'Descubre las calorias de tu comida con Inteligencia Artificial directamente en tu navegador. Reconoce 101+ platillos.',
        brandHtml: 'Miscalor<span class="accent">IAs</span>',
        author: 'Creado por Evaristo Suarez Eichelmann',
        adSpace: 'Espacio AdSense',
        tagline: 'Conoce lo que comes con Inteligencia Artificial',
        loadingPreparing: 'Preparando IA especialista en comida...',
        loadingDatabase: 'Base de datos nutricional cargada...',
        loadingDatabaseError: 'No se pudo cargar foods.json.',
        loadingSpecialist: 'Descargando IA especialista en comida...',
        loadingTransformers: 'Cargando motores de IA...',
        loadingFood101: 'Cargando IA Food-101 especializada...',
        loadingFood101FirstTime: 'Descargando IA Food-101 (solo la primera vez, ~58 MB)...',
        loadingReady: 'Lista para analizar.',
        loadingError: 'Error cargando la IA. Necesitas internet la primera vez; luego funciona offline.',
        uploadTitle: 'Toma una foto o sube imagen',
        uploadHint: 'Formatos: JPG, PNG',
        uploadButton: 'Camara / Galeria',
        scanAnalyzing: 'Analizando alimentos y bebidas...',
        detectedItemsLabel: 'Elementos detectados',
        analysisLabel: 'Analisis',
        recommendationsLabel: 'Recomendaciones',
        mealTitle: 'Tu comida',
        noDetections: 'No se detectaron elementos con suficiente confianza.',
        newMeal: 'Nueva Comida',
        authorRole: 'CEO y Creador de MiscalorIAs',
        adLabel: 'Publicidad',
        closeAd: 'Cerrar y continuar',
        aiStillLoading: 'La IA se sigue descargando. Espera unos segundos y vuelve a intentar.',
        imageReadError: 'Ocurrio un error leyendo esta imagen. Intenta con otra foto.',
        unknownName: 'No identificado',
        unknownSuggestion: 'La IA no pudo reconocer este alimento con certeza. Prueba con una foto mas iluminada, centrada y cercana al plato.',
        alternativesLabel: 'Quizas sea alguno de estos:',
        noAlternatives: 'Intenta con una foto mas clara, iluminada y cercana al plato.',
        estimateNotice: 'Estimación orientativa basada en una porción estándar. Confirma el alimento y ajusta según tu porción, receta y acompañamientos.',
        lowQualityDark: 'La foto está demasiado oscura para una estimación confiable. Toma otra con más luz.',
        lowQualityBright: 'La foto está sobreexpuesta. Evita el flash directo e intenta de nuevo.',
        lowQualityBlurry: 'La foto está borrosa o sin suficiente detalle. Acércate, enfoca el alimento y vuelve a intentarlo.',
        lowQualityInvalid: 'No se pudo leer la imagen. Elige otra fotografía.',
        confirmAlternative: '¿No es correcto? Elige otra opción para recalcular:',
        localDataOnly: 'Los datos nutricionales se calculan localmente; no se consulta ningún servicio externo.',
        healthy: 'Sano',
        moderate: 'Moderado',
        unhealthy: 'Poco Sano',
        typeFood: 'Alimento',
        typeBeverage: 'Bebida',
        typeUnknown: 'Elemento',
        detectedPrefix: 'IA detecto',
        confidence: 'confianza',
        macroProtein: 'Proteina',
        macroCarbs: 'Carbohidratos',
        macroFat: 'Grasa',
        macroSugar: 'Azucar',
        macroFiber: 'Fibra',
        perServing: 'por porcion',
        per100g: 'por 100g',
        perSlice: 'por rebanada',
        perPiece: 'por pieza',
        perPlate: 'por plato',
        perCup: 'por taza',
        perBowl: 'por tazon',
        perItem: 'por unidad',
        per2Halves: 'por 2 mitades',
        per6Pieces: 'por 6 piezas',
        perServing3: 'por porcion (3 piezas)'
    },
    en: {
        documentTitle: 'MAIcalories - AI Food Calorie Analyzer',
        metaDescription: 'Discover the calories in your food with AI directly in your browser. Recognizes 101+ dishes.',
        brandHtml: '<span class="accent">MAI</span>calories',
        author: 'Created by Evaristo Suarez Eichelmann',
        adSpace: 'AdSense Space',
        tagline: 'Know what you eat with Artificial Intelligence',
        loadingPreparing: 'Preparing food AI specialist...',
        loadingDatabase: 'Nutrition database loaded...',
        loadingDatabaseError: 'Could not load foods.json.',
        loadingSpecialist: 'Downloading food AI specialist...',
        loadingTransformers: 'Loading AI engines...',
        loadingFood101: 'Loading specialized Food-101 AI...',
        loadingFood101FirstTime: 'Downloading Food-101 AI (first time only, ~58 MB)...',
        loadingError: 'Error loading AI. Internet needed the first time; then it works offline.',
        loadingProgress: (mb, total) => `Downloading AI... ${mb} MB of ${total} MB`,
        loadingReady: 'Ready.',
        loadingError: 'Error loading the AI. Check your internet connection and reload.',
        uploadTitle: 'Take a photo or upload an image',
        uploadHint: 'Formats: JPG, PNG',
        uploadButton: 'Camera / Gallery',
        scanAnalyzing: 'Analyzing food and beverages...',
        detectedItemsLabel: 'Detected items',
        analysisLabel: 'Analysis',
        recommendationsLabel: 'Recommendations',
        mealTitle: 'Your meal',
        noDetections: 'No elements were detected with enough confidence.',
        newMeal: 'New Meal',
        authorRole: 'CEO & Creator of MiscalorIAs',
        adLabel: 'Advertisement',
        closeAd: 'Close and continue',
        aiStillLoading: 'The AI is still downloading. Wait a few seconds and try again.',
        imageReadError: 'There was an error reading this image. Try another photo.',
        unknownName: 'Not identified',
        unknownSuggestion: 'The AI could not recognize this food with confidence. Try a brighter, centered, close-up photo of the plate.',
        alternativesLabel: 'It might be one of these:',
        noAlternatives: 'Try a clearer, brighter, closer photo of the plate.',
        estimateNotice: 'This is a serving-based estimate. Confirm the food and adjust for your portion, recipe, and sides.',
        lowQualityDark: 'The photo is too dark for a reliable estimate. Take another one with more light.',
        lowQualityBright: 'The photo is overexposed. Avoid direct flash and try again.',
        lowQualityBlurry: 'The photo is blurry or lacks detail. Move closer, focus on the food, and try again.',
        lowQualityInvalid: 'The image could not be read. Choose another photo.',
        confirmAlternative: 'Not correct? Choose another option to recalculate:',
        localDataOnly: 'Nutrition is calculated locally; no external service is queried.',
        healthy: 'Healthy',
        moderate: 'Moderate',
        unhealthy: 'Less Healthy',
        typeFood: 'Food',
        typeBeverage: 'Drink',
        typeUnknown: 'Item',
        detectedPrefix: 'AI detected',
        confidence: 'confidence',
        macroProtein: 'Protein',
        macroCarbs: 'Carbs',
        macroFat: 'Fat',
        macroSugar: 'Sugar',
        macroFiber: 'Fiber',
        perServing: 'per serving',
        per100g: 'per 100g',
        perSlice: 'per slice',
        perPiece: 'per piece',
        perPlate: 'per plate',
        perCup: 'per cup',
        perBowl: 'per bowl',
        perItem: 'per item',
        per2Halves: 'per 2 halves',
        per6Pieces: 'per 6 pieces',
        perServing3: 'per serving (3 pieces)'
    }
};

// Unidades en ingles para conversion
const englishUnits = {
    'por rebanada': 'per slice',
    'por 100g': 'per 100g',
    'por porcion': 'per serving',
    'por porci\u00f3n': 'per serving',
    'por pieza': 'per piece',
    'por plato': 'per plate',
    'por unidad': 'per item',
    'por taza': 'per cup',
    'por tazon': 'per bowl',
    'por taz\u00f3n': 'per bowl',
    'por 2 mitades': 'per 2 halves',
    'por 6 piezas': 'per 6 pieces',
    'por porcion (3 piezas)': 'per serving (3 pieces)',
    'por porci\u00f3n (3 piezas)': 'per serving (3 pieces)'
};

// Deteccion de idioma
const requestedLanguage = window.location.hash.replace('#', '');
currentLanguage = ['es', 'en'].includes(requestedLanguage)
    ? requestedLanguage
    : localStorage.getItem('calorie-ai-language') || 'es';
if (!translations[currentLanguage]) currentLanguage = 'es';

// Funcion de traduccion
function t(key, ...args) {
    const value = translations[currentLanguage][key] || translations.es[key] || key;
    return typeof value === 'function' ? value(...args) : value;
}

function setText(key, text) {
    translations[currentLanguage][key] = text;
}

function formatFoodName(key, foodInfo) {
    if (currentLanguage === 'es') return foodInfo.name;
    return String(key || '')
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatFoodUnit(unit) {
    if (currentLanguage === 'es') return unit;
    const normalized = String(unit || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    return englishUnits[normalized] || englishUnits[unit] || unit;
}

function buildEnglishSuggestion(foodInfo) {
    const status = foodInfo.healthStatus || 'moderate';
    if (status === 'healthy') {
        return 'Reality check: this is a lighter, nutrient-friendly option. Portion size still matters, but it is a solid choice.';
    }
    if (status === 'unhealthy') {
        return 'Reality check: this is calorie dense and easy to overdo. Enjoy it in a smaller portion and balance the rest of your meal.';
    }
    return 'Reality check: this can fit in a balanced meal. Watch toppings, sauces, oil and portion size.';
}

// Aplicar idioma a toda la UI
function applyLanguage() {
    document.documentElement.lang = currentLanguage;
    document.title = t('documentTitle');

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) metaDescription.setAttribute('content', t('metaDescription'));
    if (brandTitle) brandTitle.innerHTML = t('brandHtml');

    document.querySelectorAll('[data-i18n]').forEach((element) => {
        const key = element.getAttribute('data-i18n');
        if (element.tagName === 'IMG' && element.hasAttribute('alt')) {
            element.alt = t(key);
        } else {
            element.textContent = t(key);
        }
    });

    languageButtons.forEach((button) => {
        const isActive = button.dataset.lang === currentLanguage;
        button.classList.toggle('active', isActive);
        button.setAttribute('aria-pressed', String(isActive));
    });

    if (progressText && currentProgressKey) {
        progressText.textContent = t(currentProgressKey);
    }

    if (lastResult) {
        showResults(lastResult);
    }
}

function updateProgress(percent, key) {
    if (progressBar) progressBar.style.width = `${percent}%`;
    currentProgressKey = key;
    if (progressText) progressText.textContent = t(key);
    // Forzar repintado
    if (progressBar) progressBar.getBoundingClientRect();
}

function setUploadEnabled(isEnabled) {
    uploadSection.style.opacity = isEnabled ? '1' : '0.5';
    uploadBox.style.pointerEvents = isEnabled ? 'auto' : 'none';
    btnUpload.disabled = !isEnabled;
}

function waitForGlobals(names, timeoutMs = 30000) {
    return new Promise((resolve, reject) => {
        const start = Date.now();
        const tick = () => {
            if (names.every((n) => typeof window[n] !== 'undefined')) {
                resolve(true);
                return;
            }
            if (Date.now() - start > timeoutMs) {
                reject(new Error('Timeout esperando librerias: ' + names.join(', ')));
                return;
            }
            setTimeout(tick, 50);
        };
        tick();
    });
}

// ============================================
// INICIALIZACION DEL MODELO
// ============================================

async function initApp() {
    setUploadEnabled(false);
    updateProgress(5, 'loadingPreparing');

    try {
        // Esperar runtimes (por si el navegador cachea scripts de forma rara)
        await waitForGlobals(['ort', 'tf'], 60000);

        if (typeof ort === 'undefined') {
            throw new Error('ONNX Runtime no esta cargado');
        }
        console.log('[App] Runtimes OK. TF.js:', typeof tf !== 'undefined' ? tf.version.tfjs : 'n/a');
        updateProgress(15, 'loadingTransformers');

        // 2. Cargar base de datos nutricional
        const foodsResponse = await fetch('foods.json');
        if (!foodsResponse.ok) throw new Error(`HTTP ${foodsResponse.status} loading foods.json`);
        foodsData = await foodsResponse.json();
        console.log('[App] Base de datos cargada:', Object.keys(foodsData).length, 'alimentos');
        updateProgress(20, 'loadingDatabase');

        if (typeof NutritionEngine === 'undefined') {
            throw new Error('NutritionEngine no esta definido. Verifica nutrition-engine.js');
        }
        nutritionEngine = new NutritionEngine({
            foodsData
        });

        // 3. Inicializar FoodClassifier
        updateProgress(30, 'loadingFood101FirstTime');
        
        if (typeof FoodClassifier === 'undefined') {
            throw new Error('FoodClassifier no esta definido. Verifica model.js');
        }

        foodClassifier = new FoodClassifier({
            foodDatabase: foodsData,
            confidenceThreshold: 0.32,
            topK: 5
        });
        window.foodClassifier = foodClassifier;

        // progress del modelo ya viene en 0-100
        await foodClassifier.load((progress, status) => {
            const prog = Math.max(30, Math.min(95, Math.round(Number(progress) || 0)));
            updateProgress(prog, status || 'loadingFood101');
        });
        
        console.log('[App] FoodClassifier cargado y listo');
        
        updateProgress(85, 'loadingFood101');
        
        // Test rapido
        const testCanvas = document.createElement('canvas');
        testCanvas.width = 224;
        testCanvas.height = 224;
        const ctx = testCanvas.getContext('2d');
        ctx.fillStyle = '#888';
        ctx.fillRect(0, 0, 224, 224);
        
        try {
            const testResult = await foodClassifier.classify(testCanvas);
            console.log('[App] Test inference OK:', testResult.slice(0, 2));
        } catch (testErr) {
            console.warn('[App] Test inference fallo (normal en algunos navegadores):', testErr.message);
        }

        scanText.textContent = t('scanAnalyzing');
        setUploadEnabled(true);
        
        const loadingBar = document.getElementById('loading-bar');
        if (loadingBar) setTimeout(() => { loadingBar.style.display = 'none'; }, 600);
        
        updateProgress(100, 'loadingReady');
        
    } catch (error) {
        console.error('[App] Error inicializando:', error);
        updateProgress(0, 'loadingError');
        setUploadEnabled(true);
        alert(t('loadingError'));
    }
}

// Timeout amplio: Food-101 ~58MB + MobileNet CDN en primera visita
const INIT_TIMEOUT_MS = 180000;
Promise.race([
    initApp(),
    new Promise((_, reject) => setTimeout(() => reject(new Error('init timeout')), INIT_TIMEOUT_MS))
]).catch(err => {
    console.error('[App] Init fallo o timeout:', err);
    updateProgress(0, 'loadingError');
    setUploadEnabled(true);
    const loadingBar = document.getElementById('loading-bar');
    if (loadingBar) loadingBar.style.display = 'none';
    alert(t('loadingError'));
});

// ============================================
// EVENTOS UI
// ============================================

btnUpload.addEventListener('click', (event) => {
    event.stopPropagation();
    imageInput.click();
});

uploadBox.addEventListener('click', () => imageInput.click());

imageInput.addEventListener('change', (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
        alert(t('imageReadError'));
        imageInput.value = '';
        return;
    }

    const reader = new FileReader();
    reader.onload = (readerEvent) => {
        imagePreview.onload = () => {
            imagePreview.onload = null;
            imagePreview.onerror = null;
            startAnalysis();
        };
        imagePreview.onerror = () => {
            imagePreview.onload = null;
            imagePreview.onerror = null;
            alert(t('imageReadError'));
            resetApp();
        };
        imagePreview.src = readerEvent.target.result;
    };
    reader.onerror = () => {
        alert(t('imageReadError'));
        resetApp();
    };
    reader.readAsDataURL(file);
});

btnReset.addEventListener('click', () => {
    adModal.classList.remove('hidden');
});

btnCloseAd.addEventListener('click', () => {
    adModal.classList.add('hidden');
    resetApp();
});

languageButtons.forEach((button) => {
    button.addEventListener('click', () => {
        currentLanguage = button.dataset.lang || 'es';
        localStorage.setItem('calorie-ai-language', currentLanguage);
        applyLanguage();
    });
});

// ============================================
// ANALISIS DE IMAGEN
// ============================================

async function startAnalysis() {
    if (!foodClassifier || !foodClassifier.ready()) {
        alert(t('aiStillLoading'));
        resetApp();
        return;
    }
    if (!nutritionEngine) {
        alert('El motor nutricional no esta listo.');
        resetApp();
        return;
    }

    uploadSection.classList.add('hidden');
    previewSection.classList.remove('hidden');
    scanningOverlay.classList.remove('hidden');
    resultsContainer.classList.add('hidden');

    try {
        const predictions = await foodClassifier.classify(imagePreview, {
            multiCrop: true,
            topK: 5
        });
        const imageQuality = foodClassifier.lastImageQuality;
        currentCandidates = foodClassifier.getLastCandidates();
        console.log('[App] Predicciones de vision:', predictions);

        const analysis = await nutritionEngine.analyzeVisionPredictions(predictions, {
            confidenceThreshold: foodClassifier.confidenceThreshold || 0.1,
            language: currentLanguage
        });
        analysis.predictions = predictions;
        analysis.alternatives = currentCandidates;
        analysis.imageQuality = imageQuality;

        showResults(analysis);
        
    } catch (error) {
        console.error('[App] Error analizando:', error);
        if (error.message && error.message.includes('timeout')) {
            alert('La IA tomo demasiado tiempo. Intenta con una foto mas clara o recarga la pagina.');
        } else {
            alert(t('imageReadError'));
        }
        resetApp();
    }
}

function showResults(analysis) {
    lastResult = analysis;
    
    scanningOverlay.classList.add('hidden');
    resultsContainer.classList.remove('hidden');

    const items = analysis?.items || [];
    const totals = analysis?.totals || {};
    const score = Number(analysis?.healthScore ?? 0);
    const scoreStatus = getHealthStatus(score);
    const scoreLabel = getHealthStatusLabel(scoreStatus);

    foodNameEl.textContent = items.length ? t('mealTitle') : t('unknownName');
    calorieAmountEl.textContent = items.length ? Math.round(totals.calories || 0) : '--';
    calorieUnitEl.textContent = 'kcal';

    const recommendations = (nutritionEngine && items.length)
        ? nutritionEngine.buildRecommendations(items, totals, score, currentLanguage)
        : (items.length ? analysis?.recommendations || [] : []);
    const analysisText = (nutritionEngine && items.length)
        ? nutritionEngine.buildAnalysis(items, totals, score, currentLanguage)
        : (analysis?.analysis || t('unknownSuggestion'));

    renderDetectedItems(items);
    renderMacros(totals);
    renderRecommendations(recommendations);
    renderQualityNotice(analysis?.imageQuality, items.length > 0);
    renderAlternatives(analysis?.alternatives || []);

    foodSuggestionEl.textContent = analysisText;

    healthBadgeEl.className = 'health-badge';
    healthBadgeEl.textContent = items.length ? `${score.toFixed(1)} / 10` : '--';
    healthBadgeEl.setAttribute('title', scoreLabel);
    if (!items.length) {
        healthBadgeEl.classList.add('status-moderate');
    } else if (scoreStatus === 'healthy') {
        healthBadgeEl.classList.add('status-healthy');
    } else if (scoreStatus === 'unhealthy') {
        healthBadgeEl.classList.add('status-unhealthy');
    } else {
        healthBadgeEl.classList.add('status-moderate');
    }
}

function resetApp() {
    imagePreview.onload = null;
    imagePreview.onerror = null;
    imagePreview.removeAttribute('src');
    imageInput.value = '';
    uploadSection.classList.remove('hidden');
    previewSection.classList.add('hidden');
    scanningOverlay.classList.add('hidden');
    resultsContainer.classList.add('hidden');
    if (detectedItemsListEl) detectedItemsListEl.innerHTML = '';
    if (macroGridEl) macroGridEl.innerHTML = '';
    if (recommendationsListEl) recommendationsListEl.innerHTML = '';
    if (foodSuggestionEl) foodSuggestionEl.textContent = '...';
    lastResult = null;
    currentCandidates = [];
    if (qualityNoticeEl) qualityNoticeEl.textContent = '';
    if (alternativesBoxEl) alternativesBoxEl.innerHTML = '';
}

function renderQualityNotice(imageQuality, hasItems) {
    if (!qualityNoticeEl) return;
    qualityNoticeEl.classList.remove('is-warning');
    if (imageQuality && !imageQuality.usable) {
        const qualityKey = `lowQuality${String(imageQuality.reason || 'invalid').replace(/^./, (letter) => letter.toUpperCase())}`;
        qualityNoticeEl.textContent = t(qualityKey);
        qualityNoticeEl.classList.add('is-warning');
        return;
    }
    qualityNoticeEl.textContent = hasItems ? `${t('estimateNotice')} ${t('localDataOnly')}` : t('unknownSuggestion');
}

function renderAlternatives(candidates) {
    if (!alternativesBoxEl) return;
    alternativesBoxEl.innerHTML = '';
    const alternatives = (candidates || []).filter((candidate) => candidate.foodKey !== lastResult?.predictions?.[0]?.foodKey).slice(0, 3);
    if (!alternatives.length) {
        alternativesBoxEl.classList.add('hidden');
        return;
    }

    alternativesBoxEl.classList.remove('hidden');
    const title = document.createElement('span');
    title.className = 'alternatives-title';
    title.textContent = t('confirmAlternative');
    alternativesBoxEl.appendChild(title);
    alternatives.forEach((candidate) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'alternative-item';
        button.textContent = `${formatFoodName(candidate.foodKey, { name: candidate.foodKey })} · ${formatConfidence(candidate.confidence)}`;
        button.addEventListener('click', () => selectCandidate(candidate));
        alternativesBoxEl.appendChild(button);
    });
}

async function selectCandidate(candidate) {
    if (!candidate || !nutritionEngine) return;
    scanningOverlay.classList.remove('hidden');
    resultsContainer.classList.add('hidden');
    try {
        const analysis = await nutritionEngine.analyzeVisionPredictions([candidate], {
            confidenceThreshold: foodClassifier?.confidenceThreshold || 0.32
        });
        analysis.predictions = [candidate];
        analysis.alternatives = currentCandidates;
        analysis.imageQuality = foodClassifier?.lastImageQuality;
        showResults(analysis);
    } catch (error) {
        console.error('[App] Error al confirmar alternativa:', error);
        alert(t('imageReadError'));
        resetApp();
    }
}

function getHealthStatus(score) {
    if (score >= 7.5) return 'healthy';
    if (score >= 4.5) return 'moderate';
    return 'unhealthy';
}

function getHealthStatusLabel(status) {
    if (status === 'healthy') return t('healthy');
    if (status === 'unhealthy') return t('unhealthy');
    return t('moderate');
}

function formatConfidence(confidence) {
    return `${Math.round((confidence || 0) * 100)}%`;
}

function formatItemType(type) {
    if (type === 'food') return t('typeFood');
    if (type === 'beverage') return t('typeBeverage');
    return t('typeUnknown');
}

function getItemDisplayName(item) {
    if (currentLanguage === 'en') {
        return formatFoodName(item.canonical_id, { name: item.name });
    }
    if (!nutritionEngine) return item.name || item.canonical_id;
    const record = nutritionEngine.getRecord(item.canonical_id);
    return record?.name || item.name || formatFoodName(item.canonical_id, { name: item.name });
}

function getQuantityLabel(item) {
    if (!item) return '';
    if (item.quantity && item.quantity !== 1) {
        if (item.estimated_volume_ml) {
            return `x${item.quantity} (${item.estimated_volume_ml} ml)`;
        }
        if (item.estimated_weight_g) {
            return `x${item.quantity} (~${item.estimated_weight_g} g)`;
        }
        return `x${item.quantity}`;
    }
    if (item.estimated_volume_ml) {
        return `${item.estimated_volume_ml} ml`;
    }
    if (item.estimated_weight_g) {
        return `${item.estimated_weight_g} g`;
    }
    return '';
}

function renderDetectedItems(items) {
    if (!detectedItemsListEl) return;
    detectedItemsListEl.innerHTML = '';

    if (!items || !items.length) {
        const empty = document.createElement('div');
        empty.className = 'detected-item detected-item-empty';
        empty.textContent = t('noDetections');
        detectedItemsListEl.appendChild(empty);
        return;
    }

    items.forEach((item) => {
        const row = document.createElement('div');
        row.className = 'detected-item';

        const left = document.createElement('div');
        left.className = 'detected-item-main';

        const title = document.createElement('div');
        title.className = 'detected-item-name';
        title.textContent = getItemDisplayName(item);

        const meta = document.createElement('div');
        meta.className = 'detected-item-meta';
        const parts = [formatItemType(item.type), getQuantityLabel(item)].filter(Boolean);
        meta.textContent = parts.join(' · ');

        left.appendChild(title);
        left.appendChild(meta);

        const right = document.createElement('div');
        right.className = 'detected-item-kcal';
        right.textContent = `${Math.round(item.nutrition?.calories || 0)} kcal`;

        const confidence = document.createElement('div');
        confidence.className = 'detected-item-confidence';
        confidence.textContent = formatConfidence(item.confidence);

        row.appendChild(left);
        row.appendChild(right);
        row.appendChild(confidence);
        detectedItemsListEl.appendChild(row);
    });
}

function renderMacros(totals) {
    if (!macroGridEl) return;
    const entries = [
        { key: 'protein', label: t('macroProtein'), value: totals.protein },
        { key: 'carbs', label: t('macroCarbs'), value: totals.carbs },
        { key: 'fat', label: t('macroFat'), value: totals.fat },
        { key: 'sugar', label: t('macroSugar'), value: totals.sugar },
        { key: 'fiber', label: t('macroFiber'), value: totals.fiber }
    ];

    macroGridEl.innerHTML = '';
    entries.forEach((entry) => {
        const card = document.createElement('div');
        card.className = 'macro-card';
        card.innerHTML = `<span class="macro-label">${entry.label}</span><strong class="macro-value">${Math.round(entry.value || 0)} g</strong>`;
        macroGridEl.appendChild(card);
    });
}

function renderRecommendations(recommendations) {
    if (!recommendationsListEl) return;
    recommendationsListEl.innerHTML = '';

    (recommendations || []).forEach((text) => {
        const li = document.createElement('li');
        li.textContent = text;
        recommendationsListEl.appendChild(li);
    });
}

/* ===== AUTHOR POPOVER (CEO bubble) ===== */
let popoverShown = false;
let popoverTimer = null;
let popoverCooldown = false;

function createAuthorPopover() {
    const popover = document.createElement('div');
    popover.className = 'author-popover';
    popover.innerHTML = `
        <div class="author-popover-card" role="dialog" aria-label="${t('author')}">
            <div class="author-popover-photo-wrap">
                <img class="author-popover-photo" src="evaristo-credits.jpeg" alt="Evaristo Suarez Eichelmann - Creador" loading="lazy">
            </div>
            <div class="author-popover-name" data-i18n="author">Evaristo Suarez Eichelmann</div>
            <div class="author-popover-role" data-i18n="authorRole">CEO & Creador de MiscalorIAs</div>
            <div class="author-popover-progress" aria-hidden="true"><span></span></div>
        </div>
    `;
    document.body.appendChild(popover);
    return popover;
}

function showAuthorPopover(triggerEl) {
    if (popoverShown || popoverCooldown) return;
    popoverShown = true;
    popoverCooldown = true;

    const popover = createAuthorPopover();
    const card = popover.querySelector('.author-popover-card');

    const rect = triggerEl.getBoundingClientRect();
    popover.style.left = rect.left + 'px';
    popover.style.top = (rect.bottom + 8) + 'px';
    popover.style.transform = 'none';

    requestAnimationFrame(() => {
        popover.classList.add('visible');
    });

    const onClickOutside = (e) => {
        if (e.target === popover || !popover.contains(e.target)) {
            hideAuthorPopover(popover, card);
            document.removeEventListener('click', onClickOutside);
        }
    };
    setTimeout(() => document.addEventListener('click', onClickOutside), 0);

    popoverTimer = setTimeout(() => {
        hideAuthorPopover(popover, card);
        document.removeEventListener('click', onClickOutside);
    }, 5000);

    setTimeout(() => { popoverCooldown = false; }, 8000);
}

function hideAuthorPopover(popover, card) {
    if (!popover.classList.contains('visible')) return;
    clearTimeout(popoverTimer);
    popover.classList.add('hiding');
    setTimeout(() => popover.classList.remove('visible'), 20);
    setTimeout(() => {
        popover.remove();
        popoverShown = false;
    }, 380);
}

const authorCredits = document.querySelector('.author-credits');
if (authorCredits) {
    authorCredits.style.cursor = 'pointer';
    authorCredits.addEventListener('click', (e) => {
        e.stopPropagation();
        showAuthorPopover(authorCredits);
    });
    authorCredits.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            showAuthorPopover(authorCredits);
        }
    });
    authorCredits.setAttribute('role', 'button');
    authorCredits.setAttribute('tabindex', '0');
    authorCredits.setAttribute('aria-label', 'Ver informacion del autor');
}

// Inicializar idioma
applyLanguage();
