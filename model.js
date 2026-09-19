// ============================================
// MiscalorIAs - Motor de vision dual (100% client-side)
// 1) Food-101 Swin ONNX  -> platos/postres (92% accuracy)
// 2) MobileNet ImageNet  -> frutas, verduras, bebidas
// Sin backend. Sin API keys. Listo para GitHub Pages.
// ============================================

const MODEL_CONFIG = {
  food101: {
    modelUrl: 'models/food101/onnx/model_q4.onnx',
    configUrl: 'models/food101/config.json',
    inputSize: 224,
    mean: [0.485, 0.456, 0.406],
    std: [0.229, 0.224, 0.225],
    confidenceThreshold: 0.32,
    minimumMargin: 0.08
  },
  imagenet: {
    confidenceThreshold: 0.18,
    topK: 5
  },
  topK: 5,
  confidenceThreshold: 0.32
};

/**
 * Solo clases ImageNet REALES de comida/bebida/fruta/verdura.
 * (ImageNet NO tiene ramen/sushi/tacos — eso lo cubre Food-101.)
 */
const IMAGENET_TO_FOODS = {
  guacamole: 'guacamole',
  consomme: 'french_onion_soup',
  hot_pot: 'pho',
  trifle: 'tiramisu',
  ice_cream: 'ice_cream',
  ice_lolly: 'ice_cream',
  french_loaf: 'bread',
  bagel: 'bagel',
  pretzel: 'pretzel',
  cheeseburger: 'hamburger',
  hotdog: 'hot_dog',
  mashed_potato: 'mashed_potato',
  head_cabbage: 'cabbage',
  broccoli: 'broccoli',
  cauliflower: 'cauliflower',
  zucchini: 'zucchini',
  spaghetti_squash: 'squash',
  acorn_squash: 'squash',
  butternut_squash: 'squash',
  cucumber: 'cucumber',
  artichoke: 'artichoke',
  bell_pepper: 'bell_pepper',
  mushroom: 'mushroom',
  granny_smith: 'apple',
  strawberry: 'strawberry',
  orange: 'orange',
  lemon: 'lemon',
  fig: 'fig',
  pineapple: 'pineapple',
  banana: 'banana',
  jackfruit: 'jackfruit',
  custard_apple: 'apple',
  pomegranate: 'pomegranate',
  carbonara: 'spaghetti_carbonara',
  chocolate_sauce: 'chocolate_mousse',
  dough: 'bread',
  meat_loaf: 'meat_loaf',
  pizza: 'pizza',
  potpie: 'potpie',
  burrito: 'breakfast_burrito',
  red_wine: 'wine',
  espresso: 'coffee',
  eggnog: 'eggnog',
  // Contenedores / botellas tipicos de bebidas (confianza mas baja en merge)
  beer_glass: 'beer',
  wine_bottle: 'wine',
  pop_bottle: 'soda',
  water_bottle: 'water',
  coffee_mug: 'coffee',
  teapot: 'tea',
  pill_bottle: null,
  // Carne / platos adicionales ImageNet
  pizza: 'pizza'
};

/** Clases ImageNet genericas que NO deben mapearse a comida (evitan falsos positivos). */
const IMAGENET_BLOCKLIST = new Set([
  'plate', 'tray', 'cup', 'bowl', 'dining_table', 'menu', 'restaurant',
  'wooden_spoon', 'spatula', 'ladle', 'potter_s_wheel', 'hook', 'stove',
  'microwave', 'refrigerator', 'dishwasher', 'toaster', 'waffle_iron'
]);

function clampNumber(value, min, max, fallback) {
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, parsed));
}

