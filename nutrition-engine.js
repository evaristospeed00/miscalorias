(function (global) {
  const STORAGE_KEY = 'calorie-ai-nutrition-cache-v1';

  const BASE_ALIASES = {
    taco_carne_asada: ['taco de carne asada', 'tacos de carne asada', 'taco asada', 'taco de asada', 'tacos de asada', 'taco de bistec', 'carne asada taco', 'carne asada tacos'],
    taco_pollo: ['taco de pollo', 'tacos de pollo'],
    burrito: ['burrito', 'burrito de carne', 'burrito de pollo', 'wrap', 'quesadilla burrito'],
    hamburger: ['hamburger', 'hamburguesa', 'cheeseburger', 'burger'],
    pizza: ['pizza', 'pizzas', 'pepperoni pizza', 'cheese pizza', 'pizza slice'],
    sushi: ['sushi', 'sushi roll', 'roll de sushi', 'maki', 'uramaki'],
    ramen: ['ramen', 'noodles soup', 'fideos ramen'],
    pasta: ['pasta', 'spaghetti', 'macarrones', 'noodles', 'fideos'],
    arroz: ['arroz', 'rice', 'fried rice', 'arroz frito'],
    pollo: ['pollo', 'chicken', 'pechuga de pollo', 'pollo asado', 'grilled chicken'],
    carne_asada: ['carne asada', 'steak', 'bistec', 'beef steak'],
    pescado: ['pescado', 'fish', 'salmon', 'atun', 'tuna', 'tilapia'],
    huevos: ['huevos', 'egg', 'eggs', 'omelette', 'omelet'],
    sopa: ['sopa', 'soup', 'broth', 'caldo'],
    ensalada: ['ensalada', 'salad', 'caesar salad', 'greek salad'],
    fruta: ['fruta', 'fruit', 'apple', 'banana', 'orange', 'strawberries', 'grapes'],
    verdura: ['verdura', 'vegetable', 'vegetables', 'broccoli', 'carrot', 'lettuce'],
    postre: ['postre', 'dessert', 'cake', 'pie', 'donut', 'ice cream'],
    pan: ['pan', 'bread', 'bagel', 'croissant', 'toast'],
    cereal: ['cereal', 'breakfast cereal', 'oats', 'granola'],
    coca_cola_original: ['coca cola', 'coca-cola', 'coke', 'coca cola original', 'coca cola 600 ml'],
    pepsi_original: ['pepsi', 'pepsi original'],
    sprite_original: ['sprite', 'sprite original'],
    fanta_original: ['fanta', 'fanta original'],
    red_bull_original: ['red bull', 'redbull', 'red bull original'],
    monster_original: ['monster', 'monster energy'],
    bebida_deportiva: ['sports drink', 'bebida deportiva', 'gatorade', 'powerade'],
    jugo: ['juice', 'jugo', 'orange juice', 'apple juice'],
    smoothie: ['smoothie', 'licuado', 'batido'],
    cafe: ['coffee', 'cafe', 'cafe negro', 'espresso'],
    latte: ['latte', 'cafe latte', 'caffe latte'],
    cappuccino: ['cappuccino', 'capuchino'],
    te: ['tea', 'te', 'green tea', 'black tea'],
    leche: ['milk', 'leche'],
    chocolate_caliente: ['hot chocolate', 'chocolate caliente', 'cocoa'],
    agua_fresca: ['agua fresca', 'agua de jamaica', 'agua de horchata'],
    agua_mineral: ['agua mineral', 'sparkling water', 'water', 'agua'],
    refresco_de_cola: ['refresco de cola', 'cola', 'soda', 'soft drink'],
    cerveza: ['beer', 'cerveza'],
    vino: ['wine', 'vino'],
  };

  const DEFAULT_RECORDS = {
    taco_carne_asada: {
      canonical_id: 'taco_carne_asada',
      type: 'food',
      name: 'Taco de carne asada',
      source_id: 'tacos',
      default_quantity: 1,
      portion: { kind: 'item', unit_label: 'taco', estimated_weight_g: 120 },
      nutrition: { calories: 210, protein: 10, carbs: 18, fat: 10, sugar: 1, fiber: 2 },
      healthStatus: 'moderate'
    },
    taco_pollo: {
      canonical_id: 'taco_pollo',
      type: 'food',
      name: 'Taco de pollo',
      source_id: 'tacos',
      default_quantity: 1,
      portion: { kind: 'item', unit_label: 'taco', estimated_weight_g: 110 },
      nutrition: { calories: 190, protein: 11, carbs: 18, fat: 8, sugar: 1, fiber: 2 },
      healthStatus: 'moderate'
    },
    burrito: {
      canonical_id: 'burrito',
      type: 'food',
      name: 'Burrito',
      source_id: 'breakfast_burrito',
      default_quantity: 1,
      portion: { kind: 'item', unit_label: 'burrito', estimated_weight_g: 260 },
      nutrition: { calories: 350, protein: 16, carbs: 32, fat: 18, sugar: 2, fiber: 4 },
      healthStatus: 'moderate'
    },
    hamburger: {
      canonical_id: 'hamburger',
      type: 'food',
      name: 'Hamburguesa',
      source_id: 'hamburger',
      default_quantity: 1,
      portion: { kind: 'item', unit_label: 'hamburguesa', estimated_weight_g: 180 },
      nutrition: { calories: 295, protein: 15, carbs: 28, fat: 15, sugar: 4, fiber: 1 },
      healthStatus: 'unhealthy'
    },
    pizza: {
      canonical_id: 'pizza',
      type: 'food',
      name: 'Pizza',
      source_id: 'pizza',
      default_quantity: 1,
      portion: { kind: 'slice', unit_label: 'rebanada', estimated_weight_g: 120 },
      nutrition: { calories: 266, protein: 11, carbs: 30, fat: 12, sugar: 3, fiber: 2 },
      healthStatus: 'unhealthy'
    },
    sushi: {
      canonical_id: 'sushi',
      type: 'food',
      name: 'Sushi',
      source_id: 'sushi',
      default_quantity: 1,
      portion: { kind: 'roll', unit_label: 'roll', estimated_weight_g: 180, pieces_per_unit: 6 },
      nutrition: { calories: 150, protein: 7, carbs: 22, fat: 4, sugar: 4, fiber: 1 },
      healthStatus: 'moderate'
    },
    ramen: {
      canonical_id: 'ramen',
      type: 'food',
      name: 'Ramen',
      source_id: 'ramen',
      default_quantity: 1,
      portion: { kind: 'bowl', unit_label: 'tazon', estimated_weight_g: 450 },
      nutrition: { calories: 436, protein: 18, carbs: 55, fat: 16, sugar: 4, fiber: 2 },
      healthStatus: 'moderate'
    },
    pasta: {
      canonical_id: 'pasta',
      type: 'food',
      name: 'Pasta',
      source_id: 'pasta',
      default_quantity: 1,
      portion: { kind: '100g', unit_label: '100g', estimated_weight_g: 100 },
      nutrition: { calories: 131, protein: 5, carbs: 25, fat: 1, sugar: 1, fiber: 1 },
      healthStatus: 'moderate'
    },
    arroz: {
      canonical_id: 'arroz',
      type: 'food',
      name: 'Arroz',
      source_id: 'rice',
      default_quantity: 1,
      portion: { kind: '100g', unit_label: '100g', estimated_weight_g: 100 },
      nutrition: { calories: 130, protein: 2, carbs: 28, fat: 0, sugar: 0, fiber: 0 },
      healthStatus: 'moderate'
    },
    pollo: {
      canonical_id: 'pollo',
      type: 'food',
      name: 'Pollo',
      source_id: 'chicken_breast',
      default_quantity: 1,
      portion: { kind: '100g', unit_label: '100g', estimated_weight_g: 100 },
      nutrition: { calories: 165, protein: 31, carbs: 0, fat: 4, sugar: 0, fiber: 0 },
      healthStatus: 'healthy'
    },
    carne_asada: {
      canonical_id: 'carne_asada',
      type: 'food',
      name: 'Carne asada',
      source_id: 'steak',
      default_quantity: 1,
      portion: { kind: '100g', unit_label: '100g', estimated_weight_g: 100 },
      nutrition: { calories: 271, protein: 26, carbs: 0, fat: 18, sugar: 0, fiber: 0 },
      healthStatus: 'moderate'
    },
    pescado: {
      canonical_id: 'pescado',
      type: 'food',
      name: 'Pescado',
      source_id: 'fish_and_chips',
      default_quantity: 1,
      portion: { kind: '100g', unit_label: '100g', estimated_weight_g: 100 },
      nutrition: { calories: 132, protein: 20, carbs: 0, fat: 5, sugar: 0, fiber: 0 },
      healthStatus: 'healthy'
    },
    huevos: {
      canonical_id: 'huevos',
      type: 'food',
      name: 'Huevos',
      source_id: 'eggs',
      default_quantity: 1,
      portion: { kind: 'serving', unit_label: '2 huevos', estimated_weight_g: 100, servings_per_unit: 1 },
      nutrition: { calories: 155, protein: 13, carbs: 1, fat: 11, sugar: 0, fiber: 0 },
      healthStatus: 'healthy'
    },
    sopa: {
      canonical_id: 'sopa',
      type: 'food',
      name: 'Sopa',
      source_id: 'miso_soup',
      default_quantity: 1,
      portion: { kind: 'bowl', unit_label: 'tazon', estimated_weight_g: 300 },
      nutrition: { calories: 120, protein: 4, carbs: 12, fat: 4, sugar: 2, fiber: 1 },
      healthStatus: 'moderate'
    },
    ensalada: {
      canonical_id: 'ensalada',
      type: 'food',
      name: 'Ensalada',
      source_id: 'greek_salad',
      default_quantity: 1,
      portion: { kind: 'plate', unit_label: 'plato', estimated_weight_g: 180 },
      nutrition: { calories: 130, protein: 4, carbs: 8, fat: 10, sugar: 4, fiber: 3 },
      healthStatus: 'healthy'
    },
    fruta: {
      canonical_id: 'fruta',
      type: 'food',
      name: 'Fruta',
      source_id: 'fruit',
      default_quantity: 1,
      portion: { kind: '100g', unit_label: '100g', estimated_weight_g: 100 },
      nutrition: { calories: 60, protein: 1, carbs: 15, fat: 0, sugar: 12, fiber: 2 },
      healthStatus: 'healthy'
    },
    verdura: {
      canonical_id: 'verdura',
      type: 'food',
      name: 'Verdura',
      source_id: 'vegetable',
      default_quantity: 1,
      portion: { kind: '100g', unit_label: '100g', estimated_weight_g: 100 },
      nutrition: { calories: 35, protein: 2, carbs: 7, fat: 0, sugar: 3, fiber: 3 },
      healthStatus: 'healthy'
    },
    postre: {
      canonical_id: 'postre',
      type: 'food',
      name: 'Postre',
      source_id: 'dessert',
      default_quantity: 1,
      portion: { kind: 'serving', unit_label: 'porcion', estimated_weight_g: 120 },
      nutrition: { calories: 280, protein: 4, carbs: 36, fat: 12, sugar: 24, fiber: 1 },
      healthStatus: 'unhealthy'
    },
    pan: {
      canonical_id: 'pan',
      type: 'food',
      name: 'Pan',
      source_id: 'bread',
      default_quantity: 1,
      portion: { kind: '100g', unit_label: '100g', estimated_weight_g: 100 },
      nutrition: { calories: 265, protein: 9, carbs: 49, fat: 3, sugar: 5, fiber: 2 },
      healthStatus: 'moderate'
    },
    cereal: {
      canonical_id: 'cereal',
      type: 'food',
      name: 'Cereal',
      source_id: 'cereal',
      default_quantity: 1,
      portion: { kind: 'bowl', unit_label: 'tazon', estimated_weight_g: 40 },
      nutrition: { calories: 150, protein: 3, carbs: 30, fat: 1.5, sugar: 9, fiber: 3 },
      healthStatus: 'moderate'
    },
    coca_cola_original: {
      canonical_id: 'coca_cola_original',
      type: 'beverage',
      name: 'Coca-Cola Original',
      source_id: 'coca_cola_original',
      default_quantity: 1,
      portion: { kind: 'ml', unit_label: 'ml', estimated_volume_ml: 355 },
      nutrition: { calories: 42, protein: 0, carbs: 10.6, fat: 0, sugar: 10.6, fiber: 0 },
      healthStatus: 'unhealthy',
      brand: 'Coca-Cola'
    },
    pepsi_original: {
      canonical_id: 'pepsi_original',
      type: 'beverage',
      name: 'Pepsi Original',
      source_id: 'pepsi_original',
      default_quantity: 1,
      portion: { kind: 'ml', unit_label: 'ml', estimated_volume_ml: 355 },
      nutrition: { calories: 41, protein: 0, carbs: 10.9, fat: 0, sugar: 10.9, fiber: 0 },
      healthStatus: 'unhealthy',
      brand: 'Pepsi'
    },
    sprite_original: {
      canonical_id: 'sprite_original',
      type: 'beverage',
      name: 'Sprite Original',
      source_id: 'sprite_original',
      default_quantity: 1,
      portion: { kind: 'ml', unit_label: 'ml', estimated_volume_ml: 355 },
      nutrition: { calories: 38, protein: 0, carbs: 9.6, fat: 0, sugar: 9.6, fiber: 0 },
      healthStatus: 'unhealthy',
      brand: 'Sprite'
    },
    fanta_original: {
      canonical_id: 'fanta_original',
      type: 'beverage',
      name: 'Fanta Original',
      source_id: 'fanta_original',
      default_quantity: 1,
      portion: { kind: 'ml', unit_label: 'ml', estimated_volume_ml: 355 },
      nutrition: { calories: 40, protein: 0, carbs: 10.1, fat: 0, sugar: 10.1, fiber: 0 },
      healthStatus: 'unhealthy',
      brand: 'Fanta'
    },
    red_bull_original: {
      canonical_id: 'red_bull_original',
      type: 'beverage',
      name: 'Red Bull Original',
      source_id: 'red_bull_original',
      default_quantity: 1,
      portion: { kind: 'ml', unit_label: 'ml', estimated_volume_ml: 250 },
      nutrition: { calories: 45, protein: 0, carbs: 11, fat: 0, sugar: 11, fiber: 0 },
      healthStatus: 'unhealthy',
      brand: 'Red Bull'
    },
    monster_original: {
      canonical_id: 'monster_original',
      type: 'beverage',
      name: 'Monster Energy',
      source_id: 'monster_original',
      default_quantity: 1,
      portion: { kind: 'ml', unit_label: 'ml', estimated_volume_ml: 473 },
      nutrition: { calories: 45, protein: 0, carbs: 11, fat: 0, sugar: 11, fiber: 0 },
      healthStatus: 'unhealthy',
      brand: 'Monster'
    },
    bebida_deportiva: {
      canonical_id: 'bebida_deportiva',
      type: 'beverage',
      name: 'Bebida deportiva',
      source_id: 'sports_drink',
      default_quantity: 1,
      portion: { kind: 'ml', unit_label: 'ml', estimated_volume_ml: 500 },
      nutrition: { calories: 24, protein: 0, carbs: 6, fat: 0, sugar: 6, fiber: 0 },
      healthStatus: 'moderate'
    },
    jugo: {
      canonical_id: 'jugo',
      type: 'beverage',
      name: 'Jugo',
      source_id: 'juice',
      default_quantity: 1,
      portion: { kind: 'ml', unit_label: 'ml', estimated_volume_ml: 240 },
      nutrition: { calories: 45, protein: 0.5, carbs: 11, fat: 0, sugar: 10, fiber: 0.2 },
      healthStatus: 'moderate'
    },
    smoothie: {
      canonical_id: 'smoothie',
      type: 'beverage',
      name: 'Smoothie',
      source_id: 'smoothie',
      default_quantity: 1,
      portion: { kind: 'ml', unit_label: 'ml', estimated_volume_ml: 350 },
      nutrition: { calories: 65, protein: 1.5, carbs: 14, fat: 1.5, sugar: 12, fiber: 1.5 },
      healthStatus: 'moderate'
    },
    cafe: {
      canonical_id: 'cafe',
      type: 'beverage',
      name: 'Cafe',
      source_id: 'coffee',
      default_quantity: 1,
      portion: { kind: 'cup', unit_label: 'taza', estimated_volume_ml: 240 },
      nutrition: { calories: 2, protein: 0, carbs: 0, fat: 0, sugar: 0, fiber: 0 },
      healthStatus: 'healthy'
    },
    latte: {
      canonical_id: 'latte',
      type: 'beverage',
      name: 'Latte',
      source_id: 'latte',
      default_quantity: 1,
      portion: { kind: 'cup', unit_label: 'taza', estimated_volume_ml: 350 },
      nutrition: { calories: 120, protein: 6, carbs: 12, fat: 5, sugar: 11, fiber: 0 },
      healthStatus: 'moderate'
    },
    cappuccino: {
      canonical_id: 'cappuccino',
      type: 'beverage',
      name: 'Cappuccino',
      source_id: 'cappuccino',
      default_quantity: 1,
      portion: { kind: 'cup', unit_label: 'taza', estimated_volume_ml: 180 },
      nutrition: { calories: 80, protein: 5, carbs: 7, fat: 3, sugar: 6, fiber: 0 },
      healthStatus: 'moderate'
    },
    te: {
      canonical_id: 'te',
      type: 'beverage',
      name: 'Te',
      source_id: 'tea',
      default_quantity: 1,
      portion: { kind: 'cup', unit_label: 'taza', estimated_volume_ml: 240 },
      nutrition: { calories: 1, protein: 0, carbs: 0, fat: 0, sugar: 0, fiber: 0 },
      healthStatus: 'healthy'
    },
    leche: {
      canonical_id: 'leche',
      type: 'beverage',
      name: 'Leche',
      source_id: 'milk',
      default_quantity: 1,
      portion: { kind: 'ml', unit_label: 'ml', estimated_volume_ml: 240 },
      nutrition: { calories: 150, protein: 8, carbs: 12, fat: 8, sugar: 12, fiber: 0 },
      healthStatus: 'moderate'
    },
    chocolate_caliente: {
      canonical_id: 'chocolate_caliente',
      type: 'beverage',
      name: 'Chocolate caliente',
      source_id: 'hot_chocolate',
      default_quantity: 1,
      portion: { kind: 'cup', unit_label: 'taza', estimated_volume_ml: 240 },
      nutrition: { calories: 190, protein: 5, carbs: 28, fat: 7, sugar: 22, fiber: 2 },
      healthStatus: 'unhealthy'
    },
    agua_fresca: {
      canonical_id: 'agua_fresca',
      type: 'beverage',
      name: 'Agua fresca',
      source_id: 'agua_fresca',
      default_quantity: 1,
      portion: { kind: 'ml', unit_label: 'ml', estimated_volume_ml: 500 },
      nutrition: { calories: 35, protein: 0, carbs: 9, fat: 0, sugar: 8, fiber: 0 },
      healthStatus: 'moderate'
    },
    agua_mineral: {
      canonical_id: 'agua_mineral',
      type: 'beverage',
      name: 'Agua mineral',
      source_id: 'water',
      default_quantity: 1,
      portion: { kind: 'bottle', unit_label: 'ml', estimated_volume_ml: 600 },
      nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0, sugar: 0, fiber: 0 },
      healthStatus: 'healthy'
    },
    refresco_de_cola: {
      canonical_id: 'refresco_de_cola',
      type: 'beverage',
      name: 'Refresco de cola',
      source_id: 'soda',
      default_quantity: 1,
      portion: { kind: 'can', unit_label: 'ml', estimated_volume_ml: 355 },
      nutrition: { calories: 140, protein: 0, carbs: 39, fat: 0, sugar: 39, fiber: 0 },
      healthStatus: 'unhealthy'
    },
    cerveza: {
      canonical_id: 'cerveza',
      type: 'beverage',
      name: 'Cerveza',
      source_id: 'beer',
      default_quantity: 1,
      portion: { kind: 'can', unit_label: 'ml', estimated_volume_ml: 355 },
      nutrition: { calories: 150, protein: 1, carbs: 13, fat: 0, sugar: 0, fiber: 0 },
      healthStatus: 'unhealthy'
    },
    vino: {
      canonical_id: 'vino',
      type: 'beverage',
      name: 'Vino',
      source_id: 'wine',
      default_quantity: 1,
      portion: { kind: 'glass', unit_label: 'ml', estimated_volume_ml: 150 },
      nutrition: { calories: 125, protein: 0, carbs: 4, fat: 0, sugar: 1, fiber: 0 },
      healthStatus: 'moderate'
    }
  };

  function normalizeText(value) {
    return String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/&/g, ' and ')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  }

  function compactText(value) {
    return normalizeText(value).replace(/\s+/g, '_');
  }

  function parseNumber(value) {
    const n = Number.parseFloat(String(value || '').replace(',', '.'));
    return Number.isFinite(n) ? n : null;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  class NutritionEngine {
    constructor(options = {}) {
      this.foodsData = options.foodsData || {};
      this.allowRemoteLookup = options.allowRemoteLookup === true;
      this.cache = this._loadCache();
      this.aliasToCanonical = this._buildAliasMap();
      this.records = this._buildRecords();
    }

    _loadCache() {
      try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      } catch {
        return {};
      }
    }

    _saveCache() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.cache));
      } catch {}
    }

    _buildAliasMap() {
      const map = new Map();

      const addAlias = (alias, canonicalId, { overwrite = true } = {}) => {
        if (!alias) return;
        const n = normalizeText(alias);
        const c = compactText(alias);
        if (overwrite || !map.has(n)) map.set(n, canonicalId);
        if (overwrite || !map.has(c)) map.set(c, canonicalId);
      };

      // Aliases genericos primero
      for (const [canonicalId, aliases] of Object.entries(BASE_ALIASES)) {
        addAlias(canonicalId, canonicalId);
        for (const alias of aliases) addAlias(alias, canonicalId);
      }

      for (const [canonicalId, record] of Object.entries(DEFAULT_RECORDS)) {
        addAlias(canonicalId, canonicalId);
        addAlias(record.name, canonicalId);
        // source_id NO debe pisar claves reales de foods.json (ej: breakfast_burrito)
        if (record.source_id) addAlias(record.source_id, canonicalId, { overwrite: false });
      }

      // foods.json gana siempre (claves Food-101 exactas)
      for (const [key, value] of Object.entries(this.foodsData || {})) {
        addAlias(key, key, { overwrite: true });
        if (value && value.name) addAlias(value.name, key, { overwrite: true });
      }

      return map;
    }

    _buildRecords() {
      const records = {};

      for (const [key, value] of Object.entries(this.foodsData || {})) {
        const normalized = compactText(key);
        records[key] = {
          canonical_id: key,
          type: this._inferTypeFromKey(key, value),
          name: value?.name || this._humanizeKey(key),
          source_id: key,
          default_quantity: 1,
          portion: this._inferPortion(value?.unit, value),
          nutrition: this._normalizeNutrition(value),
          healthStatus: value?.healthStatus || 'moderate',
          suggestion: value?.suggestion || ''
        };

        if (normalized !== key) {
          records[normalized] = records[key];
        }
      }

      for (const [canonicalId, record] of Object.entries(DEFAULT_RECORDS)) {
        const source = record.source_id && records[record.source_id] ? records[record.source_id] : null;
        const merged = {
          ...record,
          nutrition: record.nutrition || source?.nutrition || this._emptyNutrition(),
          healthStatus: record.healthStatus || source?.healthStatus || 'moderate',
          suggestion: record.suggestion || source?.suggestion || ''
        };
        records[canonicalId] = merged;
        records[compactText(canonicalId)] = merged;
      }

      return records;
    }

    _inferTypeFromKey(key, value) {
      const normalized = normalizeText(key + ' ' + (value?.name || ''));
      if (/(water|juice|smoothie|coffee|tea|milk|beer|wine|soda|cola|latte|cappuccino|bebida|drink|beverage|agua|vino|cerveza|refresco)/.test(normalized)) {
        return 'beverage';
      }
      return 'food';
    }

    _inferPortion(unit, value) {
      const label = normalizeText(unit || '');
      const calories = parseNumber(value?.calories);
      const result = {
        kind: 'serving',
        unit_label: unit || 'porcion',
        estimated_weight_g: null,
        estimated_volume_ml: null,
        serving_base: 1
      };

      if (/100g/.test(label)) {
        result.kind = '100g';
        result.estimated_weight_g = 100;
        result.serving_base = 100;
        return result;
      }

      if (/100ml/.test(label)) {
        result.kind = '100ml';
        result.estimated_volume_ml = 100;
        result.serving_base = 100;
        return result;
      }

      const perMl = label.match(/(\d+)\s*ml/);
      const perG = label.match(/(\d+)\s*g/);
      const perPiece = label.match(/(\d+)\s*(?:piece|pieza|piezas|unidad|unidades|rebanada|rebanadas|taco|tacos|roll|rolls|bowl|tazon|tazones|plato|platos)/);

      if (perMl) {
        result.kind = 'ml';
        result.estimated_volume_ml = parseInt(perMl[1], 10);
        result.serving_base = result.estimated_volume_ml;
        return result;
      }

      if (perG) {
        result.kind = 'g';
        result.estimated_weight_g = parseInt(perG[1], 10);
        result.serving_base = result.estimated_weight_g;
        return result;
      }

      if (perPiece) {
        result.kind = 'item';
        result.serving_base = parseInt(perPiece[1], 10);
        return result;
      }

      if (calories !== null && calories < 20) {
        result.kind = 'cup';
        result.estimated_volume_ml = 240;
      }

      return result;
    }

    _normalizeNutrition(value) {
      if (!value) return this._emptyNutrition();
      const macros = value.macros || {};
      return {
        calories: parseNumber(value.calories) || 0,
        protein: parseNumber(macros.protein) || 0,
        carbs: parseNumber(macros.carbs) || 0,
        fat: parseNumber(macros.fat) || 0,
        sugar: parseNumber(macros.sugar) || 0,
        fiber: parseNumber(macros.fiber) || 0
      };
    }

    _emptyNutrition() {
      return { calories: 0, protein: 0, carbs: 0, fat: 0, sugar: 0, fiber: 0 };
    }

    _humanizeKey(key) {
      return String(key || '')
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (m) => m.toUpperCase());
    }

    normalizeLabel(label) {
      const normalized = normalizeText(label);
      const compact = compactText(label);
      return this.aliasToCanonical.get(normalized) || this.aliasToCanonical.get(compact) || compact;
    }

    inferType(canonicalId) {
      const record = this.records[canonicalId] || DEFAULT_RECORDS[canonicalId];
      if (record?.type) return record.type;
      if (/(water|juice|smoothie|coffee|tea|milk|beer|wine|soda|cola|latte|cappuccino|agua|refresco|cerveza|vino)/.test(normalizeText(canonicalId))) {
        return 'beverage';
      }
      return 'food';
    }

    getRecord(canonicalId) {
      return this.records[canonicalId] || null;
    }

    async analyzeVisionPredictions(predictions = [], options = {}) {
      const detectedItems = this.detectItems(predictions, options);
      const enriched = [];

      for (const item of detectedItems) {
        enriched.push(await this.resolveItem(item, options));
      }

      const totals = this.calculateTotals(enriched);
      const healthScore = this.calculateHealthScore(enriched, totals);
      const lang = options.language || 'es';
      const recommendations = this.buildRecommendations(enriched, totals, healthScore, lang);
      const analysis = this.buildAnalysis(enriched, totals, healthScore, lang);

      return {
        items: enriched,
        totals,
        healthScore,
        analysis,
        recommendations
      };
    }

    detectItems(predictions = [], options = {}) {
      const grouped = new Map();
      const threshold = options.confidenceThreshold ?? 0.12;

      for (const pred of predictions) {
        const rawLabel = pred.canonicalId || pred.foodKey || pred.label || pred.className || '';
        const canonicalId = this.normalizeLabel(rawLabel);
        const confidence = Number(pred.confidence ?? pred.score ?? 0);
        if (confidence < threshold) continue;

        const support = pred.supportCount || 1;
        const current = grouped.get(canonicalId) || {
          canonical_id: canonicalId,
          raw_labels: [],
          confidences: [],
          support_count: 0,
          best_prediction: null
        };

        current.raw_labels.push(rawLabel);
        current.confidences.push(confidence);
        current.support_count += support;

        if (!current.best_prediction || confidence > current.best_prediction.confidence) {
          current.best_prediction = {
            ...pred,
            confidence,
            canonicalId
          };
        }

        grouped.set(canonicalId, current);
      }

      return Array.from(grouped.values())
        .map((group) => {
          const best = group.best_prediction || {};
          const confidence = this._combineConfidence(group.confidences, group.support_count);
          return {
            type: this.inferType(group.canonical_id),
            canonical_id: group.canonical_id,
            name: best.label || this._humanizeKey(group.canonical_id),
            quantity: this._estimateQuantity(group.canonical_id, group),
            estimated_weight_g: null,
            estimated_volume_ml: null,
            confidence,
            support_count: group.support_count,
            raw_labels: group.raw_labels,
            best_prediction: best
          };
        })
        .sort((a, b) => b.confidence - a.confidence);
    }

    _combineConfidence(confidences = [], supportCount = 1) {
      if (!confidences.length) return 0;
      const best = Math.max(...confidences);
      const avg = confidences.reduce((sum, v) => sum + v, 0) / confidences.length;
      const supportBoost = clamp(1 + (supportCount - 1) * 0.08, 1, 1.25);
      return clamp((best * 0.7 + avg * 0.3) * supportBoost, 0, 0.99);
    }

    _estimateQuantity(canonicalId, group) {
      // IMPORTANTE: support_count = cuantos crops de la foto coincidieron,
      // NO cuantas piezas hay en el plato. Multiplicar calorias por eso
      // inflaba pizza/tacos x3-x5. Siempre 1 porcion por defecto.
      return 1;
    }

    async resolveItem(item, options = {}) {
      const canonicalId = item.canonical_id;
      const record = await this.lookupCanonicalRecord(canonicalId, item.best_prediction, options);
      const merged = record || this._fallbackRecord(canonicalId, item.best_prediction);
      const quantity = item.quantity || merged.default_quantity || 1;
      const portion = merged.portion || {};
      const normalized = {
        type: merged.type || item.type || 'food',
        name: merged.name || item.name,
        canonical_id: canonicalId,
        quantity,
        estimated_weight_g: merged.type === 'food' ? this._estimateWeight(quantity, portion, merged) : null,
        estimated_volume_ml: merged.type === 'beverage' ? this._estimateVolume(quantity, portion, merged) : null,
        confidence: item.confidence,
        source: merged.source || 'local',
        nutritional_source: merged.nutritional_source || 'local',
        brand: merged.brand || null,
        healthStatus: merged.healthStatus || 'moderate',
        suggestion: merged.suggestion || ''
      };
      normalized.nutrition = this.calculateItemNutrition(normalized, merged);
      return normalized;
    }

    _estimateWeight(quantity, portion, record) {
      const base = portion.estimated_weight_g || record.estimated_weight_g || 100;
      return Math.round(base * quantity);
    }

    _estimateVolume(quantity, portion, record) {
      const base = portion.estimated_volume_ml || record.estimated_volume_ml || 240;
      return Math.round(base * quantity);
    }

    async lookupCanonicalRecord(canonicalId, prediction, options = {}) {
      const cacheKey = `item:${canonicalId}`;
      if (this.cache[cacheKey]) return this.cache[cacheKey];

      if (this.records[canonicalId]) {
        const record = this.records[canonicalId];
        this.cache[cacheKey] = record;
        this._saveCache();
        return record;
      }

      const byBase = this._lookupInFoodsData(canonicalId);
      if (byBase) {
        this.cache[cacheKey] = byBase;
        this._saveCache();
        return byBase;
      }

      const query = options.ocrText || prediction?.label || canonicalId;
      if (this.allowRemoteLookup) {
        const off = await this.lookupOpenFoodFacts(query, canonicalId);
        if (off) {
          this.cache[cacheKey] = off;
          this._saveCache();
          return off;
        }
      }

      return null;
    }

    _lookupInFoodsData(canonicalId) {
      const direct = this.foodsData[canonicalId];
      if (direct) {
        return {
          canonical_id: canonicalId,
          type: this._inferTypeFromKey(canonicalId, direct),
          name: direct.name || this._humanizeKey(canonicalId),
          source_id: canonicalId,
          source: 'local_foods_json',
          nutritional_source: 'local_foods_json',
          portion: this._inferPortion(direct.unit, direct),
          nutrition: this._normalizeNutrition(direct),
          healthStatus: direct.healthStatus || 'moderate',
          suggestion: direct.suggestion || ''
        };
      }

      const normalized = compactText(canonicalId);
      for (const [key, value] of Object.entries(this.foodsData)) {
        if (compactText(key) === normalized || normalizeText(value?.name) === normalizeText(canonicalId)) {
          return {
            canonical_id: key,
            type: this._inferTypeFromKey(key, value),
            name: value?.name || this._humanizeKey(key),
            source_id: key,
            source: 'local_foods_json',
            nutritional_source: 'local_foods_json',
            portion: this._inferPortion(value?.unit, value),
            nutrition: this._normalizeNutrition(value),
            healthStatus: value?.healthStatus || 'moderate',
            suggestion: value?.suggestion || ''
          };
        }
      }
      return null;
    }

    async lookupOpenFoodFacts(query, canonicalId) {
      const cacheKey = `off:${normalizeText(query)}`;
      if (this.cache[cacheKey]) return this.cache[cacheKey];

      const url = new URL(OFF_API);
      url.searchParams.set('search_terms', query);
      url.searchParams.set('page_size', '6');
      url.searchParams.set('fields', [
        'product_name',
        'brands',
        'quantity',
        'nutrition_data_per',
        'serving_size',
        'nutriments',
        'code',
        'categories',
        'categories_tags',
        'image_front_url'
      ].join(','));

      try {
        const res = await fetch(url.toString());
        if (!res.ok) return null;
        const data = await res.json();
        const product = (data.products || []).find((p) => p?.product_name && p?.nutriments);
        if (!product) return null;

        const normalized = this._normalizeOpenFoodFactsProduct(product, canonicalId);
        this.cache[cacheKey] = normalized;
        this._saveCache();
        return normalized;
      } catch {
        return null;
      }
    }

    _normalizeOpenFoodFactsProduct(product, canonicalId) {
      const nutriments = product.nutriments || {};
      const isDrink = this._looksLikeBeverage(product);
      const caloriesPer100 = this._readEnergyKcal(nutriments, isDrink ? '100ml' : '100g');
      const calories = caloriesPer100 != null ? caloriesPer100 : 0;
      return {
        canonical_id: canonicalId,
        type: isDrink ? 'beverage' : 'food',
        name: product.product_name || this._humanizeKey(canonicalId),
        source_id: product.code || canonicalId,
        source: 'open_food_facts',
        nutritional_source: 'open_food_facts',
        brand: product.brands || null,
        portion: {
          kind: isDrink ? '100ml' : '100g',
          unit_label: isDrink ? '100ml' : '100g',
          estimated_volume_ml: isDrink ? 100 : null,
          estimated_weight_g: isDrink ? null : 100
        },
        nutrition: {
          calories,
          protein: this._readNutriment(nutriments, 'proteins', isDrink ? '100ml' : '100g'),
          carbs: this._readNutriment(nutriments, 'carbohydrates', isDrink ? '100ml' : '100g'),
          fat: this._readNutriment(nutriments, 'fat', isDrink ? '100ml' : '100g'),
          sugar: this._readNutriment(nutriments, 'sugars', isDrink ? '100ml' : '100g'),
          fiber: this._readNutriment(nutriments, 'fiber', isDrink ? '100ml' : '100g')
        },
        healthStatus: isDrink ? 'unhealthy' : 'moderate'
      };
    }

    _looksLikeBeverage(product) {
      const text = normalizeText([product.product_name, product.brands, product.categories].filter(Boolean).join(' '));
      return /(drink|beverage|juice|soda|cola|water|tea|coffee|milk|wine|beer|energy)/.test(text);
    }

    _readNutriment(nutriments, key, basis) {
      const direct = parseNumber(nutriments[`${key}_${basis}`] ?? nutriments[`${key}_100g`] ?? nutriments[`${key}_100ml`]);
      return direct != null ? direct : 0;
    }

    _readEnergyKcal(nutriments, basis) {
      const kcal = parseNumber(nutriments[`energy-kcal_${basis}`] ?? nutriments['energy-kcal_100g'] ?? nutriments['energy-kcal_100ml']);
      if (kcal != null) return kcal;
      const kj = parseNumber(nutriments[`energy_${basis}`] ?? nutriments['energy_100g'] ?? nutriments['energy_100ml']);
      return kj != null ? Math.round((kj / 4.184) * 10) / 10 : null;
    }

    calculateItemNutrition(item, record) {
      const base = record?.nutrition || this._emptyNutrition();
      const portion = record?.portion || {};
      const quantity = item.quantity || 1;

      if (record?.type === 'beverage') {
        const volume = item.estimated_volume_ml || portion.estimated_volume_ml || 240;
        const factor = record?.nutrition?.calories && portion.estimated_volume_ml ? volume / portion.estimated_volume_ml : quantity;
        return this._scaleNutrition(base, factor);
      }

      if (portion.kind === '100g') {
        const grams = item.estimated_weight_g || portion.estimated_weight_g || 100;
        return this._scaleNutrition(base, grams / 100);
      }

      if (portion.kind === '100ml') {
        const ml = item.estimated_volume_ml || portion.estimated_volume_ml || 100;
        return this._scaleNutrition(base, ml / 100);
      }

      if (portion.kind === 'ml' || portion.kind === 'cup' || portion.kind === 'bottle' || portion.kind === 'glass') {
        const ml = item.estimated_volume_ml || portion.estimated_volume_ml || 240;
        const baseMl = portion.estimated_volume_ml || 240;
        return this._scaleNutrition(base, ml / baseMl);
      }

      if (portion.kind === 'slice' || portion.kind === 'roll' || portion.kind === 'item' || portion.kind === 'serving') {
        return this._scaleNutrition(base, quantity);
      }

      return this._scaleNutrition(base, quantity);
    }

    _scaleNutrition(nutrition, factor) {
      const scale = (value) => Math.round((Number(value || 0) * factor) * 10) / 10;
      return {
        calories: scale(nutrition.calories),
        protein: scale(nutrition.protein),
        carbs: scale(nutrition.carbs),
        fat: scale(nutrition.fat),
        sugar: scale(nutrition.sugar),
        fiber: scale(nutrition.fiber)
      };
    }

    calculateTotals(items = []) {
      const totals = { calories: 0, protein: 0, carbs: 0, fat: 0, sugar: 0, fiber: 0 };
      for (const item of items) {
        for (const key of Object.keys(totals)) {
          totals[key] += Number(item.nutrition?.[key] || 0);
        }
      }
      for (const key of Object.keys(totals)) {
        totals[key] = Math.round(totals[key] * 10) / 10;
      }
      return totals;
    }

    calculateHealthScore(items = [], totals = {}) {
      if (!items.length) return 0;

      const statusBase = {
        healthy: 8.2,
        moderate: 6.1,
        unhealthy: 3.8
      };
      const statusScore = items.reduce((sum, item) => {
        return sum + (statusBase[item.healthStatus] ?? statusBase.moderate);
      }, 0) / items.length;

      let score = statusScore;
      score -= Math.max(0, (totals.calories || 0) - 350) / 260;
      score -= (totals.sugar || 0) / 18;
      score -= Math.max(0, (totals.fat || 0) - 18) / 16;
      score += Math.min(1.2, (totals.protein || 0) / 45);
      score += Math.min(1.0, (totals.fiber || 0) / 10);

      const hasSugaryDrink = items.some((item) => item.type === 'beverage' && (item.nutrition?.sugar || 0) >= 8);
      const hasAlcohol = items.some((item) => /(beer|wine|alcohol|cerveza|vino)/.test(item.canonical_id));
      const hasMultipleBeverages = items.filter((item) => item.type === 'beverage').length > 1;
      const hasUnhealthyFood = items.some((item) => item.healthStatus === 'unhealthy');

      if (hasSugaryDrink) score -= 0.8;
      if (hasAlcohol) score -= 1.2;
      if (hasMultipleBeverages) score -= 0.4;
      if (hasUnhealthyFood && (totals.fiber || 0) < 4) score -= 0.5;

      return Math.round(clamp(score, 0, 10) * 10) / 10;
    }

    buildRecommendations(items = [], totals = {}, healthScore = 0, lang = 'es') {
      const isEn = lang === 'en';
      const notes = [];
      const sugaryBeverages = items.filter((item) => item.type === 'beverage' && (item.nutrition?.sugar || 0) >= 8);
      const alcohol = items.filter((item) => /(beer|wine|alcohol|cerveza|vino)/.test(item.canonical_id));

      if (sugaryBeverages.length) {
        notes.push(isEn
          ? 'The beverage contains a high amount of sugar. Replacing it with water would significantly cut calories.'
          : 'La bebida aporta bastante azucar. Cambiarla por agua reduciria una parte importante de las calorias.');
      }

      if (alcohol.length) {
        notes.push(isEn
          ? 'Alcohol adds empty calories and can lower the nutritional balance of the meal.'
          : 'Si hay alcohol, recuerda que suma calorias vacias y puede bajar la calidad global de la comida.');
      }

      if (items.some((item) => item.healthStatus === 'unhealthy')) {
        notes.push(isEn
          ? 'This is a calorie-dense option. A smaller portion or adding vegetables helps balance it.'
          : 'Es una opcion densa en calorias. Una porcion mas pequena o acompanarla con verduras ayuda a equilibrarla.');
      }

      if ((totals.fiber || 0) < 8 && (totals.calories || 0) > 400) {
        notes.push(isEn
          ? 'Lacks fiber and vegetable volume. Adding veggies or fruit will improve satiety.'
          : 'Faltan fibra y volumen de vegetales. Anadir verduras o fruta mejoraria la saciedad.');
      }

      if ((totals.protein || 0) < 15 && (totals.calories || 0) > 500) {
        notes.push(isEn
          ? 'Relatively energetic but low in protein. A lean protein source would provide better balance.'
          : 'La comida es relativamente energetica pero con poca proteina. Una fuente magra podria equilibrarla mejor.');
      }

      if ((totals.fat || 0) > 35 && (totals.calories || 0) > 600) {
        notes.push(isEn
          ? 'High fat content. Reducing fried elements, sauces, or cheese can noticeably lower total calories.'
          : 'Hay una carga alta de grasa. Reducir frituras, salsas o queso puede bajar bastante el total.');
      }

      if (!notes.length) {
        notes.push(isEn
          ? 'The meal appears reasonably balanced, but portion control remains key.'
          : 'El conjunto de alimentos luce razonablemente equilibrado, pero la porcion sigue siendo el factor clave.');
      }

      return notes;
    }

    buildAnalysis(items = [], totals = {}, healthScore = 0, lang = 'es') {
      const isEn = lang === 'en';
      const foodCount = items.filter((item) => item.type === 'food').length;
      const beverageCount = items.filter((item) => item.type === 'beverage').length;

      if (isEn) {
        const foodText = foodCount ? `${foodCount} food item${foodCount === 1 ? '' : 's'}` : 'no food items';
        const beverageText = beverageCount ? `${beverageCount} drink${beverageCount === 1 ? '' : 's'}` : 'no drinks';
        return `Identified ${foodText} and ${beverageText}. Estimated total is ${Math.round(totals.calories || 0)} kcal. Health score: ${healthScore}/10.`;
      }

      const foodText = foodCount ? `${foodCount} alimento${foodCount === 1 ? '' : 's'}` : 'sin alimentos';
      const beverageText = beverageCount ? `${beverageCount} bebida${beverageCount === 1 ? '' : 's'}` : 'sin bebidas';
      return `Se identificaron ${foodText} y ${beverageText}. El total estimado es de ${Math.round(totals.calories || 0)} kcal. El puntaje de salud es ${healthScore}/10.`;
    }
  }

  global.NutritionEngine = NutritionEngine;
  global.NutritionEngineUtils = {
    normalizeText,
    compactText,
    parseNumber
  };
})(window);
