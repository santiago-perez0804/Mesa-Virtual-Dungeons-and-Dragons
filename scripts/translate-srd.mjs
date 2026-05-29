/**
 * translate-srd.mjs
 * 
 * Script para traducir al español todos los registros del SRD en la base de datos.
 * Usa la API de Gemini Flash para traducir en batch, con progreso y reanudación.
 * 
 * Uso:
 *   node scripts/translate-srd.mjs              → Traduce todo
 *   node scripts/translate-srd.mjs --type monster  → Solo monstruos
 *   node scripts/translate-srd.mjs --type spell    → Solo hechizos
 *   node scripts/translate-srd.mjs --type item     → Solo objetos
 *   node scripts/translate-srd.mjs --reset         → Marca todo como no traducido (reinicia)
 */

import Database from 'better-sqlite3';
import { GoogleGenAI } from '@google/genai';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '../vtt_database.db');

// ---- CONFIG ----
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyA-nKRgmWgDr2XXzWPCUwUWaj6QHTf4uKo';
const BATCH_SIZE = 5;          // Cuántos registros por llamada a Gemini
const DELAY_MS = 1500;         // Pausa entre llamadas para respetar rate limits
const MODEL = 'gemini-2.0-flash'; // Modelo rápido y económico

const db = new Database(dbPath);
const genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// Leer argumentos
const args = process.argv.slice(2);
const typeFilter = args.includes('--type') ? args[args.indexOf('--type') + 1] : null;
const doReset = args.includes('--reset');

// ---- SETUP: añadir columna 'translated' si no existe ----
try {
  db.exec("ALTER TABLE content_items ADD COLUMN translated INTEGER DEFAULT 0");
  console.log("✅ Columna 'translated' añadida a la base de datos.");
} catch (e) {
  // Ya existe, ignorar
}

if (doReset) {
  const q = typeFilter
    ? db.prepare("UPDATE content_items SET translated = 0 WHERE type = ?").run(typeFilter)
    : db.prepare("UPDATE content_items SET translated = 0").run();
  console.log(`🔄 Reinicio: ${q.changes} registros marcados como no traducidos.`);
  process.exit(0);
}

// ---- SISTEMA DE PROGRESO ----
function getProgress() {
  const total = typeFilter
    ? db.prepare("SELECT COUNT(*) as c FROM content_items WHERE type = ?").get(typeFilter)
    : db.prepare("SELECT COUNT(*) as c FROM content_items").get();
  const done = typeFilter
    ? db.prepare("SELECT COUNT(*) as c FROM content_items WHERE translated = 1 AND type = ?").get(typeFilter)
    : db.prepare("SELECT COUNT(*) as c FROM content_items WHERE translated = 1").get();
  return { total: total.c, done: done.c };
}

function getNextBatch() {
  const query = typeFilter
    ? "SELECT id, name, type, data FROM content_items WHERE translated = 0 AND type = ? LIMIT ?"
    : "SELECT id, name, type, data FROM content_items WHERE translated = 0 LIMIT ?";
  return typeFilter
    ? db.prepare(query).all(typeFilter, BATCH_SIZE)
    : db.prepare(query).all(BATCH_SIZE);
}

function markTranslated(id) {
  db.prepare("UPDATE content_items SET translated = 1 WHERE id = ?").run(id);
}

function updateRecord(id, name, data) {
  db.prepare("UPDATE content_items SET name = ?, data = ?, translated = 1 WHERE id = ?")
    .run(name, JSON.stringify(data), id);
}

// ---- LÓGICA DE TRADUCCIÓN POR TIPO ----