function normalizeClassName(name) {
  return String(name || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

function softmax(logits) {
  const arr = Array.from(logits);
  const max = Math.max(...arr);
  const exps = arr.map((v) => Math.exp(v - max));
  const sum = exps.reduce((a, b) => a + b, 0) || 1;
  return exps.map((v) => v / sum);
}

function assessImageQuality(source) {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const width = source.naturalWidth || source.videoWidth || source.width || 0;
  const height = source.naturalHeight || source.videoHeight || source.height || 0;
  if (!width || !height) return { usable: false, reason: 'invalid' };

  const scale = Math.max(size / width, size / height);
  const drawWidth = Math.round(width * scale);
  const drawHeight = Math.round(height * scale);
  ctx.drawImage(source, Math.floor((size - drawWidth) / 2), Math.floor((size - drawHeight) / 2), drawWidth, drawHeight);

  const pixels = ctx.getImageData(0, 0, size, size).data;
  const luminance = new Float32Array(size * size);
  let sum = 0;
  for (let pixel = 0, index = 0; pixel < pixels.length; pixel += 4, index += 1) {
    const value = 0.299 * pixels[pixel] + 0.587 * pixels[pixel + 1] + 0.114 * pixels[pixel + 2];
    luminance[index] = value;
    sum += value;
  }
  const average = sum / luminance.length;
  let variance = 0;
  let edgeSum = 0;
  for (let y = 1; y < size - 1; y += 1) {
    for (let x = 1; x < size - 1; x += 1) {
      const index = y * size + x;
      const value = luminance[index];
      variance += (value - average) ** 2;
      edgeSum += Math.abs(value - luminance[index + 1]) + Math.abs(value - luminance[index + size]);
    }
  }
  const contrast = Math.sqrt(variance / luminance.length);
  const edgeStrength = edgeSum / ((size - 2) * (size - 2) * 2);
  let reason = null;
  if (average < 30) reason = 'dark';
  else if (average > 240) reason = 'bright';
  else if (contrast < 12 && edgeStrength < 2.5) reason = 'blurry';
  return { usable: !reason, reason, average, contrast, edgeStrength };
}

/**
 * Mejora imagenes borrosas / oscuras / pequenas antes de inferir.
 * Opera sobre canvas 2D (sin dependencias).
 */
function enhanceForVision(source, size) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  const sw = source.naturalWidth || source.videoWidth || source.width || size;
  const sh = source.naturalHeight || source.videoHeight || source.height || size;
  const scale = Math.max(size / sw, size / sh);
  const dw = Math.round(sw * scale);
  const dh = Math.round(sh * scale);
  const dx = Math.floor((size - dw) / 2);
  const dy = Math.floor((size - dh) / 2);
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, size, size);
  ctx.drawImage(source, dx, dy, dw, dh);

  // Mejora de histograma adaptativo, contraste dinámico (ayuda fotos borrosas y oscuras).
  try {
    const img = ctx.getImageData(0, 0, size, size);
    const d = img.data;

    let totalLuma = 0;
    const totalPixels = d.length / 4;
    for (let i = 0; i < d.length; i += 4) {
      totalLuma += 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    }
    const avgLuma = totalLuma / totalPixels;

    // Contraste y brillo adaptativos segun iluminacion de la toma
    const contrast = avgLuma < 80 ? 1.35 : (avgLuma > 180 ? 1.05 : 1.20);
    const brightness = avgLuma < 80 ? 18 : (avgLuma > 180 ? -10 : 6);

    for (let i = 0; i < d.length; i += 4) {
      d[i] = clampNumber((d[i] - 128) * contrast + 128 + brightness, 0, 255, d[i]);
      d[i + 1] = clampNumber((d[i + 1] - 128) * contrast + 128 + brightness, 0, 255, d[i + 1]);
      d[i + 2] = clampNumber((d[i + 2] - 128) * contrast + 128 + brightness, 0, 255, d[i + 2]);
    }
    ctx.putImageData(img, 0, 0);
  } catch (e) {
    // Safari privado u origen opaco: seguir sin enhance de pixeles.
  }

  return canvas;
}

class FoodClassifier {
  constructor(options = {}) {
    this.food101Session = null;
    this.food101Labels = null;
    this.mobilenet = null;
    this.isLoaded = false;
    this.loadPromise = null;
    this.foodDatabase = options.foodDatabase || null;
    this.confidenceThreshold = options.confidenceThreshold || MODEL_CONFIG.confidenceThreshold;
    this.topK = options.topK || MODEL_CONFIG.topK;
    this._mode = 'dual';
    this.lastImageQuality = null;
    this.lastCandidates = [];
  }

  async load(onProgress) {
    if (this.isLoaded) return true;
    if (this.loadPromise) return this.loadPromise;
    this.loadPromise = this._loadInternal(onProgress);
    try {
      return await this.loadPromise;
    } catch (e) {
      this.loadPromise = null;
      throw e;
    }
  }

  async _loadInternal(onProgress) {
    try {
      onProgress?.(5, 'loadingTransformers');

      if (!this.foodDatabase) {
        await this._loadFoodDatabase();
      }
      onProgress?.(15, 'loadingDatabase');

      // 1) Food-101 ONNX (especialista en platos)
      if (typeof ort === 'undefined') {
        throw new Error('ONNX Runtime no esta cargado (onnxruntime-web).');
      }
      ort.env.wasm.numThreads = 1;
      ort.env.wasm.simd = true;
      if (!ort.env.wasm.wasmPaths) {
        ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.21.0/dist/';
      }

      onProgress?.(25, 'loadingFood101FirstTime');
      await this._loadFood101Labels();
      onProgress?.(40, 'loadingFood101');

      this.food101Session = await ort.InferenceSession.create(MODEL_CONFIG.food101.modelUrl, {
        executionProviders: ['wasm'],
        graphOptimizationLevel: 'all'
      });
      console.log('[FoodClassifier] Food-101 ONNX listo. Inputs:', this.food101Session.inputNames);

      onProgress?.(70, 'loadingFood101');

      // 2) MobileNet ImageNet (frutas / verduras / bebidas) — opcional
      if (typeof mobilenet !== 'undefined') {
        onProgress?.(80, 'loadingTransformers');
        try {
          // URL con CORS habilitado (tfhub.dev redirige a kaggle y falla en browser).
          this.mobilenet = await mobilenet.load({
            version: 2,
            alpha: 1.0,
            modelUrl: 'models/mobilenet/model.json'
          });
          console.log('[FoodClassifier] MobileNet ImageNet listo.');
        } catch (mobileErr) {
          console.warn('[FoodClassifier] MobileNet no disponible (Food-101 sigue activo):', mobileErr.message || mobileErr);
          this.mobilenet = null;
        }
      } else {
        console.warn('[FoodClassifier] Script mobilenet no cargado; solo Food-101.');
      }

      onProgress?.(92, 'loadingFood101');
      await this._warmup();

      this.isLoaded = true;
      onProgress?.(100, 'loadingReady');
      console.log('[FoodClassifier] Dual model listo (Food-101 + ImageNet).');
      return true;
    } catch (error) {
      console.error('[FoodClassifier] Error cargando:', error);
      this.isLoaded = false;
      this.loadPromise = null;
      throw error;
    }
  }

  async _loadFood101Labels() {
    const res = await fetch(MODEL_CONFIG.food101.configUrl);
    if (!res.ok) throw new Error(`No se pudo cargar config Food-101: HTTP ${res.status}`);
    const cfg = await res.json();
    const id2label = cfg.id2label || {};
    const labels = new Array(101);
    for (const [idx, name] of Object.entries(id2label)) {
      labels[Number(idx)] = name;
    }
    this.food101Labels = labels;
    console.log('[FoodClassifier] Food-101 labels:', labels.filter(Boolean).length);
  }

  async _loadFoodDatabase() {
    try {
      const res = await fetch('foods.json');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      this.foodDatabase = await res.json();
    } catch (e) {
      console.error('[FoodClassifier] foods.json fallo:', e);
      this.foodDatabase = {
        pizza: { name: 'Pizza', calories: 266, unit: 'por rebanada', macros: { protein: 11, carbs: 30, fat: 12, sugar: 3, fiber: 2 }, healthStatus: 'unhealthy' }
      };
    }
  }