function extractTextsToTranslate(type, name, data) {
  /**
   * Devuelve un objeto con los campos a traducir.
   * Los campos numéricos, slugs y URLs se omiten.
   */
  const texts = { name };

  if (type === 'monster') {
    if (data.description) texts.description = data.description;
    if (data.size) texts.size = data.size;
    if (data.type) texts.creature_type = data.type; // "type" es la raza del monstruo (Humanoid, Beast, etc.)
    if (Array.isArray(data.actions) && data.actions.length > 0) {
      texts.actions = data.actions.map(a => ({
        name: a.name || '',
        desc: a.desc || a.description || ''
      }));
    }
    if (Array.isArray(data.traits) && data.traits.length > 0) {
      texts.traits = data.traits.map(t => ({
        name: t.name || '',
        desc: t.desc || t.description || ''
      }));
    }
    if (Array.isArray(data.vulnerabilities) && data.vulnerabilities.length > 0) texts.vulnerabilities = data.vulnerabilities;
    if (Array.isArray(data.resistances) && data.resistances.length > 0) texts.resistances = data.resistances;
    if (Array.isArray(data.immunities) && data.immunities.length > 0) texts.immunities = data.immunities;
    if (Array.isArray(data.legendary_actions) && data.legendary_actions.length > 0) {
      texts.legendary_actions = data.legendary_actions.map(a => ({
        name: a.name || '',
        desc: a.desc || a.description || ''
      }));
    }
    if (Array.isArray(data.special_abilities) && data.special_abilities.length > 0) {
      texts.special_abilities = data.special_abilities.map(a => ({
        name: a.name || '',
        desc: a.desc || a.description || ''
      }));
    }
    if (Array.isArray(data.reactions) && data.reactions.length > 0) {
      texts.reactions = data.reactions.map(a => ({
        name: a.name || '',
        desc: a.desc || a.description || ''
      }));
    }

  } else if (type === 'spell') {
    if (data.desc) texts.desc = Array.isArray(data.desc) ? data.desc.join('\n') : data.desc;
    if (data.higher_level) texts.higher_level = Array.isArray(data.higher_level) ? data.higher_level.join('\n') : data.higher_level;
    if (data.components) texts.components = data.components;
    if (data.material) texts.material = data.material;
    if (data.duration) texts.duration = data.duration;
    if (data.casting_time) texts.casting_time = data.casting_time;
    if (data.school) texts.school = typeof data.school === 'object' ? data.school.name : data.school;
    if (data.range) texts.range = data.range;

  } else if (type === 'item') {
    if (data.desc) texts.desc = Array.isArray(data.desc) ? data.desc.join('\n') : data.desc;
    if (data.description) texts.description = data.description;
    if (data.equipment_category) texts.equipment_category = typeof data.equipment_category === 'object' ? data.equipment_category.name : data.equipment_category;
    if (data.weapon_category) texts.weapon_category = data.weapon_category;
    if (data.weapon_range) texts.weapon_range = data.weapon_range;
    if (data.armor_category) texts.armor_category = data.armor_category;
    if (data.rarity) texts.rarity = typeof data.rarity === 'object' ? data.rarity.name : data.rarity;
    if (data.tool_category) texts.tool_category = data.tool_category;
  }

  return texts;
}

function applyTranslations(type, originalData, translations, translatedName) {
  /**
   * Aplica las traducciones al objeto de datos original,
   * manteniendo intactos los campos numéricos/técnicos.
   */
  const d = { ...originalData };

  if (type === 'monster') {
    if (translations.description) d.description = translations.description;
    if (translations.size) d.size = translations.size;
    if (translations.creature_type) d.type = translations.creature_type;
    if (translations.actions) {
      d.actions = (originalData.actions || []).map((a, i) => ({
        ...a,
        name: translations.actions[i]?.name || a.name,
        desc: translations.actions[i]?.desc || a.desc || a.description,
        description: translations.actions[i]?.desc || a.desc || a.description,
      }));
    }
    if (translations.traits) {
      d.traits = (originalData.traits || []).map((t, i) => ({
        ...t,
        name: translations.traits[i]?.name || t.name,
        desc: translations.traits[i]?.desc || t.desc || t.description,
      }));
    }
    if (translations.vulnerabilities) d.vulnerabilities = translations.vulnerabilities;
    if (translations.resistances) d.resistances = translations.resistances;
    if (translations.immunities) d.immunities = translations.immunities;
    if (translations.legendary_actions) {
      d.legendary_actions = (originalData.legendary_actions || []).map((a, i) => ({
        ...a,
        name: translations.legendary_actions[i]?.name || a.name,
        desc: translations.legendary_actions[i]?.desc || a.desc || a.description,
      }));
    }
    if (translations.special_abilities) {
      d.special_abilities = (originalData.special_abilities || []).map((a, i) => ({
        ...a,
        name: translations.special_abilities[i]?.name || a.name,
        desc: translations.special_abilities[i]?.desc || a.desc || a.description,
      }));
    }
    if (translations.reactions) {
      d.reactions = (originalData.reactions || []).map((a, i) => ({
        ...a,
        name: translations.reactions[i]?.name || a.name,
        desc: translations.reactions[i]?.desc || a.desc || a.description,
      }));
    }

  } else if (type === 'spell') {
    if (translations.desc) d.desc = [translations.desc];
    if (translations.higher_level) d.higher_level = [translations.higher_level];
    if (translations.duration) d.duration = translations.duration;
    if (translations.casting_time) d.casting_time = translations.casting_time;
    if (translations.school) {
      if (typeof originalData.school === 'object') {
        d.school = { ...originalData.school, name: translations.school };
      } else {
        d.school = translations.school;
      }
    }
    if (translations.range) d.range = translations.range;
    if (translations.material) d.material = translations.material;
    if (translations.components) d.components = translations.components;

  } else if (type === 'item') {
    if (translations.desc) d.desc = [translations.desc];
    if (translations.description) d.description = translations.description;
    if (translations.equipment_category) {
      if (typeof originalData.equipment_category === 'object') {
        d.equipment_category = { ...originalData.equipment_category, name: translations.equipment_category };
      } else {
        d.equipment_category = translations.equipment_category;
      }
    }
    if (translations.weapon_category) d.weapon_category = translations.weapon_category;
    if (translations.weapon_range) d.weapon_range = translations.weapon_range;
    if (translations.armor_category) d.armor_category = translations.armor_category;
    if (translations.rarity) {
      if (typeof originalData.rarity === 'object') {
        d.rarity = { ...originalData.rarity, name: translations.rarity };
      } else {
        d.rarity = translations.rarity;
      }
    }
    if (translations.tool_category) d.tool_category = translations.tool_category;
  }

  return d;
}