  async _warmup() {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 224;
      canvas.height = 224;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#888';
      ctx.fillRect(0, 0, 224, 224);
      await this._predictFood101(canvas);
      if (this.mobilenet) {
        await this.mobilenet.classify(canvas, 3);
      }
    } catch (e) {
      console.warn('[FoodClassifier] Warm-up no critico:', e.message);
    }
  }

  async classify(image, options = {}) {
    if (!this.isLoaded) {
      throw new Error('Modelo no cargado. Llama a load() primero.');
    }
    this.lastImageQuality = assessImageQuality(image);
    this.lastCandidates = [];
    if (this.lastImageQuality.reason === 'invalid') {
      console.info('[FoodClassifier] Imagen invalida para analisis.');
      return [];
    }
    if (!this.lastImageQuality.usable) {
      console.info('[FoodClassifier] Imagen dificil; se analizara con umbrales conservadores:', this.lastImageQuality.reason);
    }

    const topK = options.topK || this.topK;
    const t0 = performance.now();
    const size = MODEL_CONFIG.food101.inputSize;

    const enhanced = enhanceForVision(image, size);
    const batches = [{ name: 'full', canvas: enhanced }];

    if (options.multiCrop !== false) {
      for (const crop of this._buildCropBatches(image, options)) {
        batches.push(crop);
      }
    }

    const food101Merged = new Map();
    const imagenetMerged = new Map();

    for (const batch of batches) {
      // Dejar respirar al hilo principal para que la animación de escaneo no se congele
      await new Promise((r) => setTimeout(r, 0));
      const f101 = await this._predictFood101(batch.canvas);
      for (const pred of f101.slice(0, topK * 2)) {
        const cur = food101Merged.get(pred.foodKey) || {
          foodKey: pred.foodKey,
          label: pred.foodKey,
          confidence: 0,
          supportCount: 0,
          regions: new Set(),
          source: 'food101',
          matchType: 'food101'
        };
        cur.confidence = Math.max(cur.confidence, pred.confidence);
        cur.supportCount += 1;
        cur.regions.add(batch.name);
        food101Merged.set(pred.foodKey, cur);
      }

      if (this.mobilenet) {
        const inet = await this._predictImageNet(batch.canvas);
        for (const pred of inet) {
          const cur = imagenetMerged.get(pred.foodKey) || {
            foodKey: pred.foodKey,
            label: pred.foodKey,
            confidence: 0,
            supportCount: 0,
            regions: new Set(),
            source: 'imagenet',
            matchType: 'imagenet'
          };
          cur.confidence = Math.max(cur.confidence, pred.confidence);
          cur.supportCount += 1;
          cur.regions.add(batch.name);
          imagenetMerged.set(pred.foodKey, cur);
        }
      }
    }

    const qualityThreshold = this.lastImageQuality.usable
      ? this.confidenceThreshold
      : Math.max(0.20, this.confidenceThreshold * 0.72);
    const results = this._mergeEngines(food101Merged, imagenetMerged, topK, {
      confidenceThreshold: qualityThreshold,
      allowLowQualityFallback: !this.lastImageQuality.usable
    });
    this.lastCandidates = results;
    console.log(`[FoodClassifier] Inferencia dual en ${(performance.now() - t0).toFixed(1)}ms ->`, results.map((r) => `${r.foodKey}:${(r.confidence * 100).toFixed(1)}%`));
    // Una foto no permite contar todos los componentes de un plato con fiabilidad.
    // Solo se calcula la opción principal; las demás se muestran para confirmación manual.
    return results.slice(0, 1);
  }

  _mergeEngines(food101Map, imagenetMap, topK, options = {}) {
    const merged = new Map();
    const threshold = options.confidenceThreshold || this.confidenceThreshold;

    const add = (item, weight = 1) => {
      if (!item || item.confidence < threshold) return;
      const boosted = Math.min(0.99, item.confidence * weight);
      const existing = merged.get(item.foodKey);
      if (!existing || boosted > existing.confidence) {
        merged.set(item.foodKey, {
          foodKey: item.foodKey,
          label: item.label || item.foodKey,
          confidence: boosted,
          supportCount: item.supportCount || 1,
          regions: item.regions instanceof Set ? Array.from(item.regions) : (item.regions || []),
          source: item.source,
          matchType: item.matchType
        });
      } else {
        existing.supportCount = Math.max(existing.supportCount, item.supportCount || 1);
      }
    };

    const fruitDrinkKeys = new Set([
      'apple', 'banana', 'orange', 'lemon', 'strawberry', 'pineapple', 'fig',
      'pomegranate', 'jackfruit', 'broccoli', 'cauliflower', 'cucumber',
      'bell_pepper', 'mushroom', 'cabbage', 'zucchini', 'squash', 'artichoke',
      'coffee', 'tea', 'wine', 'beer', 'soda', 'water', 'eggnog', 'mashed_potato',
      'bagel', 'pretzel', 'bread', 'meat_loaf', 'potpie', 'avocado', 'guacamole'
    ]);

    // Food-101 es la fuente primaria para platos.
    const food101Sorted = Array.from(food101Map.values())
      .sort((a, b) => b.confidence - a.confidence);

    if (food101Sorted.length) {
      const best = food101Sorted[0];
      const runnerUp = food101Sorted[1];
      const margin = best.confidence - (runnerUp?.confidence || 0);
      const supportBoost = 1 + Math.min(0.2, ((best.supportCount || 1) - 1) * 0.05);
      const supported = (best.supportCount || 1) >= 3;
      if (best.confidence >= threshold && (margin >= MODEL_CONFIG.food101.minimumMargin || supported)) {
        add(best, supportBoost);
      }

      // Solo agregar un 2do plato si esta MUY cerca del primero
      // (evita pizza+lasagna sumando calorias de dos platos).
      if (food101Sorted.length > 1) {
        const second = food101Sorted[1];
        const gap = best.confidence - second.confidence;
        if (second.confidence >= 0.35 && gap < 0.08) {
          add(second, 1);
        }
      }
    }

    // ImageNet aporta frutas / verduras / bebidas (y refuerza si coincide).
    for (const item of imagenetMap.values()) {
      if (merged.has(item.foodKey)) {
        const existing = merged.get(item.foodKey);
        existing.confidence = Math.min(0.99, existing.confidence + item.confidence * 0.15);
        existing.supportCount += item.supportCount || 1;
        continue;
      }
      const fruitDrinkThreshold = Math.max(0.22, threshold * 0.85);
      if ((fruitDrinkKeys.has(item.foodKey) && item.confidence >= fruitDrinkThreshold) || item.confidence >= 0.55) {
        add(item, 1);
      }
    }

    if (!merged.size && options.allowLowQualityFallback && food101Sorted.length) {
      const fallback = food101Sorted[0];
      const fallbackThreshold = Math.max(0.18, threshold * 0.8);
      if (fallback.confidence >= fallbackThreshold && (fallback.supportCount || 0) >= 2) {
        add(fallback, 0.85);
      }
    }

    return Array.from(merged.values())
      .sort((a, b) => {
        const supportDelta = (b.supportCount || 0) - (a.supportCount || 0);
        if (Math.abs(supportDelta) > 1) return supportDelta;
        return (b.confidence || 0) - (a.confidence || 0);
      })
      .slice(0, topK);
  }

  async _predictFood101(canvas) {
    const size = MODEL_CONFIG.food101.inputSize;
    const mean = MODEL_CONFIG.food101.mean;
    const std = MODEL_CONFIG.food101.std;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const { data } = ctx.getImageData(0, 0, size, size);

    // NCHW float32 normalizado ImageNet
    const floatData = new Float32Array(3 * size * size);
    const plane = size * size;
    for (let i = 0, p = 0; i < data.length; i += 4, p++) {
      const r = data[i] / 255;
      const g = data[i + 1] / 255;
      const b = data[i + 2] / 255;
      floatData[p] = (r - mean[0]) / std[0];
      floatData[p + plane] = (g - mean[1]) / std[1];
      floatData[p + 2 * plane] = (b - mean[2]) / std[2];
    }

    const tensor = new ort.Tensor('float32', floatData, [1, 3, size, size]);
    const feeds = {};
    feeds[this.food101Session.inputNames[0]] = tensor;
    const output = await this.food101Session.run(feeds);
    const logits = output[this.food101Session.outputNames[0]].data;
    const probs = softmax(logits);

    const indexed = probs.map((score, index) => ({ score, index }));
    indexed.sort((a, b) => b.score - a.score);

    return indexed.slice(0, 10).map(({ score, index }) => ({
      foodKey: this.food101Labels[index] || `class_${index}`,
      confidence: score,
      source: 'food101'
    })).filter((p) => p.confidence >= MODEL_CONFIG.food101.confidenceThreshold * 0.5);
  }

  async _predictImageNet(canvas) {
    if (!this.mobilenet) return [];
    const raw = await this.mobilenet.classify(canvas, MODEL_CONFIG.imagenet.topK);
    const out = [];

    for (const pred of raw) {
      const className = normalizeClassName(pred.className.split(',')[0]);
      if (IMAGENET_BLOCKLIST.has(className)) continue;

      let foodKey = IMAGENET_TO_FOODS[className];
      if (foodKey === null) continue;
      if (!foodKey) {
        foodKey = this._partialMatch(className);
      }
      if (!foodKey) continue;
      if (pred.probability < MODEL_CONFIG.imagenet.confidenceThreshold) continue;

      out.push({
        foodKey,
        confidence: pred.probability,
        source: 'imagenet',
        className
      });
    }
    return out;
  }

  _partialMatch(lower) {
    if (!this.foodDatabase) return null;
    if (this.foodDatabase[lower]) return lower;
    for (const key of Object.keys(this.foodDatabase)) {
      if (key.length >= 5 && (lower.includes(key) || key.includes(lower))) return key;
    }
    return null;
  }

  _buildCropBatches(image, options = {}) {
    const width = image.naturalWidth || image.videoWidth || image.width || 0;
    const height = image.naturalHeight || image.videoHeight || image.height || 0;
    if (!width || !height) return [];

    const cropScale = clampNumber(options.cropScale, 0.55, 0.9, 0.75);
    const cropW = Math.round(width * cropScale);
    const cropH = Math.round(height * cropScale);
    const centerX = Math.max(0, Math.round((width - cropW) / 2));
    const centerY = Math.max(0, Math.round((height - cropH) / 2));
    const size = MODEL_CONFIG.food101.inputSize;

    const regions = [
      { name: 'center', x: centerX, y: centerY, w: cropW, h: cropH },
      { name: 'top_left', x: 0, y: 0, w: cropW, h: cropH },
      { name: 'bottom_right', x: Math.max(0, width - cropW), y: Math.max(0, height - cropH), w: cropW, h: cropH }
    ];

    return regions.map((region) => {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(image, region.x, region.y, region.w, region.h, 0, 0, size, size);
      return { name: region.name, canvas };
    });
  }

  getFoodInfo(foodKey) {
    return (this.foodDatabase && this.foodDatabase[foodKey]) || null;
  }

  getLastCandidates() {
    return this.lastCandidates.slice();
  }

  ready() {
    return this.isLoaded;
  }

  dispose() {
    this.food101Session = null;
    this.mobilenet = null;
    this.isLoaded = false;
    this.loadPromise = null;
  }
}

window.FoodClassifier = FoodClassifier;
window.MODEL_CONFIG = MODEL_CONFIG;
console.log('[FoodClassifier] Modulo dual Food-101 + MobileNet cargado.');