// ---- LLAMADA A GEMINI ----
async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function translateBatch(items, retryCount = 0) {
  const MAX_RETRIES = 5;
  const prompt = `Eres un experto traductor de contenido de Dungeons & Dragons 5e del inglés al español latinoamericano. 
Usa la terminología oficial de D&D en español (ej: "Sneak Attack" → "Ataque Furtivo", "Saving Throw" → "Tirada de Salvación", "Hit Points" → "Puntos de Golpe", "Armor Class" → "Clase de Armadura", etc.).
Mantén los nombres propios que no tienen traducción estándar en inglés.
Devuelve ÚNICAMENTE un JSON válido, sin explicaciones ni markdown, con este formato exacto:
[
  { "id": <id>, "name": "<nombre traducido>", "translations": { <campos traducidos> } },
  ...
]

Ítems a traducir:
${JSON.stringify(items.map(item => ({ id: item.id, type: item.type, texts: item.texts })), null, 2)}

IMPORTANTE:
- Para campos que son arrays (como actions, traits), devuelve el array con los mismos índices.
- Para vulnerabilities/resistances/immunities que son arrays de strings, devuelve arrays de strings traducidos.
- No omitas ningún campo que se te dio para traducir.
- Responde SOLO con el JSON array, sin texto adicional.`;

  try {
    const result = await genAI.models.generateContent({
      model: MODEL,
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
    
    // Limpiar posible markdown
    const cleaned = text
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();
    
    return JSON.parse(cleaned);
  } catch (e) {
    const msg = e.message || '';
    const is429 = msg.includes('429') || msg.includes('quota') || msg.includes('rate');
    
    if (is429 && retryCount < MAX_RETRIES) {
      const waitSec = Math.pow(2, retryCount + 2); // 4s, 8s, 16s, 32s, 64s
      process.stdout.write(`\n    ⏳ Rate limit (429), esperando ${waitSec}s antes de reintentar (intento ${retryCount + 1}/${MAX_RETRIES})... `);
      await sleep(waitSec * 1000);
      return translateBatch(items, retryCount + 1);
    }
    
    console.error('  ❌ Error en Gemini:', msg.substring(0, 200));
    return null;
  }
}

// ---- MAIN ----
async function main() {
  console.log('\n🌐 TRADUCTOR SRD → ESPAÑOL (powered by Gemini)');
  console.log('══════════════════════════════════════════════');
  
  const { total, done } = getProgress();
  console.log(`📊 Registros totales: ${total}`);
  console.log(`✅ Ya traducidos:     ${done}`);
  console.log(`⏳ Pendientes:        ${total - done}`);
  if (typeFilter) console.log(`🔍 Filtrando tipo:    ${typeFilter}`);
  console.log('');

  if (total - done === 0) {
    console.log('🎉 ¡Todo ya está traducido!');
    return;
  }

  let processed = 0;
  let errors = 0;
  const startTime = Date.now();

  while (true) {
    const batch = getNextBatch();
    if (batch.length === 0) break;

    // Preparar datos para traducción
    const itemsToTranslate = batch.map(row => {
      let data;
      try {
        data = JSON.parse(row.data);
      } catch {
        data = {};
      }
      return {
        id: row.id,
        type: row.type,
        name: row.name,
        data,
        texts: extractTextsToTranslate(row.type, row.name, data)
      };
    });

    // Llamar a Gemini
    process.stdout.write(`  📤 Traduciendo batch [${done + processed + 1}-${done + processed + batch.length}/${total}]... `);
    const translations = await translateBatch(itemsToTranslate);

    if (!translations) {
      // En caso de error, marcar como traducido para no bloquearse
      batch.forEach(row => markTranslated(row.id));
      errors += batch.length;
      console.log(`⚠️ Error en batch, saltando.`);
    } else {
      // Aplicar traducciones
      for (const t of translations) {
        const original = itemsToTranslate.find(i => i.id === t.id);
        if (!original) continue;
        
        const translatedData = applyTranslations(
          original.type,
          original.data,
          t.translations || {},
          t.name
        );
        updateRecord(t.id, t.name, translatedData);
      }
      
      // Marcar los que Gemini no devolvió (por si faltó alguno)
      batch.forEach(row => {
        const found = translations.find(t => t.id === row.id);
        if (!found) markTranslated(row.id);
      });

      processed += batch.length;
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
      const rate = (processed / elapsed * 60).toFixed(0);
      console.log(`✓ (${rate} reg/min, ${elapsed}s transcurridos)`);
    }

    // Pausa entre requests para no exceder rate limits
    await new Promise(r => setTimeout(r, DELAY_MS));
  }

  const totalTime = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
  console.log('\n══════════════════════════════════════════════');
  console.log(`🎉 ¡Traducción completada!`);
  console.log(`   ✅ Traducidos: ${processed}`);
  console.log(`   ⚠️ Errores:    ${errors}`);
  console.log(`   ⏱️ Tiempo:     ${totalTime} minutos`);
  console.log('══════════════════════════════════════════════\n');
}

main().catch(console.error);
